export const DEFAULT_SNIPPET_LENGTH = 320;

const ELLIPSIS = "...";
const unsafeSnippetCharacters = /[\u0000-\u001f\u007f-\u009f\p{Cf}]+/gu;

function normalizeSnippetLength(length: number) {
  return Number.isFinite(length)
    ? Math.max(0, Math.floor(length))
    : DEFAULT_SNIPPET_LENGTH;
}

export function createSnippet(content: string, length = DEFAULT_SNIPPET_LENGTH) {
  const normalizedContent = content
    .replace(unsafeSnippetCharacters, " ")
    .replace(/\s+/g, " ")
    .trim();
  const normalizedLength = normalizeSnippetLength(length);

  if (normalizedContent.length <= normalizedLength) {
    return normalizedContent;
  }

  if (normalizedLength <= ELLIPSIS.length) {
    return ELLIPSIS.slice(0, normalizedLength);
  }

  return `${normalizedContent
    .slice(0, normalizedLength - ELLIPSIS.length)
    .trimEnd()}${ELLIPSIS}`;
}
