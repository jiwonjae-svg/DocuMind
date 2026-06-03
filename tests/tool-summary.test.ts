import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  normalizeDocumentId,
  selectSummaryChunks,
} from "../lib/tools/document-summary";
import { createSnippet } from "../lib/text/snippet";

describe("agent tool summary helpers", () => {
  it("normalizes document IDs", () => {
    expect(normalizeDocumentId(" document-1 ")).toBe("document-1");
    expect(normalizeDocumentId("")).toBeNull();
    expect(normalizeDocumentId("../outside")).toBeNull();
    expect(normalizeDocumentId("x".repeat(129))).toBeNull();
    expect(normalizeDocumentId(null)).toBeNull();
  });

  it("selects a bounded summary context", () => {
    const chunks = Array.from({ length: 20 }, (_, index) => ({
      chunkIndex: index,
      content: `chunk ${index} `.repeat(200),
    }));

    const selected = selectSummaryChunks(chunks);

    expect(selected.chunks.length).toBe(12);
    expect(selected.truncated).toBe(true);
  });

  it("creates concise snippets", () => {
    expect(createSnippet("  alpha   beta  ", 20)).toBe("alpha beta");
    expect(createSnippet("a".repeat(30), 10)).toBe("aaaaaaaaa...");
  });
});
