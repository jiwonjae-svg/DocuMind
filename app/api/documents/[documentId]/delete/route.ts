import { auth } from "@/auth";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  DOCUMENT_DELETE_RATE_LIMIT_ERROR,
  checkDocumentDeleteRateLimit,
} from "@/lib/api/document-delete-rate-limit";
import {
  deleteOwnedDocument,
  type DeleteOwnedDocumentDb,
} from "@/lib/documents/deletion";
import { normalizeDocumentId } from "@/lib/documents/access";
import {
  deleteStoredDocument,
  validateOptionalStoragePath,
} from "@/lib/documents/storage";
import { prisma } from "@/lib/prisma";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type DeleteRouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

function redirectToDocuments(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/dashboard/documents", request.url);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest, context: DeleteRouteContext) {
  if (!isSameOriginRequest(request)) {
    return redirectToDocuments(request, { error: CROSS_ORIGIN_REQUEST_ERROR });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/dashboard/documents", request.url),
    );
  }

  const deleteRateLimit = checkDocumentDeleteRateLimit(session.user.id);

  if (!deleteRateLimit.allowed) {
    return redirectToDocuments(request, {
      error: DOCUMENT_DELETE_RATE_LIMIT_ERROR,
    });
  }

  const { documentId: rawDocumentId } = await context.params;
  const documentId = normalizeDocumentId(rawDocumentId);

  if (!documentId) {
    return redirectToDocuments(request, { error: "not-found" });
  }

  const result = await deleteOwnedDocument({
    db: prisma as unknown as DeleteOwnedDocumentDb,
    documentId,
    ipAddress: readIpAddress(request),
    validateStoragePath: validateOptionalStoragePath,
    userAgent: readUserAgent(request),
    ownerId: session.user.id,
  });

  if (!result.deleted) {
    return redirectToDocuments(request, { error: "not-found" });
  }

  if (result.storagePath) {
    await deleteStoredDocument({ storagePath: result.storagePath });
  }

  return redirectToDocuments(request, { deleted: "1" });
}
