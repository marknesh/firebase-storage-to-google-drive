import "dotenv/config";

import { uploadFile } from "@/lib/drive/uploadFile";
import { driveClient } from "@/utils/util";

driveClient
  .getStorageQuota()
  .then(async (quota) => {
    console.log("Storage quota:", quota);

    uploadFile();
  })
  .catch((error) => {
    console.log(error);
  });
