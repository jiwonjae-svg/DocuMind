import { createHash, randomBytes } from "node:crypto";
import { normalizeEmailCredential } from "./credentials";
import {
  normalizeAssignableOrganizationRole,
  normalizeAssignableTeamRole,
  normalizeRbacResourceId,
} from "./rbac";

export const TEAM_INVITATION_TOKEN_BYTES = 32;
export const TEAM_INVITATION_TOKEN_TTL_DAYS = 7;
export const TEAM_INVITATION_INVALID_REQUEST_ERROR =
  "Invalid team invitation request.";
export const TEAM_INVITATION_INVALID_TOKEN_ERROR =
  "Team invitation is invalid or expired.";
export const TEAM_INVITATION_EMAIL_MISMATCH_ERROR =
  "Team invitation belongs to another email address.";
export const TEAM_INVITATION_ACCEPTED_MESSAGE =
  "Team invitation accepted.";

const invitationTokenPattern = /^[A-Za-z0-9_-]{32,256}$/;

type TeamInvitationRequest = Pick<Request, "url">;

type TeamInvitationValidationResult =
  | {
      data: {
        email: string;
        organizationRole: "ADMIN" | "MEMBER";
        teamId: string;
        teamRole: "MANAGER" | "MEMBER" | "VIEWER";
      };
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

function readUrlOrigin(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function readInvitationBaseUrl({
  env,
  request,
}: {
  env: NodeJS.ProcessEnv;
  request: TeamInvitationRequest;
}) {
  return (
    readUrlOrigin(env.AUTH_URL) ??
    readUrlOrigin(request.url) ??
    "http://localhost:3000"
  );
}

export function createTeamInvitationToken() {
  return randomBytes(TEAM_INVITATION_TOKEN_BYTES).toString("base64url");
}

export function hashTeamInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeTeamInvitationToken(value: unknown) {
  const token = typeof value === "string" ? value.trim() : "";

  return invitationTokenPattern.test(token) ? token : null;
}

export function addTeamInvitationTtl(now: Date) {
  return new Date(
    now.getTime() + TEAM_INVITATION_TOKEN_TTL_DAYS * 24 * 60 * 60_000,
  );
}

export function buildTeamInvitationUrl({
  env = process.env,
  request,
  token,
}: {
  env?: NodeJS.ProcessEnv;
  request: TeamInvitationRequest;
  token: string;
}) {
  const url = new URL("/join-team", readInvitationBaseUrl({ env, request }));
  url.searchParams.set("token", token);

  return url.toString();
}

export function validateCreateTeamInvitationInput(
  body: unknown,
): TeamInvitationValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: TEAM_INVITATION_INVALID_REQUEST_ERROR,
      ok: false,
    };
  }

  const values = body as Record<string, unknown>;
  const email = normalizeEmailCredential(values.email);
  const teamId = normalizeRbacResourceId(values.teamId);
  const organizationRole = normalizeAssignableOrganizationRole(
    values.organizationRole,
  );
  const teamRole = normalizeAssignableTeamRole(values.teamRole);

  if (!email || !teamId || !organizationRole || !teamRole) {
    return {
      error: TEAM_INVITATION_INVALID_REQUEST_ERROR,
      ok: false,
    };
  }

  return {
    data: {
      email,
      organizationRole,
      teamId,
      teamRole,
    },
    ok: true,
  };
}
