import { ApiError } from './types'

/**
 * HttpClient — fetch wrapper for authenticated dashboard API calls.
 *
 * All requests go through /api/proxy/[...path], which:
 *   - Injects the Bearer token from the httpOnly igs_at cookie server-side
 *   - Transparently refreshes the token on 401 and retries
 *   - Returns 401 to the client only when refresh also fails
 *
 * No tokens are ever handled client-side.
 */
export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    /** Called when the session is fully expired (refresh also failed) */
    private readonly onLogout?: () => void,
  ) {}

  get<T>(path: string, init?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...init, method: 'GET' })
  }

  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...init,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...init,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(path: string, init?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...init, method: 'DELETE' })
  }

  postFormData<T>(path: string, formData: FormData, init?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...init,
      method: 'POST',
      body: formData,
    })
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...init.headers,
      },
    })

    // Proxy returns 401 only after refresh also failed — session is gone
    if (res.status === 401) {
      this.onLogout?.()
      throw new ApiError(401, 'Sesión expirada. Por favor iniciá sesión nuevamente.')
    }

    if (res.status === 204) return undefined as T

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const fieldError = Array.isArray(body.errors) ? body.errors[0]?.errors?.[0] : undefined
      const msg =
        fieldError ??
        (Array.isArray(body.message) ? body.message[0] : (body.message ?? 'Error del servidor'))
      throw new ApiError(res.status, msg)
    }

    return res.json()
  }
}
