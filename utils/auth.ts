import { google } from "googleapis";
import { config } from "../config";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

/**
 * Authorize with default service account and get the JWT client
 *
 * @return {JWT} jwtClient
 *
 */
export async function authorize() {
  const JWTClient = await google.auth.getClient({
    scopes: SCOPES,
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey?.replace(/\\n/g, "\n"),
    },
  });

  return JWTClient;
}
