import { describe, expect, it } from "vitest";
import {
  buildDocumentOwnerWhere,
  isDocumentOwner,
} from "../lib/documents/access";

describe("document ownership checks", () => {
  it("builds owner-scoped document lookup filters", () => {
    expect(
      buildDocumentOwnerWhere({
        documentId: "doc-1",
        ownerId: "user-1",
      }),
    ).toEqual({
      id: "doc-1",
      ownerId: "user-1",
    });
  });

  it("allows the owning user", () => {
    expect(isDocumentOwner({ ownerId: "user-1" }, "user-1")).toBe(true);
  });

  it("rejects other users", () => {
    expect(isDocumentOwner({ ownerId: "user-1" }, "user-2")).toBe(false);
  });

  it("rejects missing users and missing resources", () => {
    expect(isDocumentOwner({ ownerId: "user-1" }, null)).toBe(false);
    expect(isDocumentOwner(null, "user-1")).toBe(false);
  });
});
