import { describe, expect, it } from "vitest";
import {
  MAX_DOCUMENT_SAFE_FILE_NAME_LENGTH,
  MAX_DOCUMENT_UPLOAD_BYTES,
  validateDocumentBytes,
  validateDocumentUpload,
} from "../lib/documents/validation";
import { resolveStoragePath } from "../lib/documents/storage";

describe("document upload validation", () => {
  it("accepts supported text uploads and sanitizes traversal filenames", () => {
    const result = validateDocumentUpload({
      name: "../../team-notes.txt",
      size: 128,
      type: "text/plain",
    });

    expect(result).toEqual({
      ok: true,
      extension: ".txt",
      safeFileName: "team-notes.txt",
      mimeType: "text/plain",
    });
  });

  it("rejects unsupported extensions", () => {
    const result = validateDocumentUpload({
      name: "malware.exe",
      size: 128,
      type: "application/octet-stream",
    });

    expect(result.ok).toBe(false);
  });

  it("bounds sanitized filenames while preserving the extension", () => {
    const result = validateDocumentUpload({
      name: `${"very-long-name-".repeat(30)}.md`,
      size: 128,
      type: "text/markdown",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.safeFileName).toHaveLength(
        MAX_DOCUMENT_SAFE_FILE_NAME_LENGTH,
      );
      expect(result.safeFileName.endsWith(".md")).toBe(true);
    }
  });

  it("rejects oversized files", () => {
    const result = validateDocumentUpload({
      name: "large.pdf",
      size: MAX_DOCUMENT_UPLOAD_BYTES + 1,
      type: "application/pdf",
    });

    expect(result.ok).toBe(false);
  });

  it("rejects mismatched mime types", () => {
    const result = validateDocumentUpload({
      name: "notes.md",
      size: 128,
      type: "application/pdf",
    });

    expect(result.ok).toBe(false);
  });

  it("checks pdf headers", () => {
    expect(validateDocumentBytes(".pdf", Buffer.from("%PDF-1.7"))).toEqual({
      ok: true,
    });
    expect(validateDocumentBytes(".pdf", Buffer.from("not a pdf")).ok).toBe(
      false,
    );
  });

  it("rejects binary content for text files", () => {
    expect(validateDocumentBytes(".txt", Buffer.from([0x41, 0x00])).ok).toBe(
      false,
    );
  });

  it("rejects stored paths that escape the upload root", () => {
    expect(() => resolveStoragePath("../outside.txt")).toThrow(
      /upload directory/,
    );
  });
});
