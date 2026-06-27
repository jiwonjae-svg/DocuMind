import { auth } from "@/auth";
import { toApiError } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import {
  normalizeDocumentId,
  summarizeDocumentFromChunks,
} from "@/lib/tools/document-summary";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const documentId =
    typeof body === "object" && body !== null && "documentId" in body
      ? normalizeDocumentId(body.documentId)
      : null;

  if (!documentId) {
    return NextResponse.json({ error: "documentId is required." }, { status: 400 });
  }

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        ownerId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        title: true,
        chunks: {
          orderBy: {
            chunkIndex: "asc",
          },
          select: {
            chunkIndex: true,
            content: true,
          },
          where: {
            ownerId: session.user.id,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (document.status !== "READY") {
      return NextResponse.json(
        { error: "Document must be READY before summarization." },
        { status: 400 },
      );
    }

    const result = await summarizeDocumentFromChunks({
      chunks: document.chunks,
      documentTitle: document.title,
    });

    await prisma.auditLog.create({
      data: {
        action: "agent_tool_summarize_document",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: {
          citationCount: result.citations.length,
          insufficientInformation: result.insufficientInformation,
          matchedSnippetCount: result.matchedSnippets.length,
          model: result.model,
          truncated: result.truncated,
        },
        resourceId: document.id,
        resourceType: "Document",
        userAgent: readUserAgent(request),
      },
    });

    return NextResponse.json({
      citations: result.citations,
      documentId: document.id,
      documentTitle: document.title,
      insufficientInformation: result.insufficientInformation,
      matchedSnippets: result.matchedSnippets,
      summary: result.summary,
      tool: "summarize-document",
      truncated: result.truncated,
    });
  } catch (error) {
    const apiError = toApiError(error, "Document summarization failed.");

    return NextResponse.json(
      { error: apiError.error },
      { status: apiError.status },
    );
  }
}
