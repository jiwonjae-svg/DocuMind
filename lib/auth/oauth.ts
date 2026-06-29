import { Prisma } from "@prisma/client";
import type { Account, Profile, User } from "next-auth";
import { prisma } from "../prisma";
import {
  normalizeAuthDisplayName,
  normalizeAuthImageUrl,
  normalizeEmailCredential,
} from "./credentials";
import { getOAuthProviderName } from "./oauth-providers";

export const OAUTH_ACCOUNT_EMAIL_CONFLICT_ERROR =
  "An account with this email already uses password sign-in. Sign in with your password first.";
export const MAX_OAUTH_PROVIDER_ACCOUNT_ID_LENGTH = 256;

const unsafeProviderAccountIdCharacters =
  /[\u0000-\u001f\u007f-\u009f\p{Cf}]+/u;

type OAuthUserInput = {
  account: Account | null;
  profile?: Profile;
  user: User;
};

function readProfileString(profile: Profile | undefined, key: string) {
  const value = profile?.[key as keyof Profile];

  return typeof value === "string" ? value : null;
}

function readProfileBoolean(profile: Profile | undefined, key: string) {
  const value = profile?.[key as keyof Profile];

  return typeof value === "boolean" ? value : null;
}

function readOAuthDisplayName(user: User, profile?: Profile) {
  return (
    normalizeAuthDisplayName(user.name) ??
    normalizeAuthDisplayName(readProfileString(profile, "name")) ??
    normalizeAuthDisplayName(readProfileString(profile, "login"))
  );
}

function readOAuthImage(user: User, profile?: Profile) {
  return (
    normalizeAuthImageUrl(user.image) ??
    normalizeAuthImageUrl(readProfileString(profile, "picture")) ??
    normalizeAuthImageUrl(readProfileString(profile, "avatar_url"))
  );
}

function hasVerifiedProviderEmail(account: Account, profile?: Profile) {
  if (account.provider === "google") {
    return readProfileBoolean(profile, "email_verified") === true;
  }

  if (account.provider === "github") {
    return (
      readProfileBoolean(profile, "email_verified") === true ||
      readProfileBoolean(profile, "verified") === true
    );
  }

  return false;
}

function readOAuthEmail(user: User) {
  return normalizeEmailCredential(user.email);
}

function readProviderAccountId(account: Account | null) {
  if (typeof account?.providerAccountId !== "string") {
    return null;
  }

  const providerAccountId = account.providerAccountId.trim();

  if (
    !providerAccountId ||
    providerAccountId.length > MAX_OAUTH_PROVIDER_ACCOUNT_ID_LENGTH ||
    unsafeProviderAccountIdCharacters.test(providerAccountId)
  ) {
    return null;
  }

  return providerAccountId;
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function updateLinkedOAuthUser({
  account,
  image,
  name,
}: {
  account: Account;
  image: string | null;
  name: string | null;
}) {
  const linkedUserId = await findUserIdForOAuthAccount(account);

  if (!linkedUserId) {
    return null;
  }

  return prisma.user.update({
    where: {
      id: linkedUserId,
    },
    data: {
      ...(name ? { name } : {}),
      ...(image ? { image } : {}),
    },
    select: {
      email: true,
      id: true,
      image: true,
      name: true,
    },
  });
}

export async function findUserIdForOAuthAccount(account: Account | null) {
  const providerAccountId = readProviderAccountId(account);

  if (!account?.provider || !providerAccountId) {
    return null;
  }

  const linkedAccount = await prisma.userAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId,
      },
    },
    select: {
      userId: true,
    },
  });

  return linkedAccount?.userId ?? null;
}

export async function ensureOAuthUser({
  account,
  profile,
  user,
}: OAuthUserInput) {
  const providerAccountId = readProviderAccountId(account);

  if (!account?.provider || !providerAccountId) {
    return null;
  }

  const linkedUserId = await findUserIdForOAuthAccount(account);
  const name = readOAuthDisplayName(user, profile);
  const image = readOAuthImage(user, profile);

  if (linkedUserId) {
    return updateLinkedOAuthUser({ account, image, name });
  }

  const email = readOAuthEmail(user);

  if (!email) {
    return null;
  }

  if (!hasVerifiedProviderEmail(account, profile)) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (existingUser?.passwordHash) {
    return null;
  }

  const providerName = getOAuthProviderName(account.provider);

  try {
    return await prisma.$transaction(async (transaction) => {
      const transactionExistingUser = await transaction.user.findUnique({
        where: {
          email,
        },
        select: {
          email: true,
          id: true,
          image: true,
          name: true,
          passwordHash: true,
        },
      });

      if (transactionExistingUser?.passwordHash) {
        return null;
      }

      const localUser = transactionExistingUser
        ? await transaction.user.update({
            where: {
              id: transactionExistingUser.id,
            },
            data: {
              ...(name ? { name } : {}),
              ...(image ? { image } : {}),
            },
            select: {
              email: true,
              id: true,
              image: true,
              name: true,
            },
          })
        : await transaction.user.create({
            data: {
              email,
              image,
              name,
            },
            select: {
              email: true,
              id: true,
              image: true,
              name: true,
            },
          });

      await transaction.userAccount.create({
        data: {
          provider: account.provider,
          providerAccountId,
          type: account.type ?? "oauth",
          userId: localUser.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: localUser.id,
          action: transactionExistingUser
            ? "oauth_account_linked"
            : "oauth_user_created",
          resourceType: "User",
          resourceId: localUser.id,
          metadata: {
            provider: providerName,
          },
        },
      });

      return localUser;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return updateLinkedOAuthUser({ account, image, name });
    }

    throw error;
  }
}
