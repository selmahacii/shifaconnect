/**
 * Auth module exports
 * Provides both client and server auth utilities
 */

// Client-side auth (for use in Client Components)
export {
  authClient,
  signInWithPassword,
  signUp,
  signOut,
  getSession,
  resetPasswordForEmail,
  type AuthSession,
  type AuthError,
  type AuthResponse,
} from './client'

// Server-side auth (for use in API routes and Server Components)
export {
  serverAuth,
  getServerSession,
  requireAuth,
  createSession,
  deleteSession,
  setSessionCookie,
  clearSessionCookie,
  getCurrentUserId,
  getCurrentDoctorId,
  hasRole,
  type ServerSession,
} from './server'
