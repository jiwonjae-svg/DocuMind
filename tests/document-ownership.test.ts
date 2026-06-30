import { describe, expect, it } from "vitest";
import {
  buildReadableDocumentWhere,
  buildReadableDocumentsWhere,
  buildDocumentOwnerWhere,
  isDocumentOwner,
  normalizeDocumentId,
  normalizeOptionalTeamId,
} from "../lib/documents/access";

describe("document ownership checks", () => {
  it("normalizes document IDs before document operations", () => {
    expect(normalizeDocumentId(" document-1 ")).toBe("document-1");
    expect(normalizeDocumentId("")).toBeNull();
    expect(normalizeDocumentId("../outside")).toBeNull();
    expect(normalizeDocumentId("x".repeat(129))).toBeNull();
    expect(normalizeDocumentId(null)).toBeNull();
  });

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

  it("normalizes optional team IDs for upload scopes", () => {
    expect(normalizeOptionalTeamId(" team-1 ")).toBe("team-1");
    expect(normalizeOptionalTeamId("")).toBeNull();
    expect(normalizeOptionalTeamId("../team")).toBeNull();
    expect(normalizeOptionalTeamId(null)).toBeNull();
  });

  it("builds readable document filters from ownership or team membership", () => {
    expect(
      buildReadableDocumentWhere({
        documentId: "doc-1",
        userId: "user-1",
      }),
    ).toEqual({
      id: "doc-1",
      OR: [
        {
          ownerId: "user-1",
        },
        {
          team: {
            memberships: {
              some: {
                userId: "user-1",
              },
            },
          },
        },
      ],
    });

    expect(buildReadableDocumentsWhere("user-1")).toEqual({
      OR: [
        {
          ownerId: "user-1",
        },
        {
          team: {
            memberships: {
              some: {
                userId: "user-1",
              },
            },
          },
        },
      ],
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
