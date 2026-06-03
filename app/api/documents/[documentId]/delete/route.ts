import { rm } from "node:fs/promises";
import { auth } from "@/auth";
import { isDocumentOwner } from "@/lib/documents/access";
import { resolveStoragePath } from "@/lib/documents/storage";
import { prisma } from "@/lib/prisma";
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
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/dashboard/documents", request.url),
    );
  }

  const { documentId } = await context.params;
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      ownerId: true,
      originalName: true,
      storagePath: true,
    },
  });

  if (!document || !isDocumentOwner(document, session.user.id)) {
    return redirectToDocuments(request, { error: "not-found" });
  }

  await prisma.$transaction([
    prisma.document.delete({
      where: { id: document.id },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "document_delete",
        resourceType: "Document",
        resourceId: document.id,
        metadata: {
          originalName: document.originalName,
        },
      },
    }),
  ]);

  if (document.storagePath) {
    await rm(resolveStoragePath(document.storagePath), { force: true });
  }

  return redirectToDocuments(request, { deleted: "1" });
}
