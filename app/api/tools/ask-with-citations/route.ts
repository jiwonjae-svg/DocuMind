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
import {
  readJsonBodyResult,
} from "@/lib/api/json-body";
import {
  answerGroundedQuestion,
  normalizeQuestion,
} from "@/lib/qa/grounded-answer";
import {
  type GroundedAnswerPersistenceDb,
  persistGroundedAnswer,
} from "@/lib/qa/persistence";
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

  const jsonBody = await readJsonBodyResult(request);

  if (!jsonBody.ok) {
    return NextResponse.json(
      { error: jsonBody.error },
      { status: jsonBody.status },
    );
  }

  const { body } = jsonBody;

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

  const rateLimit = checkAiAnswerRateLimit(session.user.id);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: AI_ANSWER_RATE_LIMIT_ERROR },
      buildAiAnswerRateLimitResponseInit(rateLimit),
    );
  }

  try {
    const result = await answerGroundedQuestion({
      ownerId: session.user.id,
      question,
    });

    const persistedAnswer = await persistGroundedAnswer({
      action: "agent_tool_ask_with_citations",
      db: prisma as unknown as GroundedAnswerPersistenceDb,
      ipAddress: readIpAddress(request),
      ownerId: session.user.id,
      question,
      result,
      userAgent: readUserAgent(request),
    });

    return NextResponse.json({
      answer: result.answer,
      answerId: persistedAnswer.answerId,
      citations: result.citations,
      insufficientInformation: result.insufficientInformation,
      matchedSnippets: result.matchedSnippets,
      questionId: persistedAnswer.questionId,
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
