// config.ts
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} is required but was not provided.`
    );
  }
  return value;
}

export const config = {
  bucketName: requireEnv("BUCKET_NAME") as string,
  folderId: requireEnv("FOLDER_ID") as string,
  emailAddress: requireEnv("EMAIL_ADDRESS") as string,
  clientEmail: requireEnv("CLIENT_EMAIL") as string,
  privateKey: requireEnv("PRIVATE_KEY") as string,
};
