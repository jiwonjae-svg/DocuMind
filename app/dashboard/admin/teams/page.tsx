import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import {
  getOrganizationAdminContext,
} from "@/lib/auth/rbac";
import { formatCopy } from "@/lib/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/i18n/metadata";
import { getCurrentDictionary, getCurrentI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RemoveTeamMemberForm } from "./remove-team-member-form";
import { RevokeTeamInvitationForm } from "./revoke-team-invitation-form";
import { TeamRbacForms } from "./team-rbac-form";

type TeamAdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatMemberName(member: {
  user: {
    email: string;
    name: string | null;
  };
}) {
  return member.user.name ?? member.user.email;
}

function formatDateTime(value: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export async function generateMetadata() {
  const copy = await getCurrentDictionary();

  return buildPageMetadata({
    description: copy.teamAdmin.body,
    title: copy.teamAdmin.title,
  });
}

export default async function TeamAdminPage({
  searchParams,
}: TeamAdminPageProps) {
  const session = await auth();
  const { copy, locale } = await getCurrentI18n();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/admin/teams");
  }

  const params = searchParams ? await searchParams : {};
  const context = await getOrganizationAdminContext({
    organizationId: readParam(params.organizationId),
    userId: session.user.id,
  });
  const displayName =
    session.user.name ?? session.user.email ?? copy.common.userFallback;

  if (!context) {
    return (
      <main className={ui.page}>
        <AppHeader homeAriaLabel={copy.common.homeLink} userName={displayName}>
          <LanguageSwitcher initialLocale={locale} />
          <LogoutButton label={copy.common.logout} />
        </AppHeader>

        <section className={`${ui.container} py-10`}>
          <div className={`${ui.card} p-6`}>
            <IconTile accent="red" icon="shield" />
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              {copy.adminAudit.accessTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {copy.adminAudit.accessBody}
            </p>
            <Link href="/dashboard" className={`mt-6 ${ui.secondaryButton}`}>
              <Icon name="arrow" className="h-4 w-4 rotate-180 text-blue-700" />
              {copy.common.backToDashboard}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const currentTime = new Date();
  const [teams, pendingInvitations] = await Promise.all([
    prisma.team.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        memberships: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            role: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
            userId: true,
          },
        },
        name: true,
      },
      where: {
        organizationId: context.organization.id,
      },
    }),
    prisma.teamInvitation.findMany({
      orderBy: {
        expiresAt: "asc",
      },
      select: {
        email: true,
        expiresAt: true,
        id: true,
        organizationRole: true,
        team: {
          select: {
            name: true,
          },
        },
        teamRole: true,
      },
      where: {
        acceptedAt: null,
        expiresAt: {
          gt: currentTime,
        },
        organizationId: context.organization.id,
        revokedAt: null,
      },
    }),
  ]);

  return (
    <main className={ui.page}>
      <AppHeader homeAriaLabel={copy.common.homeLink} userName={displayName}>
        <LanguageSwitcher initialLocale={locale} />
        <LogoutButton label={copy.common.logout} />
      </AppHeader>

      <section className={ui.gradientBand}>
        <div className={`${ui.container} py-6 sm:py-10`}>
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
              {copy.common.backToDashboard}
            </Link>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Link href="/dashboard/admin/audit-logs" className={ui.secondaryButton}>
                <Icon name="shield" className="h-4 w-4 text-blue-700" />
                {copy.common.adminAudit}
              </Link>
              <Link href="/dashboard/documents" className={ui.secondaryButton}>
                <Icon name="document" className="h-4 w-4 text-blue-700" />
                {copy.common.documents}
              </Link>
            </div>
          </div>

          <div className={`${ui.card} grid gap-6 p-6 lg:grid-cols-[1fr_360px]`}>
            <div>
              <p className={ui.eyebrow}>{copy.adminAudit.rbac}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#080f2f] sm:text-4xl">
                {copy.teamAdmin.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                {copy.teamAdmin.body}
              </p>
            </div>

            <div className={`${ui.subtleCard} p-5`}>
              <IconTile accent="violet" icon="team" />
              <h2 className="mt-4 text-base font-semibold text-[#0b1535]">
                {context.organization.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {formatCopy(copy.adminAudit.roleBody, {
                  role: copy.adminAudit.organizationRoles[context.role],
                })}
              </p>
              <p className="mt-3 text-sm font-semibold text-blue-700">
                {formatCopy(copy.teamAdmin.teamCount, {
                  count: teams.length,
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${ui.container} grid gap-6 py-4 sm:py-8`}>
        <TeamRbacForms
          copy={{ ...copy.teamAdmin, apiErrors: copy.apiErrors }}
          organizationId={context.organization.id}
          roleCopy={{
            organizationRoles: {
              ADMIN: copy.adminAudit.organizationRoles.ADMIN,
              MEMBER: copy.adminAudit.organizationRoles.MEMBER,
            },
            teamRoles: copy.adminAudit.teamRoles,
          }}
          teams={teams.map((team) => ({
            id: team.id,
            name: team.name,
          }))}
        />

        <section className={`${ui.card} overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={ui.eyebrow}>{copy.teamAdmin.invitationLifecycle}</p>
              <h2 className="mt-2 text-xl font-semibold text-[#080f2f]">
                {copy.teamAdmin.pendingInvitationsTitle}
              </h2>
            </div>
            <span className="rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
              {formatCopy(copy.teamAdmin.invitationCount, {
                count: pendingInvitations.length,
              })}
            </span>
          </div>

          {pendingInvitations.length === 0 ? (
            <div className="grid place-items-center px-6 py-12 text-center">
              <IconTile accent="amber" icon="team" />
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
                {copy.teamAdmin.noPendingInvitations}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {pendingInvitations.map((invitation) => (
                <article
                  key={invitation.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <p className="truncate text-sm font-semibold text-[#0b1535]">
                    {invitation.email}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {invitation.team.name}
                  </p>
                  <dl className="mt-3 grid gap-2 text-xs leading-5 text-slate-600">
                    <div>
                      <dt className="font-semibold text-slate-500">
                        {copy.teamAdmin.organizationRole}
                      </dt>
                      <dd>
                        {copy.adminAudit.organizationRoles[
                          invitation.organizationRole
                        ]}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">
                        {copy.teamAdmin.teamRole}
                      </dt>
                      <dd>{copy.adminAudit.teamRoles[invitation.teamRole]}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">
                        {copy.teamAdmin.expiresAt}
                      </dt>
                      <dd>{formatDateTime(invitation.expiresAt, locale)}</dd>
                    </div>
                  </dl>
                  <RevokeTeamInvitationForm
                    copy={{
                      apiErrors: copy.apiErrors,
                      cancel: copy.common.cancel,
                      confirmRevokeInvitation:
                        copy.teamAdmin.confirmRevokeInvitation,
                      fallbackError: copy.teamAdmin.fallbackError,
                      revokeInvitation: copy.teamAdmin.revokeInvitation,
                      revokeInvitationWarning:
                        copy.teamAdmin.revokeInvitationWarning,
                      revokingInvitation: copy.teamAdmin.revokingInvitation,
                    }}
                    invitationId={invitation.id}
                    organizationId={context.organization.id}
                  />
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={`${ui.card} overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={ui.eyebrow}>{copy.adminAudit.rbac}</p>
              <h2 className="mt-2 text-xl font-semibold text-[#080f2f]">
                {copy.teamAdmin.currentTeams}
              </h2>
            </div>
            <span className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
              {formatCopy(copy.teamAdmin.teamCount, { count: teams.length })}
            </span>
          </div>

          {teams.length === 0 ? (
            <div className="grid place-items-center px-6 py-14 text-center">
              <IconTile accent="violet" icon="team" />
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
                {copy.teamAdmin.noTeams}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {teams.map((team) => (
                <article key={team.id} className="px-6 py-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-base font-semibold text-[#0b1535]">
                      {team.name}
                    </h3>
                    <span className="w-fit rounded-md bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                      {formatCopy(copy.teamAdmin.memberCount, {
                        count: team.memberships.length,
                      })}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {team.memberships.map((membership) => (
                      <div
                        key={`${team.id}-${membership.userId}`}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <p className="truncate text-sm font-semibold text-[#0b1535]">
                          {formatMemberName(membership)}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {membership.user.email}
                        </p>
                        <p className="mt-3 text-xs font-semibold text-blue-700">
                          {copy.adminAudit.teamRoles[membership.role]}
                        </p>
                        <RemoveTeamMemberForm
                          copy={{
                            apiErrors: copy.apiErrors,
                            cancel: copy.common.cancel,
                            confirmRemoveMember:
                              copy.teamAdmin.confirmRemoveMember,
                            fallbackError: copy.teamAdmin.fallbackError,
                            removeMember: copy.teamAdmin.removeMember,
                            removeMemberWarning:
                              copy.teamAdmin.removeMemberWarning,
                            removingMember: copy.teamAdmin.removingMember,
                          }}
                          organizationId={context.organization.id}
                          teamId={team.id}
                          userId={membership.userId}
                        />
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
