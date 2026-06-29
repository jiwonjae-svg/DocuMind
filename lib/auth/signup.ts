import { Prisma } from "@prisma/client";
import { hashPassword } from "../password";
import { prisma } from "../prisma";
import { normalizeEmailCredential } from "./credentials";

export const MIN_SIGNUP_PASSWORD_LENGTH = 12;
export const MAX_SIGNUP_NAME_LENGTH = 80;
export const SIGNUP_INVALID_INPUT_ERROR =
  "Enter a valid email, name, and password.";
export const SIGNUP_PASSWORD_TOO_SHORT_ERROR =
  "Password must be at least 12 characters.";
export const SIGNUP_EMAIL_EXISTS_ERROR =
  "An account already exists for this email.";

type SignupValidationResult =
  | {
      data: {
        email: string;
        name: string | null;
        password: string;
      };
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSignupName(value: unknown) {
  const name = readString(value).replace(/\s+/g, " ");

  if (!name) {
    return null;
  }

  return name.length <= MAX_SIGNUP_NAME_LENGTH ? name : null;
}

function readSignupPassword(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateSignupInput(body: unknown): SignupValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: SIGNUP_INVALID_INPUT_ERROR,
      ok: false,
    };
  }

  const values = body as Record<string, unknown>;
  const email = normalizeEmailCredential(values.email);
  const name = normalizeSignupName(values.name);
  const password = readSignupPassword(values.password);

  if (!email || name === null || !password) {
    return {
      error: SIGNUP_INVALID_INPUT_ERROR,
      ok: false,
    };
  }

  if (password.length < MIN_SIGNUP_PASSWORD_LENGTH) {
    return {
      error: SIGNUP_PASSWORD_TOO_SHORT_ERROR,
      ok: false,
    };
  }

  return {
    data: {
      email,
      name,
      password,
    },
    ok: true,
  };
}

export async function createPasswordUser({
  email,
  name,
  password,
}: {
  email: string;
  name: string | null;
  password: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      error: SIGNUP_EMAIL_EXISTS_ERROR,
      ok: false as const,
    };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
        select: {
          email: true,
          id: true,
          name: true,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: createdUser.id,
          action: "user_signed_up",
          resourceType: "User",
          resourceId: createdUser.id,
          metadata: {
            method: "password",
          },
        },
      });

      return createdUser;
    });

    return {
      ok: true as const,
      user,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: SIGNUP_EMAIL_EXISTS_ERROR,
        ok: false as const,
      };
    }

    throw error;
  }
}
