import "server-only";

export const EMBEDDING_DIMENSIONS = 1536;
export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const TRANSIENT_STATUS_CODES = new Set([408, 409, 429, 500, 502, 503, 504]);

type FetchLike = typeof fetch;

export type EmbeddingOptions = {
  apiKey?: string;
  fetchImpl?: FetchLike;
  maxRetries?: number;
  model?: string;
  retryBaseDelayMs?: number;
};

export class EmbeddingConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmbeddingConfigurationError";
  }
}

export class EmbeddingApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "EmbeddingApiError";
    this.status = status;
  }
}

type EmbeddingsResponse = {
  data?: Array<{
    embedding?: number[];
  }>;
};

function readEmbeddingApiKey(apiKey?: string) {
  const key = apiKey ?? process.env.OPENAI_API_KEY;

  if (!key?.trim()) {
    throw new EmbeddingConfigurationError("OPENAI_API_KEY is required.");
  }

  return key.trim();
}

export function getEmbeddingModel(model?: string) {
  return (
    model?.trim() ||
    process.env.OPENAI_EMBEDDING_MODEL?.trim() ||
    DEFAULT_EMBEDDING_MODEL
  );
}

function isTransientStatus(status: number) {
  return TRANSIENT_STATUS_CODES.has(status);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateEmbedding(embedding: unknown): number[] {
  if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new EmbeddingApiError(
      `OpenAI returned an embedding with an unexpected dimension. Expected ${EMBEDDING_DIMENSIONS}.`,
    );
  }

  if (!embedding.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new EmbeddingApiError("OpenAI returned an invalid embedding.");
  }

  return embedding;
}

async function parseErrorMessage(response: Response) {
  try {
    const body = await response.json();
    const message = body?.error?.message;

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  } catch {
    // Ignore JSON parse errors and fall back to the HTTP status text.
  }

  return response.statusText || "OpenAI embedding request failed.";
}

export async function createEmbedding(
  input: string,
  options: EmbeddingOptions = {},
) {
  const text = input.trim();

  if (!text) {
    throw new Error("Embedding input must not be empty.");
  }

  const apiKey = readEmbeddingApiKey(options.apiKey);
  const model = getEmbeddingModel(options.model);
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxRetries = options.maxRetries ?? 3;
  const retryBaseDelayMs = options.retryBaseDelayMs ?? 300;
  let attempt = 0;

  while (true) {
    try {
      const response = await fetchImpl(OPENAI_EMBEDDINGS_URL, {
        body: JSON.stringify({
          dimensions: EMBEDDING_DIMENSIONS,
          input: text,
          model,
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response);

        if (isTransientStatus(response.status) && attempt < maxRetries) {
          attempt += 1;
          await sleep(retryBaseDelayMs * 2 ** (attempt - 1));
          continue;
        }

        throw new EmbeddingApiError(message, response.status);
      }

      const body = (await response.json()) as EmbeddingsResponse;

      return {
        embedding: validateEmbedding(body.data?.[0]?.embedding),
        model,
      };
    } catch (error) {
      if (
        error instanceof EmbeddingApiError ||
        error instanceof EmbeddingConfigurationError
      ) {
        throw error;
      }

      if (attempt < maxRetries) {
        attempt += 1;
        await sleep(retryBaseDelayMs * 2 ** (attempt - 1));
        continue;
      }

      throw new EmbeddingApiError("OpenAI embedding request failed.");
    }
  }
}

export function toPgVector(embedding: number[]) {
  const validatedEmbedding = validateEmbedding(embedding);

  return `[${validatedEmbedding.join(",")}]`;
}
