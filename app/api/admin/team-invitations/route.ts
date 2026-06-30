import { auth } from "@/auth";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import { getOrganizationAdminContext } from "@/lib/auth/rbac";
import {
  TEAM_INVITATION_NOT_FOUND_ERROR,
  TEAM_INVITATION_RENEWED_MESSAGE,
  TEAM_INVITATION_REVOKED_MESSAGE,
  addTeamInvitationTtl,
  buildTeamInvitationUrl,
  createTeamInvitationToken,
  hashTeamInvitationToken,
  validateCreateTeamInvitationInput,
  validateRenewTeamInvitationInput,
  validateRevokeTeamInvitationInput,
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

export async function PATCH(request: NextRequest) {
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

  const validation = validateRenewTeamInvitationInput(bodyResult.body);

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

  const token = createTeamInvitationToken();
  const tokenHash = hashTeamInvitationToken(token);
  const inviteUrl = buildTeamInvitationUrl({ request, token });
  const expiresAt = addTeamInvitationTtl(new Date());
  const emailConfigured = isTeamInvitationEmailConfigured();
  const renewedInvitation = await prisma.$transaction(async (transaction) => {
    const invitation = await transaction.teamInvitation.findFirst({
      select: {
        email: true,
        id: true,
        organizationRole: true,
        team: {
          select: {
            name: true,
          },
        },
        teamId: true,
        teamRole: true,
      },
      where: {
        acceptedAt: null,
        id: validation.data.invitationId,
        organizationId: context.organization.id,
        revokedAt: null,
      },
    });

    if (!invitation) {
      return null;
    }

    const updatedInvitation = await transaction.teamInvitation.updateMany({
      data: {
        expiresAt,
        tokenHash,
      },
      where: {
        acceptedAt: null,
        id: invitation.id,
        organizationId: context.organization.id,
        revokedAt: null,
      },
    });

    if (updatedInvitation.count !== 1) {
      return null;
    }

    await transaction.auditLog.create({
      data: {
        action: "team_invitation_renewed",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: {
          emailConfigured,
          invitationId: invitation.id,
          invitedEmailDomain: invitation.email.split("@")[1] ?? null,
          organizationId: context.organization.id,
          organizationRole: invitation.organizationRole,
          teamRole: invitation.teamRole,
        },
        resourceId: invitation.teamId,
        resourceType: "Team",
        userAgent: readUserAgent(request),
      },
    });

    return {
      ...invitation,
      expiresAt,
    };
  });

  if (!renewedInvitation) {
    return NextResponse.json(
      { error: TEAM_INVITATION_NOT_FOUND_ERROR },
      { status: 404 },
    );
  }

  let emailSent = false;

  try {
    const emailResult = await sendTeamInvitationEmail({
      inviteUrl,
      locale: readRequestLocale(request),
      organizationName: context.organization.name,
      teamName: renewedInvitation.team.name,
      to: renewedInvitation.email,
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
            invitationId: renewedInvitation.id,
            invitedEmailDomain: renewedInvitation.email.split("@")[1] ?? null,
            organizationId: context.organization.id,
            provider: "resend",
            renewal: true,
            teamId: renewedInvitation.teamId,
          },
          resourceId: renewedInvitation.teamId,
          resourceType: "Team",
          userAgent: readUserAgent(request),
        },
      })
      .catch(() => {});
  }

  return NextResponse.json({
    emailSent,
    invitation: {
      email: renewedInvitation.email,
      expiresAt: renewedInvitation.expiresAt,
      id: renewedInvitation.id,
      teamRole: renewedInvitation.teamRole,
    },
    inviteUrl,
    message: TEAM_INVITATION_RENEWED_MESSAGE,
  });
}

export async function DELETE(request: NextRequest) {
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

  const validation = validateRevokeTeamInvitationInput(bodyResult.body);

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

  const currentTime = new Date();
  const revokedInvitation = await prisma.$transaction(async (transaction) => {
    const invitation = await transaction.teamInvitation.findFirst({
      select: {
        email: true,
        id: true,
        teamId: true,
      },
      where: {
        acceptedAt: null,
        expiresAt: {
          gt: currentTime,
        },
        id: validation.data.invitationId,
        organizationId: context.organization.id,
        revokedAt: null,
      },
    });

    if (!invitation) {
      return null;
    }

    const updatedInvitation = await transaction.teamInvitation.updateMany({
      data: {
        revokedAt: currentTime,
        revokedById: session.user.id,
      },
      where: {
        acceptedAt: null,
        expiresAt: {
          gt: currentTime,
        },
        id: invitation.id,
        organizationId: context.organization.id,
        revokedAt: null,
      },
    });

    if (updatedInvitation.count !== 1) {
      return null;
    }

    await transaction.auditLog.create({
      data: {
        action: "team_invitation_revoked",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: {
          invitationId: invitation.id,
          invitedEmailDomain: invitation.email.split("@")[1] ?? null,
          organizationId: context.organization.id,
        },
        resourceId: invitation.teamId,
        resourceType: "Team",
        userAgent: readUserAgent(request),
      },
    });

    return invitation;
  });

  if (!revokedInvitation) {
    return NextResponse.json(
      { error: TEAM_INVITATION_NOT_FOUND_ERROR },
      { status: 404 },
    );
  }

  return NextResponse.json({
    message: TEAM_INVITATION_REVOKED_MESSAGE,
    revoked: true,
  });
}
