import { describe, expect, it } from "vitest";
import {
  MAX_JSON_RPC_BATCH_REQUESTS,
  MCP_PROTOCOL_VERSION,
  isJsonRpcNotification,
  jsonRpcError,
  jsonRpcResult,
  mcpInitializeResult,
  mcpPingResult,
  mcpTextToolResult,
  mcpToolsListResult,
  parseJsonRpcMessages,
  parseJsonRpcRequest,
} from "../lib/mcp/protocol";

describe("MCP JSON-RPC protocol helpers", () => {
  it("parses valid JSON-RPC requests", () => {
    expect(
      parseJsonRpcRequest({
        id: 1,
        jsonrpc: "2.0",
        method: "tools/list",
      }),
    ).toEqual({
      ok: true,
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "tools/list",
      },
    });
  });

  it("rejects malformed JSON-RPC requests", () => {
    expect(parseJsonRpcRequest(null)).toEqual({
      error: "JSON-RPC request must be an object.",
      ok: false,
    });
    expect(
      parseJsonRpcRequest({
        id: {},
        jsonrpc: "2.0",
        method: "tools/list",
      }),
    ).toEqual({
      error: "JSON-RPC id must be a string, number, or null.",
      ok: false,
    });
  });

  it("parses bounded JSON-RPC batch payloads", () => {
    expect(
      parseJsonRpcMessages([
        {
          id: "init-1",
          jsonrpc: "2.0",
          method: "initialize",
        },
        {
          jsonrpc: "2.0",
          method: "notifications/initialized",
        },
        {
          id: "bad-1",
          jsonrpc: "2.0",
        },
      ]),
    ).toEqual({
      isBatch: true,
      messages: [
        {
          ok: true,
          request: {
            id: "init-1",
            jsonrpc: "2.0",
            method: "initialize",
          },
        },
        {
          ok: true,
          request: {
            jsonrpc: "2.0",
            method: "notifications/initialized",
          },
        },
        {
          error: "JSON-RPC request must include jsonrpc \"2.0\" and method.",
          id: "bad-1",
          ok: false,
        },
      ],
      ok: true,
    });
  });

  it("rejects empty or oversized JSON-RPC batches", () => {
    expect(parseJsonRpcMessages([])).toEqual({
      error: "JSON-RPC batch must contain at least one request.",
      ok: false,
    });
    expect(
      parseJsonRpcMessages(
        Array.from({ length: MAX_JSON_RPC_BATCH_REQUESTS + 1 }, (_, index) => ({
          id: index,
          jsonrpc: "2.0",
          method: "ping",
        })),
      ),
    ).toEqual({
      error: `JSON-RPC batch must contain ${MAX_JSON_RPC_BATCH_REQUESTS} or fewer requests.`,
      ok: false,
    });
  });

  it("detects notifications without treating null IDs as notifications", () => {
    expect(
      isJsonRpcNotification({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      }),
    ).toBe(true);
    expect(
      isJsonRpcNotification({
        id: null,
        jsonrpc: "2.0",
        method: "ping",
      }),
    ).toBe(false);
  });

  it("builds MCP initialize and tools/list responses", () => {
    expect(mcpInitializeResult()).toEqual({
      capabilities: {
        tools: {},
      },
      protocolVersion: MCP_PROTOCOL_VERSION,
      serverInfo: {
        name: "DocuMind",
        version: "0.1.0",
      },
    });

    expect(mcpToolsListResult().tools.map((tool) => tool.name)).toEqual([
      "search-documents",
      "ask-with-citations",
      "summarize-document",
    ]);
    expect(mcpPingResult()).toEqual({});
  });

  it("wraps tool results as text plus structured content", () => {
    expect(mcpTextToolResult({ ok: true })).toEqual({
      content: [
        {
          text: "{\n  \"ok\": true\n}",
          type: "text",
        },
      ],
      structuredContent: {
        ok: true,
      },
    });
  });

  it("formats JSON-RPC result and error envelopes", () => {
    expect(jsonRpcResult("request-1", { ok: true })).toEqual({
      id: "request-1",
      jsonrpc: "2.0",
      result: {
        ok: true,
      },
    });
    expect(
      jsonRpcError({
        code: -32601,
        id: "request-1",
        message: "Method not found.",
      }),
    ).toEqual({
      error: {
        code: -32601,
        message: "Method not found.",
      },
      id: "request-1",
      jsonrpc: "2.0",
    });
  });
});
