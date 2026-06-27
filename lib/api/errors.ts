type ApiError = {
  error: string;
  status: number;
};

const AI_CONFIGURATION_ERROR =
  "AI service is not configured. Set OPENAI_API_KEY on the server.";
const AI_PROVIDER_ERROR = "AI provider request failed.";
const AI_PROVIDER_RATE_LIMIT_ERROR =
  "AI provider is rate limiting requests. Try again shortly.";
const AI_PROVIDER_TEMPORARY_ERROR =
  "AI provider is temporarily unavailable. Try again shortly.";

function readErrorName(error: unknown) {
  return error instanceof Error ? error.name : null;
}

function readProviderStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return null;
  }

  const status = (error as { status?: unknown }).status;

  return typeof status === "number" && Number.isInteger(status) ? status : null;
}

function isAiConfigurationError(name: string | null) {
  return name === "AnswerConfigurationError" || name === "EmbeddingConfigurationError";
}

function isAiProviderError(name: string | null) {
  return name === "AnswerApiError" || name === "EmbeddingApiError";
}

export function toApiError(error: unknown, fallbackMessage: string): ApiError {
  const name = readErrorName(error);

  if (isAiConfigurationError(name)) {
    return {
      error: AI_CONFIGURATION_ERROR,
      status: 503,
    };
  }

  if (isAiProviderError(name)) {
    const providerStatus = readProviderStatus(error);

    if (providerStatus === 429) {
      return {
        error: AI_PROVIDER_RATE_LIMIT_ERROR,
        status: 429,
      };
    }

    if (providerStatus !== null && providerStatus >= 500) {
      return {
        error: AI_PROVIDER_TEMPORARY_ERROR,
        status: 503,
      };
    }

    return {
      error: AI_PROVIDER_ERROR,
      status: 502,
    };
  }

  return {
    error: fallbackMessage,
    status: 500,
  };
}
