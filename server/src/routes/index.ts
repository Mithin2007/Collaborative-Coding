import type { FastifyInstance } from "fastify"
import type { HealthController } from "../controllers/health.controller.js"
import { registerHealthRoutes } from "./health.routes.js"

export interface RouteDependencies {
  healthController: HealthController
}

/**
 * Route registry. Each future module (auth, providers, capacity, wallet,
 * exchange, …) adds one `registerXRoutes(api, deps)` line here. Everything is
 * mounted under /api.
 */
export function registerRoutes(
  app: FastifyInstance,
  deps: RouteDependencies,
): void {
  app.register(
    async (api) => {
      registerHealthRoutes(api, deps.healthController)
    },
    { prefix: "/api" },
  )
}
