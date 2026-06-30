import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  PASSWORD_RESET_RATE_LIMIT_ERROR,
  checkPasswordResetEmailRateLimit,
  checkPasswordResetRequestRateLimit,
} from "@/lib/auth/password-reset-rate-limit";
import {
  PASSWORD_RESET_ACCEPTED_MESSAGE,
  requestPasswordReset,
  validateForgotPasswordInput,
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

  const clientRateLimit = checkPasswordResetRequestRateLimit({ request });

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

  const validation = validateForgotPasswordInput(bodyResult.body);

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 },
    );
  }

  const emailRateLimit = checkPasswordResetEmailRateLimit({
    email: validation.data.email,
  });

  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      { error: PASSWORD_RESET_RATE_LIMIT_ERROR },
      {
        headers: {
          "Retry-After": String(emailRateLimit.retryAfterSeconds),
        },
        status: 429,
      },
    );
  }

  const result = await requestPasswordReset({
    email: validation.data.email,
    request,
  });

  return NextResponse.json({
    message: PASSWORD_RESET_ACCEPTED_MESSAGE,
    ...(result.resetUrl ? { resetUrl: result.resetUrl } : {}),
  });
}
