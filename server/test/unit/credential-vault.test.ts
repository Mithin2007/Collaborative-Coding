import { describe, expect, it } from "vitest"
import { UnimplementedCredentialVault } from "../../src/services/credentials/credential-vault.js"

describe("credential vault boundary (Milestone 1)", () => {
  it("fails loudly instead of storing anything", async () => {
    const vault = new UnimplementedCredentialVault()
    await expect(vault.seal()).rejects.toMatchObject({
      code: "NOT_IMPLEMENTED",
      statusCode: 501,
    })
    await expect(vault.open()).rejects.toMatchObject({
      code: "NOT_IMPLEMENTED",
    })
    await expect(vault.destroy()).rejects.toMatchObject({
      code: "NOT_IMPLEMENTED",
    })
  })
})
