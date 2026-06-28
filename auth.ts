import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  normalizeEmailCredential,
  normalizePasswordCredential,
} from "@/lib/auth/credentials";
import {
  buildUserLoginAuditData,
  buildUserLoginFailureAuditData,
} from "@/lib/auth/login-audit";
import { checkLoginAttemptRateLimit } from "@/lib/auth/login-rate-limit";
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
  providers: [
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
