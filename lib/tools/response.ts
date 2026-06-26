import type { NextRequest } from "next/server";

export const MAX_IP_ADDRESS_LENGTH = 128;
export const MAX_USER_AGENT_LENGTH = 512;

type RequestWithHeaders = Pick<NextRequest, "headers">;

function normalizeHeaderValue(value: string | null | undefined, maxLength: number) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.slice(0, maxLength);
}

export function readIpAddress(request: RequestWithHeaders) {
  return (
    normalizeHeaderValue(
      request.headers.get("x-forwarded-for")?.split(",")[0],
      MAX_IP_ADDRESS_LENGTH,
    ) ??
    normalizeHeaderValue(request.headers.get("x-real-ip"), MAX_IP_ADDRESS_LENGTH)
  );
}

export function readUserAgent(request: RequestWithHeaders) {
  return normalizeHeaderValue(
    request.headers.get("user-agent"),
    MAX_USER_AGENT_LENGTH,
  );
}
