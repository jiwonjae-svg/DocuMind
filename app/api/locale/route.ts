import { readJsonBodyResult } from "@/lib/api/json-body";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "@/lib/api/request-origin";
import {
  I18N_COOKIE_NAME,
  isSupportedLocale,
} from "@/lib/i18n/config";
import { getLocaleCookieOptions } from "@/lib/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: CROSS_ORIGIN_REQUEST_ERROR },
      { status: 403 },
    );
  }

  const bodyResult = await readJsonBodyResult(request);

  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status },
    );
  }

  const locale =
    bodyResult.body &&
    typeof bodyResult.body === "object" &&
    !Array.isArray(bodyResult.body) &&
    "locale" in bodyResult.body
      ? bodyResult.body.locale
      : null;

  if (!isSupportedLocale(locale)) {
    return NextResponse.json(
      { error: "Unsupported locale." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ locale });

  response.cookies.set(I18N_COOKIE_NAME, locale, getLocaleCookieOptions());

  return response;
}
