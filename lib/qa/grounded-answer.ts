import "server-only";

import {
  createGroundedAnswer,
  INSUFFICIENT_INFORMATION_ANSWER,
} from "@/lib/ai/answers";
import {
  normalizeSearchQuery,
  retrieveRelevantDocumentChunks,
} from "@/lib/search/semantic";

const DEFAULT_ASK_RETRIEVAL_LIMIT = 5;

type InternalSnippet = {
  chunkId: string;
  chunkIndex: number;
  documentId: string;
  documentTitle: string;
  similarityScore: number;
  snippet: string;
  sourceIndex: number;
};

export type AskCitation = {
  chunkIndex: number;
  documentTitle: string;
  snippet: string;
};

export type MatchedSnippet = AskCitation & {
  similarityScore: number;
};

export type GroundedQuestionAnswer = {
  answer: string;
  citations: AskCitation[];
  insufficientInformation: boolean;
  matchedSnippets: MatchedSnippet[];
  model: string | null;
  primaryDocumentId: string | null;
};

export function normalizeQuestion(question: unknown) {
  return normalizeSearchQuery(question);
}

function toPublicSnippet(snippet: InternalSnippet): MatchedSnippet {
  return {
    chunkIndex: snippet.chunkIndex,
    documentTitle: snippet.documentTitle,
    similarityScore: snippet.similarityScore,
    snippet: snippet.snippet,
  };
}

function toCitation(snippet: InternalSnippet): AskCitation {
  return {
    chunkIndex: snippet.chunkIndex,
    documentTitle: snippet.documentTitle,
    snippet: snippet.snippet,
  };
}

export async function answerGroundedQuestion({
  ownerId,
  question,
}: {
  ownerId: string;
  question: string;
}): Promise<GroundedQuestionAnswer> {
  const chunks = await retrieveRelevantDocumentChunks({
    limit: DEFAULT_ASK_RETRIEVAL_LIMIT,
    ownerId,
    query: question,
  });

  const matchedSnippets: InternalSnippet[] = chunks.map((chunk, index) => ({
    chunkId: chunk.chunkId,
    chunkIndex: chunk.chunkIndex,
    documentId: chunk.documentId,
    documentTitle: chunk.documentTitle,
    similarityScore: chunk.similarityScore,
    snippet: chunk.snippet,
    sourceIndex: index + 1,
  }));

  if (chunks.length === 0) {
    return {
      answer: INSUFFICIENT_INFORMATION_ANSWER,
      citations: [],
      insufficientInformation: true,
      matchedSnippets: [],
      model: null,
      primaryDocumentId: null,
    };
  }

  const generated = await createGroundedAnswer({
    question,
    sources: chunks.map((chunk, index) => ({
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      documentTitle: chunk.documentTitle,
      sourceIndex: index + 1,
    })),
  });
  const citationIndexes = new Set(generated.citationIndexes);
  const internalCitations = matchedSnippets.filter((snippet) =>
    citationIndexes.has(snippet.sourceIndex),
  );
  const insufficientInformation =
    generated.insufficientInformation || internalCitations.length === 0;

  if (insufficientInformation) {
    return {
      answer: INSUFFICIENT_INFORMATION_ANSWER,
      citations: [],
      insufficientInformation: true,
      matchedSnippets: matchedSnippets.map(toPublicSnippet),
      model: generated.model,
      primaryDocumentId: null,
    };
  }

  return {
    answer: generated.answer,
    citations: internalCitations.map(toCitation),
    insufficientInformation: false,
    matchedSnippets: matchedSnippets.map(toPublicSnippet),
    model: generated.model,
    primaryDocumentId: internalCitations[0]?.documentId ?? null,
  };
}
