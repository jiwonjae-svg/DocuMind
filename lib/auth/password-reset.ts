import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "../password";
import { prisma } from "../prisma";
import type { SupportedLocale } from "../i18n/config";
import { DEFAULT_LOCALE } from "../i18n/config";
import { readIpAddress, readUserAgent } from "../tools/response";
import {
  normalizeEmailCredential,
  normalizePasswordCredential,
} from "./credentials";
import {
  MIN_SIGNUP_PASSWORD_LENGTH,
  SIGNUP_PASSWORD_TOO_SHORT_ERROR,
} from "./signup";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} from "./password-reset-email";

export const PASSWORD_RESET_ACCEPTED_MESSAGE =
  "If an account exists, password reset instructions have been sent.";
export const PASSWORD_RESET_COMPLETED_MESSAGE =
  "Your password has been reset. Sign in with your new password.";
export const PASSWORD_RESET_INVALID_EMAIL_ERROR = "Enter a valid email address.";
export const PASSWORD_RESET_INVALID_REQUEST_ERROR =
  "Enter a valid reset token and password.";
export const PASSWORD_RESET_INVALID_TOKEN_ERROR =
  "This password reset link is invalid or expired.";
export const PASSWORD_RESET_PASSWORD_TOO_SHORT_ERROR =
  SIGNUP_PASSWORD_TOO_SHORT_ERROR;
export const PASSWORD_RESET_TOKEN_BYTES = 32;
export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;

const resetTokenPattern = /^[A-Za-z0-9_-]{32,256}$/;

type PasswordResetRequest = Pick<Request, "headers" | "url">;

type ForgotPasswordValidationResult =
  | {
      data: {
        email: string;
      };
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

type ResetPasswordValidationResult =
  | {
      data: {
        password: string;
        token: string;
      };
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

type RequestPasswordResetOptions = {
  email: string;
  env?: NodeJS.ProcessEnv;
  fetcher?: typeof fetch;
  locale?: SupportedLocale;
  now?: () => Date;
  request: PasswordResetRequest;
};

type CompletePasswordResetOptions = {
  now?: () => Date;
  password: string;
  request: PasswordResetRequest;
  token: string;
};

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createResetToken() {
  return randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("base64url");
}

function addTokenTtl(now: Date) {
  return new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60_000);
}

function readUrlOrigin(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function readPasswordResetBaseUrl({
  env,
  request,
}: {
  env: NodeJS.ProcessEnv;
  request: PasswordResetRequest;
}) {
  return (
    readUrlOrigin(env.PASSWORD_RESET_BASE_URL) ??
    readUrlOrigin(env.AUTH_URL) ??
    readUrlOrigin(request.url) ??
    "http://localhost:3000"
  );
}

function shouldReturnDebugResetUrl(env: NodeJS.ProcessEnv) {
  return (
    env.NODE_ENV !== "production" &&
    env.PASSWORD_RESET_DEBUG_LINKS === "true"
  );
}

function buildResetUrl({
  env,
  request,
  token,
}: {
  env: NodeJS.ProcessEnv;
  request: PasswordResetRequest;
  token: string;
}) {
  const url = new URL("/reset-password", readPasswordResetBaseUrl({ env, request }));
  url.searchParams.set("token", token);

  return url.toString();
}

function normalizeResetToken(value: unknown) {
  const token = typeof value === "string" ? value.trim() : "";

  return resetTokenPattern.test(token) ? token : null;
}

export function validateForgotPasswordInput(
  body: unknown,
): ForgotPasswordValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: PASSWORD_RESET_INVALID_EMAIL_ERROR,
      ok: false,
    };
  }

  const email = normalizeEmailCredential((body as Record<string, unknown>).email);

  if (!email) {
    return {
      error: PASSWORD_RESET_INVALID_EMAIL_ERROR,
      ok: false,
    };
  }

  return {
    data: {
      email,
    },
    ok: true,
  };
}

