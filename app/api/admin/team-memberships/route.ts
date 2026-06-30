import { auth } from "@/auth";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import { normalizeEmailCredential } from "@/lib/auth/credentials";
import {
  getOrganizationAdminContext,
  normalizeAssignableOrganizationRole,
  normalizeAssignableTeamRole,
} from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
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

  const body = bodyResult.body;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid team membership request." }, { status: 400 });
  }

  const email = "email" in body ? normalizeEmailCredential(body.email) : null;
  const organizationId =
    "organizationId" in body ? readString(body.organizationId) : null;
  const organizationRole =
    "organizationRole" in body
      ? normalizeAssignableOrganizationRole(body.organizationRole)
      : null;
  const teamId = "teamId" in body ? readString(body.teamId) : null;
  const teamRole =
    "teamRole" in body ? normalizeAssignableTeamRole(body.teamRole) : null;

  if (!email || !teamId || !organizationRole || !teamRole) {
    return NextResponse.json(
      { error: "Email, team, organization role, and team role are required." },
      { status: 400 },
    );
  }

  const context = await getOrganizationAdminContext({
    organizationId,
    userId: session.user.id,
  });

  if (!context) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const [team, user] = await Promise.all([
    prisma.team.findFirst({
      select: {
        id: true,
      },
      where: {
        id: teamId,
        organizationId: context.organization.id,
      },
    }),
    prisma.user.findUnique({
      select: {
        email: true,
        id: true,
      },
      where: {
        email,
      },
    }),
  ]);

  if (!team) {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }

  if (!user) {
    return NextResponse.json(
      { error: "User must sign up before being added to a team." },
      { status: 404 },
    );
  }

  const result = await prisma.$transaction(async (transaction) => {
    const organizationMembership = await transaction.organizationMembership.upsert({
      create: {
        organizationId: context.organization.id,
        role: organizationRole,
        userId: user.id,
      },
      update: {
        role: organizationRole,
      },
      where: {
        organizationId_userId: {
          organizationId: context.organization.id,
          userId: user.id,
        },
      },
      select: {
        id: true,
        role: true,
        userId: true,
      },
    });

    const teamMembership = await transaction.teamMembership.upsert({
      create: {
        organizationMembershipId: organizationMembership.id,
        role: teamRole,
        teamId: team.id,
        userId: user.id,
      },
      update: {
        organizationMembershipId: organizationMembership.id,
        role: teamRole,
      },
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: user.id,
        },
      },
      select: {
        id: true,
        role: true,
        teamId: true,
        userId: true,
      },
    });

    await transaction.auditLog.create({
      data: {
        action: "team_member_assigned",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: {
          assignedUserId: user.id,
          organizationId: context.organization.id,
          organizationRole,
          teamRole,
        },
        resourceId: team.id,
        resourceType: "Team",
        userAgent: readUserAgent(request),
      },
    });

    return {
      organizationMembership,
      teamMembership,
    };
  });

  return NextResponse.json(result);
}
