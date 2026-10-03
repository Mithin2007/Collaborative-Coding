import fs from "node:fs"
import path from "node:path"
import { PrismaClient } from "@prisma/client"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { getTestDatabaseUrl, withDatabaseName } from "./env.js"
import { runPrisma } from "./prisma-cli.js"

interface UnindexedFk {
  tbl: string
  col: string
}

const MIGRATIONS_DIR = path.resolve(
  import.meta.dirname,
  "../../prisma/migrations",
)
const SCHEMA = path.resolve(import.meta.dirname, "../../prisma/schema.prisma")
const dbName = `invenzo_migtest_${process.pid}_${Date.now()}`

let admin: PrismaClient
let scratch: PrismaClient
let scratchUrl: string

beforeAll(async () => {
  admin = new PrismaClient({ datasourceUrl: getTestDatabaseUrl(), log: [] })
  await admin.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`)
  scratchUrl = withDatabaseName(getTestDatabaseUrl(), dbName)
  scratch = new PrismaClient({ datasourceUrl: scratchUrl, log: [] })
})

afterAll(async () => {
  await scratch?.$disconnect()
  await admin?.$executeRawUnsafe(
    `DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`,
  )
  await admin?.$disconnect()
})

describe("migrations against a brand-new empty database", () => {
  it("`prisma migrate deploy` applies all migrations", () => {
    const res = runPrisma(["migrate", "deploy"], scratchUrl)
    expect(res.output).toMatch(
      /applied|All migrations have been successfully applied/i,
    )
    expect(res.status).toBe(0)
  })

  it("`prisma migrate status` reports the database is up to date", () => {
    const res = runPrisma(["migrate", "status"], scratchUrl)
    expect(res.status).toBe(0)
    expect(res.output).toMatch(/Database schema is up to date/)
  })

  it("is idempotent: a second deploy applies nothing", () => {
    const res = runPrisma(["migrate", "deploy"], scratchUrl)
    expect(res.status).toBe(0)
    expect(res.output).toMatch(/No pending migrations/)
  })

  it("schema.prisma and the migration history have no drift", () => {
    const res = runPrisma(
      [
        "migrate",
        "diff",
        "--from-url",
        scratchUrl,
        "--to-schema-datamodel",
        SCHEMA,
        "--exit-code",
      ],
      scratchUrl,
    )
    expect(res.output).toMatch(/No difference detected/)
    expect(res.status).toBe(0)
  })

  it("creates all 20 domain tables", async () => {
    const rows = await scratch.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name <> '_prisma_migrations' ORDER BY table_name`
    expect(rows.map((r) => r.table_name)).toEqual(
      [
        "AuditEvent",
        "CapacityAccount",
        "CapacityContribution",
        "CapacityReservation",
        "CapacitySnapshot",
        "DeveloperApiKey",
        "Entitlement",
        "ExchangeAgreement",
        "ExchangeOffer",
        "Notification",
        "PricingRate",
        "PricingVersion",
        "Project",
        "ProviderAccount",
        "ProviderConnection",
        "ProviderModel",
        "UsageRecord",
        "User",
        "Wallet",
        "WalletTransaction",
      ].sort(),
    )
  })

  it("installs the CHECK constraints and append-only triggers from the integrity migration", async () => {
    const sql = fs.readFileSync(
      path.join(
        MIGRATIONS_DIR,
        fs
          .readdirSync(MIGRATIONS_DIR)
          .find((d) => d.endsWith("_integrity_constraints"))!,
        "migration.sql",
      ),
      "utf8",
    )
    const declared = [...sql.matchAll(/CONSTRAINT "(chk_[a-z0-9_]+)"/g)]
      .map((m) => m[1]!)
      .sort()
    expect(declared.length).toBeGreaterThan(15)
    const installed = await scratch.$queryRaw<{
      conname: string
    }[]>`SELECT conname FROM pg_constraint WHERE contype = 'c' AND conname LIKE 'chk\\_%'`
    expect(installed.map((r) => r.conname).sort()).toEqual(declared)

    const triggers = await scratch.$queryRaw<{ tgname: string }[]>`
      SELECT tgname FROM pg_trigger WHERE NOT tgisinternal AND tgname LIKE 'trg\\_%' ORDER BY tgname`
    expect(triggers.map((t) => t.tgname)).toEqual([
      "trg_audit_event_append_only",
      "trg_audit_event_no_truncate",
      "trg_wallet_transaction_append_only",
      "trg_wallet_transaction_no_truncate",
    ])
  })

  it("indexes every public id (unique) and every foreign-key column", async () => {
    const publicIds = await scratch.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_indexes WHERE schemaname = 'public' AND indexdef LIKE 'CREATE UNIQUE INDEX%("publicId")'`
    expect(publicIds).toHaveLength(20)

    // Every FK column must be the leading column of at least one index.
    const unindexed = await scratch.$queryRaw<UnindexedFk[]>`
      SELECT c.conrelid::regclass::text AS tbl, a.attname AS col
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
      WHERE c.contype = 'f' AND NOT EXISTS (
        SELECT 1 FROM pg_index i WHERE i.indrelid = c.conrelid AND i.indkey[0] = c.conkey[1])`
    expect(unindexed).toEqual([])
  })
})
