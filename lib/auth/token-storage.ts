/**
 * ITokenStorage — abstracts where tokens live.
 *
 * Current implementation: access token in a plain cookie (readable by
 * Next.js middleware for route protection), refresh token in localStorage.
 *
 * To swap (e.g. httpOnly cookies via a /api/session route):
 * implement this interface and pass to AuthProvider.
 */
export interface ITokenStorage {
  getAccessToken(): string | null
  getRefreshToken(): string | null
  setTokens(access: string, refresh: string): void
  clearTokens(): void
}

const AT = 'igs_at'
const RT = 'igs_rt'
/** Access token TTL in seconds — should match JWT_EXPIRES_IN in backend */
const AT_MAX_AGE = 15 * 60

export class LocalTokenStorage implements ITokenStorage {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(?:^|; )${AT}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(RT)
  }

  setTokens(access: string, refresh: string): void {
    // Cookie — readable by Next.js middleware (not httpOnly intentionally)
    document.cookie = [
      `${AT}=${encodeURIComponent(access)}`,
      `path=/`,
      `max-age=${AT_MAX_AGE}`,
      `SameSite=Lax`,
    ].join('; ')

    localStorage.setItem(RT, refresh)
  }

  clearTokens(): void {
    document.cookie = `${AT}=; path=/; max-age=0`
    localStorage.removeItem(RT)
  }
}
