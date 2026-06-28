import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

async function readHeaders() {
  expect(nextConfig.headers).toBeTypeOf("function");

  return nextConfig.headers ? await nextConfig.headers() : [];
}

describe("Next.js security headers", () => {
  it("sets conservative browser security headers on all routes", async () => {
    const headers = await readHeaders();
    const allRoutes = headers.find((rule) => rule.source === "/(.*)");

    expect(allRoutes?.headers).toEqual(
      expect.arrayContaining([
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

  it("prevents API responses from being stored by caches", async () => {
    const headers = await readHeaders();
    const apiRoutes = headers.find((rule) => rule.source === "/api/:path*");

    expect(apiRoutes?.headers).toEqual(
      expect.arrayContaining([{ key: "Cache-Control", value: "no-store" }]),
    );
  });
});
