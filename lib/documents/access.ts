type OwnedResource = {
  ownerId: string;
};

export function isDocumentOwner(
  resource: OwnedResource | null | undefined,
  userId: string | null | undefined,
) {
  return Boolean(resource && userId && resource.ownerId === userId);
}
