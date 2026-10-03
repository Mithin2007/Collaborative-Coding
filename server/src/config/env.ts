import path from "node:path"
import { config as loadDotenvFile } from "dotenv"
import { z } from "zod"

const postgresUrl = z
  .string()
  .refine(
    (v) => /^postgres(ql)?:\/\//.test(v),
    "must be a PostgreSQL connection URL (postgresql://…)",
  )

const corsOrigins = z
  .string()
  .transform((v) =>
    v.split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url()))

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_HOST: z.string().min(1).default("127.0.0.1"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  CORS_ORIGINS: corsOrigins.default(["http://localhost:8443"]),
  DATABASE_URL: postgresUrl,
  /** Only used by the DB test suite; must differ from DATABASE_URL. */
  TEST_DATABASE_URL: postgresUrl.optional(),
})

export type Env = z.infer<typeof envSchema>

export class EnvValidationError extends Error {
  constructor(public readonly problems: string[]) {
    super(
      `Invalid environment configuration:\n${problems.map((p) => `  - ${p}`).join("\n")}`,
    )
    this.name = "EnvValidationError"
  }
}

/**
 * Validate an environment object. Error text names variables and constraints
 * only — it never echoes values, so a malformed DATABASE_URL (which contains a
 * password) cannot leak into logs or terminals.
 */
export function loadEnv(
  source: Record<string, string | undefined> = process.env,
): Env {
  // Treat empty strings (e.g. `API_PORT=`) as unset so defaults apply.
  const cleaned = Object.fromEntries(
    Object.entries(source).filter(([, v]) => v !== undefined && v !== ""),
  )
  const result = envSchema.safeParse(cleaned)
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
      ),
    )
  }
  return result.data
}

/** Load the repo-root .env (if present) into process.env. Real env vars win. */
export function loadDotenv(): void {
  loadDotenvFile({
    path: path.resolve(import.meta.dirname, "../../../.env"),
    quiet: true,
  })
}
