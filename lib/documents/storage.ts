import path from "node:path";

export function getUploadRoot() {
  return path.join(process.cwd(), "uploads", "documents");
}

function safePathSegment(segment: string) {
  return segment.replace(/[^a-zA-Z0-9_-]+/g, "_");
}

function safeFileNameSegment(fileName: string) {
  const basename = fileName.replace(/\0/g, "").split(/[\\/]/).pop() ?? "";
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "");

  return sanitized || "document";
}

export function buildDocumentStoragePath({
  documentId,
  fileName,
  userId,
}: {
  documentId: string;
  fileName: string;
  userId: string;
}) {
  return path.posix.join(
    safePathSegment(userId),
    safePathSegment(documentId),
    safeFileNameSegment(fileName),
  );
}

export function resolveStoragePath(relativeStoragePath: string) {
  if (path.isAbsolute(relativeStoragePath)) {
    throw new Error("Stored document path must be relative.");
  }

  const uploadRoot = getUploadRoot();
  const resolvedPath = path.resolve(uploadRoot, relativeStoragePath);

  if (
    resolvedPath !== uploadRoot &&
    !resolvedPath.startsWith(`${uploadRoot}${path.sep}`)
  ) {
    throw new Error("Stored document path escapes the upload directory.");
  }

  return resolvedPath;
}

export function resolveOptionalStoragePath(
  relativeStoragePath: string | null | undefined,
) {
  return relativeStoragePath ? resolveStoragePath(relativeStoragePath) : null;
}
