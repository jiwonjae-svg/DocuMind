export const DOCUMENT_PROCESSING_GENERIC_ERROR = "Document processing failed.";
export const DOCUMENT_PROCESSING_NO_TEXT_ERROR =
  "No extractable text found in document.";
export const DOCUMENT_PROCESSING_UNSUPPORTED_TYPE_ERROR =
  "Unsupported document type.";
export const DOCUMENT_PROCESSING_AI_CONFIGURATION_ERROR =
  "AI service is not configured. Set OPENAI_API_KEY on the server.";
export const DOCUMENT_PROCESSING_AI_PROVIDER_ERROR =
  "AI provider request failed.";
export const DOCUMENT_PROCESSING_AI_RATE_LIMIT_ERROR =
  "AI provider is rate limiting requests. Try again shortly.";
export const DOCUMENT_PROCESSING_AI_TEMPORARY_ERROR =
  "AI provider is temporarily unavailable. Try again shortly.";
const AI_PROVIDER_TEMPORARY_STATUS_CODES = new Set([
  408,
  409,
  500,
  502,
  503,
  504,
]);

function readErrorName(error: unknown) {
  return error instanceof Error ? error.name : null;
}

function readErrorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return null;
  }

  const status = (error as { status?: unknown }).status;

  return typeof status === "number" && Number.isInteger(status) ? status : null;
}

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message.trim() : "";
}

function isAiConfigurationError(name: string | null) {
  return name === "EmbeddingConfigurationError";
}

function isAiProviderError(name: string | null) {
  return name === "EmbeddingApiError";
}

export function normalizeDocumentProcessingError(error: unknown) {
  const name = readErrorName(error);
  const status = readErrorStatus(error);
  const message = readErrorMessage(error);

  if (isAiConfigurationError(name)) {
    return DOCUMENT_PROCESSING_AI_CONFIGURATION_ERROR;
  }

  if (isAiProviderError(name)) {
    if (status === 429) {
      return DOCUMENT_PROCESSING_AI_RATE_LIMIT_ERROR;
    }

    if (
      status !== null &&
      AI_PROVIDER_TEMPORARY_STATUS_CODES.has(status)
    ) {
      return DOCUMENT_PROCESSING_AI_TEMPORARY_ERROR;
    }

    if (message.toLowerCase().includes("timed out")) {
      return DOCUMENT_PROCESSING_AI_TEMPORARY_ERROR;
    }

    return DOCUMENT_PROCESSING_AI_PROVIDER_ERROR;
  }

  if (
    message === DOCUMENT_PROCESSING_NO_TEXT_ERROR ||
    message === DOCUMENT_PROCESSING_UNSUPPORTED_TYPE_ERROR
  ) {
    return message;
  }

  return DOCUMENT_PROCESSING_GENERIC_ERROR;
}
