import "dotenv/config";

import { google } from "googleapis";
import { Auth } from "./utils/auth";
import { uploadFile } from "./utils/uploadFile";

const auth = new Auth();
auth
  .getJWTClient()
  .then(async (jwtClient) => {
    const drive = google.drive({ version: "v3", auth: jwtClient });

    const res = await drive.about.get({
      fields: "storageQuota",
    });

    console.log("Storage quota:", res.data.storageQuota);

    uploadFile(drive);
  })
  .catch((err) => {
    console.log(err);
  });
