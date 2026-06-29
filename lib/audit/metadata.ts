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
  question: string;
};

type SummaryAuditMetadataInput = {
  citationCount: number;
  insufficientInformation: boolean;
  matchedSnippetCount: number;
  truncated: boolean;
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
  question,
}: AnswerAuditMetadataInput) {
  return {
    questionLength: question.length,
    citationCount,
    insufficientInformation,
    matchedSnippetCount,
    answerId,
  };
}

export function buildSummaryAuditMetadata({
  citationCount,
  insufficientInformation,
  matchedSnippetCount,
  truncated,
}: SummaryAuditMetadataInput) {
  return {
    citationCount,
    insufficientInformation,
    matchedSnippetCount,
    truncated,
  };
}
