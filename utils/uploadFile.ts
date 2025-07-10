import { Storage } from "@google-cloud/storage";

const bucketName = process.env.BUCKET_NAME as string;

export async function uploadFile() {
  const storage = new Storage();

  return await storage.bucket(bucketName).getFiles();
}
