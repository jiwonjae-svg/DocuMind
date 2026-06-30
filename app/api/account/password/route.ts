import { auth } from "@/auth";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  PASSWORD_CHANGE_COMPLETED_MESSAGE,
  changePasswordForUser,
  validatePasswordChangeInput,
} from "@/lib/auth/account-password";
import {
  PASSWORD_CHANGE_RATE_LIMIT_ERROR,
  checkPasswordChangeRateLimit,
} from "@/lib/auth/account-password-rate-limit";
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

  const rateLimit = checkPasswordChangeRateLimit({
    request,
    userId: session.user.id,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: PASSWORD_CHANGE_RATE_LIMIT_ERROR },
      {
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
        status: 429,
      },
    );
  }

  const bodyResult = await readJsonBodyResult(request);

  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status },
    );
  }

  const validation = validatePasswordChangeInput(bodyResult.body);

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 },
    );
  }

  const result = await changePasswordForUser({
    currentPassword: validation.data.currentPassword,
    newPassword: validation.data.newPassword,
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
    message: PASSWORD_CHANGE_COMPLETED_MESSAGE,
  });
}
