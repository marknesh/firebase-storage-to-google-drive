import { Storage } from "@google-cloud/storage";
import { config } from "../config";
import { listDriveFilesWithMd5CheckSum } from "./listDriveFiles";
import { driveClient, getFileName, useSharedDrive } from "./util";

let currentParentId: string = useSharedDrive
  ? config.sharedDriveId
  : config.folderId;
const emailAddress = config.emailAddress;

interface cachedDriveFoldersProps {
  id: string;
  folderPath: string;
}

export const cachedDriveFolders: cachedDriveFoldersProps[] = [];

const createSubFolders = async (filePath: string) => {
  currentParentId = useSharedDrive ? config.sharedDriveId : config.folderId;

  const lastSlash = filePath.lastIndexOf("/");
  const folders = filePath.substring(0, lastSlash).split("/");

  for (const [index, folder] of folders.entries()) {
    const driveFolders = await driveClient.listFiles(
      `name='${folder}' and mimeType='application/vnd.google-apps.folder' and  trashed=false`
    );

    const folderPath = folders.slice(0, index + 1).join("/");

    const filteredCachedFolders = cachedDriveFolders.filter(
      (file) => file.folderPath === folderPath
    );

    const folderExists = driveFolders.length > 0;

    /* drive api takes time to load newly created files, so will use it only when
    the folder does not exist in local cache.

    https://stackoverflow.com/questions/67571418/google-drive-api-files-list-not-refreshing
    */

    if (
      (filteredCachedFolders && filteredCachedFolders?.length > 0) ||
      folderExists
    ) {
      const id =
        (filteredCachedFolders && filteredCachedFolders[0]?.id) ||
        driveFolders[0]?.id;

      if (id) {
        currentParentId = id;
      }
      console.log(`skipped folder ${folder} upload`);
    } else {
      const driveResponse = await driveClient.createFile({
        name: folder,
        parentId: currentParentId,
        mimeType: "application/vnd.google-apps.folder",
        filePath: filePath,
      });

      if (driveResponse.id) {
        console.log(`uploaded and cached ${folder} folder`);
        cachedDriveFolders.push({
          id: driveResponse?.id,
          folderPath,
        });
      }

      if (!useSharedDrive && driveResponse.id) {
        currentParentId = driveResponse?.id;

        await driveClient.createPermission(
          currentParentId,
          `${emailAddress}`,
          "writer"
        );
      }
    }
  }
};

/**
 * Uploads files to google drive
 * @returns {Promise<void>}
 */
export async function uploadFile() {
  const storage = new Storage();

  const filesInGoogleDrive = await listDriveFilesWithMd5CheckSum();

  const [files] = await storage
    .bucket(config.bucketName)
    .getFiles({ autoPaginate: true });

  for (const file of files) {
    if (file.metadata.md5Hash) {
      const firebaseHex = Buffer.from(file.metadata.md5Hash, "base64").toString(
        "hex"
      );

      const matchingDriveFile = filesInGoogleDrive.get(file.name);

      if (
        matchingDriveFile?.md5CheckSum &&
        firebaseHex &&
        firebaseHex === matchingDriveFile.md5CheckSum &&
        file.name === matchingDriveFile.filePath
      ) {
        console.log(`Skipping ${file.name}, already uploaded.`);
        continue;
      }

      const slashesCount = (file.name.match(/\//g) || []).length;

      if (slashesCount > 0) {
        await createSubFolders(file.name);

        // prevent creating a file after creating a folder for the first time
        if (file.name.endsWith("/")) continue;
      }

      if (slashesCount === 0) {
        currentParentId = useSharedDrive
          ? config.sharedDriveId
          : config.folderId;
      }

      const imageStream = file.createReadStream();

      if (
        file.name === matchingDriveFile?.filePath &&
        firebaseHex !== matchingDriveFile?.md5CheckSum
      ) {
        console.log(`updating ${file.name}`);
        await driveClient.updateFile({
          fileId: matchingDriveFile.fileId,
          dataStream: imageStream,
          name: file.name,
          filePath: file.name,
        });
      } else if (file?.name) {
        console.log(`uploading ${file.name}`);

        await driveClient.createFile({
          name: getFileName(file.name),
          parentId: currentParentId,
          dataStream: imageStream,
          filePath: file.name,
        });
      }
    }
  }
}
