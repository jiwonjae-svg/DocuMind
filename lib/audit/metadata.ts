type SearchAuditMetadataInput = {
  limit: number;
  query: string;
  resultCount: number;
};

type AnswerAuditMetadataInput = {
  answerId: string;
  citationCount: number;
  insufficientInformation: boolean;
  matchedSnippetCount: number;
  model: string | null;
  question: string;
};

export function buildSearchAuditMetadata({
  limit,
  query,
  resultCount,
}: SearchAuditMetadataInput) {
  return {
    queryLength: query.length,
    limit,
    resultCount,
  };
}

export function buildAnswerAuditMetadata({
  answerId,
  citationCount,
  insufficientInformation,
  matchedSnippetCount,
  model,
  question,
}: AnswerAuditMetadataInput) {
  return {
    questionLength: question.length,
    citationCount,
    insufficientInformation,
    matchedSnippetCount,
    model,
    answerId,
  };
}
