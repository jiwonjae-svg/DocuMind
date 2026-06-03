import { describe, expect, it } from "vitest";
import { splitTextIntoChunks } from "../lib/documents/chunking";

describe("document text chunking", () => {
  it("returns no chunks for empty text", () => {
    expect(splitTextIntoChunks("  \n\n  ")).toEqual([]);
  });

  it("splits long text with overlap", () => {
    const text = ["A".repeat(70), "B".repeat(70), "C".repeat(70)].join("\n\n");
    const chunks = splitTextIntoChunks(text, {
      overlapSize: 20,
      targetSize: 100,
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].index).toBe(0);
    expect(chunks[1].index).toBe(1);
    expect(chunks[1].charStart).toBeLessThan(chunks[0].charEnd);
  });

  it("prefers paragraph boundaries when practical", () => {
    const firstParagraph = "First paragraph sentence. ".repeat(3).trim();
    const secondParagraph = "Second paragraph sentence. ".repeat(3).trim();
    const text = `${firstParagraph}\n\n${secondParagraph}`;
    const chunks = splitTextIntoChunks(text, {
      overlapSize: 10,
      targetSize: firstParagraph.length + 12,
    });

    expect(chunks[0].content).toBe(firstParagraph);
  });
});
