type OwnedResource = {
  ownerId: string;
};

type DocumentOwnerWhereInput = {
  documentId: string;
  ownerId: string;
};

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
