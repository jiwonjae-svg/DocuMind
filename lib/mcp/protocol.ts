export const MCP_PROTOCOL_VERSION = "2025-06-18";
export const MCP_SERVER_NAME = "DocuMind";
export const MAX_JSON_RPC_BATCH_REQUESTS = 10;

export type JsonRpcId = number | string | null;

export type JsonRpcRequest = {
  id?: JsonRpcId;
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
};

export type ParsedJsonRpcMessage =
  | {
      ok: true;
      request: JsonRpcRequest;
    }
  | {
      error: string;
      id?: JsonRpcId;
      ok: false;
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

function readValidJsonRpcId(values: Record<string, unknown>) {
  return "id" in values && isJsonRpcId(values.id)
    ? (values.id as JsonRpcId)
    : undefined;
}

function parseJsonRpcMessage(body: unknown): ParsedJsonRpcMessage {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: "JSON-RPC request must be an object.",
      ok: false,
    };
  }

  const values = body as Record<string, unknown>;
  const id = readValidJsonRpcId(values);

  if (values.jsonrpc !== "2.0" || typeof values.method !== "string") {
    return {
      error: "JSON-RPC request must include jsonrpc \"2.0\" and method.",
      ...(id !== undefined ? { id } : {}),
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
      jsonrpc: "2.0",
      method: values.method,
      ...("id" in values ? { id: values.id as JsonRpcId } : {}),
      ...("params" in values ? { params: values.params } : {}),
    },
  };
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
  const parsed = parseJsonRpcMessage(body);

  return parsed.ok
    ? parsed
    : {
        error: parsed.error,
        ok: false,
      };
}

export function parseJsonRpcMessages(body: unknown):
  | {
      isBatch: boolean;
      messages: ParsedJsonRpcMessage[];
      ok: true;
    }
  | {
      error: string;
      ok: false;
    } {
  if (!Array.isArray(body)) {
    return {
      isBatch: false,
      messages: [parseJsonRpcMessage(body)],
      ok: true,
    };
  }

  if (body.length === 0) {
    return {
      error: "JSON-RPC batch must contain at least one request.",
      ok: false,
    };
  }

  if (body.length > MAX_JSON_RPC_BATCH_REQUESTS) {
    return {
      error: `JSON-RPC batch must contain ${MAX_JSON_RPC_BATCH_REQUESTS} or fewer requests.`,
      ok: false,
    };
  }

  return {
    isBatch: true,
    messages: body.map(parseJsonRpcMessage),
    ok: true,
  };
}

export function isJsonRpcNotification(request: JsonRpcRequest) {
  return request.id === undefined;
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

export function mcpPingResult() {
  return {};
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
