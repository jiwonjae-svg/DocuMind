import { beforeEach, describe, expect, it, vi } from "vitest";

const pdfParseMock = vi.hoisted(() => {
  const state = {
    text: "extracted text",
    total: 2,
  };
  const instances: Array<{
    destroy: ReturnType<typeof vi.fn>;
    getInfo: ReturnType<typeof vi.fn>;
    getText: ReturnType<typeof vi.fn>;
  }> = [];
  const PDFParse = vi.fn(function MockPDFParse(this: {
    destroy: ReturnType<typeof vi.fn>;
    getInfo: ReturnType<typeof vi.fn>;
    getText: ReturnType<typeof vi.fn>;
  }) {
    this.getInfo = vi.fn(async () => ({ total: state.total }));
    this.getText = vi.fn(async () => ({
      text: state.text,
      total: state.total,
    }));
    this.destroy = vi.fn(async () => {});
    instances.push(this);
  });

  Object.assign(PDFParse, {
    setWorker: vi.fn(),
  });

  return {
    instances,
    PDFParse,
    state,
  };
});

vi.mock("pdf-parse", () => ({
  PDFParse: pdfParseMock.PDFParse,
}));

import { extractPdfText } from "../lib/documents/extraction";
import {
  DOCUMENT_PROCESSING_PDF_TOO_MANY_PAGES_ERROR,
  MAX_PDF_DOCUMENT_PAGES,
} from "../lib/documents/processing-errors";

describe("PDF extraction limits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pdfParseMock.instances.length = 0;
    pdfParseMock.state.text = "extracted text";
    pdfParseMock.state.total = 2;
  });

  it("checks PDF page count before extracting text", async () => {
    await expect(extractPdfText(Buffer.from("%PDF-1.7"))).resolves.toBe(
      "extracted text",
    );

    const parser = pdfParseMock.instances[0];

    expect(parser.getInfo).toHaveBeenCalledTimes(1);
    expect(parser.getText).toHaveBeenCalledWith({
      first: MAX_PDF_DOCUMENT_PAGES,
    });
    expect(parser.destroy).toHaveBeenCalledTimes(1);
  });

  it("rejects PDFs above the page limit before text extraction", async () => {
    pdfParseMock.state.total = MAX_PDF_DOCUMENT_PAGES + 1;

    await expect(extractPdfText(Buffer.from("%PDF-1.7"))).rejects.toThrow(
      DOCUMENT_PROCESSING_PDF_TOO_MANY_PAGES_ERROR,
    );

    const parser = pdfParseMock.instances[0];

    expect(parser.getInfo).toHaveBeenCalledTimes(1);
    expect(parser.getText).not.toHaveBeenCalled();
    expect(parser.destroy).toHaveBeenCalledTimes(1);
  });
});
