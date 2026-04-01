/**
 * BFF Proxy — forwards all dashboard API calls to the backend with the
 * access token injected from an httpOnly cookie.
 *
 * Flow:
 *   Browser  →  /api/proxy/api/stores/…  →  ${BACKEND_URL}/api/stores/…
 *
 * Token refresh:
 *   If backend returns 401, this proxy calls /api/auth/refresh internally.
 *   If refresh succeeds, it retries the original request with the new AT.
 *   If refresh fails, it returns 401 to the client (which triggers logout).
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AT_COOKIE, RT_COOKIE, AT_MAX_AGE, RT_MAX_AGE, cookieOptions } from '@/lib/auth/cookie-config'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function refreshTokens(): Promise<string | null> {
  const jar = await cookies()
  const refreshToken = jar.get(RT_COOKIE)?.value
  if (!refreshToken) return null

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    jar.set(AT_COOKIE, '', { ...cookieOptions, maxAge: 0 })
    jar.set(RT_COOKIE, '', { ...cookieOptions, maxAge: 0 })
    return null
  }

  const data = await res.json()
  jar.set(AT_COOKIE, data.accessToken, { ...cookieOptions, maxAge: AT_MAX_AGE })
  jar.set(RT_COOKIE, data.refreshToken, { ...cookieOptions, maxAge: RT_MAX_AGE })
  return data.accessToken
}

async function forward(
  request: Request,
  path: string[],
  accessToken: string,
): Promise<Response> {
  const backendPath = path.join('/')
  const url = new URL(request.url)
  const backendUrl = `${BACKEND_URL}/${backendPath}${url.search}`

  const contentType = request.headers.get('content-type') ?? ''
  const isFormData = contentType.includes('multipart/form-data')

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const body =
    request.method !== 'GET' && request.method !== 'HEAD'
      ? isFormData
        ? await request.formData()
        : await request.text().then((t) => t || undefined)
      : undefined

  return fetch(backendUrl, {
    method: request.method,
    headers,
    body: body instanceof FormData ? body : body,
  })
}

async function handle(request: Request, path: string[]): Promise<NextResponse> {
  const jar = await cookies()
  let accessToken = jar.get(AT_COOKIE)?.value

  if (!accessToken) {
    // No AT — try to refresh before giving up
    const newAt = await refreshTokens()
    if (!newAt) {
      return NextResponse.json({ message: 'Sesión expirada' }, { status: 401 })
    }
    accessToken = newAt
  }

  let res = await forward(request.clone(), path, accessToken)

  // AT expired — try refresh once
  if (res.status === 401) {
    const newAt = await refreshTokens()
    if (!newAt) {
      return NextResponse.json({ message: 'Sesión expirada' }, { status: 401 })
    }
    res = await forward(request, path, newAt)
  }

  // Stream the backend response back to the browser
  const responseBody = res.status === 204 ? null : await res.text()
  const headers = new Headers()
  const ct = res.headers.get('content-type')
  if (ct) headers.set('content-type', ct)

  return new NextResponse(responseBody, {
    status: res.status,
    headers,
  })
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(request, (await params).path)
}
export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(request, (await params).path)
}
export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(request, (await params).path)
}
export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(request, (await params).path)
}
export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handle(request, (await params).path)
}
