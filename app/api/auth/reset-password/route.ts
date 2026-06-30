import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  PASSWORD_RESET_RATE_LIMIT_ERROR,
  checkPasswordResetCompletionRateLimit,
} from "@/lib/auth/password-reset-rate-limit";
import {
  PASSWORD_RESET_COMPLETED_MESSAGE,
  completePasswordReset,
  validateResetPasswordInput,
} from "@/lib/auth/password-reset";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: CROSS_ORIGIN_REQUEST_ERROR },
      { status: 403 },
    );
  }

  const clientRateLimit = checkPasswordResetCompletionRateLimit({ request });

  if (!clientRateLimit.allowed) {
    return NextResponse.json(
      { error: PASSWORD_RESET_RATE_LIMIT_ERROR },
      {
        headers: {
          "Retry-After": String(clientRateLimit.retryAfterSeconds),
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

  const validation = validateResetPasswordInput(bodyResult.body);

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 },
    );
  }

  const result = await completePasswordReset({
    password: validation.data.password,
    request,
    token: validation.data.token,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: PASSWORD_RESET_COMPLETED_MESSAGE,
  });
}
