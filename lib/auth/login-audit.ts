import { readIpAddress, readUserAgent } from "../tools/response";

type LoginAuditRequest = { headers: Headers };

type LoginAuditDataInput = {
  request: LoginAuditRequest;
  userId: string;
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
