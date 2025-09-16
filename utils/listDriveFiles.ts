import { driveClient } from "./util";

/**
 *
 * @param drive
 * @description Lists all files in Google Drive and returns a map of file paths to their metadata
 */
export const listDriveFilesWithMd5CheckSum = async () => {
  const files = await driveClient.listFiles("trashed = false");

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
