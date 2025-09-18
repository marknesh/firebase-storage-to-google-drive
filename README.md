# Firebase Storage To Google Drive

This Cloud Run Job uploads files from a Google Cloud Storage bucket to Google Drive. It supports large file transfers with an execution timeout of up to 24 hours (or up to 7 days in preview), making it suitable for long-running uploads.

## ⚙️ Setup Instructions

- Clone the repository

```bash
git clone https://github.com/marknesh/firebase-storage-to-drive.git
cd firebase-storage-to-drive
pnpm install
```

- Download your Private Key JSON file from firebase.

- Create a `.env` based on the `.env.example` and fill all values

- In Google Drive, share editor access to your ( folder or shared drive ) with the Service Account Client Email

- Run `pnpm run dev`

### Deploying Instructions

- Login with email that has the firebase project

  ```
  gcloud auth login
  ```

- Set up with your project id of the Firebase project where you want to use Cloud Storage.

  ```
  gcloud config set project PROJECT_ID
  ```

- Deploy the function (**not a shared drive**)

  ```
  gcloud run jobs deploy upload-to-drive --set-env-vars BUCKET_NAME=your-bucket-name,EMAIL_ADDRESS=email-address-of-your-drive-account,FOLDER_ID=folder-id-of-uploading-the-files --task-timeout 18h
  ```

- Deploy the function (**for a shared drive**)

  ```
  gcloud run jobs deploy upload-to-drive --set-env-vars BUCKET_NAME=your-bucket-name,SHARED_DRIVE_ID=your shared drive id,USE_SHARED_DRIVE="true" --task-timeout 18h
  ```

- Share Editor access to your folder with the Compute Engine Service Account Email in the format `[PROJECT-NUMBER]-compute@<YOUR-PROJECT-ID>.developer.gserviceaccount.com` or check [the list of your service accounts](https://console.cloud.google.com/iam-admin/serviceaccounts).

- Run your cloud run job
