import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AT_COOKIE, RT_COOKIE, AT_MAX_AGE, RT_MAX_AGE, SESSION_FLAG_COOKIE, cookieOptions } from '@/lib/auth/cookie-config'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function POST() {
  const jar = await cookies()
  const refreshToken = jar.get(RT_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    // Clear stale cookies
    jar.set(AT_COOKIE, '', { ...cookieOptions, maxAge: 0 })
    jar.set(RT_COOKIE, '', { ...cookieOptions, maxAge: 0 })
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 })
  }

  const data = await res.json()
  jar.set(AT_COOKIE, data.accessToken, { ...cookieOptions, maxAge: AT_MAX_AGE })
  jar.set(RT_COOKIE, data.refreshToken, { ...cookieOptions, maxAge: RT_MAX_AGE })
  jar.set(SESSION_FLAG_COOKIE, '1', { httpOnly: false, secure: cookieOptions.secure, sameSite: cookieOptions.sameSite, path: '/', maxAge: RT_MAX_AGE })

  return NextResponse.json({ success: true })
}
