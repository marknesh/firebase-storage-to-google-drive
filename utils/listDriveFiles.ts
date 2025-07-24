import { drive_v3 } from "googleapis";

/**
 *
 * @param drive
 * @description Lists all files in Google Drive and returns a map of file paths to their metadata
 */
export const listDriveFiles = async (drive: drive_v3.Drive) => {
  const files = [];
  let pageToken: string | undefined;
  do {
    const { data }: { data: drive_v3.Schema$FileList } = await drive.files.list(
      {
        q: `trashed = false`,
        fields: "files(name,id,md5Checksum,appProperties),nextPageToken",
        pageToken,
      }
    );
    if (data.files) {
      files.push(...data.files);

      pageToken = data.nextPageToken ?? undefined;
    }
  } while (pageToken);

  const map = new Map();
  console.log(`You have ${files.length} files in your Google Drive.`);

  for (const file of files) {
    if (file.name && file.md5Checksum) {
      map.set(file?.appProperties?.fullFilePath, {
        md5CheckSum: file.md5Checksum,
        filePath: file?.appProperties?.fullFilePath,
        fileId: file.id,
      });
    }
  }

  return map;
};
