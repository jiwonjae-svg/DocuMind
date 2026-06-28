export const MAX_EXTRACTED_DOCUMENT_TEXT_CHARS = 300_000;
export const DOCUMENT_PROCESSING_TEXT_TOO_LARGE_ERROR =
  "Extracted document text must be 300,000 characters or fewer.";

export function readProcessableExtractedTextLength(text: string) {
  const extractedCharCount = text.trim().length;

  if (extractedCharCount > MAX_EXTRACTED_DOCUMENT_TEXT_CHARS) {
    throw new Error(DOCUMENT_PROCESSING_TEXT_TOO_LARGE_ERROR);
  }

  return extractedCharCount;
}
