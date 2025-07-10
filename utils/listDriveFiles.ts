import { drive_v3 } from "googleapis";

const FOLDER_ID = process.env.FOLDER_ID?.trim() as string;

export const listDriveFiles = async (drive: drive_v3.Drive) => {
  const response = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and trashed = false`,
    fields: "files(name,id,md5Checksum),nextPageToken",
    spaces: "drive",
  });

  console.log(response.data);
};
