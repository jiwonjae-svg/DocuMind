import { auth } from "@/auth";
import {
  AI_ANSWER_RATE_LIMIT_ERROR,
  AI_SEARCH_RATE_LIMIT_ERROR,
  buildAiAnswerRateLimitResponseInit,
  buildAiSearchRateLimitResponseInit,
  checkAiAnswerRateLimit,
  checkAiSearchRateLimit,
} from "@/lib/api/ai-rate-limit";
import { toApiError } from "@/lib/api/errors";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import { buildSearchAuditMetadata, buildSummaryAuditMetadata } from "@/lib/audit/metadata";
import { buildReadableDocumentWhere } from "@/lib/documents/access";
import {
  JsonRpcRequest,
  jsonRpcError,
  jsonRpcResult,
  mcpInitializeResult,
  mcpTextToolResult,
  mcpToolsListResult,
  parseJsonRpcRequest,
} from "@/lib/mcp/protocol";
import { prisma } from "@/lib/prisma";
import {
  answerGroundedQuestion,
  normalizeQuestion,
} from "@/lib/qa/grounded-answer";
import {
  type GroundedAnswerPersistenceDb,
  persistGroundedAnswer,
} from "@/lib/qa/persistence";
import { searchDocumentChunks } from "@/lib/search/semantic";
import {
  MAX_SEARCH_QUERY_LENGTH,
  normalizeSearchLimit,
  normalizeSearchQuery,
} from "@/lib/search/validation";
import {
  normalizeDocumentId,
  summarizeDocumentFromChunks,
} from "@/lib/tools/document-summary";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ToolCallContext = {
  ownerId: string;
  request: NextRequest;
};

function readObjectParams(params: unknown) {
  return params && typeof params === "object" && !Array.isArray(params)
    ? (params as Record<string, unknown>)
    : null;
}

async function callSearchDocuments({
  ownerId,
  request,
}: ToolCallContext, args: unknown) {
  const values = readObjectParams(args);
  const query = values ? normalizeSearchQuery(values.query) : null;

  if (!query) {
    throw new Error(
      `Search query must be between 1 and ${MAX_SEARCH_QUERY_LENGTH} characters.`,
    );
  }

  const limit = normalizeSearchLimit(values?.limit);
  const rateLimit = checkAiSearchRateLimit(ownerId);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      jsonRpcError({
        code: -32000,
        message: AI_SEARCH_RATE_LIMIT_ERROR,
      }),
      buildAiSearchRateLimitResponseInit(rateLimit),
    );
  }

  const results = await searchDocumentChunks({
    limit,
    ownerId,
    query,
  });

  await prisma.auditLog.create({
    data: {
      action: "mcp_tool_search_documents",
      actorId: ownerId,
      ipAddress: readIpAddress(request),
      metadata: buildSearchAuditMetadata({
        limit,
        query,
        resultCount: results.length,
      }),
      resourceType: "McpTool",
      userAgent: readUserAgent(request),
    },
  });

  return {
    results,
    tool: "search-documents",
  };
}

async function callAskWithCitations({
  ownerId,
  request,
}: ToolCallContext, args: unknown) {
  const values = readObjectParams(args);
  const question = values ? normalizeQuestion(values.question) : null;

  if (!question) {
    throw new Error(
      `Question must be between 1 and ${MAX_SEARCH_QUERY_LENGTH} characters.`,
    );
  }

  const rateLimit = checkAiAnswerRateLimit(ownerId);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      jsonRpcError({
        code: -32000,
        message: AI_ANSWER_RATE_LIMIT_ERROR,
      }),
      buildAiAnswerRateLimitResponseInit(rateLimit),
    );
  }

  const result = await answerGroundedQuestion({
    ownerId,
    question,
  });
  const persistedAnswer = await persistGroundedAnswer({
    action: "mcp_tool_ask_with_citations",
    db: prisma as unknown as GroundedAnswerPersistenceDb,
    ipAddress: readIpAddress(request),
    ownerId,
    question,
    result,
    userAgent: readUserAgent(request),
  });

  return {
    answer: result.answer,
    answerId: persistedAnswer.answerId,
    citations: result.citations,
    insufficientInformation: result.insufficientInformation,
    matchedSnippets: result.matchedSnippets,
    questionId: persistedAnswer.questionId,
    tool: "ask-with-citations",
  };
}

