import { describe, expect, it, vi } from "vitest";
import { RESEND_EMAIL_API_URL } from "../lib/auth/password-reset-email";
import {
  TEAM_INVITATION_EMAIL_SUBJECT,
  isTeamInvitationEmailConfigured,
  sendTeamInvitationEmail,
} from "../lib/auth/team-invitation-email";

describe("team invitation email delivery", () => {
  it("skips delivery when Resend credentials are not configured", async () => {
    await expect(
      sendTeamInvitationEmail({
        env: {},
        fetcher: vi.fn(),
        inviteUrl: "https://documind.example/join-team?token=token",
        organizationName: "DocuMind",
        teamName: "Operations",
        to: "member@example.com",
      }),
    ).resolves.toEqual({
      sent: false,
      skippedReason: "not_configured",
    });
  });

  it("detects configured invitation email delivery with either sender variable", () => {
    expect(
      isTeamInvitationEmailConfigured({
        PASSWORD_RESET_EMAIL_FROM: "DocuMind <security@documind.example>",
        RESEND_API_KEY: "re_test",
      }),
    ).toBe(true);

    expect(
      isTeamInvitationEmailConfigured({
        RESEND_API_KEY: "re_test",
        TEAM_INVITATION_EMAIL_FROM: "DocuMind <team@documind.example>",
      }),
    ).toBe(true);

    expect(
      isTeamInvitationEmailConfigured({
        RESEND_API_KEY: "re_test",
      }),
    ).toBe(false);
  });

  it("sends invitation email through the Resend HTTP API without extra dependencies", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("{}", {
        status: 200,
      }),
    );

    await expect(
      sendTeamInvitationEmail({
        env: {
          RESEND_API_KEY: "re_test",
          TEAM_INVITATION_EMAIL_FROM: "DocuMind <team@documind.example>",
        },
        fetcher,
        inviteUrl: "https://documind.example/join-team?token=token",
        organizationName: "DocuMind",
        teamName: "Operations",
        to: "member@example.com",
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
      from: "DocuMind <team@documind.example>",
      subject: TEAM_INVITATION_EMAIL_SUBJECT,
      to: "member@example.com",
    });
    expect(body.text).toContain("DocuMind / Operations");
    expect(body.text).toContain(
      "https://documind.example/join-team?token=token",
    );
    expect(body.html).toContain("Accept invitation");
  });

  it("localizes invitation email copy by request locale", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("{}", {
        status: 200,
      }),
    );

    await sendTeamInvitationEmail({
      env: {
        PASSWORD_RESET_EMAIL_FROM: "DocuMind <security@documind.example>",
        RESEND_API_KEY: "re_test",
      },
      fetcher,
      inviteUrl: "https://documind.example/join-team?token=token",
      locale: "ko",
      organizationName: "한국 지사",
      teamName: "세일즈",
      to: "member@example.com",
    });

    const body = JSON.parse(fetcher.mock.calls[0][1].body);

    expect(body.from).toBe("DocuMind <security@documind.example>");
    expect(body.subject).toBe("DocuMind 팀 초대");
    expect(body.text).toContain(
      "DocuMind의 한국 지사 / 세일즈 팀에 초대되었습니다.",
    );
    expect(body.html).toContain("초대 수락");
  });

  it("fails closed when the email provider rejects delivery", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("Bad request", {
        status: 400,
      }),
    );

    await expect(
      sendTeamInvitationEmail({
        env: {
          RESEND_API_KEY: "re_test",
          TEAM_INVITATION_EMAIL_FROM: "DocuMind <team@documind.example>",
        },
        fetcher,
        inviteUrl: "https://documind.example/join-team?token=token",
        organizationName: "DocuMind",
        teamName: "Operations",
        to: "member@example.com",
      }),
    ).rejects.toThrow("Team invitation email delivery failed.");
  });
});
