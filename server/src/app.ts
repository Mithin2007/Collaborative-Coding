import type { Writable } from "node:stream"
import cors from "@fastify/cors"
import type { PrismaClient } from "@prisma/client"
import Fastify, { LogController, type FastifyInstance } from "fastify"
import type { Env } from "./config/env.js"
import { createHealthController } from "./controllers/health.controller.js"
import { buildLoggerOptions } from "./lib/logger.js"
import { createPrismaClient } from "./lib/prisma.js"
import { registerErrorHandling } from "./middleware/error-handler.js"
import {
  generateRequestId,
  registerRequestContext,
} from "./middleware/request-context.js"
import {
  PrismaHealthRepository,
  type HealthRepository,
} from "./repositories/health.repository.js"
import { registerRoutes } from "./routes/index.js"
import { HealthService } from "./services/health.service.js"

export interface BuildAppOptions {
  env: Env
  /** Provide to share/override the Prisma client (tests). Otherwise one is created and closed with the app. */
  prisma?: PrismaClient
  /** Override the health repository (tests). */
  healthRepository?: HealthRepository
  /** Send logs to a stream instead of stdout (tests). */
  logStream?: Writable
}

export function buildApp(options: BuildAppOptions): FastifyInstance {
  const { env } = options

  const app = Fastify({
    logger: buildLoggerOptions(env, options.logStream),
    genReqId: generateRequestId,
    // Fastify's default incoming/completed lines are replaced by a single
    // structured access-log line (middleware/request-context.ts).
    logController: new LogController({
      disableRequestLogging: true,
      requestIdLogLabel: "requestId",
    }),
    // Don't reflect proxy headers until a trusted-proxy policy exists.
    trustProxy: false,
  })

  const prisma = options.prisma ?? createPrismaClient(env.DATABASE_URL)
  if (!options.prisma) {
    app.addHook("onClose", async () => {
      await prisma.$disconnect()
    })
  }

  registerRequestContext(app)
  registerErrorHandling(app)
  app.register(cors, {
    origin: env.CORS_ORIGINS,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })

  const healthRepository =
    options.healthRepository ?? new PrismaHealthRepository(prisma)
  const healthService = new HealthService(
    healthRepository,
    env.NODE_ENV,
    app.log,
  )

  registerRoutes(app, {
    healthController: createHealthController(healthService),
  })

  return app
}
