import { Prisma } from "@prisma/client"
import { afterAll, describe, expect, it } from "vitest"
import { newPublicId } from "../../src/lib/public-id.js"
import { closePrisma, createWallet, getPrisma, unique } from "./helpers.js"

afterAll(closePrisma)

const credit = (
  walletId: bigint,
  key: string,
  amount = "10",
  before = "0",
  after = "10",
) =>
  getPrisma().walletTransaction.create({
    data: {
      publicId: newPublicId("walletTransaction"),
      walletId,
      type: "CAPACITY_CREDIT",
      direction: "CREDIT",
      amount: new Prisma.Decimal(amount),
      balanceBefore: new Prisma.Decimal(before),
      balanceAfter: new Prisma.Decimal(after),
      referenceType: "CapacityContribution",
      referenceId: "ccn_example",
      idempotencyKey: key,
      metadata: { note: "test" },
    },
  })

describe("EC wallet ledger", () => {
  it("records a transaction with before/after balances, reference and metadata", async () => {
    const { wallet } = await createWallet()
    const tx = await credit(wallet.id, unique("k"))
    expect(tx.balanceBefore.toString()).toBe("0")
    expect(tx.balanceAfter.toString()).toBe("10")
    expect(tx).toMatchObject({
      referenceType: "CapacityContribution",
      referenceId: "ccn_example",
    })
  })

  it("enforces idempotency: same key on the same wallet is rejected (unique violation)", async () => {
    const { wallet } = await createWallet()
    const key = unique("idem")
    await credit(wallet.id, key)
    await expect(credit(wallet.id, key)).rejects.toMatchObject({
      code: "P2002",
    })
    expect(
      await getPrisma().walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ).toBe(1)
  })

  it("scopes idempotency keys per wallet", async () => {
    const a = await createWallet()
    const b = await createWallet()
    const key = unique("shared")
    await expect(
      Promise.all([credit(a.wallet.id, key), credit(b.wallet.id, key)]),
    ).resolves.toHaveLength(2)
  })

  it("prevents double application under concurrency: exactly one of N racing requests wins", async () => {
    const { wallet } = await createWallet()
    const key = unique("race")
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => credit(wallet.id, key)),
    )
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1)
    expect(
      await getPrisma().walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ).toBe(1)
  })

  it("rejects ledger rows whose arithmetic does not add up", async () => {
    const { wallet } = await createWallet()
    await expect(
      credit(wallet.id, unique("bad"), "10", "0", "11"),
    ).rejects.toThrow(/chk_wallet_tx_balance_arithmetic/)
    await expect(
      getPrisma().walletTransaction.create({
        data: {
          publicId: newPublicId("walletTransaction"),
          walletId: wallet.id,
          type: "USAGE_DEBIT",
          direction: "DEBIT",
          amount: new Prisma.Decimal("5"),
          balanceBefore: new Prisma.Decimal("3"),
          balanceAfter: new Prisma.Decimal("-2"),
          idempotencyKey: unique("overdraft"),
        },
      }),
    ).rejects.toThrow(
      /chk_wallet_tx_(balances_non_negative|balance_arithmetic)/,
    )
  })

  it("rejects non-positive amounts, blank idempotency keys, and negative wallet balances", async () => {
    const { wallet } = await createWallet()
    await expect(
      credit(wallet.id, unique("zero"), "0", "5", "5"),
    ).rejects.toThrow(/chk_wallet_tx_amount_positive/)
    await expect(credit(wallet.id, "   ")).rejects.toThrow(
      /chk_wallet_tx_idempotency_key_not_blank/,
    )
    await expect(
      getPrisma().wallet.update({
        where: { id: wallet.id },
        data: { balance: new Prisma.Decimal("-0.000001") },
      }),
    ).rejects.toThrow(/chk_wallet_balance_non_negative/)
  })

  it("transactions are immutable: UPDATE, DELETE and TRUNCATE are rejected", async () => {
    const { wallet } = await createWallet()
    const tx = await credit(wallet.id, unique("imm"))
    await expect(
      getPrisma().walletTransaction.update({
        where: { id: tx.id },
        data: { amount: new Prisma.Decimal("999") },
      }),
    ).rejects.toThrow(/append-only/)
    await expect(
      getPrisma().walletTransaction.delete({ where: { id: tx.id } }),
    ).rejects.toThrow(/append-only/)
    await expect(
      getPrisma().$executeRawUnsafe(`TRUNCATE TABLE "WalletTransaction"`),
    ).rejects.toThrow(/append-only/)
  })

  it("documents the safe mutation pattern: lock + insert + balance update in ONE transaction", async () => {
    const { wallet } = await createWallet()
    await getPrisma().$transaction(async (tx) => {
      const [locked] = await tx.$queryRaw<{
        balance: Prisma.Decimal
      }[]>`SELECT balance FROM "Wallet" WHERE id = ${wallet.id} FOR UPDATE`
      const before = locked!.balance
      const after = before.add(25)
      await tx.walletTransaction.create({
        data: {
          publicId: newPublicId("walletTransaction"),
          walletId: wallet.id,
          type: "ADJUSTMENT",
          direction: "CREDIT",
          amount: new Prisma.Decimal(25),
          balanceBefore: before,
          balanceAfter: after,
          idempotencyKey: unique("tx"),
        },
      })
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: after, version: { increment: 1 } },
      })
    })
    const reloaded = await getPrisma().wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    })
    expect(reloaded.balance.toString()).toBe("25")
    expect(reloaded.version).toBe(1)
  })
})
