import { describe, expect, it } from "vitest";
import {
  isJsonBodyParseError,
  isJsonBodyUnsupportedMediaTypeError,
  isJsonBodyTooLargeError,
  JSON_REQUEST_BODY_TOO_LARGE_ERROR,
  JSON_REQUEST_INVALID_ERROR,
  JSON_REQUEST_UNSUPPORTED_MEDIA_TYPE_ERROR,
  readBoundedJsonBody,
  readJsonBodyResult,
} from "../lib/api/json-body";

function jsonRequest(body: string, headers?: HeadersInit) {
  return new Request("http://localhost/api/test", {
    body,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    method: "POST",
  });
}

describe("bounded JSON request bodies", () => {
  it("parses JSON under the configured limit", async () => {
    await expect(
      readBoundedJsonBody(jsonRequest("{\"query\":\"hello\"}"), 64),
    ).resolves.toEqual({ query: "hello" });
  });

  it("accepts JSON content types with parameters", async () => {
    await expect(
      readBoundedJsonBody(
        jsonRequest("{\"query\":\"hello\"}", {
          "content-type": "application/json; charset=utf-8",
        }),
        64,
      ),
    ).resolves.toEqual({ query: "hello" });
  });

  it("rejects non-JSON content types before parsing", async () => {
    await expect(
      readBoundedJsonBody(
        jsonRequest("{\"query\":\"hello\"}", {
          "content-type": "text/plain",
        }),
        64,
      ),
    ).rejects.toSatisfy((error) =>
      isJsonBodyUnsupportedMediaTypeError(error),
    );
    await expect(
      readBoundedJsonBody(
        jsonRequest("{\"query\":\"hello\"}", {
          "content-type": "text/plain",
        }),
        64,
      ),
    ).rejects.toThrow(JSON_REQUEST_UNSUPPORTED_MEDIA_TYPE_ERROR);
  });

  it("rejects missing content types before parsing", async () => {
    const request = new Request("http://localhost/api/test", {
      body: "{\"query\":\"hello\"}",
      method: "POST",
    });

    await expect(readBoundedJsonBody(request, 64)).rejects.toSatisfy((error) =>
      isJsonBodyUnsupportedMediaTypeError(error),
    );
  });

  it("rejects declared content lengths over the configured limit", async () => {
    const request = jsonRequest("{}", {
      "content-length": "128",
    });

    await expect(readBoundedJsonBody(request, 64)).rejects.toSatisfy((error) =>
      isJsonBodyTooLargeError(error),
    );
    await expect(
      readBoundedJsonBody(jsonRequest("{}", {
        "content-length": "128",
      }), 64),
    ).rejects.toThrow(JSON_REQUEST_BODY_TOO_LARGE_ERROR);
  });

  it("rejects streamed bodies over the configured limit", async () => {
    const request = jsonRequest(JSON.stringify({ value: "x".repeat(128) }));

    await expect(readBoundedJsonBody(request, 32)).rejects.toSatisfy((error) =>
      isJsonBodyTooLargeError(error),
    );
  });

  it("maps malformed JSON to a parse error", async () => {
    await expect(readBoundedJsonBody(jsonRequest("{not-json"), 64)).rejects.toSatisfy(
      (error) => isJsonBodyParseError(error),
    );
  });

  it("returns parsed JSON results for route handlers", async () => {
    await expect(
      readJsonBodyResult(jsonRequest("{\"query\":\"hello\"}"), 64),
    ).resolves.toEqual({
      body: { query: "hello" },
      ok: true,
    });
  });

  it("maps route handler JSON body errors to stable statuses", async () => {
    await expect(
      readJsonBodyResult(
        jsonRequest("{\"query\":\"hello\"}", {
          "content-type": "text/plain",
        }),
        64,
      ),
    ).resolves.toEqual({
      error: JSON_REQUEST_UNSUPPORTED_MEDIA_TYPE_ERROR,
      ok: false,
      status: 415,
    });

    await expect(
      readJsonBodyResult(
        jsonRequest("{}", {
          "content-length": "128",
        }),
        64,
      ),
    ).resolves.toEqual({
      error: JSON_REQUEST_BODY_TOO_LARGE_ERROR,
      ok: false,
      status: 413,
    });

    await expect(
      readJsonBodyResult(jsonRequest("{not-json"), 64),
    ).resolves.toEqual({
      error: JSON_REQUEST_INVALID_ERROR,
      ok: false,
      status: 400,
    });
  });
});
