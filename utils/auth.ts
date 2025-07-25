import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

/**
 * Class to handle Google Drive authentication
 * @returns {Promise<google.auth.JWT>} A promise that resolves to a JWT client
 */
export class Auth {
  async getJWTClient() {
    const jwtClient = await google.auth.getClient({
      scopes: SCOPES,
    });
    return jwtClient;
  }
}
