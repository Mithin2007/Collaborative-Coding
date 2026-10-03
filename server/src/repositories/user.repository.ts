import {
  Prisma,
  type User,
  type UserRole,
  type UserStatus,
} from "@prisma/client"
import { ConflictError } from "../lib/errors.js"
import type { DbClient } from "../lib/prisma.js"
import { newPublicId } from "../lib/public-id.js"

export interface CreateUserInput {
  email: string
  name?: string | null
  role?: UserRole
  status?: UserStatus
}

/** Emails are stored trimmed + lower-case (also enforced by a DB CHECK). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export class UserRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreateUserInput): Promise<User> {
    try {
      return await this.db.user.create({
        data: {
          publicId: newPublicId("user"),
          email: normalizeEmail(input.email),
          name: input.name ?? null,
          ...(input.role ? { role: input.role } : {}),
          ...(input.status ? { status: input.status } : {}),
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictError("A user with this email already exists.")
      }
      throw error
    }
  }

  findByPublicId(publicId: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { publicId } })
  }

  findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email: normalizeEmail(email) } })
  }
}
