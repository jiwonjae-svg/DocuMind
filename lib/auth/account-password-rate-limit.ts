import { checkRateLimit } from "../rate-limit";
import { readIpAddress } from "../tools/response";

export const PASSWORD_CHANGE_RATE_LIMIT = 5;
export const PASSWORD_CHANGE_GLOBAL_RATE_LIMIT = 100;
export const PASSWORD_CHANGE_RATE_LIMIT_WINDOW_MS = 10 * 60_000;
export const PASSWORD_CHANGE_RATE_LIMIT_ERROR =
  "Too many password change attempts. Try again shortly.";

type PasswordChangeRateLimitOptions = {
  now?: () => number;
  request: Pick<Request, "headers">;
  userId: string;
};

function normalizeRateLimitKeySegment(value: string | null | undefined) {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .slice(0, 128)
    .replace(/[^a-z0-9_.:@-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "unknown";
}

function readPasswordChangeClientIdentifier(headers: Headers) {
  return normalizeRateLimitKeySegment(readIpAddress({ headers }));
}

export function checkPasswordChangeRateLimit({
  now,
  request,
  userId,
}: PasswordChangeRateLimitOptions) {
  const rateLimitOptions = {
    ...(now ? { now } : {}),
    windowMs: PASSWORD_CHANGE_RATE_LIMIT_WINDOW_MS,
  };
  const globalResult = checkRateLimit("auth-password-change:global", {
    ...rateLimitOptions,
    limit: PASSWORD_CHANGE_GLOBAL_RATE_LIMIT,
  });

  if (!globalResult.allowed) {
    return {
      allowed: false,
      limit: PASSWORD_CHANGE_RATE_LIMIT,
      remaining: 0,
      resetAt: globalResult.resetAt,
      retryAfterSeconds: globalResult.retryAfterSeconds,
    };
  }

  const results = [
    globalResult,
    checkRateLimit(
      `auth-password-change:user:${normalizeRateLimitKeySegment(userId)}`,
      {
        ...rateLimitOptions,
        limit: PASSWORD_CHANGE_RATE_LIMIT,
      },
    ),
    checkRateLimit(
      `auth-password-change:client:${readPasswordChangeClientIdentifier(
        request.headers,
      )}`,
      {
        ...rateLimitOptions,
        limit: PASSWORD_CHANGE_RATE_LIMIT,
      },
    ),
  ];
  const deniedResults = results.filter((result) => !result.allowed);

  return {
    allowed: deniedResults.length === 0,
    limit: PASSWORD_CHANGE_RATE_LIMIT,
    remaining: Math.min(...results.map((result) => result.remaining)),
    resetAt: Math.max(...results.map((result) => result.resetAt)),
    retryAfterSeconds: Math.max(
      ...results.map((result) => result.retryAfterSeconds),
    ),
  };
}
