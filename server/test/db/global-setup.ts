import { PrismaClient } from "@prisma/client"
import { getTestDatabaseUrl, redactUrl } from "./env.js"
import { runPrisma } from "./prisma-cli.js"

/**
 * Runs once before the DB suite:
 *   1. Requires a reachable PostgreSQL at TEST_DATABASE_URL — otherwise the
 *      whole suite FAILS with an actionable message (it never skips).
 *   2. Refuses to run if TEST_DATABASE_URL equals DATABASE_URL (the run resets
 *      the database).
 *   3. Resets the test database and applies every migration from scratch with
 *      `prisma migrate reset`, so each run also proves a clean-DB migration.
 */
export default async function setup(): Promise<void> {
  const url = getTestDatabaseUrl()

  if (process.env.DATABASE_URL && process.env.DATABASE_URL === url) {
    throw new Error(
      "TEST_DATABASE_URL must differ from DATABASE_URL: the DB test run resets its database.",
    )
  }

  const probe = new PrismaClient({ datasourceUrl: url, log: [] })
  try {
    await probe.$queryRaw`SELECT 1`
  } catch (error) {
    throw new Error(
      [
        `PostgreSQL is unavailable at ${redactUrl(url)} — DB tests cannot run.`,
        "Start it with `pnpm db:up` (Docker) or point TEST_DATABASE_URL at any PostgreSQL 16 instance.",
        `Cause: ${error instanceof Error ? error.name : "unknown error"}`,
      ].join("\n"),
    )
  } finally {
    await probe.$disconnect()
  }

  const reset = runPrisma(
    ["migrate", "reset", "--force", "--skip-generate", "--skip-seed"],
    url,
  )
  if (reset.status !== 0) {
    throw new Error(
      `prisma migrate reset failed for the test database:\n${reset.output}`,
    )
  }
}
