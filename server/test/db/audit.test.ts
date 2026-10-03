import { afterAll, describe, expect, it } from "vitest"
import { AuditEventRepository } from "../../src/repositories/audit-event.repository.js"
import { isPublicId } from "../../src/lib/public-id.js"
import { closePrisma, createUser, getPrisma, unique } from "./helpers.js"

afterAll(closePrisma)

describe("AuditEvent is append-only", () => {
  const repo = new AuditEventRepository(getPrisma())

  it("appends and lists events in order", async () => {
    const actor = await createUser()
    const entityId = unique("ent")
    const a = await repo.append({
      actorId: actor.id,
      eventType: "USER_CREATED",
      entityType: "User",
      entityId,
      requestId: "req-1",
    })
    await repo.append({
      eventType: "API_KEY_CREATED",
      entityType: "User",
      entityId,
      metadata: { scopes: ["read"] },
    })
    expect(isPublicId(a.publicId, "auditEvent")).toBe(true)
    const events = await repo.listByEntity("User", entityId)
    expect(events.map((e) => e.eventType)).toEqual([
      "USER_CREATED",
      "API_KEY_CREATED",
    ])
  })

  it("repository exposes no update/delete operations", () => {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(repo),
    ).filter((m) => m !== "constructor")
    expect(methods.sort()).toEqual(["append", "listByEntity"])
  })

  it("database rejects UPDATE (Prisma and raw SQL)", async () => {
    const event = await repo.append({
      eventType: "USER_CREATED",
      entityType: "User",
      entityId: unique("e"),
    })
    await expect(
      getPrisma().auditEvent.update({
        where: { id: event.id },
        data: { entityType: "Tampered" },
      }),
    ).rejects.toThrow(/append-only/)
    await expect(
      getPrisma()
        .$executeRaw`UPDATE "AuditEvent" SET "entityType" = 'x' WHERE id = ${event.id}`,
    ).rejects.toThrow(/append-only/)
  })

  it("database rejects DELETE and TRUNCATE", async () => {
    const event = await repo.append({
      eventType: "USER_CREATED",
      entityType: "User",
      entityId: unique("e"),
    })
    await expect(
      getPrisma().auditEvent.delete({ where: { id: event.id } }),
    ).rejects.toThrow(/append-only/)
    await expect(getPrisma().auditEvent.deleteMany({})).rejects.toThrow(
      /append-only/,
    )
    await expect(
      getPrisma().$executeRawUnsafe(`TRUNCATE TABLE "AuditEvent"`),
    ).rejects.toThrow(/append-only/)
    expect(
      await getPrisma().auditEvent.findUnique({ where: { id: event.id } }),
    ).not.toBeNull()
  })

  it("cannot delete a user who has audit history (FK RESTRICT, no silent SetNull update)", async () => {
    const actor = await createUser()
    await repo.append({
      actorId: actor.id,
      eventType: "USER_CREATED",
      entityType: "User",
      entityId: actor.publicId,
    })
    await expect(
      getPrisma().user.delete({ where: { id: actor.id } }),
    ).rejects.toThrow()
  })
})
