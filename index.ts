import "dotenv/config";

import { google } from "googleapis";
import { Auth } from "./utils/auth";
import { uploadFile } from "./utils/uploadFile";

const auth = new Auth();
auth
  .getJWTClient()
  .then(async (jwtClient) => {
    console.log(jwtClient);
    const drive = google.drive({ version: "v3", auth: jwtClient });

    uploadFile(drive);
  })
  .catch((err) => {
    console.log(err);
  });
