import { auth } from "@/auth";
import {
  answerGroundedQuestion,
  normalizeQuestion,
} from "@/lib/qa/grounded-answer";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ASK_RATE_LIMIT = 10;
const ASK_RATE_LIMIT_WINDOW_MS = 60_000;

function readIpAddress(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null
  );
}

function readUserAgent(request: NextRequest) {
  return request.headers.get("user-agent")?.trim() || null;
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`ask:${session.user.id}`, {
    limit: ASK_RATE_LIMIT,
    windowMs: ASK_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many ask requests. Try again shortly." },
      {
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
        status: 429,
      },
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

    const persisted = await prisma.$transaction(async (transaction) => {
      const questionRecord = await transaction.question.create({
        data: {
          documentId: result.primaryDocumentId,
          ownerId: session.user.id,
          text: question,
        },
        select: {
          id: true,
        },
      });
      const answerRecord = await transaction.answer.create({
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

      await transaction.auditLog.create({
        data: {
          action: "question_ask",
          actorId: session.user.id,
          ipAddress: readIpAddress(request),
          metadata: {
            answerId: answerRecord.id,
            citationCount: result.citations.length,
            insufficientInformation: result.insufficientInformation,
            matchedSnippetCount: result.matchedSnippets.length,
            model: result.model,
          },
          resourceId: questionRecord.id,
          resourceType: "Question",
          userAgent: readUserAgent(request),
        },
      });

      return {
        answerId: answerRecord.id,
        questionId: questionRecord.id,
      };
    });

    return NextResponse.json({
      answer: result.answer,
      answerId: persisted.answerId,
      citations: result.citations,
      insufficientInformation: result.insufficientInformation,
      matchedSnippets: result.matchedSnippets,
      questionId: persisted.questionId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ask request failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
