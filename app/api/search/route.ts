import { auth } from "@/auth";
import {
  AI_SEARCH_RATE_LIMIT_ERROR,
  buildAiSearchRateLimitResponseInit,
  checkAiSearchRateLimit,
} from "@/lib/api/ai-rate-limit";
import { toApiError } from "@/lib/api/errors";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  readJsonBodyResult,
} from "@/lib/api/json-body";
import { buildSearchAuditMetadata } from "@/lib/audit/metadata";
import { prisma } from "@/lib/prisma";
import { searchDocumentChunks } from "@/lib/search/semantic";
import { normalizeSearchLimit, normalizeSearchQuery } from "@/lib/search/validation";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: CROSS_ORIGIN_REQUEST_ERROR },
      { status: 403 },
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const jsonBody = await readJsonBodyResult(request);

  if (!jsonBody.ok) {
    return NextResponse.json(
      { error: jsonBody.error },
      { status: jsonBody.status },
    );
  }

  const { body } = jsonBody;

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

  const rateLimit = checkAiSearchRateLimit(session.user.id);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: AI_SEARCH_RATE_LIMIT_ERROR },
      buildAiSearchRateLimitResponseInit(rateLimit),
    );
  }

  try {
    const results = await searchDocumentChunks({
      limit,
      ownerId: session.user.id,
      query,
    });

    await prisma.auditLog.create({
      data: {
        action: "document_search",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: buildSearchAuditMetadata({
          limit,
          query,
          resultCount: results.length,
        }),
        resourceType: "Search",
        userAgent: readUserAgent(request),
      },
    });

    return NextResponse.json({ results });
  } catch (error) {
    const apiError = toApiError(error, "Search failed.");

    return NextResponse.json(
      { error: apiError.error },
      { status: apiError.status },
    );
  }
}
