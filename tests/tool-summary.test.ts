import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  normalizeDocumentId,
  selectSummaryChunks,
} from "../lib/tools/document-summary";
import {
  createSnippet,
  DEFAULT_SNIPPET_LENGTH,
} from "../lib/text/snippet";

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

  it("skips blank summary chunks and trims selected context", () => {
    const selected = selectSummaryChunks([
      { chunkIndex: 0, content: "   " },
      { chunkIndex: 1, content: "  Alpha policy note.  " },
      { chunkIndex: 2, content: "\n\t" },
      { chunkIndex: 3, content: "\nBeta action item.\n" },
    ]);

    expect(selected).toEqual({
      chunks: [
        { chunkIndex: 1, content: "Alpha policy note." },
        { chunkIndex: 3, content: "Beta action item." },
      ],
      truncated: false,
    });
  });

  it("creates concise snippets", () => {
    expect(createSnippet("  alpha   beta  ", 20)).toBe("alpha beta");
    expect(createSnippet("alpha\u0000beta\u202egamma\u0085delta", 40)).toBe(
      "alpha beta gamma delta",
    );
    expect(createSnippet("a".repeat(30), 10)).toBe("aaaaaaa...");
    expect(createSnippet("a".repeat(30), 10)).toHaveLength(10);
    expect(createSnippet("abcdef", 2)).toBe("..");
    expect(createSnippet("abcdef", 0)).toBe("");
    expect(createSnippet("a".repeat(DEFAULT_SNIPPET_LENGTH + 10))).toHaveLength(
      DEFAULT_SNIPPET_LENGTH,
    );
    expect(createSnippet("a".repeat(DEFAULT_SNIPPET_LENGTH + 10), NaN))
      .toHaveLength(DEFAULT_SNIPPET_LENGTH);
    expect(createSnippet("a".repeat(DEFAULT_SNIPPET_LENGTH + 10), Infinity))
      .toHaveLength(DEFAULT_SNIPPET_LENGTH);
  });
});
