import { Storage } from "@google-cloud/storage";
import { config } from "dotenv";
import { google } from "googleapis";

config();

const bucketName = process.env.BUCKET_NAME as string;

async function uploadFile() {
  const storage = new Storage();
  return await storage.bucket(bucketName).getFiles();
}

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
    console.log(result);
    const response = await drive.files.list({
      fields: "files(id, name, md5Checksum)",
    });

    console.log(response?.data.files?.[0]);
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
