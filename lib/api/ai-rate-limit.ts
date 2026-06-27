import { checkRateLimit } from "../rate-limit";

export const AI_ANSWER_RATE_LIMIT = 10;
export const AI_ANSWER_RATE_LIMIT_WINDOW_MS = 60_000;
export const AI_ANSWER_RATE_LIMIT_ERROR =
  "Too many answer requests. Try again shortly.";

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

export function buildAiAnswerRateLimitResponseInit(
  rateLimit: AiAnswerRateLimitResult,
) {
  return {
    headers: {
      "Retry-After": String(rateLimit.retryAfterSeconds),
    },
    status: 429,
  };
}
