import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractDocumentText,
  extractPdfText,
} from "../lib/documents/extraction";
import {
  buildDocumentStoragePath,
  resolveStoragePath,
} from "../lib/documents/storage";
import {
  DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
  MAX_DOCUMENT_UPLOAD_BYTES,
} from "../lib/documents/validation";

describe("document text extraction", () => {
  it("rejects malformed PDFs without crashing", async () => {
    await expect(
      extractPdfText(Buffer.from("%PDF-1.7\nthis is not a valid pdf")),
    ).rejects.toThrow();
  });

  it("rejects oversized stored files before text extraction", async () => {
    const userId = `user-${randomUUID()}`;
    const documentId = randomUUID();
    const storagePath = buildDocumentStoragePath({
      documentId,
      fileName: "large.txt",
      userId,
    });
    const resolvedPath = resolveStoragePath(storagePath);
    const cleanupRoot = path.dirname(path.dirname(resolvedPath));

    try {
      await mkdir(path.dirname(resolvedPath), { recursive: true });
      await writeFile(
        resolvedPath,
        Buffer.alloc(MAX_DOCUMENT_UPLOAD_BYTES + 1),
      );

      await expect(
        extractDocumentText({
          mimeType: "text/plain",
          originalName: "large.txt",
          storagePath,
        }),
      ).rejects.toThrow(DOCUMENT_UPLOAD_TOO_LARGE_ERROR);
    } finally {
      await rm(cleanupRoot, { force: true, recursive: true });
    }
  });
});
