-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'LOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GEMINI', 'CLAUDE', 'OPENAI');

-- CreateEnum
CREATE TYPE "ProviderCredentialType" AS ENUM ('API_KEY', 'OAUTH', 'SERVICE_ACCOUNT');

-- CreateEnum
CREATE TYPE "ProviderConnectionStatus" AS ENUM ('PENDING', 'CONNECTED', 'VERIFIED', 'ERROR', 'EXPIRED', 'RATE_LIMITED', 'REVOKED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "ProviderAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "ProviderModelStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'DISABLED');

-- CreateEnum
CREATE TYPE "CapacityAccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CapacityStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'CONSUMED', 'PENDING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CapacitySnapshotSource" AS ENUM ('USER_DECLARED', 'PROVIDER_REPORTED', 'SYSTEM_ESTIMATED');

-- CreateEnum
CREATE TYPE "CapacityReservationStatus" AS ENUM ('HELD', 'RELEASED', 'CONSUMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LedgerDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CAPACITY_CREDIT', 'EXCHANGE_RESERVATION', 'RESERVATION_RELEASE', 'USAGE_DEBIT', 'SETTLEMENT', 'MARKETPLACE_PURCHASE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "PricingVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('INPUT', 'CACHED_INPUT', 'OUTPUT');

-- CreateEnum
CREATE TYPE "ExchangeOfferStatus" AS ENUM ('OPEN', 'MATCHED', 'PROPOSED', 'ACCEPTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ExchangeAgreementStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'ACTIVE', 'SETTLED', 'CANCELLED', 'EXPIRED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'LOW', 'EXHAUSTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "UsageRecordStatus" AS ENUM ('PENDING', 'RECORDED', 'SETTLED', 'FAILED', 'VOID');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('USER_CREATED', 'PROVIDER_CONNECTED', 'PROVIDER_VERIFIED', 'CAPACITY_CONTRIBUTED', 'CAPACITY_RESERVED', 'EC_CREDITED', 'EC_DEBITED', 'OFFER_CREATED', 'AGREEMENT_ACCEPTED', 'ENTITLEMENT_CREATED', 'STUDIO_REQUEST', 'USAGE_RECORDED', 'SETTLEMENT_COMPLETED', 'API_KEY_CREATED', 'API_KEY_REVOKED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'SECURITY', 'PROVIDER', 'CAPACITY', 'EXCHANGE', 'WALLET');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerifiedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderConnection" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "userId" BIGINT NOT NULL,
    "provider" "Provider" NOT NULL,
    "credentialType" "ProviderCredentialType" NOT NULL,
    "encryptedCredentialRef" TEXT,
    "status" "ProviderConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "lastVerifiedAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProviderConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderAccount" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "connectionId" BIGINT NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "displayName" TEXT,
    "status" "ProviderAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProviderAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderModel" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "provider" "Provider" NOT NULL,
    "modelKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" "ProviderModelStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProviderModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacityAccount" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "ownerId" BIGINT NOT NULL,
    "providerAccountId" BIGINT NOT NULL,
    "providerModelId" BIGINT NOT NULL,
    "status" "CapacityAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CapacityAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacitySnapshot" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "capacityAccountId" BIGINT NOT NULL,
    "source" "CapacitySnapshotSource" NOT NULL,
    "observedAt" TIMESTAMPTZ(3) NOT NULL,
    "totalTokens" BIGINT NOT NULL,
    "usedTokens" BIGINT NOT NULL,
    "remainingTokens" BIGINT NOT NULL,
    "windowStart" TIMESTAMPTZ(3),
    "windowEnd" TIMESTAMPTZ(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapacitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacityContribution" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "capacityAccountId" BIGINT NOT NULL,
    "committedTokens" BIGINT NOT NULL,
    "reservedTokens" BIGINT NOT NULL DEFAULT 0,
    "consumedTokens" BIGINT NOT NULL DEFAULT 0,
    "status" "CapacityStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CapacityContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacityReservation" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "contributionId" BIGINT NOT NULL,
    "agreementId" BIGINT,
    "tokens" BIGINT NOT NULL,
    "status" "CapacityReservationStatus" NOT NULL DEFAULT 'HELD',
    "idempotencyKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3),
    "releasedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CapacityReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "userId" BIGINT NOT NULL,
    "balance" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "walletId" BIGINT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "direction" "LedgerDirection" NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "balanceBefore" DECIMAL(20,6) NOT NULL,
    "balanceAfter" DECIMAL(20,6) NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingVersion" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "label" TEXT NOT NULL,
    "status" "PricingVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "source" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMPTZ(3) NOT NULL,
    "effectiveTo" TIMESTAMPTZ(3),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRate" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "pricingVersionId" BIGINT NOT NULL,
    "providerModelId" BIGINT NOT NULL,
    "usageType" "UsageType" NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'standard',
    "usdPerMillionTokens" DECIMAL(20,8) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeOffer" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "makerId" BIGINT NOT NULL,
    "offeredContributionId" BIGINT,
    "offeredModelId" BIGINT NOT NULL,
    "offeredTokens" BIGINT NOT NULL,
    "requestedModelId" BIGINT,
    "requestedTokens" BIGINT,
    "quotedEc" DECIMAL(20,6),
    "status" "ExchangeOfferStatus" NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExchangeOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeAgreement" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "offerId" BIGINT NOT NULL,
    "offerorId" BIGINT NOT NULL,
    "counterpartyId" BIGINT NOT NULL,
    "pricingVersionId" BIGINT,
    "status" "ExchangeAgreementStatus" NOT NULL DEFAULT 'PROPOSED',
    "termsSnapshot" JSONB NOT NULL,
    "proposedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMPTZ(3),
    "activatedAt" TIMESTAMPTZ(3),
    "settledAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExchangeAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "ownerId" BIGINT NOT NULL,
    "agreementId" BIGINT NOT NULL,
    "providerModelId" BIGINT NOT NULL,
    "sourceReservationId" BIGINT,
    "committedTokens" BIGINT NOT NULL,
    "reservedTokens" BIGINT NOT NULL DEFAULT 0,
    "consumedTokens" BIGINT NOT NULL DEFAULT 0,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "userId" BIGINT NOT NULL,
    "projectId" BIGINT,
    "entitlementId" BIGINT,
    "providerModelId" BIGINT NOT NULL,
    "pricingVersionId" BIGINT,
    "requestId" TEXT NOT NULL,
    "inputTokens" BIGINT NOT NULL DEFAULT 0,
    "cachedInputTokens" BIGINT NOT NULL DEFAULT 0,
    "outputTokens" BIGINT NOT NULL DEFAULT 0,
    "totalTokens" BIGINT NOT NULL DEFAULT 0,
    "providerCostUsd" DECIMAL(20,8),
    "ecCost" DECIMAL(20,6),
    "status" "UsageRecordStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "actorId" BIGINT,
    "eventType" "AuditEventType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "requestId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "ownerId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "userId" BIGINT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperApiKey" (
    "id" BIGSERIAL NOT NULL,
    "publicId" VARCHAR(40) NOT NULL,
    "userId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "hashAlgorithm" TEXT NOT NULL,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "lastUsedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeveloperApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderConnection_publicId_key" ON "ProviderConnection"("publicId");

-- CreateIndex
CREATE INDEX "ProviderConnection_userId_provider_idx" ON "ProviderConnection"("userId", "provider");

-- CreateIndex
CREATE INDEX "ProviderConnection_status_idx" ON "ProviderConnection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderAccount_publicId_key" ON "ProviderAccount"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderAccount_connectionId_externalAccountId_key" ON "ProviderAccount"("connectionId", "externalAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderModel_publicId_key" ON "ProviderModel"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderModel_provider_modelKey_key" ON "ProviderModel"("provider", "modelKey");

-- CreateIndex
CREATE UNIQUE INDEX "CapacityAccount_publicId_key" ON "CapacityAccount"("publicId");

-- CreateIndex
CREATE INDEX "CapacityAccount_ownerId_idx" ON "CapacityAccount"("ownerId");

-- CreateIndex
CREATE INDEX "CapacityAccount_providerModelId_idx" ON "CapacityAccount"("providerModelId");

-- CreateIndex
CREATE UNIQUE INDEX "CapacityAccount_providerAccountId_providerModelId_key" ON "CapacityAccount"("providerAccountId", "providerModelId");

-- CreateIndex
CREATE UNIQUE INDEX "CapacitySnapshot_publicId_key" ON "CapacitySnapshot"("publicId");

-- CreateIndex
CREATE INDEX "CapacitySnapshot_capacityAccountId_observedAt_idx" ON "CapacitySnapshot"("capacityAccountId", "observedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CapacityContribution_publicId_key" ON "CapacityContribution"("publicId");

-- CreateIndex
CREATE INDEX "CapacityContribution_capacityAccountId_idx" ON "CapacityContribution"("capacityAccountId");

-- CreateIndex
CREATE INDEX "CapacityContribution_status_expiresAt_idx" ON "CapacityContribution"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CapacityReservation_publicId_key" ON "CapacityReservation"("publicId");

-- CreateIndex
CREATE INDEX "CapacityReservation_agreementId_idx" ON "CapacityReservation"("agreementId");

-- CreateIndex
CREATE INDEX "CapacityReservation_status_expiresAt_idx" ON "CapacityReservation"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CapacityReservation_contributionId_idempotencyKey_key" ON "CapacityReservation"("contributionId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_publicId_key" ON "Wallet"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_publicId_key" ON "WalletTransaction"("publicId");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_referenceType_referenceId_idx" ON "WalletTransaction"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_walletId_idempotencyKey_key" ON "WalletTransaction"("walletId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "PricingVersion_publicId_key" ON "PricingVersion"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingVersion_label_key" ON "PricingVersion"("label");

-- CreateIndex
CREATE INDEX "PricingVersion_status_effectiveFrom_idx" ON "PricingVersion"("status", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "PricingRate_publicId_key" ON "PricingRate"("publicId");

-- CreateIndex
CREATE INDEX "PricingRate_providerModelId_idx" ON "PricingRate"("providerModelId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingRate_pricingVersionId_providerModelId_usageType_tier_key" ON "PricingRate"("pricingVersionId", "providerModelId", "usageType", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeOffer_publicId_key" ON "ExchangeOffer"("publicId");

-- CreateIndex
CREATE INDEX "ExchangeOffer_status_expiresAt_idx" ON "ExchangeOffer"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "ExchangeOffer_makerId_status_idx" ON "ExchangeOffer"("makerId", "status");

-- CreateIndex
CREATE INDEX "ExchangeOffer_offeredModelId_idx" ON "ExchangeOffer"("offeredModelId");

-- CreateIndex
CREATE INDEX "ExchangeOffer_requestedModelId_idx" ON "ExchangeOffer"("requestedModelId");

-- CreateIndex
CREATE INDEX "ExchangeOffer_offeredContributionId_idx" ON "ExchangeOffer"("offeredContributionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeAgreement_publicId_key" ON "ExchangeAgreement"("publicId");

-- CreateIndex
CREATE INDEX "ExchangeAgreement_offerId_idx" ON "ExchangeAgreement"("offerId");

-- CreateIndex
CREATE INDEX "ExchangeAgreement_offerorId_status_idx" ON "ExchangeAgreement"("offerorId", "status");

-- CreateIndex
CREATE INDEX "ExchangeAgreement_counterpartyId_status_idx" ON "ExchangeAgreement"("counterpartyId", "status");

-- CreateIndex
CREATE INDEX "ExchangeAgreement_pricingVersionId_idx" ON "ExchangeAgreement"("pricingVersionId");

-- CreateIndex
CREATE INDEX "ExchangeAgreement_status_expiresAt_idx" ON "ExchangeAgreement"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_publicId_key" ON "Entitlement"("publicId");

-- CreateIndex
CREATE INDEX "Entitlement_ownerId_status_idx" ON "Entitlement"("ownerId", "status");

-- CreateIndex
CREATE INDEX "Entitlement_agreementId_idx" ON "Entitlement"("agreementId");

-- CreateIndex
CREATE INDEX "Entitlement_providerModelId_idx" ON "Entitlement"("providerModelId");

-- CreateIndex
CREATE INDEX "Entitlement_sourceReservationId_idx" ON "Entitlement"("sourceReservationId");

-- CreateIndex
CREATE INDEX "Entitlement_status_expiresAt_idx" ON "Entitlement"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_publicId_key" ON "UsageRecord"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_requestId_key" ON "UsageRecord"("requestId");

-- CreateIndex
CREATE INDEX "UsageRecord_userId_createdAt_idx" ON "UsageRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UsageRecord_projectId_idx" ON "UsageRecord"("projectId");

-- CreateIndex
CREATE INDEX "UsageRecord_entitlementId_idx" ON "UsageRecord"("entitlementId");

-- CreateIndex
CREATE INDEX "UsageRecord_providerModelId_idx" ON "UsageRecord"("providerModelId");

-- CreateIndex
CREATE INDEX "UsageRecord_pricingVersionId_idx" ON "UsageRecord"("pricingVersionId");

-- CreateIndex
CREATE INDEX "UsageRecord_status_idx" ON "UsageRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AuditEvent_publicId_key" ON "AuditEvent"("publicId");

-- CreateIndex
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_createdAt_idx" ON "AuditEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_requestId_idx" ON "AuditEvent"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_publicId_key" ON "Project"("publicId");

-- CreateIndex
CREATE INDEX "Project_ownerId_status_idx" ON "Project"("ownerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_publicId_key" ON "Notification"("publicId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperApiKey_publicId_key" ON "DeveloperApiKey"("publicId");

-- CreateIndex
CREATE INDEX "DeveloperApiKey_userId_idx" ON "DeveloperApiKey"("userId");

-- AddForeignKey
ALTER TABLE "ProviderConnection" ADD CONSTRAINT "ProviderConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderAccount" ADD CONSTRAINT "ProviderAccount_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ProviderConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityAccount" ADD CONSTRAINT "CapacityAccount_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityAccount" ADD CONSTRAINT "CapacityAccount_providerAccountId_fkey" FOREIGN KEY ("providerAccountId") REFERENCES "ProviderAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityAccount" ADD CONSTRAINT "CapacityAccount_providerModelId_fkey" FOREIGN KEY ("providerModelId") REFERENCES "ProviderModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacitySnapshot" ADD CONSTRAINT "CapacitySnapshot_capacityAccountId_fkey" FOREIGN KEY ("capacityAccountId") REFERENCES "CapacityAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityContribution" ADD CONSTRAINT "CapacityContribution_capacityAccountId_fkey" FOREIGN KEY ("capacityAccountId") REFERENCES "CapacityAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityReservation" ADD CONSTRAINT "CapacityReservation_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "CapacityContribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityReservation" ADD CONSTRAINT "CapacityReservation_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ExchangeAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRate" ADD CONSTRAINT "PricingRate_pricingVersionId_fkey" FOREIGN KEY ("pricingVersionId") REFERENCES "PricingVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRate" ADD CONSTRAINT "PricingRate_providerModelId_fkey" FOREIGN KEY ("providerModelId") REFERENCES "ProviderModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeOffer" ADD CONSTRAINT "ExchangeOffer_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeOffer" ADD CONSTRAINT "ExchangeOffer_offeredContributionId_fkey" FOREIGN KEY ("offeredContributionId") REFERENCES "CapacityContribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeOffer" ADD CONSTRAINT "ExchangeOffer_offeredModelId_fkey" FOREIGN KEY ("offeredModelId") REFERENCES "ProviderModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeOffer" ADD CONSTRAINT "ExchangeOffer_requestedModelId_fkey" FOREIGN KEY ("requestedModelId") REFERENCES "ProviderModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeAgreement" ADD CONSTRAINT "ExchangeAgreement_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "ExchangeOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeAgreement" ADD CONSTRAINT "ExchangeAgreement_offerorId_fkey" FOREIGN KEY ("offerorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeAgreement" ADD CONSTRAINT "ExchangeAgreement_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeAgreement" ADD CONSTRAINT "ExchangeAgreement_pricingVersionId_fkey" FOREIGN KEY ("pricingVersionId") REFERENCES "PricingVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ExchangeAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_providerModelId_fkey" FOREIGN KEY ("providerModelId") REFERENCES "ProviderModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_sourceReservationId_fkey" FOREIGN KEY ("sourceReservationId") REFERENCES "CapacityReservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_entitlementId_fkey" FOREIGN KEY ("entitlementId") REFERENCES "Entitlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_providerModelId_fkey" FOREIGN KEY ("providerModelId") REFERENCES "ProviderModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_pricingVersionId_fkey" FOREIGN KEY ("pricingVersionId") REFERENCES "PricingVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperApiKey" ADD CONSTRAINT "DeveloperApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
