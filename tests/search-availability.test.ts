import { describe, expect, it } from "vitest";
import { hasSearchableChunk } from "../lib/search/availability";

describe("search availability", () => {
  it("detects searchable chunks from boolean rows", () => {
    expect(hasSearchableChunk([{ exists: true }])).toBe(true);
    expect(hasSearchableChunk([{ exists: false }])).toBe(false);
  });

  it("handles driver-specific truthy values", () => {
    expect(hasSearchableChunk([{ exists: 1 }])).toBe(true);
    expect(hasSearchableChunk([{ exists: "true" }])).toBe(true);
    expect(hasSearchableChunk([{ exists: "TRUE" }])).toBe(true);
  });

  it("returns false for empty or null availability rows", () => {
    expect(hasSearchableChunk([])).toBe(false);
    expect(hasSearchableChunk([{ exists: null }])).toBe(false);
  });
});
