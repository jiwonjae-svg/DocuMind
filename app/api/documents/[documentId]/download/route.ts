import { auth } from "@/auth";
import { CROSS_ORIGIN_REQUEST_ERROR } from "@/lib/api/request-origin";
import { buildReadableDocumentWhere, normalizeDocumentId } from "@/lib/documents/access";
import {
  DOCUMENT_DOWNLOAD_FILE_NOT_FOUND_ERROR,
  buildDownloadContentDisposition,
} from "@/lib/documents/download";
import { readStoredDocumentBytes } from "@/lib/documents/storage";
import { prisma } from "@/lib/prisma";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type DownloadRouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

function isCrossSiteDownloadRequest(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();

  return fetchSite === "cross-site" || fetchSite === "same-site";
}

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/login?callbackUrl=/dashboard/documents", request.url),
  );
}

function notFoundResponse() {
  return NextResponse.json(
    { error: DOCUMENT_DOWNLOAD_FILE_NOT_FOUND_ERROR },
    { status: 404 },
  );
}

export async function GET(request: NextRequest, context: DownloadRouteContext) {
  if (isCrossSiteDownloadRequest(request)) {
    return NextResponse.json(
      { error: CROSS_ORIGIN_REQUEST_ERROR },
      { status: 403 },
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    return redirectToLogin(request);
  }

  const { documentId: rawDocumentId } = await context.params;
  const documentId = normalizeDocumentId(rawDocumentId);

  if (!documentId) {
    return notFoundResponse();
  }

  const document = await prisma.document.findFirst({
    select: {
      id: true,
      mimeType: true,
      originalName: true,
      sizeBytes: true,
      storagePath: true,
      teamId: true,
    },
    where: buildReadableDocumentWhere({
      documentId,
      userId: session.user.id,
    }),
  });

  if (!document?.storagePath) {
    return notFoundResponse();
  }

  let bytes: Buffer;

  try {
    bytes = await readStoredDocumentBytes({
      storagePath: document.storagePath,
    });
  } catch {
    return notFoundResponse();
  }

  await prisma.auditLog.create({
    data: {
      action: "document_download",
      actorId: session.user.id,
      ipAddress: readIpAddress(request),
      metadata: {
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        teamId: document.teamId,
      },
      resourceId: document.id,
      resourceType: "Document",
      userAgent: readUserAgent(request),
    },
  });

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": buildDownloadContentDisposition(
        document.originalName,
      ),
      "Content-Length": String(bytes.byteLength),
      "Content-Type": document.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
