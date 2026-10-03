import type {
  AuditEventView,
  EntitlementView,
  PricingVersionView,
  ProjectView,
  ProviderConnectionView,
  ProviderModelView,
  UsageRecordView,
  UserView,
} from "./entities.js"
import type { ProviderId } from "./provider.js"
import type { AuditEventType } from "@prisma/client"

/**
 * Lookup ports the provider/usage/pricing layers depend on. Interfaces only:
 * the existing repositories/services will implement them as each is needed.
 * They return views (public ids), so callers never touch Prisma or internal ids.
 */

export interface UserLookup {
  findByPublicId(id: string): Promise<UserView | null>
}

export interface ProviderConnectionLookup {
  findByPublicId(id: string): Promise<ProviderConnectionView | null>
}

export interface ProviderModelLookup {
  findByPublicId(id: string): Promise<ProviderModelView | null>
  /** Resolve the exact model an adapter reported. */
  findByKey(
    provider: ProviderId,
    modelKey: string,
  ): Promise<ProviderModelView | null>
}

export interface EntitlementLookup {
  findByPublicId(id: string): Promise<EntitlementView | null>
}

export interface UsageRecordLookup {
  findByRequestId(requestId: string): Promise<UsageRecordView | null>
}

export interface PricingVersionLookup {
  findByPublicId(id: string): Promise<PricingVersionView | null>
  /** The version in effect at `at`, if any. */
  findEffectiveAt(at: Date): Promise<PricingVersionView | null>
}

export interface ProjectLookup {
  findByPublicId(id: string): Promise<ProjectView | null>
}

export interface AuditEventInput {
  actorId?: string | null
  eventType: AuditEventType
  entityType: string
  entityId: string
  /** Must not contain secrets, credentials, tokens or raw API keys. */
  metadata?: Record<string, unknown>
  requestId?: string | null
}

/** Append-only: there is intentionally no update/delete. */
export interface AuditEventAppender {
  append(input: AuditEventInput): Promise<AuditEventView>
}
