import type { FastifyInstance } from "fastify"
import type { HealthController } from "../controllers/health.controller.js"

export function registerHealthRoutes(
  api: FastifyInstance,
  controller: HealthController,
): void {
  api.get("/health", controller.getHealth)
}
