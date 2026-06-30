import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const apiRoot = path.join(process.cwd(), "app", "api");
const publicRouteSuffixes = [
  path.join("auth", "[...nextauth]", "route.ts"),
  path.join("auth", "forgot-password", "route.ts"),
  path.join("auth", "reset-password", "route.ts"),
  path.join("auth", "signup", "route.ts"),
  path.join("health", "route.ts"),
  path.join("locale", "route.ts"),
];
const jsonPostRouteSuffixes = [
  path.join("account", "password", "route.ts"),
  path.join("admin", "team-invitations", "route.ts"),
  path.join("admin", "team-memberships", "route.ts"),
  path.join("admin", "teams", "route.ts"),
  path.join("api-tokens", "route.ts"),
  path.join("ask", "route.ts"),
  path.join("locale", "route.ts"),
  path.join("mcp", "route.ts"),
  path.join("search", "route.ts"),
  path.join("team-invitations", "accept", "route.ts"),
  path.join("tools", "ask-with-citations", "route.ts"),
  path.join("tools", "search-documents", "route.ts"),
  path.join("tools", "summarize-document", "route.ts"),
];
const jsonDeleteRouteSuffixes = [
  path.join("account", "oauth-accounts", "route.ts"),
  path.join("admin", "team-invitations", "route.ts"),
  path.join("admin", "team-memberships", "route.ts"),
  path.join("api-tokens", "route.ts"),
];
const jsonPatchRouteSuffixes = [
  path.join("admin", "team-invitations", "route.ts"),
];

function findRouteFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);

    return statSync(fullPath).isDirectory()
      ? findRouteFiles(fullPath)
      : fullPath.endsWith("route.ts")
        ? [fullPath]
        : [];
  });
}

function toApiRelativePath(filePath: string) {
  return path.relative(apiRoot, filePath);
}

function readRoute(filePath: string) {
  return readFileSync(filePath, "utf8");
}

