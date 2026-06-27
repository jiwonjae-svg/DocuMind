import { auth } from "@/auth";
import {
  AI_ANSWER_RATE_LIMIT_ERROR,
  buildAiAnswerRateLimitResponseInit,
  checkAiAnswerRateLimit,
} from "@/lib/api/ai-rate-limit";
import { toApiError } from "@/lib/api/errors";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import { buildAnswerAuditMetadata } from "@/lib/audit/metadata";
import {
  answerGroundedQuestion,
  normalizeQuestion,
} from "@/lib/qa/grounded-answer";
import { prisma } from "@/lib/prisma";
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

  const rateLimit = checkAiAnswerRateLimit(session.user.id);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: AI_ANSWER_RATE_LIMIT_ERROR },
      buildAiAnswerRateLimitResponseInit(rateLimit),
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const question =
    typeof body === "object" && body !== null && "question" in body
      ? normalizeQuestion(body.question)
      : null;

  if (!question) {
    return NextResponse.json(
      { error: "Question must be between 1 and 1000 characters." },
      { status: 400 },
    );
  }

  try {
    const result = await answerGroundedQuestion({
      ownerId: session.user.id,
      question,
    });

    const questionRecord = await prisma.question.create({
      data: {
        documentId: result.primaryDocumentId,
        ownerId: session.user.id,
        text: question,
      },
      select: {
        id: true,
      },
    });
    const answerRecord = await prisma.answer.create({
      data: {
        documentId: result.primaryDocumentId,
        ownerId: session.user.id,
        questionId: questionRecord.id,
        text: result.answer,
      },
      select: {
        id: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "agent_tool_ask_with_citations",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: buildAnswerAuditMetadata({
          answerId: answerRecord.id,
          citationCount: result.citations.length,
          insufficientInformation: result.insufficientInformation,
          matchedSnippetCount: result.matchedSnippets.length,
          model: result.model,
          question,
        }),
        resourceId: questionRecord.id,
        resourceType: "Question",
        userAgent: readUserAgent(request),
      },
    });

    return NextResponse.json({
      answer: result.answer,
      answerId: answerRecord.id,
      citations: result.citations,
      insufficientInformation: result.insufficientInformation,
      matchedSnippets: result.matchedSnippets,
      questionId: questionRecord.id,
      tool: "ask-with-citations",
    });
  } catch (error) {
    const apiError = toApiError(error, "Ask failed.");

    return NextResponse.json(
      { error: apiError.error },
      { status: apiError.status },
    );
  }
}
