import { checkRateLimit } from "../rate-limit";

export const DOCUMENT_DELETE_RATE_LIMIT = 10;
export const DOCUMENT_DELETE_RATE_LIMIT_WINDOW_MS = 60_000;
export const DOCUMENT_DELETE_RATE_LIMIT_ERROR =
  "Too many document delete requests. Try again shortly.";

type DocumentDeleteRateLimitOptions = {
  now?: () => number;
};

export function checkDocumentDeleteRateLimit(
  userId: string,
  options: DocumentDeleteRateLimitOptions = {},
) {
  return checkRateLimit(`document-delete:${userId}`, {
    limit: DOCUMENT_DELETE_RATE_LIMIT,
    ...(options.now ? { now: options.now } : {}),
    windowMs: DOCUMENT_DELETE_RATE_LIMIT_WINDOW_MS,
  });
}
