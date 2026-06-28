import { checkRateLimit } from "../rate-limit";

export const DOCUMENT_UPLOAD_RATE_LIMIT = 5;
export const DOCUMENT_UPLOAD_RATE_LIMIT_WINDOW_MS = 60_000;
export const DOCUMENT_UPLOAD_RATE_LIMIT_ERROR =
  "Too many document uploads. Try again shortly.";

type DocumentUploadRateLimitOptions = {
  now?: () => number;
};

export function checkDocumentUploadRateLimit(
  userId: string,
  options: DocumentUploadRateLimitOptions = {},
) {
  return checkRateLimit(`document-upload:${userId}`, {
    limit: DOCUMENT_UPLOAD_RATE_LIMIT,
    ...(options.now ? { now: options.now } : {}),
    windowMs: DOCUMENT_UPLOAD_RATE_LIMIT_WINDOW_MS,
  });
}
