import { hashPassword, verifyPassword } from "../password";
import { prisma } from "../prisma";
import { readIpAddress, readUserAgent } from "../tools/response";
import { normalizePasswordCredential } from "./credentials";
import {
  MIN_SIGNUP_PASSWORD_LENGTH,
  SIGNUP_PASSWORD_TOO_SHORT_ERROR,
} from "./signup";

export const PASSWORD_CHANGE_COMPLETED_MESSAGE = "Your password has been changed.";
export const PASSWORD_CHANGE_INVALID_INPUT_ERROR =
  "Enter your current password and a valid new password.";
export const PASSWORD_CHANGE_CONFIRMATION_MISMATCH_ERROR =
  "New password confirmation does not match.";
export const PASSWORD_CHANGE_PASSWORD_TOO_SHORT_ERROR =
  SIGNUP_PASSWORD_TOO_SHORT_ERROR;
export const PASSWORD_CHANGE_PASSWORD_ACCOUNT_REQUIRED_ERROR =
  "Password sign-in is required to change a password.";
export const PASSWORD_CHANGE_CURRENT_PASSWORD_INCORRECT_ERROR =
  "Current password is incorrect.";
export const PASSWORD_CHANGE_SAME_PASSWORD_ERROR =
  "New password must be different from the current password.";
export const PASSWORD_CHANGE_FAILED_ERROR = "Password change failed.";

type PasswordChangeRequest = Pick<Request, "headers">;

type PasswordChangeValidationResult =
  | {
      data: {
        confirmPassword: string;
        currentPassword: string;
        newPassword: string;
      };
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

type ChangePasswordForUserOptions = {
  currentPassword: string;
  newPassword: string;
  request: PasswordChangeRequest;
  userId: string;
};

export function validatePasswordChangeInput(
  body: unknown,
): PasswordChangeValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: PASSWORD_CHANGE_INVALID_INPUT_ERROR,
      ok: false,
    };
  }

  const values = body as Record<string, unknown>;
  const currentPassword = normalizePasswordCredential(values.currentPassword);
  const newPassword = normalizePasswordCredential(values.newPassword);
  const confirmPassword = normalizePasswordCredential(values.confirmPassword);

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      error: PASSWORD_CHANGE_INVALID_INPUT_ERROR,
      ok: false,
    };
  }

  if (newPassword.length < MIN_SIGNUP_PASSWORD_LENGTH) {
    return {
      error: PASSWORD_CHANGE_PASSWORD_TOO_SHORT_ERROR,
      ok: false,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      error: PASSWORD_CHANGE_CONFIRMATION_MISMATCH_ERROR,
      ok: false,
    };
  }

  return {
    data: {
      confirmPassword,
      currentPassword,
      newPassword,
    },
    ok: true,
  };
}

export async function changePasswordForUser({
  currentPassword,
  newPassword,
  request,
  userId,
}: ChangePasswordForUserOptions) {
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      passwordHash: true,
    },
    where: {
      id: userId,
    },
  });

  if (!user?.passwordHash) {
    return {
      error: PASSWORD_CHANGE_PASSWORD_ACCOUNT_REQUIRED_ERROR,
      ok: false as const,
    };
  }

  const currentPasswordMatches = await verifyPassword(
    currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordMatches) {
    return {
      error: PASSWORD_CHANGE_CURRENT_PASSWORD_INCORRECT_ERROR,
      ok: false as const,
    };
  }

  const newPasswordMatchesCurrent = await verifyPassword(
    newPassword,
    user.passwordHash,
  );

  if (newPasswordMatchesCurrent) {
    return {
      error: PASSWORD_CHANGE_SAME_PASSWORD_ERROR,
      ok: false as const,
    };
  }

  const passwordHash = await hashPassword(newPassword);
  const requestMetadata = {
    ipAddress: readIpAddress(request),
    userAgent: readUserAgent(request),
  };

  const result = await prisma.$transaction(async (transaction) => {
    const updatedUser = await transaction.user.updateMany({
      data: {
        passwordHash,
      },
      where: {
        id: user.id,
        passwordHash: user.passwordHash,
      },
    });

    if (updatedUser.count !== 1) {
      return {
        ok: false as const,
      };
    }

    await transaction.auditLog.create({
      data: {
        action: "password_changed",
        actorId: user.id,
        ipAddress: requestMetadata.ipAddress,
        metadata: {
          method: "password",
        },
        resourceId: user.id,
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
      error: PASSWORD_CHANGE_FAILED_ERROR,
      ok: false as const,
    };
  }

  return {
    ok: true as const,
  };
}
