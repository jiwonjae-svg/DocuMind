import { describe, expect, it } from "vitest";
import { isDocumentOwner } from "../lib/documents/access";

describe("document ownership checks", () => {
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
