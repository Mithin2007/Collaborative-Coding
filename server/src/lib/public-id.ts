import { randomBytes } from "node:crypto"

/**
 * Public identifiers are the ONLY identifiers APIs may expose. Internal
 * BigInt primary keys are sequential and must never leave the server.
 *
 * Format: `<prefix>_<22 url-safe base64 chars>` — 128 bits from the OS CSPRNG,
 * so ids are unguessable and carry no ordering or count information. The
 * prefix makes ids self-describing in logs and support requests.
 */
export const PUBLIC_ID_PREFIXES = {
  user: "usr",
  providerConnection: "pcn",
  providerAccount: "pac",
  providerModel: "pmd",
  capacityAccount: "cap",
  capacitySnapshot: "csn",
  capacityContribution: "ccn",
  capacityReservation: "crs",
  wallet: "wal",
  walletTransaction: "wtx",
  pricingVersion: "prv",
  pricingRate: "prt",
  exchangeOffer: "off",
  exchangeAgreement: "agr",
  entitlement: "ent",
  usageRecord: "use",
  auditEvent: "aud",
  project: "prj",
  notification: "ntf",
  developerApiKey: "key",
} as const

export type PublicIdKind = keyof typeof PUBLIC_ID_PREFIXES

const ENTROPY_BYTES = 16
const PUBLIC_ID_PATTERN = /^[a-z]{3}_[A-Za-z0-9_-]{22}$/

export function newPublicId(kind: PublicIdKind): string {
  return `${PUBLIC_ID_PREFIXES[kind]}_${randomBytes(ENTROPY_BYTES).toString("base64url")}`
}

export function isPublicId(value: string, kind?: PublicIdKind): boolean {
  if (!PUBLIC_ID_PATTERN.test(value)) return false
  return kind === undefined || value.startsWith(`${PUBLIC_ID_PREFIXES[kind]}_`)
}
