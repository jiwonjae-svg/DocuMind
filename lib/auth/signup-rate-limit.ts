import { checkRateLimit } from "../rate-limit";
import { readIpAddress } from "../tools/response";

export const SIGNUP_CLIENT_RATE_LIMIT = 5;
export const SIGNUP_EMAIL_RATE_LIMIT = 3;
export const SIGNUP_GLOBAL_RATE_LIMIT = 50;
export const SIGNUP_RATE_LIMIT_WINDOW_MS = 10 * 60_000;
export const SIGNUP_RATE_LIMIT_ERROR =
  "Too many account creation attempts. Try again shortly.";

type SignupRateLimitOptions = {
  now?: () => number;
  request: Pick<Request, "headers">;
};

type SignupEmailRateLimitOptions = {
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

function readSignupClientIdentifier(headers: Headers) {
  return normalizeRateLimitKeySegment(readIpAddress({ headers }));
}

export function checkSignupRateLimit({
  now,
  request,
}: SignupRateLimitOptions) {
  const rateLimitOptions = {
    ...(now ? { now } : {}),
    windowMs: SIGNUP_RATE_LIMIT_WINDOW_MS,
  };
  const globalResult = checkRateLimit("auth-signup:global", {
    ...rateLimitOptions,
    limit: SIGNUP_GLOBAL_RATE_LIMIT,
  });

  if (!globalResult.allowed) {
    return {
      allowed: false,
      limit: SIGNUP_CLIENT_RATE_LIMIT,
      remaining: 0,
      resetAt: globalResult.resetAt,
      retryAfterSeconds: globalResult.retryAfterSeconds,
    };
  }

  const result = checkRateLimit(
    `auth-signup:client:${readSignupClientIdentifier(request.headers)}`,
    {
      ...rateLimitOptions,
      limit: SIGNUP_CLIENT_RATE_LIMIT,
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

export function checkSignupEmailRateLimit({
  email,
  now,
}: SignupEmailRateLimitOptions) {
  const result = checkRateLimit(
    `auth-signup:email:${normalizeRateLimitKeySegment(email)}`,
    {
      ...(now ? { now } : {}),
      limit: SIGNUP_EMAIL_RATE_LIMIT,
      windowMs: SIGNUP_RATE_LIMIT_WINDOW_MS,
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
