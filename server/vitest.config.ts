import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // DB test files share one database and some assert on global state.
    fileParallelism: false,
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["test/unit/**/*.test.ts"],
        },
      },
      {
        // Requires a real PostgreSQL at TEST_DATABASE_URL. Fails loudly (never
        // skips) when it is unavailable. See test/db/global-setup.ts.
        test: {
          name: "db",
          environment: "node",
          include: ["test/db/**/*.test.ts"],
          globalSetup: ["test/db/global-setup.ts"],
          testTimeout: 60_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
})
