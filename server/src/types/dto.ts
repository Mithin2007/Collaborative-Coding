import type { User } from "@prisma/client"

/**
 * API-facing shapes. Mapping DB rows through these guarantees internal
 * BigInt ids (and fields that must stay server-side) never leak, and that
 * BigInt values never hit JSON.stringify.
 */
export interface PublicUserDto {
  id: string
  email: string
  name: string | null
  role: User["role"]
  status: User["status"]
  createdAt: string
}

export function toPublicUser(user: User): PublicUserDto {
  return {
    id: user.publicId,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  }
}
