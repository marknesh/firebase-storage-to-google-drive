import { google } from "googleapis";
import { useSharedDrive } from "../utils/util";

const DRIVE_SCOPES = {
  FULL: "https://www.googleapis.com/auth/drive",
  FILE: "https://www.googleapis.com/auth/drive.file",
};

/**
 * Class to handle Google Drive authentication
 * @returns {Promise<google.auth.JWT>} A promise that resolves to a JWT client
 */
export class Auth {
  async getJWTClient() {
    const jwtClient = await google.auth.getClient({
      scopes: [useSharedDrive ? DRIVE_SCOPES.FULL : DRIVE_SCOPES.FILE],
    });
    return jwtClient;
  }
}
