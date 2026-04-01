/**
 * Used by the OAuth callback pages to exchange tokens received in the
 * URL (from the backend redirect) for httpOnly cookies.
 *
 * This keeps the token exchange server-side; the client page never stores
 * the tokens — it just POSTs them here and immediately discards them.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AT_COOKIE, RT_COOKIE, AT_MAX_AGE, RT_MAX_AGE, cookieOptions } from '@/lib/auth/cookie-config'

export async function POST(request: Request) {
  const { accessToken, refreshToken } = await request.json()

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
  }

  const jar = await cookies()
  jar.set(AT_COOKIE, accessToken, { ...cookieOptions, maxAge: AT_MAX_AGE })
  jar.set(RT_COOKIE, refreshToken, { ...cookieOptions, maxAge: RT_MAX_AGE })

  return NextResponse.json({ success: true })
}
