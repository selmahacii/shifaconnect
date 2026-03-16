/**
 * Server-side auth utilities for Shifa-Connect
 * Provides server-side authentication helpers for API routes and Server Components
 */

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import type { User, Doctor } from '@/types/database'

export interface ServerSession {
  user: User
  doctor: Doctor | null
  isAuthenticated: boolean
}

/**
 * Get the current session from server-side
 * Use this in API routes and Server Components
 */
export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken) {
      return null
    }

    // Find session in database
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          include: {
            doctor: true,
          },
        },
      },
    })

    if (!session || session.expiresAt < new Date()) {
      // Session expired, delete it
      if (session) {
        await db.session.delete({ where: { id: session.id } })
      }
      return null
    }

    return {
      user: session.user as User,
      doctor: session.user.doctor as Doctor | null,
      isAuthenticated: true,
    }
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

/**
 * Require authentication - returns session or throws error
 * Use this in API routes that require authentication
 */
export async function requireAuth(): Promise<ServerSession> {
  const session = await getServerSession()

  if (!session) {
    throw new Error('Non autorisé - Veuillez vous connecter')
  }

  return session
}

/**
 * Create a session for a user
 */
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    },
  })

  return token
}

/**
 * Delete a session
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await db.session.delete({ where: { token } })
  } catch {
    // Ignore if session doesn't exist
  }
}

/**
 * Delete all sessions for a user (except current)
 */
export async function deleteOtherSessions(
  userId: string,
  currentToken: string
): Promise<void> {
  try {
    await db.session.deleteMany({
      where: {
        userId,
        NOT: { token: currentToken },
      },
    })
  } catch {
    // Ignore errors
  }
}

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session_token')
}

/**
 * Get current user ID from session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession()
  return session?.user.id || null
}

/**
 * Get current doctor ID from session
 */
export async function getCurrentDoctorId(): Promise<string | null> {
  const session = await getServerSession()
  return session?.doctor?.id || null
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getServerSession()
  return session?.user.role === role
}

export const serverAuth = {
  getSession: getServerSession,
  requireAuth,
  createSession,
  deleteSession,
  setSessionCookie,
  clearSessionCookie,
  getCurrentUserId,
  getCurrentDoctorId,
  hasRole,
}

export default serverAuth
