import { createHmac, timingSafeEqual } from "node:crypto";
import type { OAuthProviderId } from "./oauth-providers";
import { normalizeOAuthProviderId } from "./oauth-providers";

export const OAUTH_LINK_INTENT_COOKIE_NAME = "documind_oauth_link_intent";
export const OAUTH_LINK_INTENT_TTL_SECONDS = 10 * 60;
export const OAUTH_LINK_INTENT_SECRET_MISSING_ERROR =
  "OAuth link setup is not available.";
export const OAUTH_LINK_PROVIDER_DISABLED_ERROR =
  "OAuth provider is not enabled.";
export const OAUTH_LINK_INTENT_CREATED_MESSAGE = "OAuth link started.";

const MAX_OAUTH_LINK_USER_ID_LENGTH = 128;

type OAuthLinkIntent = {
  expiresAt: number;
  provider: OAuthProviderId;
  userId: string;
};

type CreateOAuthLinkIntentOptions = {
  env?: NodeJS.ProcessEnv;
  now?: () => Date;
  provider: OAuthProviderId;
  userId: string;
};

type ReadOAuthLinkIntentOptions = {
  env?: NodeJS.ProcessEnv;
  now?: () => Date;
  value: string | undefined;
};

function readOAuthLinkSecret(env: NodeJS.ProcessEnv) {
  return env.AUTH_SECRET?.trim() || env.NEXTAUTH_SECRET?.trim() || null;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function signaturesMatch(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);

  return (
    leftBytes.length === rightBytes.length &&
    timingSafeEqual(leftBytes, rightBytes)
  );
}

function normalizeIntentUserId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const userId = value.trim();

  return userId.length > 0 && userId.length <= MAX_OAUTH_LINK_USER_ID_LENGTH
    ? userId
    : null;
}

export function createOAuthLinkIntentCookieValue({
  env = process.env,
  now = () => new Date(),
  provider,
  userId,
}: CreateOAuthLinkIntentOptions) {
  const secret = readOAuthLinkSecret(env);
  const normalizedUserId = normalizeIntentUserId(userId);

  if (!secret || !normalizedUserId) {
    return null;
  }

  const intent: OAuthLinkIntent = {
    expiresAt: now().getTime() + OAUTH_LINK_INTENT_TTL_SECONDS * 1000,
    provider,
    userId: normalizedUserId,
  };
  const payload = encodeBase64Url(JSON.stringify(intent));

  return `${payload}.${signPayload(payload, secret)}`;
}

export function readOAuthLinkIntentCookieValue({
  env = process.env,
  now = () => new Date(),
  value,
}: ReadOAuthLinkIntentOptions): OAuthLinkIntent | null {
  const secret = readOAuthLinkSecret(env);

  if (!secret || !value) {
    return null;
  }

  const [payload, signature, extra] = value.split(".");

  if (!payload || !signature || extra) {
    return null;
  }

  if (!signaturesMatch(signature, signPayload(payload, secret))) {
    return null;
  }

  try {
    const decoded = JSON.parse(decodeBase64Url(payload)) as Record<
      string,
      unknown
    >;
    const provider = normalizeOAuthProviderId(decoded.provider);
    const userId = normalizeIntentUserId(decoded.userId);
    const expiresAt =
      typeof decoded.expiresAt === "number" ? decoded.expiresAt : 0;

    if (!provider || !userId || expiresAt <= now().getTime()) {
      return null;
    }

    return {
      expiresAt,
      provider,
      userId,
    };
  } catch {
    return null;
  }
}
