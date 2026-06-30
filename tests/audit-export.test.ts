import { describe, expect, it } from "vitest";
import {
  AUDIT_LOG_EXPORT_LIMIT,
  buildAuditLogCsv,
  buildAuditLogExportContentDisposition,
  buildAuditLogExportFilename,
} from "../lib/audit/export";

describe("audit log CSV export", () => {
  it("builds a bounded CSV export with localized action labels", () => {
    const csv = buildAuditLogCsv(
      [
        {
          action: "document_download",
          actor: {
            email: "mina@example.com",
            name: "Mina",
          },
          createdAt: new Date("2026-06-30T12:00:00.000Z"),
          ipAddress: "203.0.113.10",
          metadata: {
            one: "alpha",
            two: "beta",
            three: "gamma",
            four: "delta",
            five: "hidden",
          },
          resourceId: "doc-1",
          resourceType: "Document",
          userAgent: "vitest",
        },
      ],
      "ko",
    );

    expect(csv).toContain('"created_at","actor_email","actor_name"');
    expect(csv).toContain('"2026-06-30T12:00:00.000Z"');
    expect(csv).toContain('"document_download","문서 다운로드"');
    expect(csv).toContain('"one: alpha / two: beta / three: gamma / four: delta"');
    expect(csv).not.toContain("hidden");
  });

  it("escapes quotes, strips unsafe line breaks, and neutralizes spreadsheet formulas", () => {
    const csv = buildAuditLogCsv([
      {
        action: "organization_created",
        actor: {
          email: "=cmd@example.com",
          name: "Alice\r\nAdmin",
        },
        createdAt: new Date("2026-06-30T12:00:00.000Z"),
        ipAddress: null,
        metadata: {
          "=formula": "value",
        },
        resourceId: "@org-1",
        resourceType: "Organization",
        userAgent: "agent\u202etest",
      },
    ]);

    expect(csv).toContain('"\'=cmd@example.com"');
    expect(csv).toContain('"Alice Admin"');
    expect(csv).toContain('"\'=formula: value"');
    expect(csv).toContain('"\'@org-1"');
    expect(csv).toContain('"agent test"');
  });

  it("uses stable ASCII attachment filenames", () => {
    const date = new Date("2026-06-30T12:00:00.000Z");

    expect(AUDIT_LOG_EXPORT_LIMIT).toBe(500);
    expect(buildAuditLogExportFilename(date)).toBe(
      "documind-organization-audit-2026-06-30.csv",
    );
    expect(buildAuditLogExportContentDisposition(date)).toBe(
      'attachment; filename="documind-organization-audit-2026-06-30.csv"',
    );
  });
});
