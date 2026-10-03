import path from "node:path"
import { config as loadDotenvFile } from "dotenv"

/** Resolve TEST_DATABASE_URL (from the environment or the repo-root .env). */
export function getTestDatabaseUrl(): string {
  loadDotenvFile({
    path: path.resolve(import.meta.dirname, "../../../.env"),
    quiet: true,
  })
  const url = process.env.TEST_DATABASE_URL
  if (!url) {
    throw new Error(
      [
        "TEST_DATABASE_URL is not set — the DB test suite cannot run.",
        "  1. Start PostgreSQL 16 (e.g. `pnpm db:up`) or use your own instance.",
        "  2. Copy .env.example to .env and set TEST_DATABASE_URL to a DISPOSABLE database.",
        "DB tests are never skipped silently.",
      ].join("\n"),
    )
  }
  return url
}

/** Same server/credentials, different database name. */
export function withDatabaseName(url: string, database: string): string {
  const u = new URL(url)
  u.pathname = `/${database}`
  return u.toString()
}

export function redactUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.host}${u.pathname}`
  } catch {
    return "(unparseable URL)"
  }
}
