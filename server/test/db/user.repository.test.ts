import { afterAll, describe, expect, it } from "vitest"
import { ConflictError } from "../../src/lib/errors.js"
import { isPublicId } from "../../src/lib/public-id.js"
import { UserRepository } from "../../src/repositories/user.repository.js"
import { toPublicUser } from "../../src/types/dto.js"
import { closePrisma, getPrisma, unique } from "./helpers.js"

afterAll(closePrisma)

describe("UserRepository", () => {
  const repo = new UserRepository(getPrisma())

  it("creates a user with a random public id and sensible defaults", async () => {
    const user = await repo.create({
      email: `${unique("a")}@example.test`,
      name: "Ada",
    })
    expect(isPublicId(user.publicId, "user")).toBe(true)
    expect(user).toMatchObject({
      role: "USER",
      status: "PENDING_VERIFICATION",
      name: "Ada",
    })
    expect(typeof user.id).toBe("bigint")
  })

  it("normalises email and finds users by public id and by (any-case) email", async () => {
    const local = unique("MiXeD")
    const user = await repo.create({ email: `  ${local}@Example.TEST ` })
    expect(user.email).toBe(`${local.toLowerCase()}@example.test`)
    expect((await repo.findByPublicId(user.publicId))?.id).toBe(user.id)
    expect(
      (await repo.findByEmail(`${local.toUpperCase()}@EXAMPLE.test`))?.id,
    ).toBe(user.id)
    expect(await repo.findByPublicId("usr_doesnotexistdoesnot0")).toBeNull()
  })

  it("rejects duplicate emails regardless of case with ConflictError", async () => {
    const local = unique("dup")
    await repo.create({ email: `${local}@example.test` })
    await expect(
      repo.create({ email: `${local.toUpperCase()}@example.test` }),
    ).rejects.toBeInstanceOf(ConflictError)
  })

  it("the database itself rejects non-normalised emails (CHECK)", async () => {
    await expect(
      getPrisma().user.create({
        data: {
          publicId: unique("raw"),
          email: `${unique("Raw")}@Example.test`,
        },
      }),
    ).rejects.toThrow(/chk_user_email_lowercase/)
  })

  it("DTO mapping never exposes the internal id and is JSON-serialisable", async () => {
    const user = await repo.create({ email: `${unique("dto")}@example.test` })
    const dto = toPublicUser(user)
    expect(dto.id).toBe(user.publicId)
    expect(Object.keys(dto)).not.toContain("updatedAt")
    expect(JSON.stringify(dto)).not.toContain(user.id.toString() + ",")
    expect(() => JSON.stringify(dto)).not.toThrow() // raw rows with BigInt would throw
    expect(() => JSON.stringify(user)).toThrow() // proves why DTOs are mandatory
  })
})