export function validateResetPasswordInput(
  body: unknown,
): ResetPasswordValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: PASSWORD_RESET_INVALID_REQUEST_ERROR,
      ok: false,
    };
  }

  const values = body as Record<string, unknown>;
  const token = normalizeResetToken(values.token);
  const password = normalizePasswordCredential(values.password);

  if (!token || !password) {
    return {
      error: PASSWORD_RESET_INVALID_REQUEST_ERROR,
      ok: false,
    };
  }

  if (password.length < MIN_SIGNUP_PASSWORD_LENGTH) {
    return {
      error: PASSWORD_RESET_PASSWORD_TOO_SHORT_ERROR,
      ok: false,
    };
  }

  return {
    data: {
      password,
      token,
    },
    ok: true,
  };
}

export async function requestPasswordReset({
  email,
  env = process.env,
  fetcher = fetch,
  locale = DEFAULT_LOCALE,
  now = () => new Date(),
  request,
}: RequestPasswordResetOptions) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      email: true,
      id: true,
      name: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return {
      ok: true as const,
    };
  }

  const token = createResetToken();
  const resetUrl = buildResetUrl({ env, request, token });
  const tokenHash = hashResetToken(token);
  const emailConfigured = isPasswordResetEmailConfigured(env);
  const expiresAt = addTokenTtl(now());
  const requestMetadata = {
    ipAddress: readIpAddress(request),
    userAgent: readUserAgent(request),
  };

  await prisma.$transaction(async (transaction) => {
    await transaction.passwordResetToken.create({
      data: {
        expiresAt,
        tokenHash,
        userId: user.id,
      },
    });

    await transaction.auditLog.create({
      data: {
        actorId: user.id,
        action: "password_reset_requested",
        ipAddress: requestMetadata.ipAddress,
        metadata: {
          emailConfigured,
        },
        resourceId: user.id,
        resourceType: "User",
        userAgent: requestMetadata.userAgent,
      },
    });
  });

  try {
    await sendPasswordResetEmail({
      env,
      fetcher,
      locale,
      resetUrl,
      to: user.email,
      userName: user.name,
    });
  } catch {
    await prisma.auditLog
      .create({
        data: {
          actorId: user.id,
          action: "password_reset_email_failed",
          ipAddress: requestMetadata.ipAddress,
          metadata: {
            provider: "resend",
          },
          resourceId: user.id,
          resourceType: "User",
          userAgent: requestMetadata.userAgent,
        },
      })
      .catch(() => {});
  }

  return {
    ...(shouldReturnDebugResetUrl(env) ? { resetUrl } : {}),
    ok: true as const,
  };
}

export async function completePasswordReset({
  now = () => new Date(),
  password,
  request,
  token,
}: CompletePasswordResetOptions) {
  const currentTime = now();
  const tokenHash = hashResetToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      expiresAt: true,
      id: true,
      usedAt: true,
      userId: true,
    },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt <= currentTime
  ) {
    return {
      error: PASSWORD_RESET_INVALID_TOKEN_ERROR,
      ok: false as const,
    };
  }

  const passwordHash = await hashPassword(password);
  const requestMetadata = {
    ipAddress: readIpAddress(request),
    userAgent: readUserAgent(request),
  };

  const result = await prisma.$transaction(async (transaction) => {
    const consumed = await transaction.passwordResetToken.updateMany({
      data: {
        usedAt: currentTime,
      },
      where: {
        expiresAt: {
          gt: currentTime,
        },
        id: resetToken.id,
        usedAt: null,
      },
    });

    if (consumed.count !== 1) {
      return {
        ok: false as const,
      };
    }

    await transaction.user.update({
      data: {
        passwordHash,
      },
      where: {
        id: resetToken.userId,
      },
    });

    await transaction.passwordResetToken.updateMany({
      data: {
        usedAt: currentTime,
      },
      where: {
        id: {
          not: resetToken.id,
        },
        userId: resetToken.userId,
        usedAt: null,
      },
    });

    await transaction.auditLog.create({
      data: {
        actorId: resetToken.userId,
        action: "password_reset_completed",
        ipAddress: requestMetadata.ipAddress,
        resourceId: resetToken.userId,
        resourceType: "User",
        userAgent: requestMetadata.userAgent,
      },
    });

    return {
      ok: true as const,
    };
  });

  if (!result.ok) {
    return {
      error: PASSWORD_RESET_INVALID_TOKEN_ERROR,
      ok: false as const,
    };
  }

  return {
    ok: true as const,
  };
}
