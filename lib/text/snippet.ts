export const DEFAULT_SNIPPET_LENGTH = 320;

const ELLIPSIS = "...";

export function createSnippet(content: string, length = DEFAULT_SNIPPET_LENGTH) {
  const normalizedContent = content.replace(/\s+/g, " ").trim();
  const normalizedLength = Math.max(0, Math.floor(length));

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
