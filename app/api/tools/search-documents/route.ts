import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeSearchLimit,
  normalizeSearchQuery,
  searchDocumentChunks,
} from "@/lib/search/semantic";
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

  const query =
    typeof body === "object" && body !== null && "query" in body
      ? normalizeSearchQuery(body.query)
      : null;

  if (!query) {
    return NextResponse.json(
      { error: "Search query must be between 1 and 1000 characters." },
      { status: 400 },
    );
  }

  const limit =
    typeof body === "object" && body !== null && "limit" in body
      ? normalizeSearchLimit(body.limit)
      : normalizeSearchLimit(undefined);

  try {
    const results = await searchDocumentChunks({
      limit,
      ownerId: session.user.id,
      query,
    });

    await prisma.auditLog.create({
      data: {
        action: "agent_tool_search_documents",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: {
          limit,
          resultCount: results.length,
        },
        resourceType: "AgentTool",
        userAgent: readUserAgent(request),
      },
    });

    return NextResponse.json({
      results,
      tool: "search-documents",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
