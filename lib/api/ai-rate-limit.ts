import { checkRateLimit } from "../rate-limit";

export const AI_ANSWER_RATE_LIMIT = 10;
export const AI_ANSWER_RATE_LIMIT_WINDOW_MS = 60_000;
export const AI_ANSWER_RATE_LIMIT_ERROR =
  "Too many answer requests. Try again shortly.";
export const AI_SEARCH_RATE_LIMIT = 30;
export const AI_SEARCH_RATE_LIMIT_WINDOW_MS = 60_000;
export const AI_SEARCH_RATE_LIMIT_ERROR =
  "Too many search requests. Try again shortly.";

type AiAnswerRateLimitOptions = {
  now?: () => number;
};

type AiAnswerRateLimitResult = ReturnType<typeof checkRateLimit>;

export function checkAiAnswerRateLimit(
  userId: string,
  options: AiAnswerRateLimitOptions = {},
) {
  return checkRateLimit(`ai-answer:${userId}`, {
    limit: AI_ANSWER_RATE_LIMIT,
    ...(options.now ? { now: options.now } : {}),
    windowMs: AI_ANSWER_RATE_LIMIT_WINDOW_MS,
  });
}

export function checkAiSearchRateLimit(
  userId: string,
  options: AiAnswerRateLimitOptions = {},
) {
  return checkRateLimit(`ai-search:${userId}`, {
    limit: AI_SEARCH_RATE_LIMIT,
    ...(options.now ? { now: options.now } : {}),
    windowMs: AI_SEARCH_RATE_LIMIT_WINDOW_MS,
  });
}

function buildAiRateLimitResponseInit(
  rateLimit: AiAnswerRateLimitResult,
) {
  return {
    headers: {
      "Retry-After": String(rateLimit.retryAfterSeconds),
    },
    status: 429,
  };
}

export function buildAiAnswerRateLimitResponseInit(
  rateLimit: AiAnswerRateLimitResult,
) {
  return buildAiRateLimitResponseInit(rateLimit);
}

export function buildAiSearchRateLimitResponseInit(
  rateLimit: AiAnswerRateLimitResult,
) {
  return buildAiRateLimitResponseInit(rateLimit);
}
