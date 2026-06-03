import path from "node:path";

export function getUploadRoot() {
  return path.join(process.cwd(), "uploads", "documents");
}

function safePathSegment(segment: string) {
  return segment.replace(/[^a-zA-Z0-9_-]+/g, "_");
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
    fileName,
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
