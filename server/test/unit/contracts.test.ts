import { Provider, UsageType } from "@prisma/client"
import { describe, expect, it } from "vitest"
import {
  PROVIDER_ERROR_KINDS,
  PROVIDER_IDS,
  ProviderAdapterError,
  USAGE_TYPES,
  normalizedUsageSchema,
  parseNormalizedUsage,
  type NormalizedUsage,
  type ProviderAdapter,
} from "../../src/contracts/index.js"

const valid: NormalizedUsage = {
  provider: "GEMINI",
  model: "example-model-key",
  requestId: "req_0123456789",
  inputTokens: 100,
  cachedInputTokens: 40,
  outputTokens: 20,
  totalTokens: 160,
}

describe("provider-integration contracts", () => {
  it("stay in lock-step with the database enums", () => {
    expect([...PROVIDER_IDS].sort()).toEqual(Object.values(Provider).sort())
    expect([...USAGE_TYPES].sort()).toEqual(Object.values(UsageType).sort())
  })

  it("accepts a valid normalized usage, with the optional provider request id", () => {
    expect(parseNormalizedUsage(valid)).toEqual(valid)
    expect(
      normalizedUsageSchema.safeParse({ ...valid, providerRequestId: "resp-1" })
        .success,
    ).toBe(true)
  })

  it.each([
    ["negative tokens", { inputTokens: -1, totalTokens: 59 }],
    ["fractional tokens", { outputTokens: 20.5, totalTokens: 160.5 }],
    ["total that does not add up", { totalTokens: 161 }],
    ["unknown provider", { provider: "DEEPSEEK" }],
    ["empty model", { model: "" }],
    ["empty request id", { requestId: "" }],
    ["unexpected extra field (e.g. a raw payload)", { rawResponse: {} }],
  ])("rejects %s", (_name, patch) => {
    expect(
      normalizedUsageSchema.safeParse({ ...valid, ...patch }).success,
    ).toBe(false)
  })

  it("rejects missing token buckets instead of defaulting them", () => {
    const { cachedInputTokens: _omit, ...partial } = valid
    expect(normalizedUsageSchema.safeParse(partial).success).toBe(false)
  })

  it("lets a (fake) adapter be typed against the contract without any provider code", async () => {
    const fake: ProviderAdapter = {
      provider: "OPENAI",
      verifyConnection: async () => ({
        verified: false,
        accounts: [],
        modelKeys: [],
      }),
      generate: async (request) => ({
        requestId: request.requestId,
        provider: "OPENAI",
        model: request.model,
        content: "",
        finishReason: "stop",
        usage: { ...valid, provider: "OPENAI", requestId: request.requestId },
      }),
    }
    const res = await fake.generate(
      { requestId: "req_abcdefghij", model: "m", messages: [] },
      {} as never,
    )
    expect(parseNormalizedUsage(res.usage).requestId).toBe("req_abcdefghij")
  })

  it("ProviderAdapterError carries a normalized kind and retryability", () => {
    const error = new ProviderAdapterError("RATE_LIMITED", "slow down", true)
    expect(error).toMatchObject({
      kind: "RATE_LIMITED",
      retryable: true,
      name: "ProviderAdapterError",
    })
    expect(PROVIDER_ERROR_KINDS).toContain(error.kind)
    expect(new ProviderAdapterError("UNKNOWN", "x").retryable).toBe(false)
  })
})
