export const MAX_DOCUMENT_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_UPLOAD_REQUEST_BYTES =
  MAX_DOCUMENT_UPLOAD_BYTES + 1024 * 1024;
export const MAX_DOCUMENT_SAFE_FILE_NAME_LENGTH = 180;
export const MAX_DOCUMENT_DISPLAY_FILE_NAME_LENGTH = 255;
export const DOCUMENT_UPLOAD_TOO_LARGE_ERROR = "Files must be 10 MB or smaller.";
export const DOCUMENT_UPLOAD_UNSUPPORTED_MEDIA_TYPE_ERROR =
  "Document upload must use multipart form data.";
export const DOCUMENT_UPLOAD_PARSE_ERROR = "Document upload could not be parsed.";

const allowedMimeTypesByExtension = {
  ".txt": new Set(["", "text/plain", "application/octet-stream"]),
  ".md": new Set([
    "",
    "text/markdown",
    "text/plain",
    "application/octet-stream",
  ]),
  ".pdf": new Set(["", "application/pdf", "application/octet-stream"]),
} as const;

export type AllowedDocumentExtension =
  keyof typeof allowedMimeTypesByExtension;

export type UploadCandidate = {
  name: string;
  type?: string;
  size: number;
};

export type UploadValidationResult =
  | {
      ok: true;
      displayName: string;
      extension: AllowedDocumentExtension;
      safeFileName: string;
      mimeType: string;
    }
  | {
      ok: false;
      error: string;
    };

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

export function isDocumentUploadRequestTooLarge(headers: Headers) {
  const contentLength = readContentLength(headers);

  return (
    contentLength !== null &&
    contentLength > MAX_DOCUMENT_UPLOAD_REQUEST_BYTES
  );
}

export function isMultipartDocumentUploadRequest(headers: Headers) {
  return (
    headers
      .get("content-type")
      ?.toLowerCase()
      .split(";")[0]
      .trim() === "multipart/form-data"
  );
}

function getBasename(fileName: string) {
  return fileName.replace(/\0/g, "").split(/[\\/]/).pop() ?? "";
}

function getExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex < 0) {
    return "";
  }

  return fileName.slice(dotIndex).toLowerCase();
}

function sanitizeStem(stem: string) {
  const sanitized = stem
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "");

  return sanitized || "document";
}

function truncateSafeStem(stem: string, extension: string) {
  const maxStemLength = Math.max(
    1,
    MAX_DOCUMENT_SAFE_FILE_NAME_LENGTH - extension.length,
  );
  const truncatedStem = stem.slice(0, maxStemLength).replace(/[._-]+$/g, "");

  return truncatedStem || "document";
}

function truncateFileName(fileName: string, maxLength: number) {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const extension = getExtension(fileName);
  const maxStemLength = Math.max(1, maxLength - extension.length);
  const stem = extension ? fileName.slice(0, -extension.length) : fileName;
  const truncatedStem = stem.slice(0, maxStemLength).trim();

  return `${truncatedStem || "document"}${extension}`;
}

export function sanitizeDocumentFileName(fileName: string) {
  const basename = getBasename(fileName).trim();
  const extension = getExtension(basename);
  const stem = extension ? basename.slice(0, -extension.length) : basename;
  const safeStem = truncateSafeStem(sanitizeStem(stem), extension);

  return `${safeStem}${extension}`;
}

export function sanitizeDocumentDisplayName(fileName: string) {
  const basename = getBasename(fileName)
    .trim()
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f]+/g, "")
    .trim();

  return truncateFileName(
    basename || "document",
    MAX_DOCUMENT_DISPLAY_FILE_NAME_LENGTH,
  );
}

export function validateDocumentUpload(
  candidate: UploadCandidate,
): UploadValidationResult {
  const originalName = candidate.name.trim();

  if (!originalName) {
    return { ok: false, error: "Choose a file to upload." };
  }

  if (candidate.size <= 0) {
    return { ok: false, error: "The uploaded file is empty." };
  }

  if (candidate.size > MAX_DOCUMENT_UPLOAD_BYTES) {
    return {
      ok: false,
      error: DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
    };
  }

  const extension = getExtension(getBasename(originalName));

  if (!(extension in allowedMimeTypesByExtension)) {
    return {
      ok: false,
      error: "Only .txt, .md, and .pdf files are supported.",
    };
  }

  const allowedMimeTypes =
    allowedMimeTypesByExtension[extension as AllowedDocumentExtension];
  const mimeType = candidate.type?.trim().toLowerCase() ?? "";

  if (!allowedMimeTypes.has(mimeType)) {
    return {
      ok: false,
      error: "The file type does not match the selected document format.",
    };
  }

  return {
    ok: true,
    displayName: sanitizeDocumentDisplayName(originalName),
    extension: extension as AllowedDocumentExtension,
    safeFileName: sanitizeDocumentFileName(originalName),
    mimeType: mimeType || fallbackMimeType(extension as AllowedDocumentExtension),
  };
}

export function validateDocumentBytes(
  extension: AllowedDocumentExtension,
  bytes: Buffer,
): UploadValidationResult | { ok: true } {
  if (bytes.length <= 0) {
    return { ok: false, error: "The uploaded file is empty." };
  }

  if (bytes.length > MAX_DOCUMENT_UPLOAD_BYTES) {
    return {
      ok: false,
      error: DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
    };
  }

  if (extension === ".pdf") {
    return bytes.subarray(0, 5).toString("utf8") === "%PDF-"
      ? { ok: true }
      : { ok: false, error: "PDF uploads must contain a valid PDF header." };
  }

  if (bytes.includes(0)) {
    return {
      ok: false,
      error: "Text and Markdown uploads must be text files.",
    };
  }

  return { ok: true };
}

function fallbackMimeType(extension: AllowedDocumentExtension) {
  if (extension === ".pdf") {
    return "application/pdf";
  }

  if (extension === ".md") {
    return "text/markdown";
  }

  return "text/plain";
}
