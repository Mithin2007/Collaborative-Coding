import { loadEnv, type Env } from "../../src/config/env.js"

/** Env for unit tests: no real database is contacted (port 1 is closed). */
export function testEnv(overrides: Record<string, string> = {}): Env {
  return loadEnv({
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
    DATABASE_URL: "postgresql://invenzo:unit-secret@127.0.0.1:1/unit",
    ...overrides,
  })
}
