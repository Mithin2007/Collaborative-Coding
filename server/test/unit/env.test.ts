import { describe, expect, it } from "vitest"
import { EnvValidationError, loadEnv } from "../../src/config/env.js"

const valid = { DATABASE_URL: "postgresql://u:p@localhost:5432/db" }

describe("loadEnv", () => {
  it("applies defaults when only DATABASE_URL is set", () => {
    const env = loadEnv(valid)
    expect(env).toMatchObject({
      NODE_ENV: "development",
      API_HOST: "127.0.0.1",
      API_PORT: 4000,
      LOG_LEVEL: "info",
      CORS_ORIGINS: ["http://localhost:8443"],
    })
    expect(env.TEST_DATABASE_URL).toBeUndefined()
  })

  it("coerces and parses provided values", () => {
    const env = loadEnv({
      ...valid,
      NODE_ENV: "production",
      API_PORT: "8080",
      CORS_ORIGINS: "http://a.test, https://b.test",
      TEST_DATABASE_URL: "postgres://u:p@localhost:5432/t",
    })
    expect(env.API_PORT).toBe(8080)
    expect(env.NODE_ENV).toBe("production")
    expect(env.CORS_ORIGINS).toEqual(["http://a.test", "https://b.test"])
  })

  it("treats empty strings as unset", () => {
    expect(loadEnv({ ...valid, API_PORT: "", LOG_LEVEL: "" }).API_PORT).toBe(
      4000,
    )
  })

  it("requires DATABASE_URL", () => {
    expect(() => loadEnv({})).toThrow(EnvValidationError)
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/)
  })

  it.each([
    ["API_PORT", "70000"],
    ["API_PORT", "abc"],
    ["NODE_ENV", "staging"],
    ["LOG_LEVEL", "loud"],
    ["CORS_ORIGINS", "not-a-url"],
    ["DATABASE_URL", "mysql://u:p@h/db"],
  ])("rejects invalid %s=%s", (key, value) => {
    expect(() => loadEnv({ ...valid, [key]: value })).toThrow(
      EnvValidationError,
    )
  })

  it("never echoes secret values in error messages", () => {
    try {
      loadEnv({ DATABASE_URL: "mysql://admin:SuperSecret123@host/db" })
      expect.unreachable("should have thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError)
      expect((error as Error).message).toContain("DATABASE_URL")
      expect((error as Error).message).not.toContain("SuperSecret123")
    }
  })
})
