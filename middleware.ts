import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/onboarding']
const AUTH_ONLY = ['/login', '/registro']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // igs_session is a non-httpOnly flag set alongside the real httpOnly tokens.
  // The Edge runtime can read it; it contains no secret.
  const hasSession = request.cookies.has('igs_session')

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_ONLY.some((p) => pathname.startsWith(p))

  // Unauthenticated → trying to access dashboard
  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Already authenticated → trying to access login/register
  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon, public assets
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
