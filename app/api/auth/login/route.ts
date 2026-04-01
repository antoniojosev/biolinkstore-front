import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AT_COOKIE, RT_COOKIE, AT_MAX_AGE, RT_MAX_AGE, cookieOptions } from '@/lib/auth/cookie-config'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function POST(request: Request) {
  const body = await request.json()

  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  const jar = await cookies()
  jar.set(AT_COOKIE, data.accessToken, { ...cookieOptions, maxAge: AT_MAX_AGE })
  jar.set(RT_COOKIE, data.refreshToken, { ...cookieOptions, maxAge: RT_MAX_AGE })

  // Only return user to client — tokens stay server-side
  return NextResponse.json({ user: data.user })
}
