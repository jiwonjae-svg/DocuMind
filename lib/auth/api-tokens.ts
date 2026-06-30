import { createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";

export const API_TOKEN_PREFIX = "dm_pat_";
export const API_TOKEN_BYTES = 32;
export const API_TOKEN_NAME_MAX_LENGTH = 80;
export const API_TOKEN_INVALID_NAME_ERROR =
  "API token name must be between 1 and 80 characters.";
export const API_TOKEN_INVALID_BEARER_ERROR = "Invalid API bearer token.";

const unsafeTokenNameCharacters = /[\u0000-\u001f\u007f-\u009f\p{Cf}]+/gu;
const apiTokenPattern = new RegExp(
  `^${API_TOKEN_PREFIX}[A-Za-z0-9_-]{32,256}$`,
);

type ApiTokenAuthDb = Pick<Prisma.TransactionClient, "userApiToken">;

export type ApiTokenAuthResult =
  | {
      ok: true;
      tokenId: string;
      userId: string;
    }
  | {
      ok: false;
      reason: "invalid";
    }
  | {
      ok: false;
      reason: "missing";
    };

export function normalizeApiTokenName(value: unknown) {
  const name =
    typeof value === "string"
      ? value
          .normalize("NFC")
          .replace(unsafeTokenNameCharacters, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";

  return name.length > 0 && name.length <= API_TOKEN_NAME_MAX_LENGTH
    ? name
    : null;
}

export function createApiTokenSecret() {
  return `${API_TOKEN_PREFIX}${randomBytes(API_TOKEN_BYTES).toString("base64url")}`;
}

export function normalizeApiTokenSecret(value: unknown) {
  const token = typeof value === "string" ? value.trim() : "";

  return apiTokenPattern.test(token) ? token : null;
}

export function hashApiTokenSecret(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function readBearerToken(headers: Headers) {
  const authorization = headers.get("authorization")?.trim();

  if (!authorization) {
    return null;
  }

  const [scheme, token, extra] = authorization.split(/\s+/);

  if (extra || scheme?.toLowerCase() !== "bearer") {
    return API_TOKEN_INVALID_BEARER_ERROR;
  }

  return normalizeApiTokenSecret(token) ?? API_TOKEN_INVALID_BEARER_ERROR;
}

export async function authenticateApiBearerToken({
  db,
  headers,
  now = new Date(),
}: {
  db: ApiTokenAuthDb;
  headers: Headers;
  now?: Date;
}): Promise<ApiTokenAuthResult> {
  const token = readBearerToken(headers);

  if (!token) {
    return {
      ok: false,
      reason: "missing",
    };
  }

  if (token === API_TOKEN_INVALID_BEARER_ERROR) {
    return {
      ok: false,
      reason: "invalid",
    };
  }

  const tokenHash = hashApiTokenSecret(token);
  const apiToken = await db.userApiToken.findUnique({
    select: {
      expiresAt: true,
      id: true,
      revokedAt: true,
      userId: true,
    },
    where: {
      tokenHash,
    },
  });

  if (
    !apiToken ||
    apiToken.revokedAt ||
    (apiToken.expiresAt && apiToken.expiresAt <= now)
  ) {
    return {
      ok: false,
      reason: "invalid",
    };
  }

  await db.userApiToken.update({
    data: {
      lastUsedAt: now,
    },
    where: {
      id: apiToken.id,
    },
  });

  return {
    ok: true,
    tokenId: apiToken.id,
    userId: apiToken.userId,
  };
}
