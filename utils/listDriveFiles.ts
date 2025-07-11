import { drive_v3 } from "googleapis";

const FOLDER_ID = process.env.FOLDER_ID?.trim() as string;

export const listDriveFiles = async (drive: drive_v3.Drive) => {
  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: "files(name,id,md5Checksum),nextPageToken",
      // spaces: "drive",
    });
    if (res.data.files) {
      files.push(...res.data.files);
      pageToken = res.data.nextPageToken;
    }
  } while (pageToken);

  const map = new Map();
  for (const file of files) {
    if (file.name && file.md5Checksum) {
      map.set(file.name, file.md5Checksum);
    }
  }

  return map;
};
