import { isIP } from "node:net";

export const MAX_IP_ADDRESS_LENGTH = 128;
export const MAX_USER_AGENT_LENGTH = 512;
const MAX_FORWARDED_FOR_LENGTH = 512;

type RequestWithHeaders = { headers: Headers };

function normalizeHeaderValue(value: string | null | undefined, maxLength: number) {
  const trimmedValue = value
    ?.replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.slice(0, maxLength);
}

function normalizeIpAddress(value: string | null | undefined) {
  const normalizedValue = normalizeHeaderValue(value, MAX_IP_ADDRESS_LENGTH);

  return normalizedValue && isIP(normalizedValue) ? normalizedValue : null;
}

function normalizeForwardedForIpAddress(value: string | null | undefined) {
  const normalizedValue = normalizeHeaderValue(value, MAX_FORWARDED_FOR_LENGTH);

  if (!normalizedValue || normalizedValue.includes(",")) {
    return null;
  }

  return normalizeIpAddress(normalizedValue);
}

export function readIpAddress(request: RequestWithHeaders) {
  return (
    normalizeForwardedForIpAddress(request.headers.get("x-forwarded-for")) ??
    normalizeIpAddress(request.headers.get("x-real-ip"))
  );
}

export function readUserAgent(request: RequestWithHeaders) {
  return normalizeHeaderValue(
    request.headers.get("user-agent"),
    MAX_USER_AGENT_LENGTH,
  );
}
