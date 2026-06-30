import type { SupportedLocale } from "../i18n/config";
import { formatAuditMetadata } from "./formatting";
import { formatAuditAction } from "./labels";

export const AUDIT_LOG_EXPORT_LIMIT = 500;

const csvHeaders = [
  "created_at",
  "actor_email",
  "actor_name",
  "action",
  "action_label",
  "resource_type",
  "resource_id",
  "metadata",
  "ip_address",
  "user_agent",
] as const;
const unsafeCsvCharacters = /[\u0000-\u001f\u007f-\u009f\p{Cf}]+/gu;
const spreadsheetFormulaPrefix = /^[=+\-@]/;

export type AuditLogExportRow = {
  action: string;
  actor: {
    email: string;
    name: string | null;
  } | null;
  createdAt: Date;
  ipAddress: string | null;
  metadata: unknown;
  resourceId: string | null;
  resourceType: string;
  userAgent: string | null;
};

function normalizeCsvCell(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = value instanceof Date ? value.toISOString() : String(value);
  const normalizedText = text
    .replace(unsafeCsvCharacters, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedText) {
    return "";
  }

  return spreadsheetFormulaPrefix.test(normalizedText)
    ? `'${normalizedText}`
    : normalizedText;
}

function escapeCsvCell(value: unknown) {
  return `"${normalizeCsvCell(value).replaceAll('"', '""')}"`;
}

export function buildAuditLogCsv(
  auditLogs: AuditLogExportRow[],
  locale: SupportedLocale = "en",
) {
  const rows = auditLogs.map((log) => [
    log.createdAt,
    log.actor?.email,
    log.actor?.name,
    log.action,
    formatAuditAction(log.action, locale),
    log.resourceType,
    log.resourceId,
    formatAuditMetadata(log.metadata),
    log.ipAddress,
    log.userAgent,
  ]);

  return [csvHeaders, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
}

export function buildAuditLogExportFilename(date = new Date()) {
  return `documind-organization-audit-${date.toISOString().slice(0, 10)}.csv`;
}

export function buildAuditLogExportContentDisposition(date = new Date()) {
  return `attachment; filename="${buildAuditLogExportFilename(date)}"`;
}
