import "server-only";

import {
  createGroundedAnswer,
  INSUFFICIENT_INFORMATION_ANSWER,
} from "../ai/answers";
import { normalizeDocumentId } from "../documents/access";
import { createSnippet } from "../text/snippet";

const MAX_SUMMARY_CHUNKS = 12;
const MAX_SUMMARY_CHARS = 18000;

type SummaryChunk = {
  chunkIndex: number;
  content: string;
};

export type SummaryCitation = {
  chunkIndex: number;
  documentTitle: string;
  snippet: string;
};

export type DocumentSummaryResult = {
  citations: SummaryCitation[];
  insufficientInformation: boolean;
  matchedSnippets: SummaryCitation[];
  model: string | null;
  summary: string;
  truncated: boolean;
};

export { normalizeDocumentId };

export function selectSummaryChunks(chunks: SummaryChunk[]) {
  const eligibleChunks = chunks
    .map((chunk) => ({
      chunkIndex: chunk.chunkIndex,
      content: chunk.content.trim(),
    }))
    .filter((chunk) => chunk.content.length > 0);
  const selected: SummaryChunk[] = [];
  let usedChars = 0;

  for (const chunk of eligibleChunks) {
    if (selected.length >= MAX_SUMMARY_CHUNKS) {
      break;
    }

    const remainingChars = MAX_SUMMARY_CHARS - usedChars;

    if (remainingChars <= 0) {
      break;
    }

    const content =
      chunk.content.length > remainingChars
        ? chunk.content.slice(0, remainingChars)
        : chunk.content;

    selected.push({
      chunkIndex: chunk.chunkIndex,
      content,
    });
    usedChars += content.length;
  }

  return {
    chunks: selected,
    truncated:
      selected.length < eligibleChunks.length ||
      selected.some(
        (selectedChunk, index) =>
          selectedChunk.content.length !== eligibleChunks[index]?.content.length,
      ),
  };
}

export async function summarizeDocumentFromChunks({
  chunks,
  documentTitle,
}: {
  chunks: SummaryChunk[];
  documentTitle: string;
}): Promise<DocumentSummaryResult> {
  const selection = selectSummaryChunks(chunks);
  const matchedSnippets = selection.chunks.map((chunk) => ({
    chunkIndex: chunk.chunkIndex,
    documentTitle,
    snippet: createSnippet(chunk.content),
  }));

  if (selection.chunks.length === 0) {
    return {
      citations: [],
      insufficientInformation: true,
      matchedSnippets: [],
      model: null,
      summary: INSUFFICIENT_INFORMATION_ANSWER,
      truncated: false,
    };
  }

  const generated = await createGroundedAnswer({
    question:
      "Summarize this document for an internal teammate. Include the main points, decisions, action items, and risks when the source chunks support them.",
    sources: selection.chunks.map((chunk, index) => ({
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      documentTitle,
      sourceIndex: index + 1,
    })),
  });
  const citationIndexes = new Set(generated.citationIndexes);
  const citations = matchedSnippets.filter((_, index) =>
    citationIndexes.has(index + 1),
  );
  const insufficientInformation =
    generated.insufficientInformation || citations.length === 0;

  if (insufficientInformation) {
    return {
      citations: [],
      insufficientInformation: true,
      matchedSnippets,
      model: generated.model,
      summary: INSUFFICIENT_INFORMATION_ANSWER,
      truncated: selection.truncated,
    };
  }

  return {
    citations,
    insufficientInformation: false,
    matchedSnippets,
    model: generated.model,
    summary: generated.answer,
    truncated: selection.truncated,
  };
}
