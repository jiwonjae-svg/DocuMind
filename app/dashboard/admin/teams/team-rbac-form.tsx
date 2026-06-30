"use client";

import { Icon, ui } from "@/components/ui";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type TeamOption = {
  id: string;
  name: string;
};

type TeamRbacFormCopy = {
  addMemberBody: string;
  addMemberSubmit: string;
  addMemberTitle: string;
  addingMember: string;
  createTeamBody: string;
  createTeamSubmit: string;
  createTeamTitle: string;
  creatingTeam: string;
  existingUsersOnly: string;
  fallbackError: string;
  memberEmail: string;
  organizationRole: string;
  successMemberAssigned: string;
  successTeamCreated: string;
  team: string;
  teamName: string;
  teamRole: string;
};

type RoleCopy = {
  organizationRoles: Record<"ADMIN" | "MEMBER", string>;
  teamRoles: Record<"MANAGER" | "MEMBER" | "VIEWER", string>;
};

type TeamRbacFormsProps = {
  copy: TeamRbacFormCopy;
  organizationId: string;
  roleCopy: RoleCopy;
  teams: TeamOption[];
};

type ApiResponse = {
  error?: string;
};

async function readApiError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as ApiResponse | null;

  return payload?.error ?? fallback;
}

export function TeamRbacForms({
  copy,
  organizationId,
  roleCopy,
  teams,
}: TeamRbacFormsProps) {
  const router = useRouter();
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberSuccess, setMemberSuccess] = useState<string | null>(null);

  async function handleCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    setIsCreating(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");

    try {
      const response = await fetch("/api/admin/teams", {
        body: JSON.stringify({ name, organizationId }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, copy.fallbackError));
      }

      event.currentTarget.reset();
      setCreateSuccess(copy.successTeamCreated);
      router.refresh();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : copy.fallbackError);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAssignMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMemberError(null);
    setMemberSuccess(null);
    setIsAssigning(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/team-memberships", {
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          organizationId,
          organizationRole: String(formData.get("organizationRole") ?? ""),
          teamId: String(formData.get("teamId") ?? ""),
          teamRole: String(formData.get("teamRole") ?? ""),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, copy.fallbackError));
      }

      setMemberSuccess(copy.successMemberAssigned);
      router.refresh();
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : copy.fallbackError);
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={`${ui.card} p-6`}>
        <h2 className="text-xl font-semibold text-[#080f2f]">
          {copy.createTeamTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {copy.createTeamBody}
        </p>
        <form onSubmit={handleCreateTeam} className="mt-5 space-y-4">
          <div>
            <label htmlFor="team-name" className={ui.label}>
              {copy.teamName}
            </label>
            <input
              id="team-name"
              name="name"
              type="text"
              maxLength={80}
              required
              className={`mt-2 ${ui.input}`}
            />
          </div>
          {createError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {createError}
            </p>
          ) : null}
          {createSuccess ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {createSuccess}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isCreating}
            className={`${ui.primaryButton} w-full sm:w-auto`}
          >
            <Icon name="team" className="h-4 w-4" />
            {isCreating ? copy.creatingTeam : copy.createTeamSubmit}
          </button>
        </form>
      </section>

      <section className={`${ui.card} p-6`}>
        <h2 className="text-xl font-semibold text-[#080f2f]">
          {copy.addMemberTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {copy.addMemberBody}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {copy.existingUsersOnly}
        </p>
        <form onSubmit={handleAssignMember} className="mt-5 space-y-4">
          <div>
            <label htmlFor="member-email" className={ui.label}>
              {copy.memberEmail}
            </label>
            <input
              id="member-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`mt-2 ${ui.input}`}
            />
          </div>
          <div>
            <label htmlFor="team-id" className={ui.label}>
              {copy.team}
            </label>
            <select
              id="team-id"
              name="teamId"
              required
              disabled={teams.length === 0}
              className={`mt-2 ${ui.input}`}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="organization-role" className={ui.label}>
                {copy.organizationRole}
              </label>
              <select
                id="organization-role"
                name="organizationRole"
                required
                className={`mt-2 ${ui.input}`}
                defaultValue="MEMBER"
              >
                <option value="MEMBER">{roleCopy.organizationRoles.MEMBER}</option>
                <option value="ADMIN">{roleCopy.organizationRoles.ADMIN}</option>
              </select>
            </div>
            <div>
              <label htmlFor="team-role" className={ui.label}>
                {copy.teamRole}
              </label>
              <select
                id="team-role"
                name="teamRole"
                required
                className={`mt-2 ${ui.input}`}
                defaultValue="MEMBER"
              >
                <option value="VIEWER">{roleCopy.teamRoles.VIEWER}</option>
                <option value="MEMBER">{roleCopy.teamRoles.MEMBER}</option>
                <option value="MANAGER">{roleCopy.teamRoles.MANAGER}</option>
              </select>
            </div>
          </div>
          {memberError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {memberError}
            </p>
          ) : null}
          {memberSuccess ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {memberSuccess}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isAssigning || teams.length === 0}
            className={`${ui.primaryButton} w-full sm:w-auto`}
          >
            <Icon name="team" className="h-4 w-4" />
            {isAssigning ? copy.addingMember : copy.addMemberSubmit}
          </button>
        </form>
      </section>
    </div>
  );
}
