import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readIgnoreFile(path: string) {
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

describe("deployment hygiene", () => {
  it("keeps secrets and local deployment state out of Docker build context", () => {
    const patterns = readIgnoreFile(".dockerignore");

    expect(patterns).toEqual(
      expect.arrayContaining([".env", ".env.*", ".vercel", ".git"]),
    );
  });

  it("keeps generated outputs and local uploads out of Docker build context", () => {
    const patterns = readIgnoreFile(".dockerignore");

    expect(patterns).toEqual(
      expect.arrayContaining([
        ".next",
        "coverage",
        "dist",
        "node_modules",
        "out",
        "repomix-output.xml",
        "uploads",
      ]),
    );
  });
});
