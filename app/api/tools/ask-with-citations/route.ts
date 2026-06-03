import { auth } from "@/auth";
import {
  answerGroundedQuestion,
  normalizeQuestion,
} from "@/lib/qa/grounded-answer";
import { prisma } from "@/lib/prisma";
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
          action: "agent_tool_ask_with_citations",
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
      tool: "ask-with-citations",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ask failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
