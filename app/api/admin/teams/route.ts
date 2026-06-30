import { auth } from "@/auth";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  getOrganizationAdminContext,
  normalizeTeamName,
} from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function readOptionalString(value: unknown) {
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
  const name =
    typeof body === "object" && body !== null && "name" in body
      ? normalizeTeamName(body.name)
      : null;
  const organizationId =
    typeof body === "object" && body !== null && "organizationId" in body
      ? readOptionalString(body.organizationId)
      : null;

  if (!name) {
    return NextResponse.json(
      { error: "Team name must be between 1 and 80 characters." },
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

  const membership = await prisma.organizationMembership.findFirst({
    select: {
      id: true,
    },
    where: {
      organizationId: context.organization.id,
      userId: session.user.id,
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const team = await prisma.$transaction(async (transaction) => {
    const createdTeam = await transaction.team.create({
      data: {
        name,
        organizationId: context.organization.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    await transaction.teamMembership.create({
      data: {
        organizationMembershipId: membership.id,
        role: "MANAGER",
        teamId: createdTeam.id,
        userId: session.user.id,
      },
    });

    await transaction.auditLog.create({
      data: {
        action: "team_created",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: {
          organizationId: context.organization.id,
          teamNameLength: name.length,
        },
        resourceId: createdTeam.id,
        resourceType: "Team",
        userAgent: readUserAgent(request),
      },
    });

    return createdTeam;
  });

  return NextResponse.json({ team }, { status: 201 });
}