async function callSummarizeDocument({
  ownerId,
  request,
}: ToolCallContext, args: unknown) {
  const values = readObjectParams(args);
  const documentId = values ? normalizeDocumentId(values.documentId) : null;

  if (!documentId) {
    throw new Error("documentId is required.");
  }

  const rateLimit = checkAiAnswerRateLimit(ownerId);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      jsonRpcError({
        code: -32000,
        message: AI_ANSWER_RATE_LIMIT_ERROR,
      }),
      buildAiAnswerRateLimitResponseInit(rateLimit),
    );
  }

  const document = await prisma.document.findFirst({
    where: buildReadableDocumentWhere({
      documentId,
      userId: ownerId,
    }),
    select: {
      chunks: {
        orderBy: {
          chunkIndex: "asc",
        },
        select: {
          chunkIndex: true,
          content: true,
        },
      },
      id: true,
      status: true,
      title: true,
    },
  });

  if (!document) {
    throw new Error("Document not found.");
  }

  if (document.status !== "READY") {
    throw new Error("Document must be READY before summarization.");
  }

  const result = await summarizeDocumentFromChunks({
    chunks: document.chunks,
    documentTitle: document.title,
  });

  await prisma.auditLog.create({
    data: {
      action: "mcp_tool_summarize_document",
      actorId: ownerId,
      ipAddress: readIpAddress(request),
      metadata: buildSummaryAuditMetadata({
        citationCount: result.citations.length,
        insufficientInformation: result.insufficientInformation,
        matchedSnippetCount: result.matchedSnippets.length,
        truncated: result.truncated,
      }),
      resourceId: document.id,
      resourceType: "Document",
      userAgent: readUserAgent(request),
    },
  });

  return {
    citations: result.citations,
    documentId: document.id,
    documentTitle: document.title,
    insufficientInformation: result.insufficientInformation,
    matchedSnippets: result.matchedSnippets,
    summary: result.summary,
    tool: "summarize-document",
    truncated: result.truncated,
  };
}

async function handleToolCall({
  context,
  requestMessage,
}: {
  context: ToolCallContext;
  requestMessage: JsonRpcRequest;
}) {
  const params = readObjectParams(requestMessage.params);
  const toolName = typeof params?.name === "string" ? params.name : null;
  const args = params?.arguments;

  if (!toolName) {
    return jsonRpcError({
      code: -32602,
      id: requestMessage.id,
      message: "tools/call requires a tool name.",
    });
  }

  const result =
    toolName === "search-documents"
      ? await callSearchDocuments(context, args)
      : toolName === "ask-with-citations"
        ? await callAskWithCitations(context, args)
        : toolName === "summarize-document"
          ? await callSummarizeDocument(context, args)
          : null;

  if (!result) {
    return jsonRpcError({
      code: -32602,
      id: requestMessage.id,
      message: `Unknown tool: ${toolName}`,
    });
  }

  if (result instanceof NextResponse) {
    return result;
  }

  return jsonRpcResult(requestMessage.id, mcpTextToolResult(result));
}

async function handleMcpRequest(
  request: NextRequest,
  requestMessage: JsonRpcRequest,
  ownerId: string,
) {
  switch (requestMessage.method) {
    case "initialize":
      return jsonRpcResult(requestMessage.id, mcpInitializeResult());
    case "tools/list":
      return jsonRpcResult(requestMessage.id, mcpToolsListResult());
    case "tools/call":
      return handleToolCall({
        context: {
          ownerId,
          request,
        },
        requestMessage,
      });
    default:
      return jsonRpcError({
        code: -32601,
        id: requestMessage.id,
        message: `Method not found: ${requestMessage.method}`,
      });
  }
}

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
      jsonRpcError({
        code: jsonBody.status === 400 ? -32700 : -32600,
        message: jsonBody.error,
      }),
      { status: jsonBody.status },
    );
  }

  const parsed = parseJsonRpcRequest(jsonBody.body);

  if (!parsed.ok) {
    return NextResponse.json(
      jsonRpcError({
        code: -32600,
        message: parsed.error,
      }),
    );
  }

  try {
    const result = await handleMcpRequest(
      request,
      parsed.request,
      session.user.id,
    );

    return result instanceof NextResponse
      ? result
      : NextResponse.json(result);
  } catch (error) {
    const apiError = toApiError(error, "MCP request failed.");

    return NextResponse.json(
      jsonRpcError({
        code: -32000,
        id: parsed.request.id,
        message: apiError.error,
      }),
      { status: apiError.status },
    );
  }
}
