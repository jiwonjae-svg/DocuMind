import { prisma } from "@/lib/prisma";
import { extractDocumentText } from "./extraction";
import { splitTextIntoChunks, TextChunk } from "./chunking";
import { embedMissingDocumentChunks } from "./embeddings";
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

  await prisma.document.update({
    where: {
      id: document.id,
    },
    data: {
      processingError: null,
      status: "PROCESSING",
    },
  });

  try {
    const text = await extractDocumentText(document);
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

    await prisma.$transaction([
      prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          extractedCharCount: text.trim().length,
          processingError: null,
          status: "READY",
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: ownerId,
          action: "document_process_ready",
          resourceType: "Document",
          resourceId: document.id,
          metadata: {
            chunkCount: chunkData.length,
            embeddedChunkCount: embeddingSummary.embeddedChunkCount,
            extractedCharCount: text.trim().length,
          },
        },
      }),
    ]);

    return {
      chunkCount: chunkData.length,
      embeddedChunkCount: embeddingSummary.embeddedChunkCount,
      status: "READY",
    };
  } catch (error) {
    const processingError = normalizeDocumentProcessingError(error);

    await prisma.$transaction([
      prisma.documentChunk.deleteMany({
        where: {
          documentId: document.id,
          ownerId,
        },
      }),
      prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          processingError,
          status: "FAILED",
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: ownerId,
          action: "document_process_failed",
          resourceType: "Document",
          resourceId: document.id,
          metadata: {
            error: processingError,
          },
        },
      }),
    ]);

    return {
      error: processingError,
      status: "FAILED",
    };
  }
}
