import { Writable } from "node:stream"
import { afterEach, describe, expect, it } from "vitest"
import type { FastifyInstance } from "fastify"
import { buildApp } from "../../src/app.js"
import { testEnv } from "./helpers.js"

let app: FastifyInstance | undefined
afterEach(async () => {
  await app?.close()
  app = undefined
})

function capture() {
  const lines: string[] = []
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(String(chunk))
      cb()
    },
  })
  return { lines, stream }
}

describe("structured logging", () => {
  it("logs requestId, method, path, status, duration — and no secrets, query strings or bodies", async () => {
    const { lines, stream } = capture()
    app = buildApp({
      env: testEnv({ LOG_LEVEL: "info" }),
      logStream: stream,
      healthRepository: { ping: async () => {} },
    })
    app.post("/api/_t/echo", async () => ({ ok: true }))

    await app.inject({
      method: "POST",
      url: "/api/_t/echo?token=QUERY-SECRET",
      headers: {
        authorization: "Bearer AUTH-SECRET",
        cookie: "sid=COOKIE-SECRET",
        "x-api-key": "APIKEY-SECRET",
      },
      payload: { password: "BODY-SECRET" },
    })

    const all = lines.join("")
    for (const secret of [
      "AUTH-SECRET",
      "COOKIE-SECRET",
      "APIKEY-SECRET",
      "BODY-SECRET",
      "QUERY-SECRET",
    ]) {
      expect(all).not.toContain(secret)
    }
    const access = lines
      .map((l) => JSON.parse(l))
      .find((l) => l.msg === "request completed")
    expect(access).toMatchObject({
      requestId: expect.any(String),
      method: "POST",
      path: "/api/_t/echo",
      status: 200,
      durationMs: expect.any(Number),
    })
  })

  it("redacts sensitive header fields if they are ever logged", async () => {
    const { lines, stream } = capture()
    app = buildApp({ env: testEnv({ LOG_LEVEL: "info" }), logStream: stream })
    app.log.info(
      {
        req: {
          headers: {
            authorization: "Bearer LEAK",
            cookie: "c=LEAK",
            "x-api-key": "LEAK",
          },
        },
        user: { password: "LEAK" },
      },
      "probe",
    )
    const all = lines.join("")
    expect(all).not.toContain("LEAK")
    expect(all).toContain("[REDACTED]")
  })
})
