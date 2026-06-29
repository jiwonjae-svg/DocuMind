export const AI_JSON_RESPONSE_LIMIT_BYTES = 512 * 1024;

export class AiJsonResponseParseError extends Error {
  constructor() {
    super("AI provider response did not contain valid JSON.");
    this.name = "AiJsonResponseParseError";
  }
}

export class AiJsonResponseTooLargeError extends Error {
  constructor() {
    super("AI provider response exceeded maximum size.");
    this.name = "AiJsonResponseTooLargeError";
  }
}

export function readAiProviderErrorMessage(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const error = (body as { error?: unknown }).error;

  if (!error || typeof error !== "object") {
    return null;
  }

  const message = (error as { message?: unknown }).message;

  return typeof message === "string" && message.trim()
    ? message.trim()
    : null;
}

function readContentLength(headers: Headers) {
  const rawContentLength = headers.get("content-length");

  if (!rawContentLength?.trim()) {
    return null;
  }

  const contentLength = Number(rawContentLength);

  return Number.isSafeInteger(contentLength) && contentLength >= 0
    ? contentLength
    : null;
}

function assertWithinAiJsonResponseLimit(size: number, limitBytes: number) {
  if (size > limitBytes) {
    throw new AiJsonResponseTooLargeError();
  }
}

async function readBoundedResponseText(
  response: Response,
  limitBytes: number,
) {
  const declaredContentLength = readContentLength(response.headers);

  if (declaredContentLength !== null) {
    assertWithinAiJsonResponseLimit(declaredContentLength, limitBytes);
  }

  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    receivedBytes += value.byteLength;

    if (receivedBytes > limitBytes) {
      await reader.cancel().catch(() => {});
      throw new AiJsonResponseTooLargeError();
    }

    chunks.push(value);
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}

export async function readBoundedAiJsonResponse(
  response: Response,
  limitBytes = AI_JSON_RESPONSE_LIMIT_BYTES,
): Promise<unknown> {
  let text: string;

  try {
    text = await readBoundedResponseText(response, limitBytes);
  } catch (error) {
    if (error instanceof AiJsonResponseTooLargeError) {
      throw error;
    }

    throw new AiJsonResponseParseError();
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new AiJsonResponseParseError();
  }
}
