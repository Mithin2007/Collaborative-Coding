import type { PrismaClient } from "@prisma/client"

export interface HealthRepository {
  /** Resolves if the database answers a trivial query; rejects otherwise. */
  ping(timeoutMs: number): Promise<void>
}

export class PrismaHealthRepository implements HealthRepository {
  constructor(private readonly db: PrismaClient) {}

  async ping(timeoutMs: number): Promise<void> {
    let timer: NodeJS.Timeout | undefined
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`database ping timed out after ${timeoutMs}ms`)),
        timeoutMs,
      )
    })
    try {
      await Promise.race([this.db.$queryRaw`SELECT 1`, timeout])
    } finally {
      clearTimeout(timer)
    }
  }
}
