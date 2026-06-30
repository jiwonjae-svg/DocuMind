import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  DOCUMENT_UPLOAD_RATE_LIMIT_ERROR,
  checkDocumentUploadRateLimit,
} from "@/lib/api/upload-rate-limit";
import {
  buildDocumentStoragePath,
  deleteStoredDocument,
  putStoredDocument,
} from "@/lib/documents/storage";
import {
  DOCUMENT_UPLOAD_PARSE_ERROR,
  DOCUMENT_UPLOAD_LENGTH_REQUIRED_ERROR,
  DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
  DOCUMENT_UPLOAD_UNSUPPORTED_MEDIA_TYPE_ERROR,
  hasValidDocumentUploadRequestLength,
  isDocumentUploadRequestTooLarge,
  isMultipartDocumentUploadRequest,
  validateDocumentBytes,
  validateDocumentUpload,
} from "@/lib/documents/validation";
import { processDocument } from "@/lib/documents/processing";
import { prisma } from "@/lib/prisma";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function redirectToDocuments(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/dashboard/documents", request.url);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/login?callbackUrl=/dashboard/documents", request.url),
  );
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File;
}

function getTitleFromFileName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");

  return withoutExtension || fileName;
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return redirectToDocuments(request, { error: CROSS_ORIGIN_REQUEST_ERROR });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return redirectToLogin(request);
  }

  const uploadRateLimit = checkDocumentUploadRateLimit(session.user.id);

  if (!uploadRateLimit.allowed) {
    return redirectToDocuments(request, {
      error: DOCUMENT_UPLOAD_RATE_LIMIT_ERROR,
    });
  }

  if (isDocumentUploadRequestTooLarge(request.headers)) {
    return redirectToDocuments(request, {
      error: DOCUMENT_UPLOAD_TOO_LARGE_ERROR,
    });
  }

  if (!isMultipartDocumentUploadRequest(request.headers)) {
    return redirectToDocuments(request, {
      error: DOCUMENT_UPLOAD_UNSUPPORTED_MEDIA_TYPE_ERROR,
    });
  }

  if (!hasValidDocumentUploadRequestLength(request.headers)) {
    return redirectToDocuments(request, {
      error: DOCUMENT_UPLOAD_LENGTH_REQUIRED_ERROR,
    });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return redirectToDocuments(request, {
      error: DOCUMENT_UPLOAD_PARSE_ERROR,
    });
  }

  const file = formData.get("file");

  if (!isUploadFile(file)) {
    return redirectToDocuments(request, { error: "missing-file" });
  }

  const validation = validateDocumentUpload({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validation.ok) {
    return redirectToDocuments(request, { error: validation.error });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const byteValidation = validateDocumentBytes(validation.extension, bytes);

  if (!byteValidation.ok) {
    return redirectToDocuments(request, { error: byteValidation.error });
  }

  const documentId = randomUUID();
  const relativeStoragePath = buildDocumentStoragePath({
    documentId,
    fileName: validation.safeFileName,
    userId: session.user.id,
  });

  await putStoredDocument({
    bytes,
    mimeType: validation.mimeType,
    storagePath: relativeStoragePath,
  });

  try {
    await prisma.$transaction([
      prisma.document.create({
        data: {
          id: documentId,
          ownerId: session.user.id,
          title: getTitleFromFileName(validation.displayName),
          originalName: validation.displayName,
          storedName: validation.safeFileName,
          storagePath: relativeStoragePath,
          mimeType: validation.mimeType,
          sizeBytes: file.size,
          sourceType: "upload",
          status: "UPLOADED",
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "document_upload",
          ipAddress: readIpAddress(request),
          resourceType: "Document",
          resourceId: documentId,
          metadata: {
            originalName: validation.displayName,
            sizeBytes: file.size,
            mimeType: validation.mimeType,
          },
          userAgent: readUserAgent(request),
        },
      }),
    ]);
  } catch (error) {
    await deleteStoredDocument({ storagePath: relativeStoragePath });
    throw error;
  }

  const result = await processDocument(documentId, session.user.id);

  return redirectToDocuments(request, {
    processed: result.status.toLowerCase(),
    uploaded: "1",
  });
}
