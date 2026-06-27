import { describe, expect, it } from "vitest";
import {
  getDocumentOperationNotice,
  readDocumentNoticeParam,
} from "../lib/documents/notices";

describe("document operation notices", () => {
  it("returns success notices for upload and delete redirects", () => {
    expect(getDocumentOperationNotice({ uploaded: "1" })).toEqual({
      text: "Document uploaded and processed.",
      tone: "success",
    });
    expect(getDocumentOperationNotice({ deleted: "1" })).toEqual({
      text: "Document deleted.",
      tone: "success",
    });
  });

  it("returns an error notice for failed post-upload processing", () => {
    expect(
      getDocumentOperationNotice({ processed: "failed", uploaded: "1" }),
    ).toEqual({
      text: "Document uploaded, but text extraction failed.",
      tone: "error",
    });
  });

  it("maps known error codes and validation messages", () => {
    expect(getDocumentOperationNotice({ error: "missing-file" })).toEqual({
      text: "Choose a file before uploading.",
      tone: "error",
    });
    expect(
      getDocumentOperationNotice({
        error: "Only .txt, .md, and .pdf files are supported.",
      }),
    ).toEqual({
      text: "Only .txt, .md, and .pdf files are supported.",
      tone: "error",
    });
  });

  it("does not reflect arbitrary error query strings", () => {
    expect(
      getDocumentOperationNotice({ error: "<script>alert(1)</script>" }),
    ).toEqual({
      text: "Document operation failed.",
      tone: "error",
    });
  });

  it("reads the first value from repeated query params", () => {
    expect(readDocumentNoticeParam(["first", "second"])).toBe("first");
  });
});
