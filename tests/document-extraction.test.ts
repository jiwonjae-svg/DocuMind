import { describe, expect, it } from "vitest";
import { extractPdfText } from "../lib/documents/extraction";

describe("document text extraction", () => {
  it("rejects malformed PDFs without crashing", async () => {
    await expect(
      extractPdfText(Buffer.from("%PDF-1.7\nthis is not a valid pdf")),
    ).rejects.toThrow();
  });
});
