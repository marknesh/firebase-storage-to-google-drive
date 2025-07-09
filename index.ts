import { Storage } from "@google-cloud/storage";
import { config } from "dotenv";

config();

const bucketName = process.env.BUCKET_NAME as string;

async function uploadFile() {
  const storage = new Storage();
  return await storage.bucket(bucketName).getFiles();
}

uploadFile()
  .then((res) => console.log(res[2]))
  .catch((err) => {
    console.error("❌ Upload failed:", err);
    process.exit(1);
  });
