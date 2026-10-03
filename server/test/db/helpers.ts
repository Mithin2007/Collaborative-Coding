import { PrismaClient, type Provider } from "@prisma/client"
import { newPublicId } from "../../src/lib/public-id.js"
import { getTestDatabaseUrl } from "./env.js"

let client: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  client ??= new PrismaClient({ datasourceUrl: getTestDatabaseUrl(), log: [] })
  return client
}

export async function closePrisma(): Promise<void> {
  await client?.$disconnect()
  client = undefined
}

let seq = 0
export const unique = (label: string): string =>
  `${label}-${process.pid}-${Date.now()}-${seq++}`

export function createUser(prisma = getPrisma()) {
  return prisma.user.create({
    data: {
      publicId: newPublicId("user"),
      email: `${unique("user")}@example.test`,
    },
  })
}

export async function createWallet(prisma = getPrisma()) {
  const user = await createUser(prisma)
  const wallet = await prisma.wallet.create({
    data: { publicId: newPublicId("wallet"), userId: user.id },
  })
  return { user, wallet }
}

interface CapacityStackOptions {
  provider?: Provider
  committedTokens?: bigint
}

/** user → connection → provider account → model → capacity account → contribution. */
export async function createCapacityStack(
  opts: CapacityStackOptions = {},
  prisma = getPrisma(),
) {
  const provider = opts.provider ?? "GEMINI"
  const user = await createUser(prisma)
  const connection = await prisma.providerConnection.create({
    data: {
      publicId: newPublicId("providerConnection"),
      userId: user.id,
      provider,
      credentialType: "API_KEY",
    },
  })
  const account = await prisma.providerAccount.create({
    data: {
      publicId: newPublicId("providerAccount"),
      connectionId: connection.id,
      externalAccountId: unique("project"),
    },
  })
  const model = await prisma.providerModel.create({
    data: {
      publicId: newPublicId("providerModel"),
      provider,
      modelKey: unique("model"),
      displayName: "Test model",
    },
  })
  const capacityAccount = await prisma.capacityAccount.create({
    data: {
      publicId: newPublicId("capacityAccount"),
      ownerId: user.id,
      providerAccountId: account.id,
      providerModelId: model.id,
    },
  })
  const contribution = await prisma.capacityContribution.create({
    data: {
      publicId: newPublicId("capacityContribution"),
      capacityAccountId: capacityAccount.id,
      committedTokens: opts.committedTokens ?? 1_000_000n,
    },
  })
  return { user, connection, account, model, capacityAccount, contribution }
}
