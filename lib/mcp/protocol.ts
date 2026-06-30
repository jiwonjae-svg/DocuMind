export const MCP_PROTOCOL_VERSION = "2025-06-18";
export const MCP_SERVER_NAME = "DocuMind";

export type JsonRpcId = number | string | null;

export type JsonRpcRequest = {
  id?: JsonRpcId;
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
};

export type JsonRpcErrorCode =
  | -32700
  | -32600
  | -32601
  | -32602
  | -32603
  | -32000;

function isJsonRpcId(value: unknown): value is JsonRpcId {
  return (
    value === null ||
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

export function parseJsonRpcRequest(body: unknown):
  | {
      ok: true;
      request: JsonRpcRequest;
    }
  | {
      error: string;
      ok: false;
    } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: "JSON-RPC request must be an object.",
      ok: false,
    };
  }

  const values = body as Record<string, unknown>;

  if (values.jsonrpc !== "2.0" || typeof values.method !== "string") {
    return {
      error: "JSON-RPC request must include jsonrpc \"2.0\" and method.",
      ok: false,
    };
  }

  if ("id" in values && !isJsonRpcId(values.id)) {
    return {
      error: "JSON-RPC id must be a string, number, or null.",
      ok: false,
    };
  }

  return {
    ok: true,
    request: {
      id: values.id as JsonRpcId | undefined,
      jsonrpc: "2.0",
      method: values.method,
      ...("params" in values ? { params: values.params } : {}),
    },
  };
}

export function jsonRpcResult(id: JsonRpcId | undefined, result: unknown) {
  return {
    id: id ?? null,
    jsonrpc: "2.0",
    result,
  };
}

export function jsonRpcError({
  code,
  id,
  message,
}: {
  code: JsonRpcErrorCode;
  id?: JsonRpcId;
  message: string;
}) {
  return {
    error: {
      code,
      message,
    },
    id: id ?? null,
    jsonrpc: "2.0",
  };
}

export const mcpTools = [
  {
    description:
      "Search ready DocuMind document chunks the signed-in user can access through ownership or team membership.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        limit: {
          default: 5,
          maximum: 10,
          minimum: 1,
          type: "number",
        },
        query: {
          minLength: 1,
          type: "string",
        },
      },
      required: ["query"],
      type: "object",
    },
    name: "search-documents",
    title: "Search documents",
  },
  {
    description:
      "Ask a grounded question over ready DocuMind documents the signed-in user can access and return citations.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        question: {
          minLength: 1,
          type: "string",
        },
      },
      required: ["question"],
      type: "object",
    },
    name: "ask-with-citations",
    title: "Ask with citations",
  },
  {
    description:
      "Summarize one READY document the signed-in user can access from bounded stored chunks.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        documentId: {
          minLength: 1,
          type: "string",
        },
      },
      required: ["documentId"],
      type: "object",
    },
    name: "summarize-document",
    title: "Summarize document",
  },
] as const;

export function mcpInitializeResult() {
  return {
    capabilities: {
      tools: {},
    },
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: {
      name: MCP_SERVER_NAME,
      version: "0.1.0",
    },
  };
}

export function mcpToolsListResult() {
  return {
    tools: mcpTools,
  };
}

export function mcpTextToolResult(value: unknown) {
  return {
    content: [
      {
        text: JSON.stringify(value, null, 2),
        type: "text",
      },
    ],
    structuredContent: value,
  };
}
