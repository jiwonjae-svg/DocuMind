import { describe, expect, it } from "vitest";
import {
  type GroundedAnswerPersistenceDb,
  persistGroundedAnswer,
} from "../lib/qa/persistence";

describe("grounded answer persistence", () => {
  it("stores question, answer, and audit log in one transaction", async () => {
    const calls: string[] = [];
    const createdPayloads: unknown[] = [];
    const db: GroundedAnswerPersistenceDb = {
      $transaction: async (callback) => {
        calls.push("transaction");

        return callback({
          answer: {
            create: async (args) => {
              calls.push("answer");
              createdPayloads.push(args);

              return { id: "answer-1" };
            },
          },
          auditLog: {
            create: async (args) => {
              calls.push("auditLog");
              createdPayloads.push(args);

              return { id: "audit-1" };
            },
          },
          question: {
            create: async (args) => {
              calls.push("question");
              createdPayloads.push(args);

              return { id: "question-1" };
            },
          },
        });
      },
    };

    const persisted = await persistGroundedAnswer({
      action: "question_ask",
      db,
      ipAddress: "127.0.0.1",
      ownerId: "user-1",
      question: "What is the private roadmap?",
      result: {
        answer: "Use the internal launch checklist.",
        citations: [
          {
            chunkIndex: 0,
            documentTitle: "Launch Plan",
            snippet: "Use the internal launch checklist.",
          },
        ],
        insufficientInformation: false,
        matchedSnippets: [
          {
            chunkIndex: 0,
            documentTitle: "Launch Plan",
            similarityScore: 0.8,
            snippet: "Use the internal launch checklist.",
          },
        ],
        model: "test-model",
        primaryDocumentId: "document-1",
      },
      userAgent: "vitest",
    });

    expect(persisted).toEqual({
      answerId: "answer-1",
      questionId: "question-1",
    });
    expect(calls).toEqual(["transaction", "question", "answer", "auditLog"]);
    expect(createdPayloads).toMatchObject([
      {
        data: {
          documentId: "document-1",
          ownerId: "user-1",
          text: "What is the private roadmap?",
        },
      },
      {
        data: {
          documentId: "document-1",
          ownerId: "user-1",
          questionId: "question-1",
          text: "Use the internal launch checklist.",
        },
      },
      {
        data: {
          action: "question_ask",
          actorId: "user-1",
          metadata: {
            answerId: "answer-1",
            citationCount: 1,
            insufficientInformation: false,
            matchedSnippetCount: 1,
            model: "test-model",
            questionLength: 28,
          },
          resourceId: "question-1",
          resourceType: "Question",
        },
      },
    ]);
    expect(JSON.stringify(createdPayloads[2])).not.toContain(
      "What is the private roadmap?",
    );
  });
});
