import { describe, expect, it } from "vitest";
import {
  TEAM_INVITATION_INVALID_REQUEST_ERROR,
  addTeamInvitationTtl,
  buildTeamInvitationUrl,
  createTeamInvitationToken,
  hashTeamInvitationToken,
  normalizeTeamInvitationToken,
  validateCreateTeamInvitationInput,
} from "../lib/auth/team-invitations";

describe("team invitations", () => {
  it("creates bounded URL-safe invitation tokens and hashes them", () => {
    const token = createTeamInvitationToken();

    expect(normalizeTeamInvitationToken(token)).toBe(token);
    expect(hashTeamInvitationToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashTeamInvitationToken(token)).toBe(hashTeamInvitationToken(token));
  });

  it("normalizes invitation tokens", () => {
    const token = `abc_123-def${"x".repeat(21)}`;

    expect(normalizeTeamInvitationToken(` ${token} `)).toBe(token);
    expect(normalizeTeamInvitationToken("bad/token")).toBeNull();
    expect(normalizeTeamInvitationToken("x".repeat(257))).toBeNull();
  });

  it("validates create invitation inputs", () => {
    expect(
      validateCreateTeamInvitationInput({
        email: "  USER@Example.COM  ",
        organizationRole: "MEMBER",
        teamId: "team_123",
        teamRole: "VIEWER",
      }),
    ).toEqual({
      data: {
        email: "user@example.com",
        organizationRole: "MEMBER",
        teamId: "team_123",
        teamRole: "VIEWER",
      },
      ok: true,
    });

    expect(
      validateCreateTeamInvitationInput({
        email: "invalid",
        organizationRole: "OWNER",
        teamId: "bad/team",
        teamRole: "OWNER",
      }),
    ).toEqual({
      error: TEAM_INVITATION_INVALID_REQUEST_ERROR,
      ok: false,
    });
  });

  it("builds invite URLs from AUTH_URL or request origin", () => {
    const request = new Request("https://documind.example/api/admin/team-invitations");

    expect(
      buildTeamInvitationUrl({
        env: { AUTH_URL: "https://app.example" },
        request,
        token: "token_123",
      }),
    ).toBe("https://app.example/join-team?token=token_123");
    expect(
      buildTeamInvitationUrl({
        env: {},
        request,
        token: "token_123",
      }),
    ).toBe("https://documind.example/join-team?token=token_123");
  });

  it("sets a seven-day invitation expiry", () => {
    expect(addTeamInvitationTtl(new Date("2026-06-30T00:00:00.000Z"))).toEqual(
      new Date("2026-07-07T00:00:00.000Z"),
    );
  });
});
