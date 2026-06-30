import { checkRateLimit } from "../rate-limit";
import { readIpAddress } from "../tools/response";

export const PASSWORD_RESET_REQUEST_CLIENT_RATE_LIMIT = 5;
export const PASSWORD_RESET_REQUEST_EMAIL_RATE_LIMIT = 3;
export const PASSWORD_RESET_REQUEST_GLOBAL_RATE_LIMIT = 50;
export const PASSWORD_RESET_COMPLETION_CLIENT_RATE_LIMIT = 10;
export const PASSWORD_RESET_RATE_LIMIT_WINDOW_MS = 10 * 60_000;
export const PASSWORD_RESET_RATE_LIMIT_ERROR =
  "Too many password reset attempts. Try again shortly.";

type PasswordResetRequestRateLimitOptions = {
  now?: () => number;
  request: Pick<Request, "headers">;
};

type PasswordResetEmailRateLimitOptions = {
  email: string;
  now?: () => number;
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

function readPasswordResetClientIdentifier(headers: Headers) {
  return normalizeRateLimitKeySegment(readIpAddress({ headers }));
}

export function checkPasswordResetRequestRateLimit({
  now,
  request,
}: PasswordResetRequestRateLimitOptions) {
  const rateLimitOptions = {
    ...(now ? { now } : {}),
    windowMs: PASSWORD_RESET_RATE_LIMIT_WINDOW_MS,
  };
  const globalResult = checkRateLimit("auth-password-reset:global", {
    ...rateLimitOptions,
    limit: PASSWORD_RESET_REQUEST_GLOBAL_RATE_LIMIT,
  });

  if (!globalResult.allowed) {
    return {
      allowed: false,
      limit: PASSWORD_RESET_REQUEST_CLIENT_RATE_LIMIT,
      remaining: 0,
      resetAt: globalResult.resetAt,
      retryAfterSeconds: globalResult.retryAfterSeconds,
    };
  }

  const result = checkRateLimit(
    `auth-password-reset:client:${readPasswordResetClientIdentifier(
      request.headers,
    )}`,
    {
      ...rateLimitOptions,
      limit: PASSWORD_RESET_REQUEST_CLIENT_RATE_LIMIT,
    },
  );

  return {
    allowed: result.allowed,
    limit: result.limit,
    remaining: result.remaining,
    resetAt: result.resetAt,
    retryAfterSeconds: result.retryAfterSeconds,
  };
}

export function checkPasswordResetEmailRateLimit({
  email,
  now,
}: PasswordResetEmailRateLimitOptions) {
  const result = checkRateLimit(
    `auth-password-reset:email:${normalizeRateLimitKeySegment(email)}`,
    {
      ...(now ? { now } : {}),
      limit: PASSWORD_RESET_REQUEST_EMAIL_RATE_LIMIT,
      windowMs: PASSWORD_RESET_RATE_LIMIT_WINDOW_MS,
    },
  );

  return {
    allowed: result.allowed,
    limit: result.limit,
    remaining: result.remaining,
    resetAt: result.resetAt,
    retryAfterSeconds: result.retryAfterSeconds,
  };
}

export function checkPasswordResetCompletionRateLimit({
  now,
  request,
}: PasswordResetRequestRateLimitOptions) {
  const result = checkRateLimit(
    `auth-password-reset-complete:client:${readPasswordResetClientIdentifier(
      request.headers,
    )}`,
    {
      ...(now ? { now } : {}),
      limit: PASSWORD_RESET_COMPLETION_CLIENT_RATE_LIMIT,
      windowMs: PASSWORD_RESET_RATE_LIMIT_WINDOW_MS,
    },
  );

  return {
    allowed: result.allowed,
    limit: result.limit,
    remaining: result.remaining,
    resetAt: result.resetAt,
    retryAfterSeconds: result.retryAfterSeconds,
  };
}
