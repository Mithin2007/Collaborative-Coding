import { PrismaClient, type Prisma } from "@prisma/client"

/** A client or an interactive-transaction client; repositories accept either. */
export type DbClient = PrismaClient | Prisma.TransactionClient

export function createPrismaClient(databaseUrl: string): PrismaClient {
  // Lazy: nothing connects until the first query, so the API can boot (and
  // report database "unavailable" on /api/health) when PostgreSQL is down.
  return new PrismaClient({
    datasourceUrl: databaseUrl,
    // Prisma errors surface as exceptions handled by callers; keep its own
    // stdout logger off so connection details never reach raw stdout.
    log: [],
    errorFormat: "minimal",
  })
}
