import { lstat, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
  MAX_DOCUMENT_UPLOAD_BYTES,
} from "./validation";

export type DocumentStorageProvider = "local" | "vercel-blob";
type DocumentStorageEnv = Record<string, string | undefined>;

type StoredDocumentInput = {
  bytes: Buffer;
  mimeType: string;
  provider?: DocumentStorageProvider;
  storagePath: string;
};

type StoredDocumentPathInput = {
  provider?: DocumentStorageProvider;
  storagePath: string;
};

export function getUploadRoot() {
  return path.join(process.cwd(), "uploads", "documents");
}

export function getDocumentStorageProvider(
  env: DocumentStorageEnv = process.env,
): DocumentStorageProvider {
  return env.DOCUMENT_STORAGE_PROVIDER === "vercel-blob"
    ? "vercel-blob"
    : "local";
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

export function validateOptionalStoragePath(
  relativeStoragePath: string | null | undefined,
) {
  if (!relativeStoragePath) {
    return null;
  }

  resolveStoragePath(relativeStoragePath);

  return relativeStoragePath;
}

async function putLocalStoredDocument({
  bytes,
  storagePath,
}: StoredDocumentInput) {
  const resolvedStoragePath = resolveStoragePath(storagePath);

  await mkdir(path.dirname(resolvedStoragePath), { recursive: true });
  await writeFile(resolvedStoragePath, bytes, { flag: "wx" });
}

async function readLocalStoredDocumentBytes(storagePath: string) {
  const resolvedPath = resolveStoragePath(storagePath);
  const fileStats = await lstat(resolvedPath);

  if (!fileStats.isFile()) {
    throw new Error("Stored document path must point to a file.");
  }

  if (fileStats.size > MAX_DOCUMENT_UPLOAD_BYTES) {
    throw new Error(DOCUMENT_UPLOAD_TOO_LARGE_ERROR);
  }

  return readFile(resolvedPath);
}

async function readStreamToBoundedBuffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    receivedBytes += value.byteLength;

    if (receivedBytes > MAX_DOCUMENT_UPLOAD_BYTES) {
      await reader.cancel().catch(() => {});
      throw new Error(DOCUMENT_UPLOAD_TOO_LARGE_ERROR);
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

async function putBlobStoredDocument({
  bytes,
  mimeType,
  storagePath,
}: StoredDocumentInput) {
  resolveStoragePath(storagePath);
  const { put } = await import("@vercel/blob");

  await put(storagePath, bytes, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: mimeType,
  });
}

async function readBlobStoredDocumentBytes(storagePath: string) {
  resolveStoragePath(storagePath);
  const { get } = await import("@vercel/blob");
  const result = await get(storagePath, {
    access: "private",
  });

  if (!result || result.statusCode !== 200) {
    throw new Error("Stored document not found.");
  }

  if (result.blob.size > MAX_DOCUMENT_UPLOAD_BYTES) {
    throw new Error(DOCUMENT_UPLOAD_TOO_LARGE_ERROR);
  }

  return readStreamToBoundedBuffer(result.stream);
}

export async function putStoredDocument({
  bytes,
  mimeType,
  provider = getDocumentStorageProvider(),
  storagePath,
}: StoredDocumentInput) {
  if (provider === "vercel-blob") {
    await putBlobStoredDocument({ bytes, mimeType, provider, storagePath });

    return;
  }

  await putLocalStoredDocument({ bytes, mimeType, provider, storagePath });
}

export async function readStoredDocumentBytes({
  provider = getDocumentStorageProvider(),
  storagePath,
}: StoredDocumentPathInput) {
  if (provider === "vercel-blob") {
    return readBlobStoredDocumentBytes(storagePath);
  }

  return readLocalStoredDocumentBytes(storagePath);
}

export async function deleteStoredDocument({
  provider = getDocumentStorageProvider(),
  storagePath,
}: StoredDocumentPathInput) {
  if (provider === "vercel-blob") {
    resolveStoragePath(storagePath);
    const { del } = await import("@vercel/blob");

    await del(storagePath);
    return;
  }

  await rm(resolveStoragePath(storagePath), { force: true });
}
