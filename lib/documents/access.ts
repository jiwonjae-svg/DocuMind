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

export function buildDocumentOwnerWhere({
  documentId,
  ownerId,
}: DocumentOwnerWhereInput) {
  return {
    id: documentId,
    ownerId,
  };
}

export function isDocumentOwner(
  resource: OwnedResource | null | undefined,
  userId: string | null | undefined,
) {
  return Boolean(resource && userId && resource.ownerId === userId);
}
