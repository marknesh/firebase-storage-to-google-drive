import { google } from "googleapis";

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
  });

  return JWTClient;
}
