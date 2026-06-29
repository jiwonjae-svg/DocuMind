import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const clientRoots = ["app", "components"];
const forbiddenServerImports = [
  "@/auth",
  "@/lib/ai/",
  "@/lib/auth/oauth",
  "@/lib/auth/signup",
  "@/lib/documents/embeddings",
  "@/lib/documents/processing",
  "@/lib/prisma",
  "@/lib/qa/",
  "@/lib/tools/document-summary",
  "@/lib/password",
];

function findTsxFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);

    return statSync(fullPath).isDirectory()
      ? findTsxFiles(fullPath)
      : fullPath.endsWith(".tsx")
        ? [fullPath]
        : [];
  });
}

function isClientComponent(source: string) {
  return /^["']use client["'];?/.test(source.trimStart());
}

function readValueImports(source: string) {
  const imports: string[] = [];
  const fromImportPattern =
    /import\s+(?!type\b)[\s\S]*?\s+from\s+["']([^"']+)["']/g;
  const sideEffectImportPattern = /import\s+["']([^"']+)["']/g;

  for (const match of source.matchAll(fromImportPattern)) {
    imports.push(match[1] ?? "");
  }

  for (const match of source.matchAll(sideEffectImportPattern)) {
    imports.push(match[1] ?? "");
  }

  return imports;
}

function isForbiddenServerImport(importPath: string) {
  return forbiddenServerImports.some(
    (forbiddenImport) =>
      importPath === forbiddenImport || importPath.startsWith(forbiddenImport),
  );
}

describe("client/server module boundaries", () => {
  it("keeps client components from importing server-only modules", () => {
    const violations = clientRoots
      .flatMap((root) => findTsxFiles(path.join(process.cwd(), root)))
      .flatMap((filePath) => {
        const source = readFileSync(filePath, "utf8");

        if (!isClientComponent(source)) {
          return [];
        }

        return readValueImports(source)
          .filter(isForbiddenServerImport)
          .map((importPath) => `${path.relative(process.cwd(), filePath)} -> ${importPath}`);
      });

    expect(violations).toEqual([]);
  });
});
