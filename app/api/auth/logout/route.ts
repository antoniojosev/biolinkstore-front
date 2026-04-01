import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AT_COOKIE, RT_COOKIE, cookieOptions } from '@/lib/auth/cookie-config'

export async function POST() {
  const jar = await cookies()
  jar.set(AT_COOKIE, '', { ...cookieOptions, maxAge: 0 })
  jar.set(RT_COOKIE, '', { ...cookieOptions, maxAge: 0 })
  return NextResponse.json({ success: true })
}
