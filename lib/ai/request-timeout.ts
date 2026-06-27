export const DEFAULT_OPENAI_REQUEST_TIMEOUT_MS = 30_000;

export type OpenAiRequestTimeout = {
  clear: () => void;
  signal?: AbortSignal;
  timedOut: () => boolean;
};

function normalizeTimeoutMs(timeoutMs?: number) {
  if (timeoutMs === undefined || !Number.isFinite(timeoutMs)) {
    return DEFAULT_OPENAI_REQUEST_TIMEOUT_MS;
  }

  return Math.max(0, timeoutMs);
}

export function createOpenAiRequestTimeout(
  timeoutMs?: number,
): OpenAiRequestTimeout {
  const normalizedTimeoutMs = normalizeTimeoutMs(timeoutMs);

  if (normalizedTimeoutMs === 0 || typeof AbortController === "undefined") {
    return {
      clear: () => {},
      timedOut: () => false,
    };
  }

  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, normalizedTimeoutMs);

  return {
    clear: () => clearTimeout(timeoutId),
    signal: controller.signal,
    timedOut: () => didTimeout,
  };
}

export function isAbortError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}
