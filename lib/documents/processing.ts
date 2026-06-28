import { prisma } from "@/lib/prisma";
import { buildDocumentOwnerWhere } from "./access";
import { extractDocumentText } from "./extraction";
import { splitTextIntoChunks, TextChunk } from "./chunking";
import { embedMissingDocumentChunks } from "./embeddings";
import { readProcessableExtractedTextLength } from "./processing-limits";
import {
  DOCUMENT_PROCESSING_NO_TEXT_ERROR,
  normalizeDocumentProcessingError,
} from "./processing-errors";

type ProcessDocumentResult =
  | {
      chunkCount: number;
      embeddedChunkCount: number;
      status: "READY";
    }
  | {
      error: string;
      status: "FAILED";
    };

function approximateTokenCount(content: string) {
  return Math.ceil(content.length / 4);
}

function buildChunkData({
  chunks,
  document,
}: {
  chunks: TextChunk[];
  document: {
    id: string;
    mimeType: string;
    originalName: string;
    ownerId: string;
    title: string;
  };
}) {
  return chunks.map((chunk) => ({
    documentId: document.id,
    ownerId: document.ownerId,
    chunkIndex: chunk.index,
    content: chunk.content,
    tokenCount: approximateTokenCount(chunk.content),
    metadata: {
      charEnd: chunk.charEnd,
      charStart: chunk.charStart,
      documentTitle: document.title,
      mimeType: document.mimeType,
      originalName: document.originalName,
    },
  }));
}

export function createChunksForDocumentText({
  document,
  text,
}: {
  document: {
    id: string;
    mimeType: string;
    originalName: string;
    ownerId: string;
    title: string;
  };
  text: string;
}) {
  readProcessableExtractedTextLength(text);
  const chunks = splitTextIntoChunks(text);

  if (chunks.length === 0) {
    throw new Error(DOCUMENT_PROCESSING_NO_TEXT_ERROR);
  }

  return buildChunkData({ chunks, document });
}

export async function processDocument(
  documentId: string,
  ownerId: string,
): Promise<ProcessDocumentResult> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      ownerId,
    },
    select: {
      id: true,
      mimeType: true,
      originalName: true,
      ownerId: true,
      storagePath: true,
      title: true,
    },
  });

  if (!document) {
    return {
      error: "Document not found.",
      status: "FAILED",
    };
  }

  const ownerWhere = buildDocumentOwnerWhere({
    documentId: document.id,
    ownerId,
  });
  const processingUpdate = await prisma.document.updateMany({
    where: ownerWhere,
    data: {
      processingError: null,
      status: "PROCESSING",
    },
  });

  if (processingUpdate.count !== 1) {
    return {
      error: "Document not found.",
      status: "FAILED",
    };
  }

  try {
    const text = await extractDocumentText(document);
    const extractedCharCount = readProcessableExtractedTextLength(text);
    const chunkData = createChunksForDocumentText({ document, text });

    await prisma.$transaction([
      prisma.documentChunk.deleteMany({
        where: {
          documentId: document.id,
          ownerId,
        },
      }),
      prisma.documentChunk.createMany({
        data: chunkData,
      }),
    ]);

    const embeddingSummary = await embedMissingDocumentChunks({
      documentId: document.id,
      ownerId,
    });

    const readyUpdateSucceeded = await prisma.$transaction(async (transaction) => {
      const readyUpdate = await transaction.document.updateMany({
        where: ownerWhere,
        data: {
          extractedCharCount,
          processingError: null,
          status: "READY",
        },
      });

      if (readyUpdate.count !== 1) {
        return false;
      }

      await transaction.auditLog.create({
        data: {
          actorId: ownerId,
          action: "document_process_ready",
          resourceType: "Document",
          resourceId: document.id,
          metadata: {
            chunkCount: chunkData.length,
            embeddedChunkCount: embeddingSummary.embeddedChunkCount,
            extractedCharCount,
          },
        },
      });

      return true;
    });

    if (!readyUpdateSucceeded) {
      return {
        error: "Document not found.",
        status: "FAILED",
      };
    }

    return {
      chunkCount: chunkData.length,
      embeddedChunkCount: embeddingSummary.embeddedChunkCount,
      status: "READY",
    };
  } catch (error) {
    const processingError = normalizeDocumentProcessingError(error);

    const failedUpdateSucceeded = await prisma.$transaction(async (transaction) => {
      await transaction.documentChunk.deleteMany({
        where: {
          documentId: document.id,
          ownerId,
        },
      });

      const failedUpdate = await transaction.document.updateMany({
        where: ownerWhere,
        data: {
          processingError,
          status: "FAILED",
        },
      });

      if (failedUpdate.count !== 1) {
        return false;
      }

      await transaction.auditLog.create({
        data: {
          actorId: ownerId,
          action: "document_process_failed",
          resourceType: "Document",
          resourceId: document.id,
          metadata: {
            error: processingError,
          },
        },
      });

      return true;
    });

    if (!failedUpdateSucceeded) {
      return {
        error: "Document not found.",
        status: "FAILED",
      };
    }

    return {
      error: processingError,
      status: "FAILED",
    };
  }
}
