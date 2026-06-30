import type { Prisma } from "@prisma/client";

type OwnedResource = {
  ownerId: string;
};

type DocumentOwnerWhereInput = {
  documentId: string;
  ownerId: string;
};

export function normalizeDocumentId(documentId: unknown) {
  if (typeof documentId !== "string") {
    return null;
  }

  const normalized = documentId.trim();

  return normalized.length > 0 &&
    normalized.length <= 128 &&
    /^[A-Za-z0-9_-]+$/.test(normalized)
    ? normalized
    : null;
}

export function normalizeOptionalTeamId(teamId: unknown) {
  if (teamId === null || teamId === undefined || teamId === "") {
    return null;
  }

  return normalizeDocumentId(teamId);
}

export function buildDocumentOwnerWhere({
  documentId,
  ownerId,
}: DocumentOwnerWhereInput) {
  return {
    id: documentId,
    ownerId,
  };
}

export function buildReadableDocumentWhere({
  documentId,
  userId,
}: {
  documentId: string;
  userId: string;
}): Prisma.DocumentWhereInput {
  return {
    id: documentId,
    OR: [
      {
        ownerId: userId,
      },
      {
        team: {
          memberships: {
            some: {
              userId,
            },
          },
        },
      },
    ],
  };
}

export function buildReadableDocumentsWhere(
  userId: string,
): Prisma.DocumentWhereInput {
  return {
    OR: [
      {
        ownerId: userId,
      },
      {
        team: {
          memberships: {
            some: {
              userId,
            },
          },
        },
      },
    ],
  };
}

export function isDocumentOwner(
  resource: OwnedResource | null | undefined,
  userId: string | null | undefined,
) {
  return Boolean(resource && userId && resource.ownerId === userId);
}
