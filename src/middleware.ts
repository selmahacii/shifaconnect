import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

// API routes that don't require authentication
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  const isPublicApiRoute = publicApiRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // Allow public API routes
  if (isPublicApiRoute) {
    return NextResponse.next()
  }
  
  // Allow other API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Allow static files
  if (pathname.startsWith('/_next/') || pathname.startsWith('/public/') || pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // If accessing protected route without session, redirect to login
  if (!isPublicRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If accessing auth routes with valid session, redirect to dashboard
  if (isPublicRoute && sessionToken && pathname !== '/forgot-password') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If root path, redirect to dashboard or login
  if (pathname === '/') {
    if (sessionToken) {
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
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|fonts/).*)',
  ],
}
