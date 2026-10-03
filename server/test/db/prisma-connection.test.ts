import fs from "node:fs"
import path from "node:path"
import { afterAll, describe, expect, it } from "vitest"
import { buildApp } from "../../src/app.js"
import { loadEnv } from "../../src/config/env.js"
import { getTestDatabaseUrl } from "./env.js"
import { closePrisma, getPrisma } from "./helpers.js"

afterAll(closePrisma)

describe("database connection", () => {
  it("connects through Prisma and answers a query", async () => {
    const rows = await getPrisma().$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`
    expect(rows[0]?.ok).toBe(1)
  })

  it("runs on PostgreSQL 16", async () => {
    const rows = await getPrisma().$queryRaw<{
      v: string
    }[]>`SELECT current_setting('server_version_num') AS v`
    expect(Math.floor(Number(rows[0]?.v) / 10000)).toBe(16)
  })

  it("GET /api/health reports 200 + connected against the real database", async () => {
    const app = buildApp({
      env: loadEnv({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        DATABASE_URL: getTestDatabaseUrl(),
      }),
    })
    try {
      const res = await app.inject({ method: "GET", url: "/api/health" })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ status: "ok", database: "connected" })
    } finally {
      await app.close()
    }
  })

  it("has every migration on disk applied (clean-database reset in global setup)", async () => {
    const dir = path.resolve(import.meta.dirname, "../../prisma/migrations")
    const onDisk = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
    const applied = await getPrisma().$queryRaw<{
      migration_name: string
      finished_at: Date | null
    }[]>`
      SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY migration_name`
    expect(applied.map((m) => m.migration_name)).toEqual(onDisk)
    expect(applied.every((m) => m.finished_at !== null)).toBe(true)
  })
})
