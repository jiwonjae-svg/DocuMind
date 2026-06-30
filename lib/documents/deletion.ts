type DeletedDocumentCandidate = {
  id: string;
  originalName: string;
  storagePath: string | null;
};

type DeleteManyResult = {
  count: number;
};

type DeleteDocumentTransaction = {
  auditLog: {
    create(args: {
      data: {
        action: string;
        actorId: string;
        ipAddress?: string | null;
        metadata: {
          originalName: string;
        };
        resourceId: string;
        resourceType: string;
        userAgent?: string | null;
      };
    }): Promise<unknown>;
  };
  document: {
    deleteMany(args: {
      where: {
        id: string;
        ownerId: string;
      };
    }): Promise<DeleteManyResult>;
    findFirst(args: {
      select: {
        id: true;
        originalName: true;
        storagePath: true;
      };
      where: {
        id: string;
        ownerId: string;
      };
    }): Promise<DeletedDocumentCandidate | null>;
  };
};

export type DeleteOwnedDocumentDb = {
  $transaction<T>(
    callback: (transaction: DeleteDocumentTransaction) => Promise<T>,
  ): Promise<T>;
};

type DeleteOwnedDocumentOptions = {
  db: DeleteOwnedDocumentDb;
  documentId: string;
  ipAddress?: string | null;
  ownerId: string;
  validateStoragePath: (storagePath: string | null) => string | null;
  userAgent?: string | null;
};

type DeleteOwnedDocumentResult =
  | {
      deleted: false;
    }
  | {
      deleted: true;
      storagePath: string | null;
    };

export async function deleteOwnedDocument({
  db,
  documentId,
  ipAddress,
  ownerId,
  validateStoragePath,
  userAgent,
}: DeleteOwnedDocumentOptions): Promise<DeleteOwnedDocumentResult> {
  return db.$transaction(async (transaction) => {
    const document = await transaction.document.findFirst({
      where: {
        id: documentId,
        ownerId,
      },
      select: {
        id: true,
        originalName: true,
        storagePath: true,
      },
    });

    if (!document) {
      return { deleted: false };
    }

    const storagePath = validateStoragePath(document.storagePath);
    const deleted = await transaction.document.deleteMany({
      where: {
        id: document.id,
        ownerId,
      },
    });

    if (deleted.count !== 1) {
      return { deleted: false };
    }

    await transaction.auditLog.create({
      data: {
        actorId: ownerId,
        action: "document_delete",
        ipAddress,
        resourceType: "Document",
        resourceId: document.id,
        metadata: {
          originalName: document.originalName,
        },
        userAgent,
      },
    });

    return {
      deleted: true,
      storagePath,
    };
  });
}
