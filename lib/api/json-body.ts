export const JSON_REQUEST_BODY_LIMIT_BYTES = 16 * 1024;
export const JSON_REQUEST_BODY_TOO_LARGE_ERROR =
  "JSON request body must be 16 KB or smaller.";
export const JSON_REQUEST_UNSUPPORTED_MEDIA_TYPE_ERROR =
  "Content-Type must be application/json.";

export class JsonBodyParseError extends Error {
  constructor() {
    super("Invalid JSON body.");
    this.name = "JsonBodyParseError";
  }
}

export class JsonBodyTooLargeError extends Error {
  constructor() {
    super(JSON_REQUEST_BODY_TOO_LARGE_ERROR);
    this.name = "JsonBodyTooLargeError";
  }
}

export class JsonBodyUnsupportedMediaTypeError extends Error {
  constructor() {
    super(JSON_REQUEST_UNSUPPORTED_MEDIA_TYPE_ERROR);
    this.name = "JsonBodyUnsupportedMediaTypeError";
  }
}

function isJsonContentType(contentType: string | null) {
  return contentType
    ?.toLowerCase()
    .split(";")[0]
    .trim() === "application/json";
}

function assertJsonContentType(headers: Headers) {
  if (!isJsonContentType(headers.get("content-type"))) {
    throw new JsonBodyUnsupportedMediaTypeError();
  }
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

function assertWithinJsonBodyLimit(size: number, limitBytes: number) {
  if (size > limitBytes) {
    throw new JsonBodyTooLargeError();
  }
}

async function readBoundedRequestText(
  request: Request,
  limitBytes: number,
) {
  const declaredContentLength = readContentLength(request.headers);

  if (declaredContentLength !== null) {
    assertWithinJsonBodyLimit(declaredContentLength, limitBytes);
  }

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
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
      throw new JsonBodyTooLargeError();
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

export async function readBoundedJsonBody(
  request: Request,
  limitBytes = JSON_REQUEST_BODY_LIMIT_BYTES,
): Promise<unknown> {
  let text: string;

  assertJsonContentType(request.headers);

  try {
    text = await readBoundedRequestText(request, limitBytes);
  } catch (error) {
    if (error instanceof JsonBodyTooLargeError) {
      throw error;
    }

    throw new JsonBodyParseError();
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new JsonBodyParseError();
  }
}

export function isJsonBodyParseError(error: unknown) {
  return error instanceof JsonBodyParseError;
}

export function isJsonBodyTooLargeError(error: unknown) {
  return error instanceof JsonBodyTooLargeError;
}

export function isJsonBodyUnsupportedMediaTypeError(error: unknown) {
  return error instanceof JsonBodyUnsupportedMediaTypeError;
}
