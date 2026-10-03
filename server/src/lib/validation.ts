import type { z } from "zod"

/**
 * Parse untrusted input with a Zod schema. Throws a ZodError on failure, which
 * the central error handler converts to a 400 VALIDATION_ERROR response.
 * Frontend validation is UX; this is the security boundary.
 */
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
): z.output<S> {
  return schema.parse(input)
}
