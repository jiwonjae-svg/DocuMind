import { describe, expect, it } from "vitest";
import { getDeploymentReadiness } from "../lib/deployment/readiness";

describe("deployment readiness checks", () => {
  it("marks a fully configured Vercel deployment as ready", () => {
    expect(
      getDeploymentReadiness({
        AUTH_GOOGLE_ID: "google-client-id",
        AUTH_GOOGLE_SECRET: "google-client-secret",
        AUTH_SECRET: "strong-secret",
        AUTH_URL: "https://documind.example",
        BLOB_READ_WRITE_TOKEN: "blob-token",
        DATABASE_URL: "postgresql://example",
        DOCUMENT_STORAGE_PROVIDER: "vercel-blob",
        OPENAI_API_KEY: "openai-key",
        PASSWORD_RESET_EMAIL_FROM: "DocuMind <noreply@example.com>",
        RESEND_API_KEY: "resend-key",
      }),
    ).toMatchObject({
      missingCount: 0,
      readyCount: 7,
      status: "ready",
      totalCount: 7,
      warningCount: 0,
    });
  });

  it("reports missing production-critical configuration without exposing values", () => {
    const readiness = getDeploymentReadiness({
      AUTH_SECRET: "replace-with-a-strong-random-secret",
      AUTH_URL: "",
      DOCUMENT_STORAGE_PROVIDER: "vercel-blob",
      OPENAI_API_KEY: "replace-with-openai-api-key",
    });

    expect(readiness.status).toBe("missing");
    expect(readiness.warningCount).toBe(1);
    expect(readiness.checks).toEqual([
      { id: "database", message: "missing", status: "missing" },
      { id: "authSecret", message: "missing", status: "missing" },
      { id: "authUrl", message: "warning", status: "warning" },
      { id: "openAi", message: "missing", status: "missing" },
      { id: "storage", message: "missing", status: "missing" },
      { id: "googleOAuth", message: "missing", status: "missing" },
      { id: "emailDelivery", message: "missing", status: "missing" },
    ]);
  });

  it("warns when durable storage is not enabled", () => {
    const readiness = getDeploymentReadiness({
      AUTH_GOOGLE_ID: "google-client-id",
      AUTH_GOOGLE_SECRET: "google-client-secret",
      AUTH_SECRET: "strong-secret",
      AUTH_URL: "https://documind.example",
      DATABASE_URL: "postgresql://example",
      DOCUMENT_STORAGE_PROVIDER: "local",
      OPENAI_API_KEY: "openai-key",
      PASSWORD_RESET_EMAIL_FROM: "DocuMind <noreply@example.com>",
      RESEND_API_KEY: "resend-key",
    });

    expect(readiness.status).toBe("warning");
    expect(readiness.warningCount).toBe(1);
    expect(readiness.checks.find((check) => check.id === "storage")).toEqual({
      id: "storage",
      message: "warning",
      status: "warning",
    });
  });
});
