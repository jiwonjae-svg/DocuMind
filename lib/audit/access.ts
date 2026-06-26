type ActorScopedAuditLog = {
  actorId: string | null;
};

export function isAuditLogActor(
  auditLog: ActorScopedAuditLog | null | undefined,
  userId: string | null | undefined,
) {
  return Boolean(auditLog?.actorId && userId && auditLog.actorId === userId);
}

export function buildAuditLogOwnerWhere(userId: string) {
  return {
    actorId: userId,
  };
}
