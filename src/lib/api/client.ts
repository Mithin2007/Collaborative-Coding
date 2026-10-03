/**
 * Invenzo API client foundation (Milestone 1).
 *
 * - If VITE_API_BASE_URL is NOT set, the app is in DEMO MODE: no request is
 *   ever made and every existing screen keeps using its in-memory demo data.
 * - If it is set, callers may use `apiRequest`. Nothing in the UI uses it yet.
 */

export interface ApiErrorDetail {
  code: string
  message: string
  requestId: string
  details?: unknown
}

export interface ApiErrorBody {
  error: ApiErrorDetail
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/** Thrown when the backend cannot be reached at all (offline, CORS, DNS, timeout). */
export class ApiUnreachableError extends Error {
  constructor(message = "The Invenzo API is unreachable.") {
    super(message)
    this.name = "ApiUnreachableError"
  }
}

/** Normalised API base URL, or null when running in demo mode. */
export function getApiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim()
  return raw ? raw.replace(/\/+$/, "") : null
}

export function isDemoMode(): boolean {
  return getApiBaseUrl() === null
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  signal?: AbortSignal
  /** Default 5000 ms. */
  timeoutMs?: number
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  const error = (value as ApiErrorBody | null)?.error
  return typeof error?.code === "string" && typeof error?.message === "string"
}

/**
 * Typed JSON request. Rejects with ApiError for non-2xx responses that carry
 * the standard error envelope, and ApiUnreachableError for network failures.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const base = getApiBaseUrl()
  if (base === null) {
    throw new ApiUnreachableError(
      "Demo mode: VITE_API_BASE_URL is not configured.",
    )
  }

  const timeout = AbortSignal.timeout(options.timeoutMs ?? 5000)
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeout])
    : timeout

  let response: Response
  try {
    response = await fetch(
      `${base}${path.startsWith("/") ? path : `/${path}`}`,
      {
        method: options.method ?? "GET",
        headers:
          options.body === undefined
            ? { accept: "application/json" }
            : {
                accept: "application/json",
                "content-type": "application/json",
              },
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        signal,
      },
    )
  } catch {
    throw new ApiUnreachableError()
  }

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      throw new ApiError(
        response.status,
        payload.error.code,
        payload.error.message,
        payload.error.requestId,
      )
    }
    throw new ApiError(
      response.status,
      "HTTP_ERROR",
      `Request failed with status ${response.status}`,
    )
  }
  return payload as T
}
