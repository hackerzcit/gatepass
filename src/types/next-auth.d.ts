import NextAuth, { DefaultSession } from "next-auth"
import { JWT as NextAuthJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique identifier */
      userId: string
      /** Admin ID from backend */
      adminId?: string
      /** The user's name */
      name?: string | null
      /** The user's email address */
      email?: string | null
      /** The user's role */
      role: string
      /** When the user was created */
      createdAt?: string
      /** Code block allocated to this admin (range_start, range_end, current_value) */
      codeBlock?: { id: string; admin_id: string; range_start: number; range_end: number; current_value: number; updated_at: string }
    } & DefaultSession["user"]
    error?: string
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    userId?: string
    adminId?: string
    name?: string | null
    email?: string | null
    role?: string
    createdAt?: string
    codeBlock?: { id: string; admin_id: string; range_start: number; range_end: number; current_value: number; updated_at: string }
    accessToken?: string
    refreshToken?: string
  }

  /**
   * Usually contains information about the provider being used
   * and also extends `TokenSet`, which is different tokens returned by OAuth Providers.
   */
  interface Account {
    provider: string
    type: string
    id: string
    accessToken?: string
    refreshToken?: string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends NextAuthJWT {
    id?: string
    adminId?: string
    name?: string | null
    email?: string | null
    role?: string
    createdAt?: string
    codeBlock?: { id: string; admin_id: string; range_start: number; range_end: number; current_value: number; updated_at: string }
    accessToken?: string
    refreshToken?: string
    exp?: number
    iat?: number
    error?: string
  }
}