/**
 * Application error with a stable machine-readable `code`. The central error
 * handler turns these into the single API error envelope:
 *   { "error": { "code", "message", "requestId" } }
 * `message` is shown to API clients, so it must never contain secrets,
 * connection strings, or internal details.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class NotImplementedError extends AppError {
  constructor(what: string) {
    super("NOT_IMPLEMENTED", `${what} is not implemented yet.`, 501)
    this.name = "NotImplementedError"
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message, 409)
    this.name = "ConflictError"
  }
}
