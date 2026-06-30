import { auth } from "@/auth";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  TEAM_INVITATION_ACCEPTED_MESSAGE,
  TEAM_INVITATION_EMAIL_MISMATCH_ERROR,
  TEAM_INVITATION_INVALID_REQUEST_ERROR,
  TEAM_INVITATION_INVALID_TOKEN_ERROR,
  hashTeamInvitationToken,
  normalizeTeamInvitationToken,
} from "@/lib/auth/team-invitations";
import { normalizeEmailCredential } from "@/lib/auth/credentials";
import {
  readStrongerOrganizationRole,
  readStrongerTeamRole,
} from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: CROSS_ORIGIN_REQUEST_ERROR },
      { status: 403 },
    );
  }

  const session = await auth();
  const userEmail = normalizeEmailCredential(session?.user?.email);

  if (!session?.user?.id || !userEmail) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const userId = session.user.id;

  const bodyResult = await readJsonBodyResult(request);

  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status },
    );
  }

  const token =
    bodyResult.body &&
    typeof bodyResult.body === "object" &&
    !Array.isArray(bodyResult.body) &&
    "token" in bodyResult.body
      ? normalizeTeamInvitationToken(bodyResult.body.token)
      : null;

  if (!token) {
    return NextResponse.json(
      { error: TEAM_INVITATION_INVALID_REQUEST_ERROR },
      { status: 400 },
    );
  }

  const currentTime = new Date();
  const tokenHash = hashTeamInvitationToken(token);
  const invitation = await prisma.teamInvitation.findUnique({
    select: {
      acceptedAt: true,
      email: true,
      expiresAt: true,
      id: true,
      organizationId: true,
      organizationRole: true,
      revokedAt: true,
      teamId: true,
      teamRole: true,
    },
    where: {
      tokenHash,
    },
  });

  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt <= currentTime
  ) {
    return NextResponse.json(
      { error: TEAM_INVITATION_INVALID_TOKEN_ERROR },
      { status: 400 },
    );
  }

  if (normalizeEmailCredential(invitation.email) !== userEmail) {
    return NextResponse.json(
      { error: TEAM_INVITATION_EMAIL_MISMATCH_ERROR },
      { status: 403 },
    );
  }

  const accepted = await prisma.$transaction(async (transaction) => {
    const consumed = await transaction.teamInvitation.updateMany({
      data: {
        acceptedAt: currentTime,
        acceptedById: userId,
      },
      where: {
        acceptedAt: null,
        expiresAt: {
          gt: currentTime,
        },
        id: invitation.id,
        revokedAt: null,
      },
    });

    if (consumed.count !== 1) {
      return false;
    }

    const existingOrganizationMembership =
      await transaction.organizationMembership.findUnique({
        select: {
          id: true,
          role: true,
        },
        where: {
          organizationId_userId: {
            organizationId: invitation.organizationId,
            userId,
          },
        },
      });
    const organizationRole = readStrongerOrganizationRole(
      existingOrganizationMembership?.role,
      invitation.organizationRole,
    );
    const organizationMembership = existingOrganizationMembership
      ? await transaction.organizationMembership.update({
          data: {
            role: organizationRole,
          },
          select: {
            id: true,
          },
          where: {
            id: existingOrganizationMembership.id,
          },
        })
      : await transaction.organizationMembership.create({
          data: {
            organizationId: invitation.organizationId,
            role: organizationRole,
            userId,
          },
          select: {
            id: true,
          },
        });
    const existingTeamMembership = await transaction.teamMembership.findUnique({
      select: {
        id: true,
        role: true,
      },
      where: {
        teamId_userId: {
          teamId: invitation.teamId,
          userId,
        },
      },
    });
    const teamRole = readStrongerTeamRole(
      existingTeamMembership?.role,
      invitation.teamRole,
    );

    if (existingTeamMembership) {
      await transaction.teamMembership.update({
        data: {
          organizationMembershipId: organizationMembership.id,
          role: teamRole,
        },
        where: {
          id: existingTeamMembership.id,
        },
      });
    } else {
      await transaction.teamMembership.create({
        data: {
          organizationMembershipId: organizationMembership.id,
          role: teamRole,
          teamId: invitation.teamId,
          userId,
        },
      });
    }

    await transaction.auditLog.create({
      data: {
        action: "team_invitation_accepted",
        actorId: userId,
        ipAddress: readIpAddress(request),
        metadata: {
          invitationId: invitation.id,
          organizationId: invitation.organizationId,
          organizationRole,
          teamRole,
        },
        resourceId: invitation.teamId,
        resourceType: "Team",
        userAgent: readUserAgent(request),
      },
    });

    return true;
  });

  if (!accepted) {
    return NextResponse.json(
      { error: TEAM_INVITATION_INVALID_TOKEN_ERROR },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: TEAM_INVITATION_ACCEPTED_MESSAGE,
  });
}
