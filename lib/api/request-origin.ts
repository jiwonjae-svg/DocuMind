import type { NextRequest } from "next/server";

export const CROSS_ORIGIN_REQUEST_ERROR = "Cross-origin request blocked.";

type RequestWithOrigin = Pick<NextRequest, "headers" | "url">;

function parseOrigin(value: string | null) {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return "invalid";
  }
}

function readFetchSite(headers: Headers) {
  return headers.get("sec-fetch-site")?.trim().toLowerCase() ?? null;
}

export function isSameOriginRequest(request: RequestWithOrigin) {
  const fetchSite = readFetchSite(request.headers);

  if (fetchSite === "cross-site" || fetchSite === "same-site") {
    return false;
  }

  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }

  const origin = parseOrigin(request.headers.get("origin"));

  if (!origin) {
    return true;
  }

  if (origin === "invalid") {
    return false;
  }

  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
