import { randomUUID } from "node:crypto"
import type { IncomingMessage } from "node:http"
import type { FastifyInstance } from "fastify"

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{8,64}$/

/** Reuse a well-formed inbound x-request-id; otherwise mint one. */
export function generateRequestId(req: IncomingMessage): string {
  const header = req.headers["x-request-id"]
  const value = Array.isArray(header) ? header[0] : header
  return value !== undefined && SAFE_REQUEST_ID.test(value)
    ? value
    : randomUUID()
}

/**
 * Echo the request id and emit ONE structured access-log line per request:
 * requestId (bound by Fastify), method, path, status, durationMs.
 * Query strings, headers and bodies are deliberately never logged.
 */
export function registerRequestContext(app: FastifyInstance): void {
  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-request-id", request.id)
  })

  app.addHook("onResponse", async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        path: request.url.split("?")[0],
        status: reply.statusCode,
        durationMs: Math.round(reply.elapsedTime * 100) / 100,
      },
      "request completed",
    )
  })
}
