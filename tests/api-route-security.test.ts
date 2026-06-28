import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const apiRoot = path.join(process.cwd(), "app", "api");
const publicRouteSuffixes = [
  path.join("auth", "[...nextauth]", "route.ts"),
  path.join("health", "route.ts"),
];
const jsonPostRouteSuffixes = [
  path.join("ask", "route.ts"),
  path.join("search", "route.ts"),
  path.join("tools", "ask-with-citations", "route.ts"),
  path.join("tools", "search-documents", "route.ts"),
  path.join("tools", "summarize-document", "route.ts"),
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

  it("keeps every protected POST route authenticated and same-origin checked", () => {
    expect(protectedPostRoutes.map(toApiRelativePath).sort()).toEqual([
      path.join("ask", "route.ts"),
      path.join("documents", "[documentId]", "delete", "route.ts"),
      path.join("documents", "route.ts"),
      path.join("search", "route.ts"),
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

  it("keeps JSON POST routes on bounded JSON body parsing", () => {
    for (const relativePath of jsonPostRouteSuffixes) {
      const source = readRoute(path.join(apiRoot, relativePath));

      expect(source, relativePath).toContain("readJsonBodyResult(request)");
    }
  });

  it("keeps document uploads rate-limited before multipart parsing", () => {
    const source = readRoute(path.join(apiRoot, "documents", "route.ts"));
    const rateLimitIndex = source.indexOf("checkDocumentUploadRateLimit");
    const formDataIndex = source.indexOf("request.formData()");

    expect(rateLimitIndex).toBeGreaterThanOrEqual(0);
    expect(formDataIndex).toBeGreaterThan(rateLimitIndex);
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
});