describe("API route security contracts", () => {
  const routeFiles = findRouteFiles(apiRoot);
  const protectedPostRoutes = routeFiles.filter((filePath) => {
    const relativePath = toApiRelativePath(filePath);
    const source = readRoute(filePath);

    return (
      source.includes("export async function POST") &&
      !publicRouteSuffixes.includes(relativePath)
    );
  });
  const protectedDeleteRoutes = routeFiles.filter((filePath) => {
    const source = readRoute(filePath);

    return source.includes("export async function DELETE");
  });
  const protectedPatchRoutes = routeFiles.filter((filePath) => {
    const source = readRoute(filePath);

    return source.includes("export async function PATCH");
  });
  const protectedGetRoutes = routeFiles.filter((filePath) => {
    const relativePath = toApiRelativePath(filePath);
    const source = readRoute(filePath);

    return (
      source.includes("export async function GET") &&
      !publicRouteSuffixes.includes(relativePath)
    );
  });

  it("keeps every protected POST route authenticated and same-origin checked", () => {
    expect(protectedPostRoutes.map(toApiRelativePath).sort()).toEqual([
      path.join("account", "password", "route.ts"),
      path.join("admin", "team-invitations", "route.ts"),
      path.join("admin", "team-memberships", "route.ts"),
      path.join("admin", "teams", "route.ts"),
      path.join("api-tokens", "route.ts"),
      path.join("ask", "route.ts"),
      path.join("documents", "[documentId]", "delete", "route.ts"),
      path.join("documents", "route.ts"),
      path.join("mcp", "route.ts"),
      path.join("search", "route.ts"),
      path.join("team-invitations", "accept", "route.ts"),
      path.join("tools", "ask-with-citations", "route.ts"),
      path.join("tools", "search-documents", "route.ts"),
      path.join("tools", "summarize-document", "route.ts"),
    ].sort());

    for (const routeFile of protectedPostRoutes) {
      const source = readRoute(routeFile);

      expect(source, toApiRelativePath(routeFile)).toContain("auth()");
      expect(source, toApiRelativePath(routeFile)).toContain(
        "isSameOriginRequest(request)",
      );
    }
  });

  it("keeps every protected DELETE route authenticated and same-origin checked", () => {
    expect(protectedDeleteRoutes.map(toApiRelativePath).sort()).toEqual([
      path.join("account", "oauth-accounts", "route.ts"),
      path.join("admin", "team-invitations", "route.ts"),
      path.join("admin", "team-memberships", "route.ts"),
      path.join("api-tokens", "route.ts"),
    ]);

    for (const routeFile of protectedDeleteRoutes) {
      const source = readRoute(routeFile);

      expect(source, toApiRelativePath(routeFile)).toContain("auth()");
      expect(source, toApiRelativePath(routeFile)).toContain(
        "isSameOriginRequest(request)",
      );
    }
  });

  it("keeps every protected PATCH route authenticated and same-origin checked", () => {
    expect(protectedPatchRoutes.map(toApiRelativePath).sort()).toEqual([
      path.join("admin", "team-invitations", "route.ts"),
    ]);

    for (const routeFile of protectedPatchRoutes) {
      const source = readRoute(routeFile);

      expect(source, toApiRelativePath(routeFile)).toContain("auth()");
      expect(source, toApiRelativePath(routeFile)).toContain(
        "isSameOriginRequest(request)",
      );
    }
  });

  it("keeps every protected GET route authenticated", () => {
    expect(protectedGetRoutes.map(toApiRelativePath).sort()).toEqual([
      path.join("admin", "audit-logs", "export", "route.ts"),
      path.join("documents", "[documentId]", "download", "route.ts"),
    ]);

    for (const routeFile of protectedGetRoutes) {
      const source = readRoute(routeFile);

      expect(source, toApiRelativePath(routeFile)).toContain("auth()");
    }
  });

  it("keeps JSON POST routes on bounded JSON body parsing", () => {
    for (const relativePath of jsonPostRouteSuffixes) {
      const source = readRoute(path.join(apiRoot, relativePath));

      expect(source, relativePath).toContain("readJsonBodyResult(request)");
    }
  });

  it("keeps JSON DELETE routes on bounded JSON body parsing", () => {
    for (const relativePath of jsonDeleteRouteSuffixes) {
      const source = readRoute(path.join(apiRoot, relativePath));
      const deleteIndex = source.indexOf("export async function DELETE");
      const jsonBodyIndex = source.indexOf(
        "readJsonBodyResult(request)",
        deleteIndex,
      );

      expect(jsonBodyIndex, relativePath).toBeGreaterThan(deleteIndex);
    }
  });

  it("keeps JSON PATCH routes on bounded JSON body parsing", () => {
    for (const relativePath of jsonPatchRouteSuffixes) {
      const source = readRoute(path.join(apiRoot, relativePath));
      const patchIndex = source.indexOf("export async function PATCH");
      const jsonBodyIndex = source.indexOf(
        "readJsonBodyResult(request)",
        patchIndex,
      );

      expect(jsonBodyIndex, relativePath).toBeGreaterThan(patchIndex);
    }
  });

  it("keeps public signup constrained when present", () => {
    const signupRoutePath = path.join(apiRoot, "auth", "signup", "route.ts");

    if (!existsSync(signupRoutePath)) {
      return;
    }

    const source = readRoute(signupRoutePath);
    const clientRateLimitIndex = source.indexOf("const clientRateLimit");
    const jsonBodyIndex = source.indexOf("readJsonBodyResult(request)");
    const emailRateLimitIndex = source.indexOf("const emailRateLimit");
    const createUserIndex = source.indexOf("await createPasswordUser");

    expect(source).toContain("isSameOriginRequest(request)");
    expect(source).toContain("SIGNUP_ACCEPTED_MESSAGE");
    expect(source).not.toContain("status: 409");
    expect(source).not.toContain("result.user");
    expect(clientRateLimitIndex).toBeGreaterThanOrEqual(0);
    expect(jsonBodyIndex).toBeGreaterThan(clientRateLimitIndex);
    expect(emailRateLimitIndex).toBeGreaterThan(jsonBodyIndex);
    expect(createUserIndex).toBeGreaterThan(emailRateLimitIndex);
  });

  it("keeps public password reset routes constrained when present", () => {
    const forgotPasswordRoutePath = path.join(
      apiRoot,
      "auth",
      "forgot-password",
      "route.ts",
    );
    const resetPasswordRoutePath = path.join(
      apiRoot,
      "auth",
      "reset-password",
      "route.ts",
    );

    if (!existsSync(forgotPasswordRoutePath) || !existsSync(resetPasswordRoutePath)) {
      return;
    }

    const forgotSource = readRoute(forgotPasswordRoutePath);
    const resetSource = readRoute(resetPasswordRoutePath);
    const forgotRateLimitIndex = forgotSource.indexOf(
      "const clientRateLimit",
    );
    const forgotJsonBodyIndex = forgotSource.indexOf(
      "readJsonBodyResult(request)",
    );
    const forgotEmailRateLimitIndex = forgotSource.indexOf(
      "const emailRateLimit",
    );
    const forgotRequestIndex = forgotSource.indexOf(
      "await requestPasswordReset",
    );
    const resetRateLimitIndex = resetSource.indexOf(
      "const clientRateLimit",
    );
    const resetJsonBodyIndex = resetSource.indexOf(
      "readJsonBodyResult(request)",
    );
    const resetCompleteIndex = resetSource.indexOf(
      "await completePasswordReset",
    );

    expect(forgotSource).toContain("isSameOriginRequest(request)");
    expect(forgotSource).toContain("PASSWORD_RESET_ACCEPTED_MESSAGE");
    expect(forgotSource).not.toContain("result.user");
    expect(forgotRateLimitIndex).toBeGreaterThanOrEqual(0);
    expect(forgotJsonBodyIndex).toBeGreaterThan(forgotRateLimitIndex);
    expect(forgotEmailRateLimitIndex).toBeGreaterThan(forgotJsonBodyIndex);
    expect(forgotRequestIndex).toBeGreaterThan(forgotEmailRateLimitIndex);

    expect(resetSource).toContain("isSameOriginRequest(request)");
    expect(resetRateLimitIndex).toBeGreaterThanOrEqual(0);
    expect(resetJsonBodyIndex).toBeGreaterThan(resetRateLimitIndex);
    expect(resetCompleteIndex).toBeGreaterThan(resetJsonBodyIndex);
  });

  it("keeps revoked team invitations from being accepted", () => {
    const source = readRoute(
      path.join(apiRoot, "team-invitations", "accept", "route.ts"),
    );
    const lookupIndex = source.indexOf("prisma.teamInvitation.findUnique");
    const revokedSelectIndex = source.indexOf("revokedAt: true", lookupIndex);
    const invalidCheckIndex = source.indexOf("invitation.revokedAt", lookupIndex);
    const consumeIndex = source.indexOf("transaction.teamInvitation.updateMany");
    const revokedWhereIndex = source.indexOf("revokedAt: null", consumeIndex);

    expect(revokedSelectIndex).toBeGreaterThan(lookupIndex);
    expect(invalidCheckIndex).toBeGreaterThan(revokedSelectIndex);
    expect(revokedWhereIndex).toBeGreaterThan(consumeIndex);
  });

  it("keeps team invitation renewal replacing the stored token hash", () => {
    const source = readRoute(
      path.join(apiRoot, "admin", "team-invitations", "route.ts"),
    );
    const patchIndex = source.indexOf("export async function PATCH");
    const tokenHashIndex = source.indexOf("const tokenHash", patchIndex);
    const updateIndex = source.indexOf(
      "transaction.teamInvitation.updateMany",
      patchIndex,
    );
    const tokenHashWriteIndex = source.indexOf("tokenHash", updateIndex);
    const auditIndex = source.indexOf(
      'action: "team_invitation_renewed"',
      updateIndex,
    );

    expect(tokenHashIndex).toBeGreaterThan(patchIndex);
    expect(tokenHashWriteIndex).toBeGreaterThan(updateIndex);
    expect(auditIndex).toBeGreaterThan(updateIndex);
  });

  it("keeps OAuth account unlinking owner-scoped and audited", () => {
    const source = readRoute(
      path.join(apiRoot, "account", "oauth-accounts", "route.ts"),
    );
    const authIndex = source.indexOf("auth()");
    const jsonBodyIndex = source.indexOf("readJsonBodyResult(request)");
    const validationIndex = source.indexOf(
      "validateUnlinkOAuthAccountInput",
      jsonBodyIndex,
    );
    const unlinkIndex = source.indexOf(
      "unlinkOAuthAccountForUser",
      validationIndex,
    );

    expect(source).toContain("isSameOriginRequest(request)");
    expect(authIndex).toBeGreaterThanOrEqual(0);
    expect(jsonBodyIndex).toBeGreaterThan(authIndex);
    expect(validationIndex).toBeGreaterThan(jsonBodyIndex);
    expect(unlinkIndex).toBeGreaterThan(validationIndex);

    const helperSource = readRoute(
      path.join(process.cwd(), "lib", "auth", "oauth-account-management.ts"),
    );

    expect(helperSource).toContain("userAccount.deleteMany");
    expect(helperSource).toContain("userId");
    expect(helperSource).toContain("OAUTH_ACCOUNT_LAST_METHOD_ERROR");
    expect(helperSource).toContain('action: "oauth_account_unlinked"');
  });

  it("keeps document uploads rate-limited before multipart parsing", () => {
    const source = readRoute(path.join(apiRoot, "documents", "route.ts"));
    const rateLimitIndex = source.indexOf("checkDocumentUploadRateLimit");
    const formDataIndex = source.indexOf("request.formData()");

    expect(rateLimitIndex).toBeGreaterThanOrEqual(0);
    expect(formDataIndex).toBeGreaterThan(rateLimitIndex);
  });

  it("keeps document upload file writes exclusive", () => {
    const routeSource = readRoute(path.join(apiRoot, "documents", "route.ts"));
    const storageSource = readRoute(
      path.join(process.cwd(), "lib", "documents", "storage.ts"),
    );

    expect(routeSource).toContain("putStoredDocument");
    expect(storageSource).toContain(
      'writeFile(resolvedStoragePath, bytes, { flag: "wx" })',
    );
    expect(storageSource).toContain("allowOverwrite: false");
  });

  it("keeps document deletes rate-limited before delete lookup", () => {
    const source = readRoute(
      path.join(apiRoot, "documents", "[documentId]", "delete", "route.ts"),
    );
    const rateLimitIndex = source.indexOf("checkDocumentDeleteRateLimit");
    const deleteLookupIndex = source.indexOf(
      "const result = await deleteOwnedDocument",
    );

    expect(rateLimitIndex).toBeGreaterThanOrEqual(0);
    expect(deleteLookupIndex).toBeGreaterThan(rateLimitIndex);
  });

  it("keeps summarize-document rate-limited before document chunk lookup", () => {
    const source = readRoute(
      path.join(apiRoot, "tools", "summarize-document", "route.ts"),
    );
    const rateLimitIndex = source.indexOf("checkAiAnswerRateLimit");
    const documentLookupIndex = source.indexOf("prisma.document.findFirst");

    expect(rateLimitIndex).toBeGreaterThanOrEqual(0);
    expect(documentLookupIndex).toBeGreaterThan(rateLimitIndex);
  });

  it("normalizes document IDs before owner-scoped delete mutations", () => {
    const source = readRoute(
      path.join(apiRoot, "documents", "[documentId]", "delete", "route.ts"),
    );
    const normalizeIndex = source.indexOf(
      "const documentId = normalizeDocumentId",
    );
    const deleteIndex = source.indexOf(
      "const result = await deleteOwnedDocument",
    );

    expect(normalizeIndex).toBeGreaterThanOrEqual(0);
    expect(deleteIndex).toBeGreaterThan(normalizeIndex);
  });

  it("keeps document downloads readable-scoped before storage reads", () => {
    const source = readRoute(
      path.join(
        apiRoot,
        "documents",
        "[documentId]",
        "download",
        "route.ts",
      ),
    );
    const normalizeIndex = source.indexOf("const documentId = normalizeDocumentId");
    const documentLookupIndex = source.indexOf("prisma.document.findFirst");
    const readableWhereIndex = source.indexOf(
      "buildReadableDocumentWhere",
      documentLookupIndex,
    );
    const storageReadIndex = source.indexOf(
      "readStoredDocumentBytes",
      documentLookupIndex,
    );
    const auditIndex = source.indexOf('action: "document_download"');

    expect(source).toContain("isCrossSiteDownloadRequest(request)");
    expect(source).toContain("Content-Disposition");
    expect(normalizeIndex).toBeGreaterThanOrEqual(0);
    expect(documentLookupIndex).toBeGreaterThan(normalizeIndex);
    expect(readableWhereIndex).toBeGreaterThanOrEqual(0);
    expect(storageReadIndex).toBeGreaterThan(documentLookupIndex);
    expect(auditIndex).toBeGreaterThan(storageReadIndex);
  });

  it("keeps organization audit exports admin-scoped before CSV response", () => {
    const source = readRoute(
      path.join(apiRoot, "admin", "audit-logs", "export", "route.ts"),
    );
    const contextIndex = source.indexOf("getOrganizationAdminContext");
    const memberIdsIndex = source.indexOf("const memberUserIds");
    const auditLookupIndex = source.indexOf("prisma.auditLog.findMany");
    const scopedWhereIndex = source.indexOf(
      "buildOrganizationAuditLogWhere(memberUserIds)",
      auditLookupIndex,
    );
    const csvIndex = source.indexOf("buildAuditLogCsv", auditLookupIndex);
    const auditIndex = source.indexOf(
      'action: "organization_audit_exported"',
      csvIndex,
    );
    const responseIndex = source.indexOf("return new NextResponse", auditIndex);

    expect(source).toContain("isCrossSiteAuditExportRequest(request)");
    expect(source).toContain("Content-Disposition");
    expect(source).toContain("text/csv; charset=utf-8");
    expect(source).toContain("Cache-Control");
    expect(source).toContain("X-Content-Type-Options");
    expect(contextIndex).toBeGreaterThanOrEqual(0);
    expect(memberIdsIndex).toBeGreaterThan(contextIndex);
    expect(auditLookupIndex).toBeGreaterThan(memberIdsIndex);
    expect(scopedWhereIndex).toBeGreaterThan(auditLookupIndex);
    expect(csvIndex).toBeGreaterThan(auditLookupIndex);
    expect(auditIndex).toBeGreaterThan(csvIndex);
    expect(responseIndex).toBeGreaterThan(auditIndex);
  });
});
