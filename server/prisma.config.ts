import path from "node:path"
import { defineConfig } from "prisma/config"
import { config as loadDotenv } from "dotenv"

// Prisma CLI does not auto-load .env when a config file exists. Load the
// repo-root .env explicitly. dotenv never overrides variables that are already
// set, so real environment variables (CI, containers) always win.
loadDotenv({ path: path.resolve(import.meta.dirname, "../.env"), quiet: true })

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
})
