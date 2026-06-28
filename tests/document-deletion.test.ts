import { describe, expect, it } from "vitest";
import {
  deleteOwnedDocument,
  type DeleteOwnedDocumentDb,
} from "../lib/documents/deletion";

function buildDb({
  deleteCount = 1,
  document = {
    id: "document-1",
    originalName: "policy.md",
    storagePath: "user/document/policy.md",
  },
}: {
  deleteCount?: number;
  document?: {
    id: string;
    originalName: string;
    storagePath: string | null;
  } | null;
} = {}) {
  const calls: unknown[] = [];
  const db: DeleteOwnedDocumentDb = {
    $transaction: async (callback) =>
      callback({
        auditLog: {
          create: async (args) => {
            calls.push(["auditLog.create", args]);

            return { id: "audit-1" };
          },
        },
        document: {
          deleteMany: async (args) => {
            calls.push(["document.deleteMany", args]);

            return { count: deleteCount };
          },
          findFirst: async (args) => {
            calls.push(["document.findFirst", args]);

            return document;
          },
        },
      }),
  };

  return { calls, db };
}

describe("document deletion", () => {
  it("uses owner-scoped lookup and owner-scoped delete mutation", async () => {
    const { calls, db } = buildDb();
    const result = await deleteOwnedDocument({
      db,
      documentId: "document-1",
      ipAddress: "127.0.0.1",
      ownerId: "user-1",
      resolveStoragePath: (storagePath) =>
        storagePath ? `/uploads/${storagePath}` : null,
      userAgent: "vitest",
    });

    expect(result).toEqual({
      deleted: true,
      resolvedStoragePath: "/uploads/user/document/policy.md",
    });
    expect(calls).toMatchObject([
      [
        "document.findFirst",
        {
          where: {
            id: "document-1",
            ownerId: "user-1",
          },
        },
      ],
      [
        "document.deleteMany",
        {
          where: {
            id: "document-1",
            ownerId: "user-1",
          },
        },
      ],
      [
        "auditLog.create",
        {
          data: {
            action: "document_delete",
            actorId: "user-1",
            metadata: {
              originalName: "policy.md",
            },
            resourceId: "document-1",
            resourceType: "Document",
          },
        },
      ],
    ]);
  });

  it("does not audit or delete files when the owner-scoped delete loses a race", async () => {
    const { calls, db } = buildDb({ deleteCount: 0 });
    const result = await deleteOwnedDocument({
      db,
      documentId: "document-1",
      ownerId: "user-1",
      resolveStoragePath: (storagePath) =>
        storagePath ? `/uploads/${storagePath}` : null,
    });

    expect(result).toEqual({ deleted: false });
    expect(calls.map((call) => (call as unknown[])[0])).toEqual([
      "document.findFirst",
      "document.deleteMany",
    ]);
  });

  it("validates stored paths before deleting the database record", async () => {
    const { calls, db } = buildDb();

    await expect(
      deleteOwnedDocument({
        db,
        documentId: "document-1",
        ownerId: "user-1",
        resolveStoragePath: () => {
          throw new Error("Stored document path escapes the upload directory.");
        },
      }),
    ).rejects.toThrow(/upload directory/);

    expect(calls.map((call) => (call as unknown[])[0])).toEqual([
      "document.findFirst",
    ]);
  });
});
