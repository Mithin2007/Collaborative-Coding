/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the Invenzo API (e.g. http://localhost:4000). When unset the
   * app runs in DEMO MODE and never calls a backend. Never put secrets in
   * VITE_ variables: they are bundled into the browser code.
   */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
