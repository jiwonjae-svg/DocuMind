import path from "node:path";
import { pathToFileURL } from "node:url";
import { readStoredDocumentBytes } from "./storage";
import {
  DOCUMENT_PROCESSING_PDF_TOO_MANY_PAGES_ERROR,
  MAX_PDF_DOCUMENT_PAGES,
} from "./processing-limits";

export type ExtractableDocument = {
  mimeType: string;
  originalName: string;
  storagePath: string;
};

function getExtension(fileName: string) {
  return path.extname(fileName).toLowerCase();
}

function stripByteOrderMark(text: string) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function shouldReadAsText(document: ExtractableDocument) {
  const extension = getExtension(document.originalName);

  return (
    extension === ".txt" ||
    extension === ".md" ||
    document.mimeType === "text/plain" ||
    document.mimeType === "text/markdown"
  );
}

function shouldReadAsPdf(document: ExtractableDocument) {
  return (
    getExtension(document.originalName) === ".pdf" ||
    document.mimeType === "application/pdf"
  );
}

export async function extractPdfText(bytes: Buffer) {
  const { PDFParse } = await import("pdf-parse");

  PDFParse.setWorker(
    pathToFileURL(
      path.join(
        process.cwd(),
        "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      ),
    ).href,
  );

  const parser = new PDFParse({ data: bytes });

  try {
    const info = await parser.getInfo();

    if (info.total > MAX_PDF_DOCUMENT_PAGES) {
      throw new Error(DOCUMENT_PROCESSING_PDF_TOO_MANY_PAGES_ERROR);
    }

    const result = await parser.getText({ first: MAX_PDF_DOCUMENT_PAGES });

    return result.text;
  } finally {
    await parser.destroy();
  }
}

export async function extractDocumentText(document: ExtractableDocument) {
  const bytes = await readStoredDocumentBytes({
    storagePath: document.storagePath,
  });

  if (shouldReadAsText(document)) {
    return stripByteOrderMark(bytes.toString("utf8"));
  }

  if (shouldReadAsPdf(document)) {
    return extractPdfText(bytes);
  }

  throw new Error("Unsupported document type.");
}
