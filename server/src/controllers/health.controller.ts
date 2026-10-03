import type { FastifyReply, FastifyRequest } from "fastify"
import type { HealthService } from "../services/health.service.js"

export function createHealthController(healthService: HealthService) {
  return {
    async getHealth(_request: FastifyRequest, reply: FastifyReply) {
      const report = await healthService.check()
      return reply
        .header("cache-control", "no-store")
        .status(report.status === "ok" ? 200 : 503)
        .send(report)
    },
  }
}

export type HealthController = ReturnType<typeof createHealthController>
