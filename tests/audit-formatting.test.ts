import { describe, expect, it } from "vitest";
import {
  formatAuditMetadata,
  formatAuditMetadataValue,
  MAX_AUDIT_METADATA_ENTRIES,
  MAX_AUDIT_METADATA_VALUE_LENGTH,
} from "../lib/audit/formatting";
import {
  buildAnswerAuditMetadata,
  buildSearchAuditMetadata,
} from "../lib/audit/metadata";

describe("audit metadata formatting", () => {
  it("formats primitive metadata values", () => {
    expect(formatAuditMetadataValue("document.txt")).toBe("document.txt");
    expect(formatAuditMetadataValue(5)).toBe("5");
    expect(formatAuditMetadataValue(false)).toBe("false");
    expect(formatAuditMetadataValue(["a", "b", "c"])).toBe("3 items");
  });

  it("bounds long string and object metadata values", () => {
    const longValue = "x".repeat(MAX_AUDIT_METADATA_VALUE_LENGTH + 20);
    const formattedString = formatAuditMetadataValue(longValue);
    const formattedObject = formatAuditMetadataValue({ longValue });

    expect(formattedString).toHaveLength(MAX_AUDIT_METADATA_VALUE_LENGTH);
    expect(formattedString.endsWith("...")).toBe(true);
    expect(formattedObject).toHaveLength(MAX_AUDIT_METADATA_VALUE_LENGTH);
    expect(formattedObject.endsWith("...")).toBe(true);
  });

  it("returns null for missing or empty metadata", () => {
    expect(formatAuditMetadata(null)).toBeNull();
    expect(formatAuditMetadata([])).toBeNull();
    expect(formatAuditMetadata({ blank: "" })).toBeNull();
  });

  it("limits displayed metadata entries", () => {
    const metadata = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
    };
    const formatted = formatAuditMetadata(metadata);

    expect(formatted?.split(" / ")).toHaveLength(MAX_AUDIT_METADATA_ENTRIES);
    expect(formatted).toContain("one: 1");
    expect(formatted).not.toContain("five: 5");
  });

  it("builds search audit metadata without storing the query text", () => {
    const metadata = buildSearchAuditMetadata({
      limit: 5,
      query: "confidential launch policy",
      resultCount: 2,
    });

    expect(metadata).toEqual({
      queryLength: 26,
      limit: 5,
      resultCount: 2,
    });
    expect(Object.values(metadata)).not.toContain("confidential launch policy");
  });

  it("builds answer audit metadata without storing the question text", () => {
    const metadata = buildAnswerAuditMetadata({
      answerId: "answer-1",
      citationCount: 1,
      insufficientInformation: false,
      matchedSnippetCount: 3,
      model: "test-model",
      question: "What is the private roadmap?",
    });

    expect(metadata).toEqual({
      questionLength: 28,
      citationCount: 1,
      insufficientInformation: false,
      matchedSnippetCount: 3,
      model: "test-model",
      answerId: "answer-1",
    });
    expect(Object.values(metadata)).not.toContain(
      "What is the private roadmap?",
    );
  });
});
