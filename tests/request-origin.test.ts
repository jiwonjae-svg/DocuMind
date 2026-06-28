import { describe, expect, it } from "vitest";
import {
  CROSS_ORIGIN_REQUEST_ERROR,
  isSameOriginRequest,
} from "../lib/api/request-origin";

type RequestWithOrigin = Parameters<typeof isSameOriginRequest>[0];

function request(
  url: string,
  origin?: string | null,
  fetchSite?: string | null,
  cookie?: string | null,
): RequestWithOrigin {
  const headers = new Headers();

  if (origin !== undefined && origin !== null) {
    headers.set("origin", origin);
  }

  if (fetchSite !== undefined && fetchSite !== null) {
    headers.set("sec-fetch-site", fetchSite);
  }

  if (cookie !== undefined && cookie !== null) {
    headers.set("cookie", cookie);
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

  it("rejects cookie-authenticated mutations without browser provenance headers", () => {
    expect(
      isSameOriginRequest(
        request(
          "https://documind.example/api/search",
          null,
          null,
          "authjs.session-token=session",
        ),
      ),
    ).toBe(false);
  });

  it("allows same-origin Fetch Metadata without an Origin header", () => {
    expect(
      isSameOriginRequest(
        request("https://documind.example/api/search", null, "same-origin"),
      ),
    ).toBe(true);
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

  it("rejects cross-site and same-site browser mutations without Origin", () => {
    expect(
      isSameOriginRequest(
        request("https://documind.example/api/search", null, "cross-site"),
      ),
    ).toBe(false);
    expect(
      isSameOriginRequest(
        request("https://documind.example/api/search", null, "same-site"),
      ),
    ).toBe(false);
  });

  it("rejects malformed Fetch Metadata headers", () => {
    expect(
      isSameOriginRequest(
        request("https://documind.example/api/search", null, "unexpected"),
      ),
    ).toBe(false);
  });
});
