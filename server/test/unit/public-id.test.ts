import { describe, expect, it } from "vitest"
import {
  isPublicId,
  newPublicId,
  PUBLIC_ID_PREFIXES,
  type PublicIdKind,
} from "../../src/lib/public-id.js"

describe("public ids", () => {
  it("has a unique prefix per entity kind (one per model)", () => {
    const prefixes = Object.values(PUBLIC_ID_PREFIXES)
    expect(prefixes).toHaveLength(20)
    expect(new Set(prefixes).size).toBe(prefixes.length)
  })

  it("uses the expected format: 3-char prefix + 22 url-safe chars (128 bits)", () => {
    const id = newPublicId("user")
    expect(id).toMatch(/^usr_[A-Za-z0-9_-]{22}$/)
    expect(isPublicId(id)).toBe(true)
    expect(isPublicId(id, "user")).toBe(true)
    expect(isPublicId(id, "wallet")).toBe(false)
  })

  it("fits the VarChar(40) column for every kind", () => {
    for (const kind of Object.keys(PUBLIC_ID_PREFIXES) as PublicIdKind[]) {
      expect(newPublicId(kind).length).toBeLessThanOrEqual(40)
    }
  })

  it("does not collide or look sequential across 50k ids", () => {
    const ids = new Set<string>()
    for (let i = 0; i < 50_000; i++) ids.add(newPublicId("auditEvent"))
    expect(ids.size).toBe(50_000)
    expect(newPublicId("user")).not.toBe(newPublicId("user"))
  })

  it("rejects malformed values", () => {
    for (const bad of [
      "",
      "usr_",
      "usr_short",
      "42",
      "USR_aaaaaaaaaaaaaaaaaaaaaa",
      "usr_aaaaaaaaaaaaaaaaaaaaa!",
    ]) {
      expect(isPublicId(bad)).toBe(false)
    }
  })
})
