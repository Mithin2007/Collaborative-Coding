import type {
  AuditEventType,
  EntitlementStatus,
  PricingVersionStatus,
  ProjectStatus,
  ProviderConnectionStatus,
  ProviderCredentialType,
  ProviderModelStatus,
  UsageRecordStatus,
} from "@prisma/client"
import type { PublicUserDto } from "../types/dto.js"
import type { ProviderId } from "./provider.js"

/**
 * Read-side views of the entities the provider/usage/pricing layers look up.
 *
 * Rules: ids are PUBLIC ids (never internal BigInt ids); timestamps are ISO
 * strings; money/decimals are strings; secrets and credential material are
 * never present (e.g. no `encryptedCredentialRef`). Enum types are imported as
 * types only, so this module has no runtime dependency on Prisma.
 */

export type UserView = PublicUserDto

export interface ProviderConnectionView {
  id: string
  userId: string
  provider: ProviderId
  credentialType: ProviderCredentialType
  status: ProviderConnectionStatus
  lastVerifiedAt: string | null
  revokedAt: string | null
}

export interface ProviderModelView {
  id: string
  provider: ProviderId
  /** Exact provider model identifier. */
  modelKey: string
  displayName: string
  status: ProviderModelStatus
}

export interface EntitlementView {
  id: string
  ownerId: string
  agreementId: string
  provider: ProviderId
  modelKey: string
  committedTokens: bigint
  reservedTokens: bigint
  consumedTokens: bigint
  /** committed - reserved - consumed */
  remainingTokens: bigint
  status: EntitlementStatus
  expiresAt: string | null
}

export interface UsageRecordView {
  id: string
  requestId: string
  userId: string
  projectId: string | null
  entitlementId: string | null
  provider: ProviderId
  model: string
  inputTokens: number
  cachedInputTokens: number
  outputTokens: number
  totalTokens: number
  providerCostUsd: string | null
  ecCost: string | null
  pricingVersionId: string | null
  status: UsageRecordStatus
  createdAt: string
}

export interface PricingVersionView {
  id: string
  label: string
  status: PricingVersionStatus
  /** Where the prices came from. */
  source: string
  effectiveFrom: string
  effectiveTo: string | null
}

export interface AuditEventView {
  id: string
  actorId: string | null
  eventType: AuditEventType
  entityType: string
  entityId: string
  metadata: unknown
  requestId: string | null
  createdAt: string
}

export interface ProjectView {
  id: string
  ownerId: string
  name: string
  description: string | null
  status: ProjectStatus
}
