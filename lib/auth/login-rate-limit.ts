import { checkRateLimit } from "../rate-limit";

export const LOGIN_ATTEMPT_RATE_LIMIT = 10;
export const LOGIN_ATTEMPT_RATE_LIMIT_WINDOW_MS = 60_000;
export const LOGIN_ATTEMPT_RATE_LIMIT_ERROR =
  "Too many sign-in attempts. Try again shortly.";

type LoginAttemptRateLimitOptions = {
  email: string | null;
  now?: () => number;
  request: Pick<Request, "headers">;
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

export function readLoginClientIdentifier(headers: Headers) {
  return normalizeRateLimitKeySegment(
    headers.get("x-forwarded-for")?.split(",")[0] ??
      headers.get("x-real-ip") ??
      null,
  );
}

export function buildLoginAttemptRateLimitKeys({
  email,
  request,
}: Pick<LoginAttemptRateLimitOptions, "email" | "request">) {
  const keys = [
    `auth-login:client:${readLoginClientIdentifier(request.headers)}`,
  ];

  if (email) {
    keys.push(`auth-login:email:${normalizeRateLimitKeySegment(email)}`);
  }

  return keys;
}

export function checkLoginAttemptRateLimit({
  email,
  now,
  request,
}: LoginAttemptRateLimitOptions) {
  const results = buildLoginAttemptRateLimitKeys({ email, request }).map((key) =>
    checkRateLimit(key, {
      limit: LOGIN_ATTEMPT_RATE_LIMIT,
      ...(now ? { now } : {}),
      windowMs: LOGIN_ATTEMPT_RATE_LIMIT_WINDOW_MS,
    }),
  );
  const deniedResults = results.filter((result) => !result.allowed);

  return {
    allowed: deniedResults.length === 0,
    limit: LOGIN_ATTEMPT_RATE_LIMIT,
    remaining: Math.min(...results.map((result) => result.remaining)),
    resetAt: Math.max(...results.map((result) => result.resetAt)),
    retryAfterSeconds: Math.max(
      ...results.map((result) => result.retryAfterSeconds),
    ),
  };
}
