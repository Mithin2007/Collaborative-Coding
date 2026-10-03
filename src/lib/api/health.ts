import {
  ApiError,
  ApiUnreachableError,
  apiRequest,
  getApiBaseUrl,
} from "./client"

export interface HealthResponse {
  status: "ok" | "degraded"
  service: "invenzo-api"
  environment: "development" | "test" | "production"
  database: "connected" | "unavailable"
  timestamp: string
}

/**
 * Honest backend status. Never reports success it did not observe.
 *  - demo:        VITE_API_BASE_URL not set; no request made.
 *  - connected:   API answered 200 and its database is connected.
 *  - degraded:    API answered but reports its database unavailable (HTTP 503).
 *  - unreachable: API could not be reached or answered unexpectedly.
 */
export interface DemoStatus {
  mode: "demo"
}

export interface ConnectedStatus {
  mode: "connected"
  health: HealthResponse
}

export interface DegradedStatus {
  mode: "degraded"
  health: HealthResponse | null
}

export interface UnreachableStatus {
  mode: "unreachable"
  reason: string
}

export type BackendStatus = DemoStatus | ConnectedStatus | DegradedStatus | UnreachableStatus

export function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/api/health", signal ? { signal } : {})
}

export async function getBackendStatus(
  signal?: AbortSignal,
): Promise<BackendStatus> {
  if (getApiBaseUrl() === null) return { mode: "demo" }

  try {
    const health = await fetchHealth(signal)
    return health.database === "connected"
      ? { mode: "connected", health }
      : { mode: "degraded", health }
  } catch (error) {
    if (error instanceof ApiError) {
      // The 503 health body is not the error envelope, so it surfaces here.
      return error.status === 503
        ? { mode: "degraded", health: null }
        : {
            mode: "unreachable",
            reason: `${error.code} (HTTP ${error.status})`,
          }
    }
    if (error instanceof ApiUnreachableError)
      return { mode: "unreachable", reason: error.message }
    return {
      mode: "unreachable",
      reason: "Unexpected error while contacting the API.",
    }
  }
}
