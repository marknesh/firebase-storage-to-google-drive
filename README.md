# Firebase Storage To Google Drive

This Cloud Run Job uploads files from a Google Cloud Storage bucket to Google Drive.

## ⚙️ Setup Instructions

- Clone the repository

```bash
git clone https://github.com/your-username/firebase-storage-to-drive.git
cd firebase-storage-to-drive
pnpm install
```

- Create a `.env` based on the `.env.example` and fill all values

- Run `pnpm run dev`

### Deploying Instructions

- Login with email that has the firebase project

  ```
  gcloud auth login
  ```

- Set up with your project id

  ```
  gcloud config set project PROJECT_ID
  ```

- Deploy the function

  ```
  gcloud run jobs deploy upload-to-drive --set-env-vars BUCKET_NAME=your-bucket-name,EMAIL_ADDRESS=email-address-of-your-drive-account,FOLDER_ID=folder-id-of-uploading-the-files
  ```
