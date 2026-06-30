import { auth } from "@/auth";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import { getOrganizationAdminContext } from "@/lib/auth/rbac";
import {
  addTeamInvitationTtl,
  buildTeamInvitationUrl,
  createTeamInvitationToken,
  hashTeamInvitationToken,
  validateCreateTeamInvitationInput,
} from "@/lib/auth/team-invitations";
import {
  isTeamInvitationEmailConfigured,
  sendTeamInvitationEmail,
} from "@/lib/auth/team-invitation-email";
import {
  I18N_COOKIE_NAME,
  normalizeLocale,
  readPreferredLocaleFromAcceptLanguage,
} from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readRequestLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(I18N_COOKIE_NAME)?.value;

  return cookieLocale
    ? normalizeLocale(cookieLocale)
    : readPreferredLocaleFromAcceptLanguage(
        request.headers.get("accept-language"),
      );
}

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

  const bodyResult = await readJsonBodyResult(request);

  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status },
    );
  }

  const validation = validateCreateTeamInvitationInput(bodyResult.body);

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 },
    );
  }

  const organizationId =
    bodyResult.body &&
    typeof bodyResult.body === "object" &&
    !Array.isArray(bodyResult.body) &&
    "organizationId" in bodyResult.body
      ? readOptionalString(bodyResult.body.organizationId)
      : null;

  const context = await getOrganizationAdminContext({
    organizationId,
    userId: session.user.id,
  });

  if (!context) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const team = await prisma.team.findFirst({
    select: {
      id: true,
      name: true,
    },
    where: {
      id: validation.data.teamId,
      organizationId: context.organization.id,
    },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }

  const token = createTeamInvitationToken();
  const inviteUrl = buildTeamInvitationUrl({ request, token });
  const tokenHash = hashTeamInvitationToken(token);
  const expiresAt = addTeamInvitationTtl(new Date());
  const emailConfigured = isTeamInvitationEmailConfigured();
  const invitation = await prisma.$transaction(async (transaction) => {
    const createdInvitation = await transaction.teamInvitation.create({
      data: {
        email: validation.data.email,
        expiresAt,
        invitedById: session.user.id,
        organizationId: context.organization.id,
        organizationRole: validation.data.organizationRole,
        teamId: team.id,
        teamRole: validation.data.teamRole,
        tokenHash,
      },
      select: {
        email: true,
        expiresAt: true,
        id: true,
        teamRole: true,
      },
    });

    await transaction.auditLog.create({
      data: {
        action: "team_invitation_created",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: {
          emailConfigured,
          invitedEmailDomain: validation.data.email.split("@")[1] ?? null,
          organizationId: context.organization.id,
          organizationRole: validation.data.organizationRole,
          teamRole: validation.data.teamRole,
        },
        resourceId: team.id,
        resourceType: "Team",
        userAgent: readUserAgent(request),
      },
    });

    return createdInvitation;
  });
  let emailSent = false;

  try {
    const emailResult = await sendTeamInvitationEmail({
      inviteUrl,
      locale: readRequestLocale(request),
      organizationName: context.organization.name,
      teamName: team.name,
      to: validation.data.email,
    });

    emailSent = emailResult.sent;
  } catch {
    await prisma.auditLog
      .create({
        data: {
          action: "team_invitation_email_failed",
          actorId: session.user.id,
          ipAddress: readIpAddress(request),
          metadata: {
            invitedEmailDomain: validation.data.email.split("@")[1] ?? null,
            organizationId: context.organization.id,
            provider: "resend",
            teamId: team.id,
          },
          resourceId: team.id,
          resourceType: "Team",
          userAgent: readUserAgent(request),
        },
      })
      .catch(() => {});
  }

  return NextResponse.json(
    {
      emailSent,
      invitation,
      inviteUrl,
    },
    { status: 201 },
  );
}
