import { afterAll, describe, expect, it } from "vitest"
import { newPublicId } from "../../src/lib/public-id.js"
import {
  closePrisma,
  createCapacityStack,
  getPrisma,
  unique,
} from "./helpers.js"

afterAll(closePrisma)

describe("Provider Capacity Ledger", () => {
  it("is provider/model specific: contribution → capacity account → provider account + exact model", async () => {
    const s = await createCapacityStack({ provider: "CLAUDE" })
    const loaded = await getPrisma().capacityContribution.findUniqueOrThrow({
      where: { id: s.contribution.id },
      include: {
        capacityAccount: {
          include: { providerModel: true, providerAccount: true },
        },
      },
    })
    expect(loaded.capacityAccount.providerModel.provider).toBe("CLAUDE")
    expect(loaded.capacityAccount.providerAccount.id).toBe(s.account.id)
    expect(loaded.committedTokens).toBe(1_000_000n) // BigInt, integer-safe
  })

  it("stores token counts beyond 2^53 exactly (no floating point)", async () => {
    const huge = 9_007_199_254_740_993n // 2^53 + 1 is not representable as a double
    const s = await createCapacityStack({ committedTokens: huge })
    const row = await getPrisma().capacityContribution.findUniqueOrThrow({
      where: { id: s.contribution.id },
    })
    expect(row.committedTokens).toBe(huge)
  })

  it("accepts reserved + consumed up to committed, and rejects over-commitment", async () => {
    const s = await createCapacityStack({ committedTokens: 1000n })
    const update = (reserved: bigint, consumed: bigint) =>
      getPrisma().capacityContribution.update({
        where: { id: s.contribution.id },
        data: { reservedTokens: reserved, consumedTokens: consumed },
      })
    await expect(update(600n, 400n)).resolves.toMatchObject({
      reservedTokens: 600n,
      consumedTokens: 400n,
    })
    await expect(update(600n, 401n)).rejects.toThrow(
      /chk_capacity_contribution_no_overcommit/,
    )
    await expect(update(1001n, 0n)).rejects.toThrow(
      /chk_capacity_contribution_no_overcommit/,
    )
  })

  it("rejects negative quantities and non-positive commitments", async () => {
    const s = await createCapacityStack({ committedTokens: 1000n })
    await expect(
      getPrisma().capacityContribution.update({
        where: { id: s.contribution.id },
        data: { reservedTokens: -1n },
      }),
    ).rejects.toThrow(/chk_capacity_contribution_non_negative/)
    await expect(
      getPrisma().capacityContribution.create({
        data: {
          publicId: newPublicId("capacityContribution"),
          capacityAccountId: s.capacityAccount.id,
          committedTokens: 0n,
        },
      }),
    ).rejects.toThrow(/chk_capacity_contribution_committed_positive/)
  })

  it("enforces reservation positivity and per-contribution idempotency", async () => {
    const s = await createCapacityStack({ committedTokens: 1000n })
    const reserve = (tokens: bigint, key: string) =>
      getPrisma().capacityReservation.create({
        data: {
          publicId: newPublicId("capacityReservation"),
          contributionId: s.contribution.id,
          tokens,
          idempotencyKey: key,
        },
      })
    const key = unique("rsv")
    await reserve(100n, key)
    await expect(reserve(100n, key)).rejects.toMatchObject({ code: "P2002" })
    await expect(reserve(0n, unique("zero"))).rejects.toThrow(
      /chk_capacity_reservation_tokens_positive/,
    )
  })

  it("applies the same invariants to entitlements", async () => {
    const s = await createCapacityStack()
    const offeree = await getPrisma().user.create({
      data: {
        publicId: newPublicId("user"),
        email: `${unique("o")}@example.test`,
      },
    })
    const offer = await getPrisma().exchangeOffer.create({
      data: {
        publicId: newPublicId("exchangeOffer"),
        makerId: s.user.id,
        offeredModelId: s.model.id,
        offeredTokens: 100n,
      },
    })
    const agreement = await getPrisma().exchangeAgreement.create({
      data: {
        publicId: newPublicId("exchangeAgreement"),
        offerId: offer.id,
        offerorId: s.user.id,
        counterpartyId: offeree.id,
        termsSnapshot: { tokens: "100" },
      },
    })
    const base = {
      publicId: newPublicId("entitlement"),
      ownerId: offeree.id,
      agreementId: agreement.id,
      providerModelId: s.model.id,
    }
    await expect(
      getPrisma().entitlement.create({
        data: {
          ...base,
          committedTokens: 100n,
          reservedTokens: 60n,
          consumedTokens: 50n,
        },
      }),
    ).rejects.toThrow(/chk_entitlement_no_overcommit/)
    await expect(
      getPrisma().entitlement.create({
        data: {
          ...base,
          publicId: newPublicId("entitlement"),
          committedTokens: 100n,
          reservedTokens: 60n,
          consumedTokens: 40n,
        },
      }),
    ).resolves.toMatchObject({ status: "ACTIVE" })
  })

  it("rejects negative snapshots, and one capacity account per provider account + model", async () => {
    const s = await createCapacityStack()
    await expect(
      getPrisma().capacitySnapshot.create({
        data: {
          publicId: newPublicId("capacitySnapshot"),
          capacityAccountId: s.capacityAccount.id,
          source: "USER_DECLARED",
          observedAt: new Date(),
          totalTokens: 10n,
          usedTokens: -1n,
          remainingTokens: 11n,
        },
      }),
    ).rejects.toThrow(/chk_capacity_snapshot_non_negative/)
    await expect(
      getPrisma().capacityAccount.create({
        data: {
          publicId: newPublicId("capacityAccount"),
          ownerId: s.user.id,
          providerAccountId: s.account.id,
          providerModelId: s.model.id,
        },
      }),
    ).rejects.toMatchObject({ code: "P2002" })
  })
})
