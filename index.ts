import "dotenv/config";

import { google } from "googleapis";
import { authorize } from "./utils/auth";
import { uploadFile } from "./utils/uploadFile";

authorize()
  .then(async (result) => {
    const drive = google.drive({ version: "v3", auth: result });

    uploadFile(drive);
  })
  .catch((err) => {
    console.log(err);
  });
