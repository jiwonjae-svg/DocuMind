import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

async function readHeaders() {
  expect(nextConfig.headers).toBeTypeOf("function");

  return nextConfig.headers ? await nextConfig.headers() : [];
}

describe("Next.js security headers", () => {
  it("does not expose the framework powered-by header", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("sets conservative browser security headers on all routes", async () => {
    const headers = await readHeaders();
    const allRoutes = headers.find((rule) => rule.source === "/(.*)");

    expect(allRoutes?.headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "Content-Security-Policy",
          value: expect.stringContaining("default-src 'self'"),
        }),
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
        },
      ]),
    );
  });

  it("limits high-risk browser capabilities with CSP directives", async () => {
    const headers = await readHeaders();
    const allRoutes = headers.find((rule) => rule.source === "/(.*)");
    const csp = allRoutes?.headers.find(
      (header) => header.key === "Content-Security-Policy",
    )?.value;

    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("prevents API responses from being stored by caches", async () => {
    const headers = await readHeaders();
    const apiRoutes = headers.find((rule) => rule.source === "/api/:path*");

    expect(apiRoutes?.headers).toEqual(
      expect.arrayContaining([{ key: "Cache-Control", value: "no-store" }]),
    );
  });
});
