import type { FastifyBaseLogger } from "fastify"
import type { Env } from "../config/env.js"
import type { HealthRepository } from "../repositories/health.repository.js"

export type DatabaseState = "connected" | "unavailable"

export interface HealthReport {
  status: "ok" | "degraded"
  service: "invenzo-api"
  environment: Env["NODE_ENV"]
  database: DatabaseState
  timestamp: string
}

const DATABASE_PING_TIMEOUT_MS = 3000

export class HealthService {
  constructor(
    private readonly repository: HealthRepository,
    private readonly environment: Env["NODE_ENV"],
    private readonly logger: FastifyBaseLogger,
  ) {}

  async check(): Promise<HealthReport> {
    let database: DatabaseState = "connected"
    try {
      await this.repository.ping(DATABASE_PING_TIMEOUT_MS)
    } catch (error) {
      database = "unavailable"
      // Log only the error class: driver messages can include connection details.
      this.logger.warn(
        { errorName: error instanceof Error ? error.name : "unknown" },
        "database health check failed",
      )
    }
    return {
      status: database === "connected" ? "ok" : "degraded",
      service: "invenzo-api",
      environment: this.environment,
      database,
      timestamp: new Date().toISOString(),
    }
  }
}
