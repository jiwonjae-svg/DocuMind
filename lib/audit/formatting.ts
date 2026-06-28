export const MAX_AUDIT_METADATA_ENTRIES = 4;
export const MAX_AUDIT_METADATA_VALUE_LENGTH = 80;

const unsafeAuditDisplayCharacters = /[\u0000-\u001f\u007f-\u009f\p{Cf}]+/gu;

function normalizeAuditDisplayText(value: string) {
  return value
    .replace(unsafeAuditDisplayCharacters, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateAuditValue(value: string) {
  const normalizedValue = normalizeAuditDisplayText(value);

  if (!normalizedValue) {
    return "";
  }

  return normalizedValue.length > MAX_AUDIT_METADATA_VALUE_LENGTH
    ? `${normalizedValue.slice(0, MAX_AUDIT_METADATA_VALUE_LENGTH - 3)}...`
    : normalizedValue;
}

export function formatAuditMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return truncateAuditValue(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  try {
    return truncateAuditValue(JSON.stringify(value));
  } catch {
    return "[unserializable]";
  }
}

export function formatAuditMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const entries = Object.entries(metadata)
    .map(
      ([key, value]) =>
        [truncateAuditValue(key), formatAuditMetadataValue(value)] as const,
    )
    .filter(([key, value]) => key.length > 0 && value.length > 0);

  if (entries.length === 0) {
    return null;
  }

  return entries
    .slice(0, MAX_AUDIT_METADATA_ENTRIES)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" / ");
}
