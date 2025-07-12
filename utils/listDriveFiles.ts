import { drive_v3 } from "googleapis";

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

  // for (const file of files) {
  //   try {
  //     await drive.files.delete({ fileId: file.id });
  //     console.log("Deleted", file);
  //   } catch (err) {
  //     console.error(`Failed to delete ${file}:`, err.message);
  //     // optionally: log, skip, retry, or collect failed items
  //   }
  // }

  for (const file of files) {
    if (file.name && file.md5Checksum) {
      map.set(file?.appProperties?.fullFilePath, {
        md5CheckSum: file.md5Checksum,
        filePath: file?.appProperties?.fullFilePath,
      });
    }
  }

  return map;
};
