import { describe, expect, it } from "vitest";
import {
  buildAuditLogOwnerWhere,
  isAuditLogActor,
} from "../lib/audit/access";

describe("audit log ownership checks", () => {
  it("allows the acting user to read their own audit log", () => {
    expect(isAuditLogActor({ actorId: "user-1" }, "user-1")).toBe(true);
  });

  it("rejects other users and missing actors", () => {
    expect(isAuditLogActor({ actorId: "user-1" }, "user-2")).toBe(false);
    expect(isAuditLogActor({ actorId: null }, "user-1")).toBe(false);
    expect(isAuditLogActor(null, "user-1")).toBe(false);
  });

  it("builds an actor-scoped Prisma where clause", () => {
    expect(buildAuditLogOwnerWhere("user-1")).toEqual({ actorId: "user-1" });
  });
});
