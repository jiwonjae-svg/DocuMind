export const DEFAULT_CHUNK_TARGET_SIZE = 3000;
export const DEFAULT_CHUNK_OVERLAP_SIZE = 500;

export type TextChunk = {
  content: string;
  index: number;
  charStart: number;
  charEnd: number;
};

type ChunkingOptions = {
  overlapSize?: number;
  targetSize?: number;
};

function normalizeText(text: string) {
  return text.replace(/\r\n?/g, "\n").trim();
}

function findLastParagraphBreak(
  text: string,
  start: number,
  end: number,
): number | null {
  const segment = text.slice(start, end);
  const matches = [...segment.matchAll(/\n\s*\n/g)];
  const match = matches.at(-1);

  return match?.index === undefined ? null : start + match.index;
}

function findLastWhitespace(
  text: string,
  start: number,
  end: number,
): number | null {
  for (let index = end - 1; index > start; index -= 1) {
    if (/\s/.test(text[index])) {
      return index;
    }
  }

  return null;
}

function findChunkEnd(text: string, start: number, targetSize: number) {
  const idealEnd = Math.min(text.length, start + targetSize);

  if (idealEnd >= text.length) {
    return text.length;
  }

  const minimumUsefulEnd = start + Math.floor(targetSize * 0.6);
  const paragraphBreak = findLastParagraphBreak(text, start, idealEnd);

  if (paragraphBreak !== null && paragraphBreak >= minimumUsefulEnd) {
    return paragraphBreak;
  }

  const whitespace = findLastWhitespace(text, minimumUsefulEnd, idealEnd);

  return whitespace ?? idealEnd;
}

function findNextStart(text: string, chunkEnd: number, overlapSize: number) {
  if (chunkEnd >= text.length) {
    return text.length;
  }

  const overlapStart = Math.max(0, chunkEnd - overlapSize);
  const paragraphBreak = findLastParagraphBreak(text, overlapStart, chunkEnd);

  if (paragraphBreak !== null) {
    const afterBreak = text.slice(paragraphBreak).match(/^\n\s*\n/)?.[0]
      .length;

    if (afterBreak) {
      return paragraphBreak + afterBreak;
    }
  }

  return overlapStart;
}

function trimChunkBounds(text: string, start: number, end: number) {
  let charStart = start;
  let charEnd = end;

  while (charStart < charEnd && /\s/.test(text[charStart])) {
    charStart += 1;
  }

  while (charEnd > charStart && /\s/.test(text[charEnd - 1])) {
    charEnd -= 1;
  }

  return {
    charStart,
    charEnd,
    content: text.slice(charStart, charEnd),
  };
}

export function splitTextIntoChunks(
  text: string,
  options: ChunkingOptions = {},
): TextChunk[] {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return [];
  }

  const targetSize = options.targetSize ?? DEFAULT_CHUNK_TARGET_SIZE;
  const overlapSize = options.overlapSize ?? DEFAULT_CHUNK_OVERLAP_SIZE;

  if (targetSize <= 0) {
    throw new Error("targetSize must be greater than 0.");
  }

  if (overlapSize < 0 || overlapSize >= targetSize) {
    throw new Error("overlapSize must be lower than targetSize.");
  }

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < normalizedText.length) {
    const end = findChunkEnd(normalizedText, start, targetSize);
    const trimmed = trimChunkBounds(normalizedText, start, end);

    if (trimmed.content) {
      chunks.push({
        content: trimmed.content,
        index: chunks.length,
        charStart: trimmed.charStart,
        charEnd: trimmed.charEnd,
      });
    }

    const nextStart = findNextStart(normalizedText, end, overlapSize);

    if (nextStart <= start) {
      start = end;
    } else {
      start = nextStart;
    }
  }

  return chunks;
}
