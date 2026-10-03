import { z } from "zod"
import { PROVIDER_IDS, type ProviderId } from "./provider.js"
import type { ProjectView, UsageRecordView } from "./entities.js"

export const USAGE_TYPES = ["INPUT", "CACHED_INPUT", "OUTPUT"] as const
/** Same vocabulary as the Prisma `UsageType` enum (a test asserts parity). */
export type UsageTypeId = typeof USAGE_TYPES[number]

/**
 * Normalized usage for ONE provider request. This is the only usage shape that
 * crosses the Provider Adapter → Usage Service / Pricing Engine boundary.
 *
 * Counting convention (adapters MUST normalize to it, because pricing prices
 * each bucket separately and any overlap would double-bill):
 *  - inputTokens        input tokens billed at the normal input rate
 *                       (EXCLUDING cached tokens)
 *  - cachedInputTokens  input tokens served from the provider's prompt cache
 *  - outputTokens       everything billed as output (including any provider
 *                       "reasoning/thinking" tokens)
 *  - totalTokens        inputTokens + cachedInputTokens + outputTokens
 *
 * Per-request counts are JS safe integers; aggregate ledger quantities in the
 * database are BigInt.
 */
export interface NormalizedUsage {
  provider: ProviderId
  /** Exact provider model key (ProviderModel.modelKey). */
  model: string
  /** Platform request id; becomes UsageRecord.requestId (unique, idempotent). */
  requestId: string
  /** The provider's own request/response id, for support tracing. */
  providerRequestId?: string
  inputTokens: number
  cachedInputTokens: number
  outputTokens: number
  totalTokens: number
}

const tokenCount = z.number().int().nonnegative()

/** Runtime validation for adapter output: adapters are an integration boundary. */
export const normalizedUsageSchema: z.ZodType<NormalizedUsage> = z
  .object({
    provider: z.enum(PROVIDER_IDS),
    model: z.string().min(1),
    requestId: z.string().min(1),
    providerRequestId: z.string().min(1).optional(),
    inputTokens: tokenCount,
    cachedInputTokens: tokenCount,
    outputTokens: tokenCount,
    totalTokens: tokenCount,
  })
  .strict()
  .refine(
    (u) =>
      u.totalTokens === u.inputTokens + u.cachedInputTokens + u.outputTokens,
    {
      path: ["totalTokens"],
      message:
        "totalTokens must equal inputTokens + cachedInputTokens + outputTokens",
    },
  )

export function parseNormalizedUsage(input: unknown): NormalizedUsage {
  return normalizedUsageSchema.parse(input)
}

// ───────────── Usage Service / Pricing Engine boundary (types only) ─────────────
// Decimal values are strings so no money value is ever a JS float.

export interface ProviderCostLine {
  usageType: UsageTypeId
  tokens: number
  /** PricingRate.usdPerMillionTokens that applied. */
  usdPerMillionTokens: string
  costUsd: string
  pricingRateId: string
}

/** Step 1: actual usage → provider USD cost, using PricingRate. */
export interface ProviderCostBreakdown {
  pricingVersionId: string
  tier: string
  lines: ProviderCostLine[]
  providerCostUsd: string
}

/** Step 2: provider USD cost → EC cost. */
export interface EcCostResult {
  ecCost: string
}

export interface PricingEngine {
  /** Price `usage` with the PricingVersion effective at `at`. */
  computeProviderCost(
    usage: NormalizedUsage,
    at: Date,
  ): Promise<ProviderCostBreakdown>
  /** Convert a provider USD cost to EC (EC conversion is separate from PricingRate). */
  convertToEc(cost: ProviderCostBreakdown, at: Date): Promise<EcCostResult>
}

export interface RecordUsageInput {
  usage: NormalizedUsage
  userId: string
  projectId?: ProjectView["id"]
  entitlementId?: string
}

export interface UsageRecorder {
  /** Idempotent on usage.requestId. */
  recordUsage(input: RecordUsageInput): Promise<UsageRecordView>
}
