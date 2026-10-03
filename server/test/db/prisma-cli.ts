import { execFileSync } from "node:child_process"
import { createRequire } from "node:module"
import path from "node:path"

const require = createRequire(import.meta.url)
const SERVER_DIR = path.resolve(import.meta.dirname, "../..")
const PRISMA_BIN = require.resolve("prisma/build/index.js")

interface ExecFailure {
  status?: number
  stdout?: string
  stderr?: string
}

export interface PrismaCliResult {
  status: number
  output: string
}

/** Run the pinned Prisma CLI against `databaseUrl` (never touches DATABASE_URL). */
export function runPrisma(
  args: string[],
  databaseUrl: string,
): PrismaCliResult {
  try {
    const output = execFileSync(process.execPath, [PRISMA_BIN, ...args], {
      cwd: SERVER_DIR,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        PRISMA_HIDE_UPDATE_MESSAGE: "1",
        CI: "1",
      },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
    return { status: 0, output }
  } catch (error) {
    const e = error as ExecFailure
    return {
      status: e.status ?? 1,
      output: `${e.stdout ?? ""}${e.stderr ?? ""}`,
    }
  }
}
