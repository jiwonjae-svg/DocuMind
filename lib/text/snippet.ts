export const DEFAULT_SNIPPET_LENGTH = 320;

const ELLIPSIS = "...";

function normalizeSnippetLength(length: number) {
  return Number.isFinite(length)
    ? Math.max(0, Math.floor(length))
    : DEFAULT_SNIPPET_LENGTH;
}

export function createSnippet(content: string, length = DEFAULT_SNIPPET_LENGTH) {
  const normalizedContent = content.replace(/\s+/g, " ").trim();
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
