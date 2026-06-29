import { buildAnswerAuditMetadata } from "../audit/metadata";
import type { GroundedQuestionAnswer } from "./grounded-answer";

type CreateResult = {
  id: string;
};

type TransactionClient = {
  answer: {
    create: (args: unknown) => Promise<CreateResult>;
  };
  auditLog: {
    create: (args: unknown) => Promise<unknown>;
  };
  question: {
    create: (args: unknown) => Promise<CreateResult>;
  };
};

export type GroundedAnswerPersistenceDb = {
  $transaction: <T>(
    callback: (transaction: TransactionClient) => Promise<T>,
  ) => Promise<T>;
};

export type PersistGroundedAnswerInput = {
  action: "agent_tool_ask_with_citations" | "question_ask";
  db: GroundedAnswerPersistenceDb;
  ipAddress: string | null;
  ownerId: string;
  question: string;
  result: GroundedQuestionAnswer;
  userAgent: string | null;
};

export async function persistGroundedAnswer({
  action,
  db,
  ipAddress,
  ownerId,
  question,
  result,
  userAgent,
}: PersistGroundedAnswerInput) {
  return db.$transaction(async (transaction) => {
    const questionRecord = await transaction.question.create({
      data: {
        documentId: result.primaryDocumentId,
        ownerId,
        text: question,
      },
      select: {
        id: true,
      },
    });
    const answerRecord = await transaction.answer.create({
      data: {
        documentId: result.primaryDocumentId,
        ownerId,
        questionId: questionRecord.id,
        text: result.answer,
      },
      select: {
        id: true,
      },
    });

    await transaction.auditLog.create({
      data: {
        action,
        actorId: ownerId,
        ipAddress,
        metadata: buildAnswerAuditMetadata({
          answerId: answerRecord.id,
          citationCount: result.citations.length,
          insufficientInformation: result.insufficientInformation,
          matchedSnippetCount: result.matchedSnippets.length,
          question,
        }),
        resourceId: questionRecord.id,
        resourceType: "Question",
        userAgent,
      },
    });

    return {
      answerId: answerRecord.id,
      questionId: questionRecord.id,
    };
  });
}
