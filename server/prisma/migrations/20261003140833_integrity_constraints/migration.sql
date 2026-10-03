-- ============================================================================
-- Invenzo AI — integrity constraints and append-only protection
--
-- Hand-written companion to the generated `init` migration. Prisma cannot
-- express CHECK constraints or triggers, so they live here, in one place.
--
-- Contents
--   1. CHECK constraints (non-negative quantities, ledger arithmetic,
--      capacity invariants, normalised email, date ordering)
--   2. Append-only protection for "AuditEvent" and "WalletTransaction":
--      row triggers reject UPDATE and DELETE; statement triggers reject
--      TRUNCATE. (Superusers can still disable triggers or drop them — this
--      protects against application bugs and ordinary roles, not a DBA.)
-- ============================================================================

-- ───────────────────────── 1. CHECK constraints ─────────────────────────

-- Identity: emails are stored normalised so the plain UNIQUE index is
-- effectively case-insensitive.
ALTER TABLE "User"
  ADD CONSTRAINT "chk_user_email_lowercase" CHECK ("email" = lower("email"));

-- Provider Capacity Ledger -------------------------------------------------
ALTER TABLE "CapacitySnapshot"
  ADD CONSTRAINT "chk_capacity_snapshot_non_negative"
  CHECK ("totalTokens" >= 0 AND "usedTokens" >= 0 AND "remainingTokens" >= 0);

-- remaining = committed - reserved - consumed must never go negative.
ALTER TABLE "CapacityContribution"
  ADD CONSTRAINT "chk_capacity_contribution_committed_positive" CHECK ("committedTokens" > 0),
  ADD CONSTRAINT "chk_capacity_contribution_non_negative" CHECK ("reservedTokens" >= 0 AND "consumedTokens" >= 0),
  ADD CONSTRAINT "chk_capacity_contribution_no_overcommit"
  CHECK ("reservedTokens" + "consumedTokens" <= "committedTokens");

ALTER TABLE "CapacityReservation"
  ADD CONSTRAINT "chk_capacity_reservation_tokens_positive" CHECK ("tokens" > 0);

-- Entitlements follow the same invariant as capacity contributions.
ALTER TABLE "Entitlement"
  ADD CONSTRAINT "chk_entitlement_committed_positive" CHECK ("committedTokens" > 0),
  ADD CONSTRAINT "chk_entitlement_non_negative" CHECK ("reservedTokens" >= 0 AND "consumedTokens" >= 0),
  ADD CONSTRAINT "chk_entitlement_no_overcommit"
  CHECK ("reservedTokens" + "consumedTokens" <= "committedTokens");

-- EC Wallet Ledger ---------------------------------------------------------
ALTER TABLE "Wallet"
  ADD CONSTRAINT "chk_wallet_balance_non_negative" CHECK ("balance" >= 0);

-- Every row must be internally consistent arithmetic:
--   CREDIT: after = before + amount      DEBIT: after = before - amount
ALTER TABLE "WalletTransaction"
  ADD CONSTRAINT "chk_wallet_tx_amount_positive" CHECK ("amount" > 0),
  ADD CONSTRAINT "chk_wallet_tx_balances_non_negative" CHECK ("balanceBefore" >= 0 AND "balanceAfter" >= 0),
  ADD CONSTRAINT "chk_wallet_tx_balance_arithmetic" CHECK (
    ("direction" = 'CREDIT' AND "balanceAfter" = "balanceBefore" + "amount") OR
    ("direction" = 'DEBIT'  AND "balanceAfter" = "balanceBefore" - "amount")
  ),
  ADD CONSTRAINT "chk_wallet_tx_idempotency_key_not_blank" CHECK (length(btrim("idempotencyKey")) > 0);

-- Pricing ------------------------------------------------------------------
ALTER TABLE "PricingVersion"
  ADD CONSTRAINT "chk_pricing_version_dates"
  CHECK ("effectiveTo" IS NULL OR "effectiveTo" > "effectiveFrom");

ALTER TABLE "PricingRate"
  ADD CONSTRAINT "chk_pricing_rate_non_negative" CHECK ("usdPerMillionTokens" >= 0);

-- Exchange -----------------------------------------------------------------
ALTER TABLE "ExchangeOffer"
  ADD CONSTRAINT "chk_exchange_offer_offered_tokens_positive" CHECK ("offeredTokens" > 0),
  ADD CONSTRAINT "chk_exchange_offer_requested_tokens_positive" CHECK ("requestedTokens" IS NULL OR "requestedTokens" > 0),
  ADD CONSTRAINT "chk_exchange_offer_quote_non_negative" CHECK ("quotedEc" IS NULL OR "quotedEc" >= 0);

-- Usage --------------------------------------------------------------------
ALTER TABLE "UsageRecord"
  ADD CONSTRAINT "chk_usage_tokens_non_negative"
  CHECK ("inputTokens" >= 0 AND "cachedInputTokens" >= 0 AND "outputTokens" >= 0 AND "totalTokens" >= 0),
  ADD CONSTRAINT "chk_usage_costs_non_negative"
  CHECK (("providerCostUsd" IS NULL OR "providerCostUsd" >= 0) AND ("ecCost" IS NULL OR "ecCost" >= 0));

-- ───────────────────── 2. Append-only protection ─────────────────────

CREATE FUNCTION "invenzo_reject_mutation"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% is not allowed on append-only table "%"', TG_OP, TG_TABLE_NAME
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER "trg_audit_event_append_only"
  BEFORE UPDATE OR DELETE ON "AuditEvent"
  FOR EACH ROW EXECUTE FUNCTION "invenzo_reject_mutation"();

CREATE TRIGGER "trg_audit_event_no_truncate"
  BEFORE TRUNCATE ON "AuditEvent"
  FOR EACH STATEMENT EXECUTE FUNCTION "invenzo_reject_mutation"();

CREATE TRIGGER "trg_wallet_transaction_append_only"
  BEFORE UPDATE OR DELETE ON "WalletTransaction"
  FOR EACH ROW EXECUTE FUNCTION "invenzo_reject_mutation"();

CREATE TRIGGER "trg_wallet_transaction_no_truncate"
  BEFORE TRUNCATE ON "WalletTransaction"
  FOR EACH STATEMENT EXECUTE FUNCTION "invenzo_reject_mutation"();
