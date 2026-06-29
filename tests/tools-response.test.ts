import { describe, expect, it } from "vitest";
import {
  MAX_IP_ADDRESS_LENGTH,
  MAX_USER_AGENT_LENGTH,
  readIpAddress,
  readUserAgent,
} from "../lib/tools/response";

type RequestWithHeaders = Parameters<typeof readIpAddress>[0];

function requestWithHeaders(headers: HeadersInit): RequestWithHeaders {
  return {
    headers: new Headers(headers),
  } as RequestWithHeaders;
}

function requestWithRawHeaderValues(headers: Record<string, string>): RequestWithHeaders {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]),
  );

  return {
    headers: {
      get(name: string) {
        return normalizedHeaders[name.toLowerCase()] ?? null;
      },
    },
  } as RequestWithHeaders;
}

describe("request metadata helpers", () => {
  it("reads a single forwarded IP address", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": " 203.0.113.10 ",
      "x-real-ip": "198.51.100.5",
    });

    expect(readIpAddress(request)).toBe("203.0.113.10");
  });

  it("rejects multi-hop forwarded IP chains before audit persistence", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": " 203.0.113.10, 10.0.0.2 ",
      "x-real-ip": "198.51.100.5",
    });

    expect(readIpAddress(request)).toBe("198.51.100.5");
  });

  it("falls back to x-real-ip when forwarded IP is empty", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": " , 10.0.0.2 ",
      "x-real-ip": " 198.51.100.5 ",
    });

    expect(readIpAddress(request)).toBe("198.51.100.5");
  });

  it("ignores malformed forwarded IP metadata before audit persistence", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": " 203.0.113.10<script>, 10.0.0.2 ",
      "x-real-ip": " 198.51.100.5 ",
    });

    expect(readIpAddress(request)).toBe("198.51.100.5");
  });

  it("returns null for blank request metadata", () => {
    const request = requestWithHeaders({
      "user-agent": "   ",
      "x-forwarded-for": "   ",
    });

    expect(readIpAddress(request)).toBeNull();
    expect(readUserAgent(request)).toBeNull();
  });

  it("bounds stored audit header values", () => {
    const request = requestWithHeaders({
      "user-agent": "a".repeat(MAX_USER_AGENT_LENGTH + 10),
      "x-forwarded-for": "b".repeat(MAX_IP_ADDRESS_LENGTH + 10),
    });

    expect(readIpAddress(request)).toBeNull();
    expect(readUserAgent(request)).toHaveLength(MAX_USER_AGENT_LENGTH);
  });

  it("removes control and format characters before storing audit metadata", () => {
    const request = requestWithRawHeaderValues({
      "user-agent": "DocuMind\r\nReviewer\tBrowser\u202eHidden",
      "x-forwarded-for": " 203.0.113.10\r\nInjected, 10.0.0.2 ",
    });

    expect(readIpAddress(request)).toBeNull();
    expect(readUserAgent(request)).toBe("DocuMind Reviewer Browser Hidden");
  });
});
