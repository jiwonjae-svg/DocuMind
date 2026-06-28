import { describe, expect, it } from "vitest";
import {
  DOCUMENT_UPLOAD_PARSE_ERROR,
  DOCUMENT_UPLOAD_LENGTH_REQUIRED_ERROR,
  DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
  DOCUMENT_UPLOAD_UNSUPPORTED_MEDIA_TYPE_ERROR,
  MAX_DOCUMENT_DISPLAY_FILE_NAME_LENGTH,
  MAX_DOCUMENT_SAFE_FILE_NAME_LENGTH,
  MAX_DOCUMENT_UPLOAD_BYTES,
  MAX_DOCUMENT_UPLOAD_REQUEST_BYTES,
  hasValidDocumentUploadRequestLength,
  isDocumentUploadRequestTooLarge,
  isMultipartDocumentUploadRequest,
  validateDocumentBytes,
  validateDocumentUpload,
} from "../lib/documents/validation";
import {
  resolveOptionalStoragePath,
  resolveStoragePath,
} from "../lib/documents/storage";

describe("document upload validation", () => {
  it("accepts supported text uploads and sanitizes traversal filenames", () => {
    const result = validateDocumentUpload({
      name: "../../team-notes.txt",
      size: 128,
      type: "text/plain",
    });

    expect(result).toEqual({
      ok: true,
      displayName: "team-notes.txt",
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

  it("bounds display names while preserving localized basenames", () => {
    const result = validateDocumentUpload({
      name: `../../${"日本語_".repeat(80)}メモ.md`,
      size: 128,
      type: "text/markdown",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.displayName).toHaveLength(
        MAX_DOCUMENT_DISPLAY_FILE_NAME_LENGTH,
      );
      expect(result.displayName).toContain("日本語");
      expect(result.displayName).not.toContain("/");
      expect(result.displayName).not.toContain("\\");
      expect(result.displayName.endsWith(".md")).toBe(true);
    }
  });

  it("rejects oversized files", () => {
    const result = validateDocumentUpload({
      name: "large.pdf",
      size: MAX_DOCUMENT_UPLOAD_BYTES + 1,
      type: "application/pdf",
    });

    expect(result).toEqual({
      ok: false,
      error: DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
    });
  });

  it("detects oversized declared multipart upload requests", () => {
    expect(
      isDocumentUploadRequestTooLarge(
        new Headers({
          "content-length": String(MAX_DOCUMENT_UPLOAD_REQUEST_BYTES + 1),
        }),
      ),
    ).toBe(true);
    expect(
      isDocumentUploadRequestTooLarge(
        new Headers({
          "content-length": String(MAX_DOCUMENT_UPLOAD_REQUEST_BYTES),
        }),
      ),
    ).toBe(false);
  });

  it("does not reject upload requests with absent or malformed content lengths", () => {
    expect(isDocumentUploadRequestTooLarge(new Headers())).toBe(false);
    expect(
      isDocumentUploadRequestTooLarge(
        new Headers({
          "content-length": "not-a-number",
        }),
      ),
    ).toBe(false);
  });

  it("requires a valid declared request length before multipart parsing", () => {
    expect(
      hasValidDocumentUploadRequestLength(
        new Headers({
          "content-length": "128",
        }),
      ),
    ).toBe(true);
    expect(hasValidDocumentUploadRequestLength(new Headers())).toBe(false);
    expect(
      hasValidDocumentUploadRequestLength(
        new Headers({
          "content-length": "not-a-number",
        }),
      ),
    ).toBe(false);
    expect(DOCUMENT_UPLOAD_LENGTH_REQUIRED_ERROR).toBe(
      "Document upload requires a valid Content-Length header.",
    );
  });

  it("accepts multipart upload request content types with parameters", () => {
    expect(
      isMultipartDocumentUploadRequest(
        new Headers({
          "content-type": "multipart/form-data; boundary=----documind",
        }),
      ),
    ).toBe(true);
  });

  it("rejects missing or non-multipart upload request content types", () => {
    expect(isMultipartDocumentUploadRequest(new Headers())).toBe(false);
    expect(
      isMultipartDocumentUploadRequest(
        new Headers({
          "content-type": "application/json",
        }),
      ),
    ).toBe(false);
    expect(DOCUMENT_UPLOAD_UNSUPPORTED_MEDIA_TYPE_ERROR).toBe(
      "Document upload must use multipart form data.",
    );
    expect(DOCUMENT_UPLOAD_PARSE_ERROR).toBe(
      "Document upload could not be parsed.",
    );
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
    expect(
      validateDocumentBytes(
        ".md",
        Buffer.concat([Buffer.alloc(4096, 0x41), Buffer.from([0x00])]),
      ).ok,
    ).toBe(false);
  });

  it("checks actual upload byte sizes after multipart parsing", () => {
    expect(validateDocumentBytes(".txt", Buffer.alloc(0)).ok).toBe(false);
    expect(
      validateDocumentBytes(".txt", Buffer.alloc(MAX_DOCUMENT_UPLOAD_BYTES + 1)),
    ).toEqual({
      ok: false,
      error: DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
    });
  });

  it("rejects stored paths that escape the upload root", () => {
    expect(() => resolveStoragePath("../outside.txt")).toThrow(
      /upload directory/,
    );
  });

  it("resolves optional stored paths before delete operations", () => {
    expect(resolveOptionalStoragePath("")).toBeNull();
    expect(resolveOptionalStoragePath(null)).toBeNull();
    expect(resolveOptionalStoragePath("user/document/file.txt")).toContain(
      "uploads",
    );
    expect(() => resolveOptionalStoragePath("../outside.txt")).toThrow(
      /upload directory/,
    );
  });
});
