/**
 * Extracts a concise error message from Google Drive API or generic errors.
 */
export function extractError(err: unknown): string {
  if (err && typeof err === "object") {
    const apiError = (err as any)?.response?.data?.error?.message;
    const genericError = (err as any)?.message;
    return apiError || genericError || "Unknown Drive API error";
  }

  return "Unknown Drive API error";
}
