import "dotenv/config";

import { google } from "googleapis";
import { uploadFile } from "./utils/uploadFile";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

/**
 * Authorize with default service account and get the JWT client
 *
 * @return {JWT} jwtClient
 *
 */
async function authorize() {
  const JWTClient = await google.auth.getClient({
    scopes: SCOPES,
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  return JWTClient;
}

authorize()
  .then(async (result) => {
    const drive = google.drive({ version: "v3", auth: result });

    // const response = await drive.files.list({
    //   fields: "files(id, name, md5Checksum)",
    // });

    uploadFile(drive);
  })
  .catch((err) => {
    console.log(err);
  });

// uploadFile()
//   .then((res) => console.log(res[2]))
//   .catch((err) => {
//     console.error("❌ Upload failed:", err);
//     process.exit(1);
//   });
