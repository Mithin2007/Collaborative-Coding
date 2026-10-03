import type { Provider } from "@prisma/client"
import { NotImplementedError } from "../../lib/errors.js"

/**
 * SERVICE BOUNDARY ONLY (Milestone 1).
 *
 * Provider credentials must never be stored raw or logged. The database stores
 * only an opaque `ProviderConnection.encryptedCredentialRef`; anything that
 * needs the plaintext must go through this interface. The real implementation
 * (envelope encryption, key rotation, KMS/secret-manager integration) is
 * Milestone 2 work. Until then every operation fails loudly rather than
 * silently storing anything.
 */
export interface CredentialContext {
  userPublicId: string
  provider: Provider
}

export interface SealedCredentialRef {
  /** Opaque reference persisted in ProviderConnection.encryptedCredentialRef. */
  readonly ref: string
}

export interface CredentialVault {
  seal(
    plaintext: Buffer,
    context: CredentialContext,
  ): Promise<SealedCredentialRef>
  open(ref: SealedCredentialRef, context: CredentialContext): Promise<Buffer>
  destroy(ref: SealedCredentialRef): Promise<void>
}

export class UnimplementedCredentialVault implements CredentialVault {
  seal(): Promise<SealedCredentialRef> {
    return Promise.reject(new NotImplementedError("Credential vault"))
  }
  open(): Promise<Buffer> {
    return Promise.reject(new NotImplementedError("Credential vault"))
  }
  destroy(): Promise<void> {
    return Promise.reject(new NotImplementedError("Credential vault"))
  }
}
