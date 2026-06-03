import { NextRequest } from "next/server";

export function readIpAddress(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null
  );
}

export function readUserAgent(request: NextRequest) {
  return request.headers.get("user-agent")?.trim() || null;
}
