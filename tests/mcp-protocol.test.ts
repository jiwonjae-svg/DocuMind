import { describe, expect, it } from "vitest";
import {
  MCP_PROTOCOL_VERSION,
  jsonRpcError,
  jsonRpcResult,
  mcpInitializeResult,
  mcpTextToolResult,
  mcpToolsListResult,
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
