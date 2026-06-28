import { readIpAddress, readUserAgent } from "../tools/response";

type LoginAuditRequest = { headers: Headers };

type LoginAuditDataInput = {
  request: LoginAuditRequest;
  userId: string;
};

type FailedLoginAuditDataInput = {
  request: LoginAuditRequest;
  userId?: string | null;
};

export function buildUserLoginAuditData({
  request,
  userId,
}: LoginAuditDataInput) {
  return {
    actorId: userId,
    action: "user_login",
    ipAddress: readIpAddress(request),
    resourceType: "User",
    resourceId: userId,
    userAgent: readUserAgent(request),
  };
}

export function buildUserLoginFailureAuditData({
  request,
  userId,
}: FailedLoginAuditDataInput) {
  return {
    actorId: userId ?? null,
    action: "user_login_failed",
    ipAddress: readIpAddress(request),
    metadata: {
      reason: "invalid_credentials",
    },
    resourceType: userId ? "User" : "Auth",
    resourceId: userId ?? null,
    userAgent: readUserAgent(request),
  };
}
