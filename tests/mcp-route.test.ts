import type { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: "user-1",
    },
  }),
}));

vi.mock("@/lib/api/request-origin", () => ({
  CROSS_ORIGIN_REQUEST_ERROR: "Cross-origin request blocked.",
  isSameOriginRequest: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/auth/api-tokens", () => ({
  API_TOKEN_INVALID_BEARER_ERROR: "Invalid bearer token.",
  authenticateApiBearerToken: vi.fn().mockResolvedValue({
    ok: false,
    reason: "missing",
  }),
}));

import { POST } from "../app/api/mcp/route";

function buildMcpRequest(body: unknown) {
  return new Request("https://documind.test/api/mcp", {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      origin: "https://documind.test",
    },
    method: "POST",
  }) as NextRequest;
}

describe("MCP route JSON-RPC compatibility", () => {
  it("returns no body for notification-only payloads", async () => {
    const response = await POST(
      buildMcpRequest({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      }),
    );

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  it("returns responses only for batch requests with IDs", async () => {
    const response = await POST(
      buildMcpRequest([
        {
          id: "ping-1",
          jsonrpc: "2.0",
          method: "ping",
        },
        {
          jsonrpc: "2.0",
          method: "notifications/initialized",
        },
        {
          id: "tools-1",
          jsonrpc: "2.0",
          method: "tools/list",
        },
      ]),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject([
      {
        id: "ping-1",
        jsonrpc: "2.0",
        result: {},
      },
      {
        id: "tools-1",
        jsonrpc: "2.0",
        result: {
          tools: [
            {
              name: "search-documents",
            },
            {
              name: "ask-with-citations",
            },
            {
              name: "summarize-document",
            },
          ],
        },
      },
    ]);
  });

  it("keeps per-item JSON-RPC error IDs in batches", async () => {
    const response = await POST(
      buildMcpRequest([
        {
          id: "bad-1",
          jsonrpc: "2.0",
        },
      ]),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        error: {
          code: -32600,
          message: "JSON-RPC request must include jsonrpc \"2.0\" and method.",
        },
        id: "bad-1",
        jsonrpc: "2.0",
      },
    ]);
  });
});
