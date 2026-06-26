export const DEFAULT_SEARCH_LIMIT = 5;
export const MAX_SEARCH_LIMIT = 10;

const MAX_QUERY_LENGTH = 1000;

export function normalizeSearchQuery(query: unknown) {
  if (typeof query !== "string") {
    return null;
  }

  const normalizedQuery = query.replace(/\s+/g, " ").trim();

  if (!normalizedQuery || normalizedQuery.length > MAX_QUERY_LENGTH) {
    return null;
  }

  return normalizedQuery;
}

export function normalizeSearchLimit(limit: unknown) {
  if (limit === undefined || limit === null) {
    return DEFAULT_SEARCH_LIMIT;
  }

  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedLimit)) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(Math.max(parsedLimit, 1), MAX_SEARCH_LIMIT);
}
