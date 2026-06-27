import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  buildDocumentStoragePath,
  resolveStoragePath,
} from "@/lib/documents/storage";
import {
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

  const formData = await request.formData();
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
  const resolvedStoragePath = resolveStoragePath(relativeStoragePath);

  await mkdir(path.dirname(resolvedStoragePath), { recursive: true });
  await writeFile(resolvedStoragePath, bytes);

  try {
    await prisma.$transaction([
      prisma.document.create({
        data: {
          id: documentId,
          ownerId: session.user.id,
          title: getTitleFromFileName(validation.safeFileName),
          originalName: file.name,
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
            originalName: file.name,
            sizeBytes: file.size,
            mimeType: validation.mimeType,
          },
          userAgent: readUserAgent(request),
        },
      }),
    ]);
  } catch (error) {
    await rm(resolvedStoragePath, { force: true });
    throw error;
  }

  const result = await processDocument(documentId, session.user.id);

  return redirectToDocuments(request, {
    processed: result.status.toLowerCase(),
    uploaded: "1",
  });
}
