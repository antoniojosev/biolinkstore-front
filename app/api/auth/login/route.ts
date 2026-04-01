import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AT_COOKIE, RT_COOKIE, AT_MAX_AGE, RT_MAX_AGE, SESSION_FLAG_COOKIE, cookieOptions } from '@/lib/auth/cookie-config'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message[0] : (data.message ?? 'Error al iniciar sesión')
      return NextResponse.json({ message: msg }, { status: res.status })
    }

    const jar = await cookies()
    jar.set(AT_COOKIE, data.accessToken, { ...cookieOptions, maxAge: AT_MAX_AGE })
    jar.set(RT_COOKIE, data.refreshToken, { ...cookieOptions, maxAge: RT_MAX_AGE })
    jar.set(SESSION_FLAG_COOKIE, '1', { httpOnly: false, secure: cookieOptions.secure, sameSite: cookieOptions.sameSite, path: '/', maxAge: RT_MAX_AGE })

    return NextResponse.json({ user: data.user })
  } catch (err) {
    console.error('[BFF /api/auth/login]', err)
    return NextResponse.json({ message: 'No se pudo conectar con el servidor' }, { status: 502 })
  }
}
