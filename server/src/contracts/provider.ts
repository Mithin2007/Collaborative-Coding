import type { SealedCredentialRef } from "../services/credentials/credential-vault.js"
import type { ProviderConnectionView } from "./entities.js"
import type { NormalizedUsage } from "./usage.js"

/**
 * PROVIDER-INTEGRATION CONTRACT (types only — no provider is implemented).
 *
 *   Provider Adapter ──▶ NormalizedUsage ──▶ Usage Service ──▶ Pricing Engine
 *
 * The provider layer (Gemini / Claude / OpenAI adapters, owned by the provider
 * workstream) implements `ProviderAdapter`. Everything downstream — usage
 * recording, pricing, entitlement consumption, audit — depends ONLY on these
 * normalized shapes and never on a provider SDK or a provider's raw response.
 */

/** Wire/DB names; kept identical to the Prisma `Provider` enum (a test asserts parity). */
export const PROVIDER_IDS = ["GEMINI", "CLAUDE", "OPENAI"] as const
export type ProviderId = typeof PROVIDER_IDS[number]

export interface ProviderMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ProviderGenerateRequest {
  /**
   * Platform-generated id for THIS request. It is the idempotency key for the
   * resulting UsageRecord (UsageRecord.requestId is unique), so retries must
   * reuse it.
   */
  requestId: string
  /** Exact provider model key (ProviderModel.modelKey), never a marketing alias. */
  model: string
  messages: ProviderMessage[]
  maxOutputTokens?: number
}

export type ProviderFinishReason = "stop" | "length" | "content_filter" | "other"

export interface NormalizedProviderResponse {
  /** Echo of ProviderGenerateRequest.requestId. */
  requestId: string
  provider: ProviderId
  /** Exact model that served the request. */
  model: string
  content: string
  finishReason: ProviderFinishReason
  /** Always present: a response without usage cannot be metered or settled. */
  usage: NormalizedUsage
}

/**
 * Per-call context. Adapters get an OPAQUE credential reference and must
 * resolve the secret through the CredentialVault; raw credentials never appear
 * in contracts, logs or errors.
 */
export interface ProviderCallContext {
  connection: ProviderConnectionView
  credentialRef: SealedCredentialRef
  signal?: AbortSignal
}

export interface DiscoveredProviderAccount {
  externalAccountId: string
  displayName?: string
}

export interface ProviderVerificationResult {
  verified: boolean
  accounts: DiscoveredProviderAccount[]
  /** Exact model keys the credentials can use. */
  modelKeys: string[]
}

export interface ProviderAdapter {
  readonly provider: ProviderId
  /** Check the credentials work and discover accounts/models. No generation, no cost. */
  verifyConnection(
    ctx: ProviderCallContext,
  ): Promise<ProviderVerificationResult>
  /** Run one request and return content plus normalized usage. */
  generate(
    request: ProviderGenerateRequest,
    ctx: ProviderCallContext,
  ): Promise<NormalizedProviderResponse>
}

/** Provider failures normalized so the app can map them to credential/entitlement UI states. */
export const PROVIDER_ERROR_KINDS = [
  "AUTHENTICATION_FAILED",
  "CREDENTIALS_EXPIRED",
  "CREDENTIALS_REVOKED",
  "RATE_LIMITED",
  "QUOTA_EXHAUSTED",
  "MODEL_UNAVAILABLE",
  "INVALID_REQUEST",
  "PROVIDER_UNAVAILABLE",
  "TIMEOUT",
  "UNKNOWN",
] as const
export type ProviderErrorKind = typeof PROVIDER_ERROR_KINDS[number]

/**
 * Thrown by adapters. `message` MUST be sanitized: no credentials, no request
 * bodies, no provider error payloads that could echo secrets.
 */
export class ProviderAdapterError extends Error {
  constructor(
    public readonly kind: ProviderErrorKind,
    message: string,
    public readonly retryable: boolean = false,
  ) {
    super(message)
    this.name = "ProviderAdapterError"
  }
}
