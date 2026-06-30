import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const ORGANIZATION_ADMIN_ROLES = ["OWNER", "ADMIN"] as const;
export const ASSIGNABLE_ORGANIZATION_ROLES = ["ADMIN", "MEMBER"] as const;
export const TEAM_MANAGER_ROLES = ["MANAGER"] as const;
export const ASSIGNABLE_TEAM_ROLES = ["MANAGER", "MEMBER", "VIEWER"] as const;
export const DEFAULT_TEAM_NAME = "General";
export const MAX_TEAM_NAME_LENGTH = 80;

type OrganizationRoleValue = (typeof ORGANIZATION_ADMIN_ROLES)[number] | "MEMBER";
type TeamRoleValue = (typeof TEAM_MANAGER_ROLES)[number] | "MEMBER" | "VIEWER";

type RbacTransaction = Pick<
  Prisma.TransactionClient,
  "organization" | "organizationMembership" | "team" | "teamMembership" | "user"
>;

type UserWorkspaceInput = {
  email: string;
  id: string;
  name?: string | null;
};

const unsafeWorkspaceNameCharacters =
  /[\u0000-\u001f\u007f-\u009f\p{Cf}]+/gu;

function normalizeWorkspaceName(value: string) {
  return value
    .normalize("NFC")
    .replace(unsafeWorkspaceNameCharacters, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function normalizeTeamName(value: unknown) {
  const name =
    typeof value === "string"
      ? value
          .normalize("NFC")
          .replace(unsafeWorkspaceNameCharacters, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";

  if (!name || name.length > MAX_TEAM_NAME_LENGTH) {
    return null;
  }

  return name;
}

export function normalizeAssignableOrganizationRole(
  value: unknown,
): (typeof ASSIGNABLE_ORGANIZATION_ROLES)[number] | null {
  return typeof value === "string" &&
    ASSIGNABLE_ORGANIZATION_ROLES.includes(
      value as (typeof ASSIGNABLE_ORGANIZATION_ROLES)[number],
    )
    ? (value as (typeof ASSIGNABLE_ORGANIZATION_ROLES)[number])
    : null;
}

export function normalizeAssignableTeamRole(
  value: unknown,
): (typeof ASSIGNABLE_TEAM_ROLES)[number] | null {
  return typeof value === "string" &&
    ASSIGNABLE_TEAM_ROLES.includes(
      value as (typeof ASSIGNABLE_TEAM_ROLES)[number],
    )
    ? (value as (typeof ASSIGNABLE_TEAM_ROLES)[number])
    : null;
}

function readDefaultWorkspaceName({ email, name }: UserWorkspaceInput) {
  const displayName =
    normalizeWorkspaceName(name ?? "") ||
    normalizeWorkspaceName(email.split("@")[0] ?? "") ||
    "DocuMind";

  return `${displayName}'s workspace`;
}

export function canManageOrganization(
  role: OrganizationRoleValue | null | undefined,
) {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageTeam(role: TeamRoleValue | null | undefined) {
  return role === "MANAGER";
}

export function buildOrganizationAuditLogWhere(memberUserIds: string[]) {
  return {
    actorId: {
      in: memberUserIds,
    },
  };
}

export async function createOwnedOrganizationForUser(
  transaction: RbacTransaction,
  user: UserWorkspaceInput,
) {
  const organization = await transaction.organization.create({
    data: {
      name: readDefaultWorkspaceName(user),
    },
    select: {
      id: true,
      name: true,
    },
  });
  const membership = await transaction.organizationMembership.create({
    data: {
      organizationId: organization.id,
      role: "OWNER",
      userId: user.id,
    },
    select: {
      id: true,
      organizationId: true,
      role: true,
      userId: true,
    },
  });
  const team = await transaction.team.create({
    data: {
      name: DEFAULT_TEAM_NAME,
      organizationId: organization.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  await transaction.teamMembership.create({
    data: {
      organizationMembershipId: membership.id,
      role: "MANAGER",
      teamId: team.id,
      userId: user.id,
    },
  });

  return {
    membership,
    organization,
    team,
  };
}

export async function ensureUserDefaultOrganization(userId: string) {
  const existingMembership = await prisma.organizationMembership.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      organizationId: true,
      role: true,
      userId: true,
    },
    where: {
      userId,
    },
  });

  if (existingMembership) {
    return existingMembership;
  }

  const user = await prisma.user.findUnique({
    select: {
      email: true,
      id: true,
      name: true,
    },
    where: {
      id: userId,
    },
  });

  if (!user) {
    return null;
  }

  const result = await prisma.$transaction((transaction) =>
    createOwnedOrganizationForUser(transaction, user),
  );

  return result.membership;
}

export async function ensureUserHasOrganizationMembership(
  transaction: RbacTransaction,
  user: UserWorkspaceInput,
) {
  const existingMembership = await transaction.organizationMembership.findFirst({
    select: {
      id: true,
    },
    where: {
      userId: user.id,
    },
  });

  if (existingMembership) {
    return null;
  }

  return createOwnedOrganizationForUser(transaction, user);
}

export async function getOrganizationAdminContext({
  organizationId,
  userId,
}: {
  organizationId?: string | null;
  userId: string;
}) {
  await ensureUserDefaultOrganization(userId);

  const membership = await prisma.organizationMembership.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      organization: {
        select: {
          id: true,
          memberships: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              role: true,
              teamRoles: {
                orderBy: {
                  createdAt: "asc",
                },
                select: {
                  role: true,
                  team: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              user: {
                select: {
                  email: true,
                  id: true,
                  name: true,
                },
              },
              userId: true,
            },
          },
          name: true,
        },
      },
      role: true,
    },
    where: {
      ...(organizationId ? { organizationId } : {}),
      role: {
        in: [...ORGANIZATION_ADMIN_ROLES],
      },
      userId,
    },
  });

  if (!membership || !canManageOrganization(membership.role)) {
    return null;
  }

  return {
    organization: membership.organization,
    role: membership.role,
  };
}
