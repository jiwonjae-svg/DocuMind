import {
  DOCUMENT_UPLOAD_PARSE_ERROR,
  DOCUMENT_UPLOAD_LENGTH_REQUIRED_ERROR,
  DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
  DOCUMENT_UPLOAD_UNSUPPORTED_MEDIA_TYPE_ERROR,
} from "./validation";
import { DOCUMENT_UPLOAD_RATE_LIMIT_ERROR } from "../api/upload-rate-limit";

export type DocumentNotice = {
  text: string;
  tone: "error" | "success";
};

const knownDocumentErrors = new Map([
  ["missing-file", "Choose a file before uploading."],
  ["not-found", "Document not found."],
  [
    DOCUMENT_UPLOAD_UNSUPPORTED_MEDIA_TYPE_ERROR,
    "Document upload must use multipart form data.",
  ],
  [DOCUMENT_UPLOAD_RATE_LIMIT_ERROR, DOCUMENT_UPLOAD_RATE_LIMIT_ERROR],
  [
    DOCUMENT_UPLOAD_LENGTH_REQUIRED_ERROR,
    "Document upload requires a valid Content-Length header.",
  ],
  [DOCUMENT_UPLOAD_PARSE_ERROR, "Document upload could not be parsed."],
  ["Choose a file to upload.", "Choose a file before uploading."],
  ["The uploaded file is empty.", "The uploaded file is empty."],
  [DOCUMENT_UPLOAD_TOO_LARGE_ERROR, "Files must be 10 MB or smaller."],
  [
    "Only .txt, .md, and .pdf files are supported.",
    "Only .txt, .md, and .pdf files are supported.",
  ],
  [
    "The file type does not match the selected document format.",
    "The file type does not match the selected document format.",
  ],
  [
    "PDF uploads must contain a valid PDF header.",
    "PDF uploads must contain a valid PDF header.",
  ],
  [
    "Text and Markdown uploads must be text files.",
    "Text and Markdown uploads must be text files.",
  ],
  ["Cross-origin request blocked.", "Cross-origin request blocked."],
]);

export function readDocumentNoticeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getDocumentOperationNotice(
  params: Record<string, string | string[] | undefined>,
): DocumentNotice | null {
  if (readDocumentNoticeParam(params.uploaded)) {
    if (readDocumentNoticeParam(params.processed) === "failed") {
      return {
        tone: "error",
        text: "Document uploaded, but text extraction failed.",
      };
    }

    return { tone: "success", text: "Document uploaded and processed." };
  }

  if (readDocumentNoticeParam(params.deleted)) {
    return { tone: "success", text: "Document deleted." };
  }

  const error = readDocumentNoticeParam(params.error);

  if (!error) {
    return null;
  }

  return {
    tone: "error",
    text: knownDocumentErrors.get(error) ?? "Document operation failed.",
  };
}
