import { extractError } from "@/utils/errors";
import { useSharedDrive } from "@/utils/util";
import { google } from "googleapis";

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
    try {
      const jwtClient = await google.auth.getClient({
        scopes: [useSharedDrive ? DRIVE_SCOPES.FULL : DRIVE_SCOPES.FILE],
      });
      return jwtClient;
    } catch (error) {
      const message = extractError(error);
      throw message;
    }
  }
}
