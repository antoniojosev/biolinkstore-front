import { ApiError } from './types'
import type { ITokenStorage } from '@/lib/auth/token-storage'

/**
 * HttpClient — fetch wrapper with:
 * - Automatic Bearer token injection
 * - Transparent 401 → refresh → retry (deduplicated for concurrent requests)
 * - Typed ApiError on failures
 *
 * Swap the underlying fetch implementation by extending this class
 * or replacing it with an adapter (e.g. axios) — the IAuthRepository
 * and IStoreRepository only depend on this class, not on fetch.
 */
export class HttpClient {
  /** Deduplicate concurrent refresh calls */
  private refreshPromise: Promise<boolean> | null = null

  constructor(
    private readonly baseUrl: string,
    private readonly tokenStorage: ITokenStorage,
    /** Called when refresh fails — use to clear auth state */
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

  private async request<T>(
    path: string,
    init: RequestInit,
    isRetry = false,
  ): Promise<T> {
    const token = this.tokenStorage.getAccessToken()

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })

    // Token expired — try once to refresh and retry
    if (res.status === 401 && !isRetry) {
      const refreshed = await this.tryRefresh()
      if (refreshed) return this.request<T>(path, init, true)
      this.onLogout?.()
      throw new ApiError(401, 'Sesión expirada. Por favor iniciá sesión nuevamente.')
    }

    // No content
    if (res.status === 204) return undefined as T

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      // Si hay errores de campo (ValidationPipe), mostrar el primer mensaje de campo
      const fieldError = Array.isArray(body.errors) ? body.errors[0]?.errors?.[0] : undefined
      const msg = fieldError
        ?? (Array.isArray(body.message) ? body.message[0] : (body.message ?? 'Error del servidor'))
      throw new ApiError(res.status, msg)
    }

    return res.json()
  }

  /** Deduplicate: if a refresh is already in progress, wait for it */
  private tryRefresh(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise
    this.refreshPromise = this.doRefresh().finally(() => {
      this.refreshPromise = null
    })
    return this.refreshPromise
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = this.tokenStorage.getRefreshToken()
    if (!refreshToken) return false

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!res.ok) {
        this.tokenStorage.clearTokens()
        return false
      }

      const data = await res.json()
      this.tokenStorage.setTokens(data.accessToken, data.refreshToken)
      return true
    } catch {
      this.tokenStorage.clearTokens()
      return false
    }
  }
}
