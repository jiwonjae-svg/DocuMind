import { describe, expect, it } from "vitest";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "../lib/api/request-origin";

type RequestWithOrigin = Parameters<typeof isSameOriginRequest>[0];

function request(url: string, origin?: string | null): RequestWithOrigin {
  const headers = new Headers();

  if (origin !== undefined && origin !== null) {
    headers.set("origin", origin);
  }

  return { headers, url } as RequestWithOrigin;
}

describe("request origin checks", () => {
  it("allows same-origin browser mutations", () => {
    expect(
      isSameOriginRequest(
        request("https://documind.example/api/search", "https://documind.example"),
      ),
    ).toBe(true);
  });

  it("allows non-browser or server clients without an Origin header", () => {
    expect(isSameOriginRequest(request("https://documind.example/api/search"))).toBe(
      true,
    );
  });

  it("rejects cross-origin browser mutations", () => {
    expect(
      isSameOriginRequest(
        request("https://documind.example/api/search", "https://attacker.example"),
      ),
    ).toBe(false);
  });

  it("rejects malformed Origin headers", () => {
    expect(
      isSameOriginRequest(request("https://documind.example/api/search", "null")),
    ).toBe(false);
    expect(CROSS_ORIGIN_REQUEST_ERROR).toBe("Cross-origin request blocked.");
  });
});
