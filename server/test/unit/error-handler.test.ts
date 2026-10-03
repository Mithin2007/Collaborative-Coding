import { afterEach, describe, expect, it } from "vitest"
import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { buildApp } from "../../src/app.js"
import { AppError } from "../../src/lib/errors.js"
import { parseInput } from "../../src/lib/validation.js"
import { testEnv } from "./helpers.js"

let app: FastifyInstance | undefined
afterEach(async () => {
  await app?.close()
  app = undefined
})

function appWithRoutes(
  nodeEnv: "test" | "production" = "test",
): FastifyInstance {
  const instance = buildApp({ env: testEnv({ NODE_ENV: nodeEnv }) })
  instance.get("/api/_t/app-error", async () => {
    throw new AppError("TEAPOT", "I am a teapot", 418)
  })
  instance.get("/api/_t/boom", async () => {
    throw new Error("connect failed postgresql://admin:pw-leak@db/internal")
  })
  instance.post("/api/_t/validate", async (request) => {
    return parseInput(
      z.object({ email: z.email(), amount: z.number().positive() }),
      request.body,
    )
  })
  app = instance
  return instance
}

describe("centralized error handling", () => {
  it("returns the standard envelope for AppError with matching request id", async () => {
    const res = await appWithRoutes().inject({
      method: "GET",
      url: "/api/_t/app-error",
    })
    expect(res.statusCode).toBe(418)
    const body = res.json()
    expect(body).toEqual({
      error: {
        code: "TEAPOT",
        message: "I am a teapot",
        requestId: expect.any(String),
      },
    })
    expect(res.headers["x-request-id"]).toBe(body.error.requestId)
  })

  it("returns 404 NOT_FOUND in the same envelope", async () => {
    const res = await appWithRoutes().inject({
      method: "GET",
      url: "/api/missing?token=abc",
    })
    expect(res.statusCode).toBe(404)
    expect(res.json().error).toMatchObject({
      code: "NOT_FOUND",
      requestId: expect.any(String),
    })
  })

  it("converts Zod failures to 400 VALIDATION_ERROR with field details", async () => {
    const res = await appWithRoutes().inject({
      method: "POST",
      url: "/api/_t/validate",
      payload: { email: "nope", amount: -1 },
    })
    expect(res.statusCode).toBe(400)
    const { error } = res.json()
    expect(error.code).toBe("VALIDATION_ERROR")
    expect(error.details.map((d: { path: string }) => d.path).sort()).toEqual([
      "amount",
      "email",
    ])
  })

  it("maps malformed JSON to a 400 client error", async () => {
    const res = await appWithRoutes().inject({
      method: "POST",
      url: "/api/_t/validate",
      headers: { "content-type": "application/json" },
      payload: "{not json",
    })
    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe("BAD_REQUEST")
  })

  it.each(["test", "production"] as const)(
    "hides internals of unexpected errors (%s)",
    async (nodeEnv) => {
      const res = await appWithRoutes(nodeEnv).inject({
        method: "GET",
        url: "/api/_t/boom",
      })
      expect(res.statusCode).toBe(500)
      expect(res.json().error).toEqual({
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
        requestId: expect.any(String),
      })
      expect(res.body).not.toContain("pw-leak")
      expect(res.body).not.toMatch(/stack|at .*\.ts/i)
    },
  )

  it("reuses a well-formed inbound x-request-id and replaces a malformed one", async () => {
    const instance = appWithRoutes()
    const good = await instance.inject({
      method: "GET",
      url: "/api/nope",
      headers: { "x-request-id": "trace-12345678" },
    })
    expect(good.headers["x-request-id"]).toBe("trace-12345678")
    const bad = await instance.inject({
      method: "GET",
      url: "/api/nope",
      headers: { "x-request-id": "bad id\twith spaces" },
    })
    expect(bad.headers["x-request-id"]).not.toContain(" ")
    expect(bad.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/)
  })
})
