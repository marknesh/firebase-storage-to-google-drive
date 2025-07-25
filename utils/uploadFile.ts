import { Storage } from "@google-cloud/storage";
import { drive_v3 } from "googleapis";
import { Readable } from "node:stream";
import { config } from "../config";
import { listDriveFiles } from "./listDriveFiles";
import { getFileName } from "./util";

let currentParentId: string = config.folderId;
const emailAddress = config.emailAddress;

interface cachedDriveFoldersProps {
  folder: string;
  index: number;
  id: string;
  firstFolder: string;
  folderPath: string;
}

export const cachedDriveFolders: cachedDriveFoldersProps[] = [];

const createSubFolders = async (filePath: string, drive: drive_v3.Drive) => {
  currentParentId = config.folderId;

  const firstSlash = filePath.indexOf("/");
  const lastSlash = filePath.lastIndexOf("/");
  const folders = filePath.substring(0, lastSlash).split("/");
  const firstFolder = filePath.substring(0, firstSlash);
  let response;

  for (const [index, folder] of folders.entries()) {
    const driveFolders = await drive.files.list({
      q: `name='${folder}' and mimeType='application/vnd.google-apps.folder' and '${currentParentId}' in parents and trashed=false`,
    });

    const folderPath = folders.slice(0, index + 1).join("/");

    const filteredCachedFolders = cachedDriveFolders.filter(
      (file) =>
        file.index === index &&
        file.folder === folder &&
        file.firstFolder === firstFolder &&
        file.folderPath === folderPath
    );

    const folderExists =
      driveFolders?.data?.files && driveFolders?.data.files?.length > 0;

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
        (driveFolders?.data?.files && driveFolders?.data?.files[0]?.id);

      if (id) {
        currentParentId = id;
        response = { data: { id: `${id}` } };
      }
    } else {
      const driveResponse = await drive.files.create({
        fields: "id",
        requestBody: {
          name: folder,
          parents: [currentParentId],
          mimeType: "application/vnd.google-apps.folder",
          appProperties: {
            fullFilePath: filePath,
          },
        },
      });

      /* give access to the email address to enable it to view the folder */
      if (driveResponse?.data?.id) {
        currentParentId = driveResponse?.data?.id;
        response = await drive.permissions.create({
          fields: "id",
          fileId: currentParentId,
          requestBody: {
            type: "user",
            role: "writer",
            emailAddress: `${emailAddress}`,
          },
          sendNotificationEmail: false,
        });

        cachedDriveFolders.push({
          folder,
          index,
          id: driveResponse?.data?.id,
          firstFolder,
          folderPath,
        });
      }
    }
  }

  return response;
};

/**
 * Uploads files to google drive
 * @param {drive_v3.Drive} drive
 * @returns {Promise<void>}
 */
export async function uploadFile(drive: drive_v3.Drive) {
  const storage = new Storage();

  const filesInGoogleDrive = await listDriveFiles(drive);

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
        const response = await createSubFolders(file.name, drive);

        // prevent creating a file after creating a folder for the first time
        if (file.name.endsWith("/")) continue;

        if (!response?.data?.id) return;
      }

      if (slashesCount === 0) {
        currentParentId = config.folderId;
      }

      const imageStream = file.createReadStream();

      if (
        file.name === matchingDriveFile?.filePath &&
        firebaseHex !== matchingDriveFile?.md5CheckSum
      ) {
        await drive.files
          .update({
            fileId: matchingDriveFile.fileId,
            media: {
              body: Readable.from(imageStream),
            },
            requestBody: {
              name: getFileName(file.name),
              appProperties: {
                fullFilePath: file.name,
              },
            },
          })
          .then(() => console.log(`file ${file.name} updated successfully`));
      } else if (file?.name) {
        await drive.files
          .create({
            media: {
              body: Readable.from(imageStream),
            },
            fields: "id,name,appProperties",
            requestBody: {
              name: getFileName(file.name),
              parents: [currentParentId],
              appProperties: {
                fullFilePath: file.name,
              },
            },
          })
          .then(() => {
            console.log(`file uploaded ${file.name} successfully`);
          });
      }
    }
  }
}
