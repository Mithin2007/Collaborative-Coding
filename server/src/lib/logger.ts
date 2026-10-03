import type { Writable } from "node:stream"
import type { Env } from "../config/env.js"

/** Paths pino replaces with "[REDACTED]" if they ever reach a log line. */
export const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  'req.headers["x-api-key"]',
  'res.headers["set-cookie"]',
  "headers.authorization",
  "headers.cookie",
  'headers["x-api-key"]',
  "*.authorization",
  "*.cookie",
  "*.password",
  "*.secret",
  "*.apiKey",
  "*.secretHash",
  "*.encryptedCredentialRef",
]

export function buildLoggerOptions(env: Env, stream?: Writable) {
  return {
    level: env.LOG_LEVEL,
    redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
    ...(stream ? { stream } : {}),
    ...(!stream && env.NODE_ENV === "development"
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:HH:MM:ss.l",
              ignore: "pid,hostname",
            },
          },
        }
      : {}),
  }
}
