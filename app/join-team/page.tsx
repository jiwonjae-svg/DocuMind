import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import {
  hashTeamInvitationToken,
  normalizeTeamInvitationToken,
} from "@/lib/auth/team-invitations";
import { normalizeEmailCredential } from "@/lib/auth/credentials";
import { getCurrentI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AcceptTeamInvitationForm } from "./accept-team-invitation-form";

type JoinTeamPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function JoinTeamPage({ searchParams }: JoinTeamPageProps) {
  const session = await auth();
  const params = searchParams ? await searchParams : {};
  const { copy, locale } = await getCurrentI18n();
  const token = normalizeTeamInvitationToken(readParam(params.token));
  const callbackUrl = token
    ? `/join-team?token=${encodeURIComponent(token)}`
    : "/join-team";
  const displayName =
    session?.user?.name ?? session?.user?.email ?? copy.common.userFallback;
  const tokenHash = token ? hashTeamInvitationToken(token) : null;
  const invitation = tokenHash
    ? await prisma.teamInvitation.findUnique({
        select: {
          acceptedAt: true,
          email: true,
          expiresAt: true,
          organization: {
            select: {
              name: true,
            },
          },
          team: {
            select: {
              name: true,
            },
          },
        },
        where: {
          tokenHash,
        },
      })
    : null;
  const isExpired = invitation ? invitation.expiresAt <= new Date() : false;
  const sessionEmail = normalizeEmailCredential(session?.user?.email);
  const isWrongUser =
    Boolean(invitation && sessionEmail) &&
    normalizeEmailCredential(invitation?.email) !== sessionEmail;

  return (
    <main className={ui.page}>
      <AppHeader homeAriaLabel={copy.common.homeLink} userName={displayName}>
        <LanguageSwitcher initialLocale={locale} />
        {session?.user ? (
          <LogoutButton label={copy.common.logout} />
        ) : (
          <Link href="/login" className={ui.primaryButton}>
            <Icon name="lock" className="h-4 w-4" />
            {copy.common.login}
          </Link>
        )}
      </AppHeader>

      <section className={`${ui.gradientBand} min-h-[calc(100vh-64px)]`}>
        <div className={`${ui.container} grid gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_460px] lg:py-16`}>
          <div className="flex flex-col justify-center">
            <p className={ui.eyebrow}>{copy.teamInvite.eyebrow}</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-normal text-[#080f2f] sm:text-5xl">
              {copy.teamInvite.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              {copy.teamInvite.body}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="blue" icon="shield" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  {copy.teamInvite.secureTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.teamInvite.secureBody}
                </p>
              </div>
              <div className={`${ui.subtleCard} p-5`}>
                <IconTile accent="emerald" icon="team" />
                <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                  {copy.teamInvite.auditTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.teamInvite.auditBody}
                </p>
              </div>
            </div>
          </div>

          <div className={`${ui.card} self-center p-6 sm:p-7`}>
            <p className={ui.eyebrow}>DocuMind</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              {copy.teamInvite.cardTitle}
            </h2>
            {!token || !invitation || invitation.acceptedAt || isExpired ? (
              <div className="mt-7 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                <p className="font-semibold">{copy.teamInvite.invalidTitle}</p>
                <p className="mt-2">{copy.teamInvite.invalidBody}</p>
              </div>
            ) : !session?.user ? (
              <div className="mt-7 grid gap-3">
                <p className="text-sm leading-6 text-slate-600">
                  {copy.teamInvite.signInBody}
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className={ui.primaryButton}
                >
                  <Icon name="lock" className="h-4 w-4" />
                  {copy.common.login}
                </Link>
                <Link
                  href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className={ui.secondaryButton}
                >
                  <Icon name="team" className="h-4 w-4 text-blue-700" />
                  {copy.common.signup}
                </Link>
              </div>
            ) : isWrongUser ? (
              <div className="mt-7 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                <p className="font-semibold">{copy.teamInvite.emailMismatchTitle}</p>
                <p className="mt-2">{copy.teamInvite.emailMismatchBody}</p>
              </div>
            ) : (
              <>
                <dl className="mt-7 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-500">
                      {copy.teamInvite.organization}
                    </dt>
                    <dd className="mt-1 text-[#0b1535]">
                      {invitation.organization.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">
                      {copy.teamInvite.team}
                    </dt>
                    <dd className="mt-1 text-[#0b1535]">
                      {invitation.team.name}
                    </dd>
                  </div>
                </dl>
                <AcceptTeamInvitationForm
                  copy={{
                    accepted: copy.teamInvite.accepted,
                    accepting: copy.teamInvite.accepting,
                    acceptInvitation: copy.teamInvite.acceptInvitation,
                    apiErrors: copy.apiErrors,
                    dashboard: copy.common.dashboard,
                    fallbackError: copy.teamInvite.fallbackError,
                  }}
                  token={token}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
