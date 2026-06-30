export const DOCUMENT_DOWNLOAD_FILE_NOT_FOUND_ERROR =
  "Document file not found.";
export const MAX_DOCUMENT_DOWNLOAD_FILE_NAME_LENGTH = 180;

const unsafeFileNameCharacters = /[\u0000-\u001f\u007f-\u009f\p{Cf}]+/gu;

function truncateFileName(fileName: string) {
  if (fileName.length <= MAX_DOCUMENT_DOWNLOAD_FILE_NAME_LENGTH) {
    return fileName;
  }

  const extensionMatch = fileName.match(/(\.[A-Za-z0-9]{1,12})$/);
  const extension = extensionMatch?.[1] ?? "";
  const baseLength = MAX_DOCUMENT_DOWNLOAD_FILE_NAME_LENGTH - extension.length;

  return `${fileName.slice(0, Math.max(baseLength, 1))}${extension}`;
}

export function normalizeDownloadFileName(value: unknown) {
  const rawName = typeof value === "string" ? value : "";
  const basename = rawName.replace(/\0/g, "").split(/[\\/]/).pop() ?? "";
  const normalized = basename
    .normalize("NFC")
    .replace(unsafeFileNameCharacters, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+(\.[A-Za-z0-9]{1,12})$/u, "$1")
    .replace(/^[.\s_-]+|[\s]+$/g, "")
    .trim();

  return truncateFileName(normalized || "document");
}

function buildAsciiFallbackFileName(fileName: string) {
  const fallback = fileName
    .replace(/["\\]/g, "_")
    .replace(/[^\x20-\x7e]+/g, "_")
    .replace(/\s+/g, " ")
    .replace(/_+/g, "_")
    .replace(/^[.\s_-]+|[\s]+$/g, "")
    .trim();

  return truncateFileName(fallback || "document");
}

function encodeRfc5987Value(value: string) {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function buildDownloadContentDisposition(fileName: string) {
  const normalizedFileName = normalizeDownloadFileName(fileName);
  const fallbackFileName = buildAsciiFallbackFileName(normalizedFileName);

  return `attachment; filename="${fallbackFileName}"; filename*=UTF-8''${encodeRfc5987Value(normalizedFileName)}`;
}
