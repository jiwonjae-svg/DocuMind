import { describe, expect, it } from "vitest";
import {
  DEFAULT_SEARCH_LIMIT,
  MAX_SEARCH_QUERY_LENGTH,
  MAX_SEARCH_LIMIT,
  normalizeSearchLimit,
  normalizeSearchQuery,
} from "../lib/search/validation";

describe("search validation", () => {
  it("normalizes valid search queries", () => {
    expect(normalizeSearchQuery("  onboarding   policy\nnotes  ")).toBe(
      "onboarding policy notes",
    );
  });

  it("removes control characters from search and ask inputs", () => {
    expect(
      normalizeSearchQuery("policy\u0000launch\u007fnotes\u0085owner"),
    ).toBe("policy launch notes owner");
  });

  it("rejects invalid search queries", () => {
    expect(normalizeSearchQuery("")).toBeNull();
    expect(normalizeSearchQuery("   \n\t")).toBeNull();
    expect(
      normalizeSearchQuery("x".repeat(MAX_SEARCH_QUERY_LENGTH + 1)),
    ).toBeNull();
    expect(normalizeSearchQuery(null)).toBeNull();
  });

  it("normalizes search limits into the supported range", () => {
    expect(normalizeSearchLimit(undefined)).toBe(DEFAULT_SEARCH_LIMIT);
    expect(normalizeSearchLimit(null)).toBe(DEFAULT_SEARCH_LIMIT);
    expect(normalizeSearchLimit("3")).toBe(3);
    expect(normalizeSearchLimit(0)).toBe(1);
    expect(normalizeSearchLimit(99)).toBe(MAX_SEARCH_LIMIT);
    expect(normalizeSearchLimit("not-a-number")).toBe(DEFAULT_SEARCH_LIMIT);
  });
});
