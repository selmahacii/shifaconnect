/**
 * Browser-side auth client for Shifa-Connect
 * Provides Supabase-style auth interface with Prisma backend
 */

import type { User, Doctor } from '@/types/database'

export interface AuthSession {
  user: User
  doctor: Doctor | null
  accessToken: string
  expiresAt: number
}

export interface AuthError {
  message: string
  code?: string
}

export interface AuthResponse {
  data: {
    user: User | null
    doctor: Doctor | null
    session: AuthSession | null
  }
  error: AuthError | null
}

const API_BASE = '/api/auth'

/**
 * Sign in with email and password
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return {
        data: { user: null, doctor: null, session: null },
        error: { message: data.error || 'Erreur de connexion' },
      }
    }

    return {
      data: {
        user: data.data.user,
        doctor: data.data.doctor,
        session: data.data.session,
      },
      error: null,
    }
  } catch (error) {
    return {
      data: { user: null, doctor: null, session: null },
      error: { message: 'Erreur de connexion au serveur' },
    }
  }
}

/**
 * Sign up a new user
 */
export async function signUp(data: {
  email: string
  password: string
  name: string
  phone?: string
  clinicName?: string
  licenseNumber?: string
  wilaya?: string
}): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const responseData = await response.json()

    if (!response.ok || !responseData.success) {
      return {
        data: { user: null, doctor: null, session: null },
        error: { message: responseData.error || "Erreur lors de l'inscription" },
      }
    }

    return {
      data: {
        user: responseData.data.user,
        doctor: responseData.data.doctor,
        session: responseData.data.session,
      },
      error: null,
    }
  } catch {
    return {
      data: { user: null, doctor: null, session: null },
      error: { message: 'Erreur de connexion au serveur' },
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
    })

    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shifa-auth')
    }

    return { error: null }
  } catch {
    return { error: { message: 'Erreur lors de la déconnexion' } }
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/me`)
    const data = await response.json()

    if (!response.ok || !data.success) {
      return {
        data: { user: null, doctor: null, session: null },
        error: null,
      }
    }

    return {
      data: {
        user: data.data.user,
        doctor: data.data.doctor,
        session: data.data.session,
      },
      error: null,
    }
  } catch {
    return {
      data: { user: null, doctor: null, session: null },
      error: null,
    }
  }
}

/**
 * Request password reset
 */
export async function resetPasswordForEmail(
  email: string
): Promise<{ error: AuthError | null }> {
  try {
    const response = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const data = await response.json()
      return { error: { message: data.error || "Erreur lors de l'envoi" } }
    }

    return { error: null }
  } catch {
    return { error: { message: 'Erreur de connexion au serveur' } }
  }
}

/**
 * Auth client object with Supabase-style interface
 */
export const authClient = {
  signInWithPassword,
  signUp,
  signOut,
  getSession,
  resetPasswordForEmail,
}

export default authClient
