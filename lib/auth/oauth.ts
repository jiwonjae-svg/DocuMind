import type { Account, Profile, User } from "next-auth";
import { prisma } from "../prisma";
import { normalizeEmailCredential } from "./credentials";
import { getOAuthProviderName } from "./oauth-providers";

export const OAUTH_ACCOUNT_EMAIL_CONFLICT_ERROR =
  "An account with this email already uses password sign-in. Sign in with your password first.";

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
    user.name ??
    readProfileString(profile, "name") ??
    readProfileString(profile, "login") ??
    null
  );
}

function readOAuthImage(user: User, profile?: Profile) {
  return (
    user.image ??
    readProfileString(profile, "picture") ??
    readProfileString(profile, "avatar_url") ??
    null
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
  return typeof account?.providerAccountId === "string"
    ? account.providerAccountId
    : null;
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

  return prisma.$transaction(async (transaction) => {
    const localUser = await transaction.user.upsert({
      where: {
        email,
      },
      update: {
        ...(name ? { name } : {}),
        ...(image ? { image } : {}),
      },
      create: {
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
        action: existingUser ? "oauth_account_linked" : "oauth_user_created",
        resourceType: "User",
        resourceId: localUser.id,
        metadata: {
          provider: providerName,
        },
      },
    });

    return localUser;
  });
}
