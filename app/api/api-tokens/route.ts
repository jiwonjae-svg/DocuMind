import { auth } from "@/auth";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  API_TOKEN_INVALID_NAME_ERROR,
  createApiTokenSecret,
  hashApiTokenSecret,
  normalizeApiTokenName,
} from "@/lib/auth/api-tokens";
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

  const values =
    bodyResult.body &&
    typeof bodyResult.body === "object" &&
    !Array.isArray(bodyResult.body)
      ? (bodyResult.body as Record<string, unknown>)
      : {};
  const name = normalizeApiTokenName(values.name);

  if (!name) {
    return NextResponse.json(
      { error: API_TOKEN_INVALID_NAME_ERROR },
      { status: 400 },
    );
  }

  const token = createApiTokenSecret();
  const tokenHash = hashApiTokenSecret(token);
  const apiToken = await prisma.$transaction(async (transaction) => {
    const createdToken = await transaction.userApiToken.create({
      data: {
        name,
        tokenHash,
        userId: session.user.id,
      },
      select: {
        createdAt: true,
        id: true,
        lastUsedAt: true,
        name: true,
      },
    });

    await transaction.auditLog.create({
      data: {
        action: "api_token_created",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: {
          tokenId: createdToken.id,
        },
        resourceId: createdToken.id,
        resourceType: "UserApiToken",
        userAgent: readUserAgent(request),
      },
    });

    return createdToken;
  });

  return NextResponse.json(
    {
      apiToken,
      token,
    },
    { status: 201 },
  );
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

  const values =
    bodyResult.body &&
    typeof bodyResult.body === "object" &&
    !Array.isArray(bodyResult.body)
      ? (bodyResult.body as Record<string, unknown>)
      : {};
  const tokenId =
    typeof values.tokenId === "string" && values.tokenId.trim()
      ? values.tokenId.trim()
      : null;

  if (!tokenId) {
    return NextResponse.json(
      { error: "API token is required." },
      { status: 400 },
    );
  }

  const revokedToken = await prisma.$transaction(async (transaction) => {
    const updatedToken = await transaction.userApiToken.updateMany({
      data: {
        revokedAt: new Date(),
      },
      where: {
        id: tokenId,
        revokedAt: null,
        userId: session.user.id,
      },
    });

    if (updatedToken.count === 0) {
      return null;
    }

    await transaction.auditLog.create({
      data: {
        action: "api_token_revoked",
        actorId: session.user.id,
        ipAddress: readIpAddress(request),
        metadata: {
          tokenId,
        },
        resourceId: tokenId,
        resourceType: "UserApiToken",
        userAgent: readUserAgent(request),
      },
    });

    return {
      id: tokenId,
    };
  });

  if (!revokedToken) {
    return NextResponse.json(
      { error: "API token not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    revoked: true,
  });
}
