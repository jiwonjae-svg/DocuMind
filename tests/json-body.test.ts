import { describe, expect, it } from "vitest";
import {
  isJsonBodyParseError,
  isJsonBodyTooLargeError,
  JSON_REQUEST_BODY_TOO_LARGE_ERROR,
  readBoundedJsonBody,
} from "../lib/api/json-body";

function jsonRequest(body: string, headers?: HeadersInit) {
  return new Request("http://localhost/api/test", {
    body,
    headers,
    method: "POST",
  });
}

describe("bounded JSON request bodies", () => {
  it("parses JSON under the configured limit", async () => {
    await expect(
      readBoundedJsonBody(jsonRequest("{\"query\":\"hello\"}"), 64),
    ).resolves.toEqual({ query: "hello" });
  });

  it("rejects declared content lengths over the configured limit", async () => {
    const request = jsonRequest("{}", {
      "content-length": "128",
    });

    await expect(readBoundedJsonBody(request, 64)).rejects.toSatisfy((error) =>
      isJsonBodyTooLargeError(error),
    );
    await expect(readBoundedJsonBody(jsonRequest("{}", {
      "content-length": "128",
    }), 64)).rejects.toThrow(JSON_REQUEST_BODY_TOO_LARGE_ERROR);
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
});
