import { rm } from "node:fs/promises";
import { auth } from "@/auth";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import { buildDocumentOwnerWhere } from "@/lib/documents/access";
import { resolveOptionalStoragePath } from "@/lib/documents/storage";
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

  const { documentId } = await context.params;
  const document = await prisma.document.findFirst({
    where: buildDocumentOwnerWhere({
      documentId,
      ownerId: session.user.id,
    }),
    select: {
      id: true,
      ownerId: true,
      originalName: true,
      storagePath: true,
    },
  });

  if (!document) {
    return redirectToDocuments(request, { error: "not-found" });
  }

  const resolvedStoragePath = resolveOptionalStoragePath(document.storagePath);

  await prisma.$transaction([
    prisma.document.delete({
      where: { id: document.id },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "document_delete",
        ipAddress: readIpAddress(request),
        resourceType: "Document",
        resourceId: document.id,
        metadata: {
          originalName: document.originalName,
        },
        userAgent: readUserAgent(request),
      },
    }),
  ]);

  if (resolvedStoragePath) {
    await rm(resolvedStoragePath, { force: true });
  }

  return redirectToDocuments(request, { deleted: "1" });
}
