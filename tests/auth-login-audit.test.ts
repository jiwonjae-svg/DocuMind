import { describe, expect, it } from "vitest";
import {
  buildUserLoginAuditData,
  buildUserLoginFailureAuditData,
} from "../lib/auth/login-audit";
import {
  MAX_IP_ADDRESS_LENGTH,
  MAX_USER_AGENT_LENGTH,
} from "../lib/tools/response";

function requestWithHeaders(headers: HeadersInit) {
  return {
    headers: new Headers(headers),
  };
}

describe("login audit data", () => {
  it("captures bounded request metadata for successful sign-ins", () => {
    const auditData = buildUserLoginAuditData({
      request: requestWithHeaders({
        "user-agent": "DocuMind reviewer browser",
        "x-forwarded-for": " 203.0.113.42, 10.0.0.1 ",
      }),
      userId: "user-1",
    });

    expect(auditData).toEqual({
      actorId: "user-1",
      action: "user_login",
      ipAddress: "203.0.113.42",
      resourceType: "User",
      resourceId: "user-1",
      userAgent: "DocuMind reviewer browser",
    });
  });

  it("bounds long user agents and ignores malformed IP metadata before persistence", () => {
    const auditData = buildUserLoginAuditData({
      request: requestWithHeaders({
        "user-agent": "u".repeat(MAX_USER_AGENT_LENGTH + 1),
        "x-forwarded-for": "i".repeat(MAX_IP_ADDRESS_LENGTH + 1),
      }),
      userId: "user-1",
    });

    expect(auditData.ipAddress).toBeNull();
    expect(auditData.userAgent).toHaveLength(MAX_USER_AGENT_LENGTH);
  });

  it("captures failed sign-ins without storing submitted secrets", () => {
    const auditData = buildUserLoginFailureAuditData({
      request: requestWithHeaders({
        "user-agent": "DocuMind reviewer browser",
        "x-forwarded-for": " 203.0.113.42, 10.0.0.1 ",
      }),
      userId: "user-1",
    });

    expect(auditData).toEqual({
      actorId: "user-1",
      action: "user_login_failed",
      ipAddress: "203.0.113.42",
      metadata: {
        reason: "invalid_credentials",
      },
      resourceType: "User",
      resourceId: "user-1",
      userAgent: "DocuMind reviewer browser",
    });
    expect(JSON.stringify(auditData.metadata)).not.toContain(
      "DocuMindDemo123!",
    );
    expect(JSON.stringify(auditData.metadata)).not.toContain(
      "demo@documind.local",
    );
  });

  it("records unknown-user sign-in failures without assigning ownership", () => {
    expect(
      buildUserLoginFailureAuditData({
        request: requestWithHeaders({}),
      }),
    ).toMatchObject({
      actorId: null,
      action: "user_login_failed",
      resourceType: "Auth",
      resourceId: null,
    });
  });
});
