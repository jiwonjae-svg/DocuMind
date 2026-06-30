import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { normalizeAuthRedirectUrl } from "@/lib/auth/callback-url";
import {
  normalizeAuthDisplayName,
  normalizeAuthImageUrl,
  normalizeEmailCredential,
  normalizePasswordCredential,
} from "@/lib/auth/credentials";
import {
  buildUserLoginAuditData,
  buildUserLoginFailureAuditData,
} from "@/lib/auth/login-audit";
import { checkLoginAttemptRateLimit } from "@/lib/auth/login-rate-limit";
import { isOAuthProviderEnabled } from "@/lib/auth/oauth-providers";
import {
  ensureOAuthUser,
  findUserIdForOAuthAccount,
} from "@/lib/auth/oauth";
import { ensureUserDefaultOrganization } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const DUMMY_PASSWORD_HASH =
  "scrypt:documind_dummy_login_salt:9416b5514bd04012f409f5e5bac8205fb08d2a7c5481b7f65a8b808182666299fad451c9ca3297607854d2306cbd08270dcb857cfcd3af0970f7ea5990882edb";

async function auditFailedLogin(request: Request, userId?: string | null) {
  await prisma.auditLog
    .create({
      data: buildUserLoginFailureAuditData({
        request,
        userId,
      }),
    })
    .catch(() => {});
}

const authProviders: Provider[] = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, request) {
      const email = normalizeEmailCredential(credentials?.email);
      const password = normalizePasswordCredential(credentials?.password);
      const rateLimit = checkLoginAttemptRateLimit({
        email,
        request,
      });

      if (!rateLimit.allowed) {
        return null;
      }

      if (!email || !password) {
        await auditFailedLogin(request);

        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
        },
      });

      const passwordMatches = await verifyPassword(
        password,
        user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      );

      if (!user || !passwordMatches) {
        await auditFailedLogin(request, user?.id);

        return null;
      }

      await prisma.auditLog.create({
        data: buildUserLoginAuditData({
          request,
          userId: user.id,
        }),
      });
      await ensureUserDefaultOrganization(user.id);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    },
  }),
  ...(isOAuthProviderEnabled("google") ? [Google] : []),
  ...(isOAuthProviderEnabled("github") ? [GitHub] : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost:
    process.env.AUTH_TRUST_HOST === "true" ||
    process.env.NODE_ENV === "development",
  providers: authProviders,
  callbacks: {
    redirect({ baseUrl, url }) {
      return normalizeAuthRedirectUrl({ baseUrl, url });
    },
    async signIn({ account, profile, user }) {
      if (!account || account.provider === "credentials") {
        return true;
      }

      const localUser = await ensureOAuthUser({ account, profile, user });

      return Boolean(localUser);
    },
    async jwt({ account, token, user }) {
      if (account && account.provider !== "credentials") {
        const localUserId = await findUserIdForOAuthAccount(account);

        if (localUserId) {
          token.sub = localUserId;
        }
      } else if (user) {
        token.sub = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = normalizeAuthDisplayName(session.user.name);
        session.user.image = normalizeAuthImageUrl(session.user.image);
      }

      return session;
    },
  },
});
