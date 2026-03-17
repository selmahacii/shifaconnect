
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Shifa-Connect Middleware
 * Handles session protection and redirection
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get session token from cookie
  const sessionToken = request.cookies.get('session_token')?.value
  const isAuthenticated = !!sessionToken

  // Define route types
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/consultations')
  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isRoot = pathname === '/'

  // 1. Redirect to login if accessing dashboard without session
  if (isDashboardRoute && !isAuthenticated) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Redirect to dashboard if logged in and accessing auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Handle root path
  if (isRoot) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - fonts folder
     * - api routes (handled individually)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|fonts/|api/).*)',
  ],
}
