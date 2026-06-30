import { auth } from "@/auth";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  OAUTH_LINK_INTENT_COOKIE_NAME,
  OAUTH_LINK_INTENT_CREATED_MESSAGE,
  OAUTH_LINK_INTENT_SECRET_MISSING_ERROR,
  OAUTH_LINK_INTENT_TTL_SECONDS,
  OAUTH_LINK_PROVIDER_DISABLED_ERROR,
  createOAuthLinkIntentCookieValue,
} from "@/lib/auth/oauth-link-intent";
import {
  isOAuthProviderEnabled,
  normalizeOAuthProviderId,
} from "@/lib/auth/oauth-providers";
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

  const provider =
    bodyResult.body && typeof bodyResult.body === "object"
      ? normalizeOAuthProviderId(
          (bodyResult.body as Record<string, unknown>).provider,
        )
      : null;

  if (!provider || !isOAuthProviderEnabled(provider)) {
    return NextResponse.json(
      { error: OAUTH_LINK_PROVIDER_DISABLED_ERROR },
      { status: 400 },
    );
  }

  const cookieValue = createOAuthLinkIntentCookieValue({
    provider,
    userId: session.user.id,
  });

  if (!cookieValue) {
    return NextResponse.json(
      { error: OAUTH_LINK_INTENT_SECRET_MISSING_ERROR },
      { status: 503 },
    );
  }

  const response = NextResponse.json({
    message: OAUTH_LINK_INTENT_CREATED_MESSAGE,
  });

  response.cookies.set(OAUTH_LINK_INTENT_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    maxAge: OAUTH_LINK_INTENT_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
