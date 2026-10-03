import { Prisma } from "@prisma/client"
import { afterAll, describe, expect, it } from "vitest"
import { newPublicId } from "../../src/lib/public-id.js"
import {
  closePrisma,
  createCapacityStack,
  getPrisma,
  unique,
} from "./helpers.js"

afterAll(closePrisma)

describe("pricing & usage foundations", () => {
  it("ships with NO seeded pricing or usage data", async () => {
    // Other test files may create rows; seed data would exist before any test ran.
    const names = await getPrisma().$queryRaw<{
      n: bigint
    }[]>`SELECT count(*) AS n FROM "PricingVersion" WHERE source NOT LIKE 'test:%'`
    expect(names[0]?.n).toBe(0n)
  })

  it("keeps INPUT / CACHED_INPUT / OUTPUT as separate rates per exact model + tier, uniquely", async () => {
    const s = await createCapacityStack()
    const version = await getPrisma().pricingVersion.create({
      data: {
        publicId: newPublicId("pricingVersion"),
        label: unique("v"),
        source: "test:fixture",
        effectiveFrom: new Date("2030-01-01"),
      },
    })
    const rate = (
      usageType: "INPUT" | "CACHED_INPUT" | "OUTPUT",
      usd: string,
      tier = "standard",
    ) =>
      getPrisma().pricingRate.create({
        data: {
          publicId: newPublicId("pricingRate"),
          pricingVersionId: version.id,
          providerModelId: s.model.id,
          usageType,
          tier,
          usdPerMillionTokens: new Prisma.Decimal(usd),
        },
      })
    await rate("INPUT", "1.5")
    await rate("CACHED_INPUT", "0.15")
    await rate("OUTPUT", "6")
    await rate("INPUT", "3", "long-context")
    await expect(rate("INPUT", "9")).rejects.toMatchObject({ code: "P2002" })
    await expect(rate("OUTPUT", "-1", "weird")).rejects.toThrow(
      /chk_pricing_rate_non_negative/,
    )
    expect(
      await getPrisma().pricingRate.count({
        where: { pricingVersionId: version.id },
      }),
    ).toBe(4)
  })

  it("preserves the provider USD price exactly (8 decimals) and has no EC price column", async () => {
    const s = await createCapacityStack()
    const version = await getPrisma().pricingVersion.create({
      data: {
        publicId: newPublicId("pricingVersion"),
        label: unique("usd"),
        source: "test:fixture",
        effectiveFrom: new Date("2030-01-01"),
      },
    })
    // Synthetic, obviously-not-real value: proves exact decimal storage.
    const fixture = "1234.56789012"
    const rate = await getPrisma().pricingRate.create({
      data: {
        publicId: newPublicId("pricingRate"),
        pricingVersionId: version.id,
        providerModelId: s.model.id,
        usageType: "CACHED_INPUT",
        usdPerMillionTokens: new Prisma.Decimal(fixture),
      },
    })
    const reloaded = await getPrisma().pricingRate.findUniqueOrThrow({
      where: { id: rate.id },
    })
    expect(reloaded.usdPerMillionTokens.toFixed(8)).toBe("1234.56789012")

    const columns = await getPrisma().$queryRaw<{
      column_name: string
    }[]>`SELECT column_name FROM information_schema.columns WHERE table_name = 'PricingRate'`
    const names = columns.map((c) => c.column_name)
    expect(names).toContain("usdPerMillionTokens")
    expect(names.some((n) => /^ec/i.test(n))).toBe(false)
  })

  it("rejects pricing versions whose effectiveTo is not after effectiveFrom", async () => {
    await expect(
      getPrisma().pricingVersion.create({
        data: {
          publicId: newPublicId("pricingVersion"),
          label: unique("bad"),
          source: "test:fixture",
          effectiveFrom: new Date("2030-02-01"),
          effectiveTo: new Date("2030-01-01"),
        },
      }),
    ).rejects.toThrow(/chk_pricing_version_dates/)
  })

  it("usage records keep provider/model identity, split token types, and a unique requestId", async () => {
    const s = await createCapacityStack({ provider: "OPENAI" })
    const base = { userId: s.user.id, providerModelId: s.model.id }
    const requestId = unique("req")
    const row = await getPrisma().usageRecord.create({
      data: {
        publicId: newPublicId("usageRecord"),
        ...base,
        requestId,
        inputTokens: 100n,
        cachedInputTokens: 40n,
        outputTokens: 20n,
        totalTokens: 160n,
      },
    })
    const loaded = await getPrisma().usageRecord.findUniqueOrThrow({
      where: { id: row.id },
      include: { providerModel: true },
    })
    expect(loaded.providerModel.provider).toBe("OPENAI")
    expect([
      loaded.inputTokens,
      loaded.cachedInputTokens,
      loaded.outputTokens,
    ]).toEqual([100n, 40n, 20n])
    await expect(
      getPrisma().usageRecord.create({
        data: { publicId: newPublicId("usageRecord"), ...base, requestId },
      }),
    ).rejects.toMatchObject({ code: "P2002" })
    await expect(
      getPrisma().usageRecord.create({
        data: {
          publicId: newPublicId("usageRecord"),
          ...base,
          requestId: unique("neg"),
          outputTokens: -1n,
        },
      }),
    ).rejects.toThrow(/chk_usage_tokens_non_negative/)
  })
})
