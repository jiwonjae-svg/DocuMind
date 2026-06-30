import { auth } from "@/auth";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  OAUTH_ACCOUNT_UNLINKED_MESSAGE,
  unlinkOAuthAccountForUser,
  validateUnlinkOAuthAccountInput,
} from "@/lib/auth/oauth-account-management";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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

  const validation = validateUnlinkOAuthAccountInput(bodyResult.body);

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 },
    );
  }

  const result = await unlinkOAuthAccountForUser({
    accountId: validation.data.accountId,
    request,
    userId: session.user.id,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: OAUTH_ACCOUNT_UNLINKED_MESSAGE,
  });
}
