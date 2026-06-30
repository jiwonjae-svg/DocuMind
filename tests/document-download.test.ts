import { describe, expect, it } from "vitest";
import {
  DOCUMENT_DOWNLOAD_FILE_NOT_FOUND_ERROR,
  MAX_DOCUMENT_DOWNLOAD_FILE_NAME_LENGTH,
  buildDownloadContentDisposition,
  normalizeDownloadFileName,
} from "../lib/documents/download";

describe("document download helpers", () => {
  it("normalizes download filenames without path or control characters", () => {
    expect(normalizeDownloadFileName("../日本語\r\nreport\u202e.pdf")).toBe(
      "日本語 report.pdf",
    );
    expect(normalizeDownloadFileName("")).toBe("document");
    expect(normalizeDownloadFileName(null)).toBe("document");
  });

  it("bounds download filenames while preserving the extension", () => {
    const normalized = normalizeDownloadFileName(
      `${"long-name-".repeat(40)}.pdf`,
    );

    expect(normalized).toHaveLength(MAX_DOCUMENT_DOWNLOAD_FILE_NAME_LENGTH);
    expect(normalized.endsWith(".pdf")).toBe(true);
  });

  it("builds safe content-disposition headers for localized filenames", () => {
    const disposition = buildDownloadContentDisposition("한국어 문서 (최종).pdf");

    expect(disposition).toContain("attachment;");
    expect(disposition).toMatch(/filename="[^"\r\n]+"/);
    expect(disposition).toContain(
      "filename*=UTF-8''%ED%95%9C%EA%B5%AD%EC%96%B4%20%EB%AC%B8%EC%84%9C%20%28%EC%B5%9C%EC%A2%85%29.pdf",
    );
    expect(disposition).not.toMatch(/[\r\n\u202e]/);
  });

  it("exposes a stable missing-file error", () => {
    expect(DOCUMENT_DOWNLOAD_FILE_NOT_FOUND_ERROR).toBe(
      "Document file not found.",
    );
  });
});
