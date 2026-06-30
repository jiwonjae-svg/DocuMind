import { describe, expect, it, vi } from "vitest";
import {
  PASSWORD_RESET_EMAIL_SUBJECT,
  RESEND_EMAIL_API_URL,
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} from "../lib/auth/password-reset-email";

describe("password reset email delivery", () => {
  it("skips delivery when Resend credentials are not configured", async () => {
    await expect(
      sendPasswordResetEmail({
        env: {},
        fetcher: vi.fn(),
        resetUrl: "https://documind.example/reset-password?token=token",
        to: "owner@example.com",
      }),
    ).resolves.toEqual({
      sent: false,
      skippedReason: "not_configured",
    });
  });

  it("detects configured reset email delivery", () => {
    expect(
      isPasswordResetEmailConfigured({
        PASSWORD_RESET_EMAIL_FROM: "DocuMind <security@documind.example>",
        RESEND_API_KEY: "re_test",
      }),
    ).toBe(true);

    expect(
      isPasswordResetEmailConfigured({
        PASSWORD_RESET_EMAIL_FROM: "DocuMind <security@documind.example>",
      }),
    ).toBe(false);
  });

  it("sends reset email through the Resend HTTP API without extra dependencies", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("{}", {
        status: 200,
      }),
    );

    await expect(
      sendPasswordResetEmail({
        env: {
          PASSWORD_RESET_EMAIL_FROM: "DocuMind <security@documind.example>",
          RESEND_API_KEY: "re_test",
        },
        fetcher,
        resetUrl: "https://documind.example/reset-password?token=token",
        to: "owner@example.com",
        userName: "Owner",
      }),
    ).resolves.toEqual({
      sent: true,
    });

    expect(fetcher).toHaveBeenCalledWith(
      RESEND_EMAIL_API_URL,
      expect.objectContaining({
        headers: {
          Authorization: "Bearer re_test",
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
    );

    const body = JSON.parse(fetcher.mock.calls[0][1].body);

    expect(body).toMatchObject({
      from: "DocuMind <security@documind.example>",
      subject: PASSWORD_RESET_EMAIL_SUBJECT,
      to: "owner@example.com",
    });
    expect(body.text).toContain(
      "https://documind.example/reset-password?token=token",
    );
    expect(body.html).toContain("Reset password");
  });

  it("fails closed when the email provider rejects delivery", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("Bad request", {
        status: 400,
      }),
    );

    await expect(
      sendPasswordResetEmail({
        env: {
          PASSWORD_RESET_EMAIL_FROM: "DocuMind <security@documind.example>",
          RESEND_API_KEY: "re_test",
        },
        fetcher,
        resetUrl: "https://documind.example/reset-password?token=token",
        to: "owner@example.com",
      }),
    ).rejects.toThrow("Password reset email delivery failed.");
  });
});
