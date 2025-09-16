import "dotenv/config";

import { uploadFile } from "./utils/uploadFile";
import { driveClient } from "./utils/util";

driveClient
  .getStorageQuota()
  .then(async (quota) => {
    console.log("Storage quota:", quota);

    uploadFile();
  })
  .catch((err) => {
    console.log(err);
  });
