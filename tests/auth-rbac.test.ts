import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  organization: {
    create: vi.fn(),
  },
  organizationMembership: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  team: {
    create: vi.fn(),
  },
  teamMembership: {
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
}));

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  DEFAULT_TEAM_NAME,
  buildOrganizationAuditLogWhere,
  canManageOrganization,
  canManageTeam,
  createOwnedOrganizationForUser,
  ensureUserDefaultOrganization,
} from "../lib/auth/rbac";

describe("RBAC helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (operation) =>
      operation(prismaMock),
    );
    prismaMock.organization.create.mockResolvedValue({
      id: "org-1",
      name: "Mina's workspace",
    });
    prismaMock.organizationMembership.create.mockResolvedValue({
      id: "membership-1",
      organizationId: "org-1",
      role: "OWNER",
      userId: "user-1",
    });
    prismaMock.team.create.mockResolvedValue({
      id: "team-1",
      name: DEFAULT_TEAM_NAME,
    });
    prismaMock.teamMembership.create.mockResolvedValue({
      id: "team-membership-1",
    });
  });

  it("checks organization and team management roles explicitly", () => {
    expect(canManageOrganization("OWNER")).toBe(true);
    expect(canManageOrganization("ADMIN")).toBe(true);
    expect(canManageOrganization("MEMBER")).toBe(false);

    expect(canManageTeam("MANAGER")).toBe(true);
    expect(canManageTeam("MEMBER")).toBe(false);
    expect(canManageTeam("VIEWER")).toBe(false);
  });

  it("builds organization audit log filters from member user IDs", () => {
    expect(buildOrganizationAuditLogWhere(["user-1", "user-2"])).toEqual({
      actorId: {
        in: ["user-1", "user-2"],
      },
    });
  });

  it("creates an owner organization and default manager team for new users", async () => {
    await expect(
      createOwnedOrganizationForUser(prismaMock, {
        email: "mina@example.com",
        id: "user-1",
        name: "Mina\u202e Tanaka",
      }),
    ).resolves.toMatchObject({
      membership: {
        organizationId: "org-1",
        role: "OWNER",
        userId: "user-1",
      },
      team: {
        id: "team-1",
        name: DEFAULT_TEAM_NAME,
      },
    });

    expect(prismaMock.organization.create).toHaveBeenCalledWith({
      data: {
        name: "Mina Tanaka's workspace",
      },
      select: {
        id: true,
        name: true,
      },
    });
    expect(prismaMock.teamMembership.create).toHaveBeenCalledWith({
      data: {
        organizationMembershipId: "membership-1",
        role: "MANAGER",
        teamId: "team-1",
        userId: "user-1",
      },
    });
  });

  it("reuses existing organization membership for migrated users", async () => {
    prismaMock.organizationMembership.findFirst.mockResolvedValue({
      id: "membership-1",
      organizationId: "org-1",
      role: "OWNER",
      userId: "user-1",
    });

    await expect(ensureUserDefaultOrganization("user-1")).resolves.toEqual({
      id: "membership-1",
      organizationId: "org-1",
      role: "OWNER",
      userId: "user-1",
    });

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("creates a default organization for existing users without memberships", async () => {
    prismaMock.organizationMembership.findFirst.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue({
      email: "mina@example.com",
      id: "user-1",
      name: "Mina",
    });

    await expect(ensureUserDefaultOrganization("user-1")).resolves.toEqual({
      id: "membership-1",
      organizationId: "org-1",
      role: "OWNER",
      userId: "user-1",
    });

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.organization.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: "Mina's workspace",
        },
      }),
    );
  });
});
