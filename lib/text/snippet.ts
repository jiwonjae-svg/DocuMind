const DEFAULT_SNIPPET_LENGTH = 320;

export function createSnippet(content: string, length = DEFAULT_SNIPPET_LENGTH) {
  const normalizedContent = content.replace(/\s+/g, " ").trim();

  if (normalizedContent.length <= length) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, length - 1).trimEnd()}...`;
}
