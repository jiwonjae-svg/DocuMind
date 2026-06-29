import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { resolveStoragePath } from "./storage";
import {
  DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
  MAX_DOCUMENT_UPLOAD_BYTES,
} from "./validation";

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

async function readStoredDocumentBytes(storagePath: string) {
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
    const result = await parser.getText();

    return result.text;
  } finally {
    await parser.destroy();
  }
}

export async function extractDocumentText(document: ExtractableDocument) {
  const bytes = await readStoredDocumentBytes(document.storagePath);

  if (shouldReadAsText(document)) {
    return stripByteOrderMark(bytes.toString("utf8"));
  }

  if (shouldReadAsPdf(document)) {
    return extractPdfText(bytes);
  }

  throw new Error("Unsupported document type.");
}
