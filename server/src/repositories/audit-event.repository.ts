import type { AuditEvent, AuditEventType, Prisma } from "@prisma/client"
import type { DbClient } from "../lib/prisma.js"
import { newPublicId } from "../lib/public-id.js"

export interface AppendAuditEventInput {
  /** Internal user id of the actor, or null for system-originated events. */
  actorId?: bigint | null
  eventType: AuditEventType
  entityType: string
  /** Public id of the affected entity (never an internal id). */
  entityId: string
  /** Must not contain secrets, credentials, tokens or raw API keys. */
  metadata?: Prisma.InputJsonValue
  requestId?: string | null
}

/**
 * Append-only by design: this repository intentionally exposes NO update or
 * delete operation, and PostgreSQL triggers (see the `integrity_constraints`
 * migration) reject UPDATE/DELETE/TRUNCATE on the table regardless of caller.
 *
 * Future tamper-evidence (hash chaining) belongs inside `append`, so callers
 * will not need to change.
 */
export class AuditEventRepository {
  constructor(private readonly db: DbClient) {}

  append(input: AppendAuditEventInput): Promise<AuditEvent> {
    return this.db.auditEvent.create({
      data: {
        publicId: newPublicId("auditEvent"),
        actorId: input.actorId ?? null,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        ...(input.metadata === undefined ? {} : { metadata: input.metadata }),
        requestId: input.requestId ?? null,
      },
    })
  }

  listByEntity(
    entityType: string,
    entityId: string,
    limit = 100,
  ): Promise<AuditEvent[]> {
    return this.db.auditEvent.findMany({
      where: { entityType, entityId },
      orderBy: { id: "asc" },
      take: Math.min(Math.max(limit, 1), 500),
    })
  }
}
