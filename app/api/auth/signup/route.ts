import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  SIGNUP_RATE_LIMIT_ERROR,
  checkSignupEmailRateLimit,
  checkSignupRateLimit,
} from "@/lib/auth/signup-rate-limit";
import {
  createPasswordUser,
  validateSignupInput,
} from "@/lib/auth/signup";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: CROSS_ORIGIN_REQUEST_ERROR },
      { status: 403 },
    );
  }

  const clientRateLimit = checkSignupRateLimit({ request });

  if (!clientRateLimit.allowed) {
    return NextResponse.json(
      { error: SIGNUP_RATE_LIMIT_ERROR },
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

  const validation = validateSignupInput(bodyResult.body);

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 },
    );
  }

  const emailRateLimit = checkSignupEmailRateLimit({
    email: validation.data.email,
  });

  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      { error: SIGNUP_RATE_LIMIT_ERROR },
      {
        headers: {
          "Retry-After": String(emailRateLimit.retryAfterSeconds),
        },
        status: 429,
      },
    );
  }

  const result = await createPasswordUser(validation.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json(
    {
      user: result.user,
    },
    { status: 201 },
  );
}
