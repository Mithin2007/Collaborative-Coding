import { EnvValidationError, loadDotenv, loadEnv } from "./config/env.js"
import { buildApp } from "./app.js"

loadDotenv()

let env
try {
  env = loadEnv()
} catch (error) {
  // EnvValidationError lists variable names/constraints only — never values.
  console.error(
    error instanceof EnvValidationError
      ? error.message
      : "Failed to load environment.",
  )
  process.exit(1)
}

const app = buildApp({ env })

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, "shutting down")
  try {
    await app.close()
    process.exit(0)
  } catch (error) {
    app.log.error({ err: error }, "error during shutdown")
    process.exit(1)
  }
}
process.on("SIGINT", () => void shutdown("SIGINT"))
process.on("SIGTERM", () => void shutdown("SIGTERM"))

try {
  await app.listen({ host: env.API_HOST, port: env.API_PORT })
} catch (error) {
  app.log.error({ err: error }, "failed to start server")
  process.exit(1)
}
