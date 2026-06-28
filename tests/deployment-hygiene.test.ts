import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readIgnoreFile(path: string) {
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function readFile(path: string) {
  return readFileSync(path, "utf8");
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

  it("runs the production container as a non-root user", () => {
    const dockerfile = readFile("Dockerfile");

    expect(dockerfile).toContain("useradd --system --uid 1001");
    expect(dockerfile).toContain("COPY --from=builder --chown=nextjs:nodejs");
    expect(dockerfile).toContain("chown -R nextjs:nodejs /app/uploads");
    expect(dockerfile).toMatch(/\nUSER nextjs\n/);
  });

  it("does not prefill the demo password in the client login form", () => {
    const loginForm = readFile("app/login/login-form.tsx");

    expect(loginForm).not.toContain("defaultValue=\"DocuMindDemo123!\"");
    expect(loginForm).not.toContain("value=\"DocuMindDemo123!\"");
  });
});
