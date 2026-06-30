import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { readIpAddress, readUserAgent } from "../tools/response";
import { getOAuthProviderName } from "./oauth-providers";

export const OAUTH_ACCOUNT_INVALID_INPUT_ERROR =
  "Enter a valid OAuth account.";
export const OAUTH_ACCOUNT_NOT_FOUND_ERROR = "OAuth account not found.";
export const OAUTH_ACCOUNT_LAST_METHOD_ERROR =
  "Add a password before removing your last sign-in method.";
export const OAUTH_ACCOUNT_UNLINKED_MESSAGE = "OAuth account unlinked.";
export const MAX_OAUTH_ACCOUNT_ID_LENGTH = 128;

const oauthAccountIdPattern = /^[A-Za-z0-9_-]+$/;

type UnlinkOAuthAccountInput = {
  accountId: string;
  request: Pick<Request, "headers">;
  userId: string;
};

export function normalizeOAuthAccountId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 &&
    normalized.length <= MAX_OAUTH_ACCOUNT_ID_LENGTH &&
    oauthAccountIdPattern.test(normalized)
    ? normalized
    : null;
}

export function validateUnlinkOAuthAccountInput(value: unknown):
  | {
      data: {
        accountId: string;
      };
      ok: true;
    }
  | {
      error: string;
      ok: false;
    } {
  const accountId =
    value && typeof value === "object" && !Array.isArray(value)
      ? normalizeOAuthAccountId(
          (value as Record<string, unknown>).accountId,
        )
      : null;

  if (!accountId) {
    return {
      error: OAUTH_ACCOUNT_INVALID_INPUT_ERROR,
      ok: false,
    };
  }

  return {
    data: {
      accountId,
    },
    ok: true,
  };
}

export async function unlinkOAuthAccountForUser({
  accountId,
  request,
  userId,
}: UnlinkOAuthAccountInput) {
  return prisma.$transaction(
    async (transaction) => {
      const user = await transaction.user.findUnique({
        select: {
          accounts: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              provider: true,
            },
          },
          id: true,
          passwordHash: true,
        },
        where: {
          id: userId,
        },
      });
      const targetAccount = user?.accounts.find(
        (account) => account.id === accountId,
      );

      if (!user || !targetAccount) {
        return {
          error: OAUTH_ACCOUNT_NOT_FOUND_ERROR,
          ok: false as const,
        };
      }

      const remainingOAuthAccountCount = user.accounts.length - 1;
      const hasRemainingSignInMethod =
        Boolean(user.passwordHash) || remainingOAuthAccountCount > 0;

      if (!hasRemainingSignInMethod) {
        return {
          error: OAUTH_ACCOUNT_LAST_METHOD_ERROR,
          ok: false as const,
        };
      }

      const deletedAccount = await transaction.userAccount.deleteMany({
        where: {
          id: targetAccount.id,
          userId,
        },
      });

      if (deletedAccount.count !== 1) {
        return {
          error: OAUTH_ACCOUNT_NOT_FOUND_ERROR,
          ok: false as const,
        };
      }

      await transaction.auditLog.create({
        data: {
          action: "oauth_account_unlinked",
          actorId: userId,
          ipAddress: readIpAddress(request),
          metadata: {
            passwordEnabled: Boolean(user.passwordHash),
            provider: getOAuthProviderName(targetAccount.provider),
            remainingOAuthAccounts: remainingOAuthAccountCount,
          },
          resourceId: userId,
          resourceType: "User",
          userAgent: readUserAgent(request),
        },
      });

      return {
        ok: true as const,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
