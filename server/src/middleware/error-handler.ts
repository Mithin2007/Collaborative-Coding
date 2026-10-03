import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { ZodError } from "zod"
import { AppError } from "../lib/errors.js"

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    requestId: string
    details?: unknown
  }
}

const CLIENT_ERROR_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  405: "METHOD_NOT_ALLOWED",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  415: "UNSUPPORTED_MEDIA_TYPE",
  429: "RATE_LIMITED",
}

function body(
  code: string,
  message: string,
  requestId: string,
  details?: unknown,
): ApiErrorBody {
  return {
    error: {
      code,
      message,
      requestId,
      ...(details === undefined ? {} : { details }),
    },
  }
}

/**
 * Single place where errors become HTTP responses. Stack traces and raw error
 * messages of unexpected (5xx) errors are NEVER sent to clients — in any
 * environment — only logged server-side with the request id.
 */
export function registerErrorHandling(app: FastifyInstance): void {
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply
      .status(404)
      .send(
        body(
          "NOT_FOUND",
          `Route ${request.method} ${request.url.split("?")[0]} not found`,
          request.id,
        ),
      )
  })

  app.setErrorHandler(
    (error: unknown, request: FastifyRequest, reply: FastifyReply) => {
      if (error instanceof ZodError) {
        const details = error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }))
        return reply
          .status(400)
          .send(
            body(
              "VALIDATION_ERROR",
              "Request validation failed",
              request.id,
              details,
            ),
          )
      }

      if (error instanceof AppError) {
        if (error.statusCode >= 500)
          request.log.error({ err: error }, "application error")
        return reply
          .status(error.statusCode)
          .send(body(error.code, error.message, request.id, error.details))
      }

      // Fastify's own 4xx errors (malformed JSON, payload too large, …) carry
      // client-safe messages and a statusCode.
      const statusCode = (error as { statusCode?: unknown }).statusCode
      if (
        typeof statusCode === "number" &&
        statusCode >= 400 &&
        statusCode < 500
      ) {
        const message = error instanceof Error ? error.message : "Bad request"
        return reply
          .status(statusCode)
          .send(
            body(
              CLIENT_ERROR_CODES[statusCode] ?? "CLIENT_ERROR",
              message,
              request.id,
            ),
          )
      }

      request.log.error({ err: error }, "unhandled error")
      return reply
        .status(500)
        .send(
          body("INTERNAL_ERROR", "An unexpected error occurred.", request.id),
        )
    },
  )
}
