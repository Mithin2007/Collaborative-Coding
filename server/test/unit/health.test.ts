import { afterEach, describe, expect, it } from "vitest"
import type { FastifyInstance } from "fastify"
import { buildApp } from "../../src/app.js"
import type { HealthRepository } from "../../src/repositories/health.repository.js"
import { testEnv } from "./helpers.js"

let app: FastifyInstance | undefined
afterEach(async () => {
  await app?.close()
  app = undefined
})

const healthy: HealthRepository = { ping: async () => {} }
const failing: HealthRepository = {
  ping: async () => {
    throw new Error(
      "connection refused postgresql://invenzo:unit-secret@127.0.0.1:1/unit",
    )
  },
}

describe("GET /api/health", () => {
  it("returns 200 and database=connected when the database answers", async () => {
    app = buildApp({ env: testEnv(), healthRepository: healthy })
    const res = await app.inject({ method: "GET", url: "/api/health" })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({
      status: "ok",
      service: "invenzo-api",
      environment: "test",
      database: "connected",
      timestamp: expect.any(String),
    })
    expect(res.headers["cache-control"]).toBe("no-store")
  })

  it("returns 503 and database=unavailable when the ping fails, leaking nothing", async () => {
    app = buildApp({ env: testEnv(), healthRepository: failing })
    const res = await app.inject({ method: "GET", url: "/api/health" })
    expect(res.statusCode).toBe(503)
    expect(res.json()).toMatchObject({
      status: "degraded",
      database: "unavailable",
    })
    expect(res.body).not.toMatch(
      /unit-secret|postgresql:|127\.0\.0\.1|DATABASE_URL/,
    )
  })

  it("returns 503 with a real Prisma client pointed at an unreachable database", async () => {
    app = buildApp({ env: testEnv() }) // port 1: nothing listens
    const res = await app.inject({ method: "GET", url: "/api/health" })
    expect(res.statusCode).toBe(503)
    expect(res.json().database).toBe("unavailable")
    expect(res.body).not.toContain("unit-secret")
  })

  it("allows only configured CORS origins", async () => {
    app = buildApp({
      env: testEnv({ CORS_ORIGINS: "http://localhost:8443" }),
      healthRepository: healthy,
    })
    const ok = await app.inject({
      method: "GET",
      url: "/api/health",
      headers: { origin: "http://localhost:8443" },
    })
    expect(ok.headers["access-control-allow-origin"]).toBe(
      "http://localhost:8443",
    )
    const other = await app.inject({
      method: "GET",
      url: "/api/health",
      headers: { origin: "http://evil.test" },
    })
    expect(other.headers["access-control-allow-origin"]).toBeUndefined()
  })
})
