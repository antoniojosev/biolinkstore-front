'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { HttpClient } from '@/lib/http/client'
import { AuthHttpRepository } from '@/lib/auth/auth.http-repository'
import { StoreHttpRepository } from '@/lib/stores-api/store.http-repository'
import { MultiStoreHttpRepository } from '@/lib/multi-store-api'
import { ApiError } from '@/lib/http/types'
import type { IAuthRepository } from '@/lib/auth/auth.repository'
import type { User, LoginDto } from '@/lib/auth/types'
import type { DashboardStore } from '@/lib/stores-api/types'

interface AuthContextValue {
  // State
  user: User | null
  store: DashboardStore | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  /** True when the last store fetch failed (network/5xx) — distinct from "user genuinely has no store". */
  storeLoadError: boolean

  // Actions
  login(dto: LoginDto): Promise<void>
  loginWithTokens(accessToken: string, refreshToken: string): Promise<void>
  logout(): void
  clearError(): void
  refreshStore(): Promise<void>
  loadSession(): Promise<void>

  /**
   * Pre-configured HttpClient shared across all repositories.
   * Calls go through the BFF proxy — tokens are never visible to JavaScript.
   */
  http: HttpClient
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [store, setStore] = useState<DashboardStore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeLoadError, setStoreLoadError] = useState(false)

  // logoutRef breaks the circular dependency between `logout` ↔ `http`
  const logoutRef = useRef<() => void>(() => {})

  // HttpClient points to the BFF proxy — no token management client-side
  const http = useMemo(
    () => new HttpClient('/api/proxy', () => logoutRef.current()),
    [],
  )

  const authRepo: IAuthRepository = useMemo(() => new AuthHttpRepository(http), [http])
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])
  const multiStoreRepo = useMemo(() => new MultiStoreHttpRepository(http), [http])

  // Resolves the real *active* store (from /users/me/stores), not just "the first one" —
  // a user can own/belong to several stores, and the active one is a per-user setting
  // set via switchActive(), independent of list order.
  const loadActiveStore = useCallback(async (): Promise<DashboardStore | null> => {
    const { stores, activeStoreId } = await multiStoreRepo.listMine()
    const targetId = activeStoreId ?? stores[0]?.id ?? null
    if (!targetId) return null
    return storeRepo.findById(targetId)
  }, [multiStoreRepo, storeRepo])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // Clear httpOnly cookies server-side
    fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {})
    setUser(null)
    setStore(null)
    router.push('/login')
  }, [router])

  useEffect(() => { logoutRef.current = logout }, [logout])

  // ── Session helpers ─────────────────────────────────────────────────────────
  const loadUserAndStore = useCallback(async () => {
    const me = await authRepo.me()
    let activeStore: DashboardStore | null = null
    let loadFailed = false
    try {
      activeStore = await loadActiveStore()
    } catch {
      loadFailed = true // fetch failed — distinct from "genuinely no stores"
    }
    setUser(me)
    setStore(activeStore)
    setStoreLoadError(loadFailed)
    return { user: me, store: activeStore }
  }, [authRepo, loadActiveStore])

  // ── Restore session on mount ────────────────────────────────────────────────
  // Read the non-httpOnly session flag cookie to avoid a pointless /me call
  // (and the resulting 401 → onLogout loop) when there is clearly no session.
  useEffect(() => {
    const hasSession = typeof document !== 'undefined' &&
      document.cookie.split(';').some((c) => c.trim().startsWith('igs_session='))

    if (!hasSession) {
      setIsLoading(false)
      return
    }

    loadUserAndStore()
      .catch(() => {
        setUser(null)
        setStore(null)
      })
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentional: run once on mount

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (dto: LoginDto) => {
      setError(null)
      try {
        // BFF route sets httpOnly cookies and returns { user }
        await authRepo.login(dto)
        const { store } = await loadUserAndStore()
        router.push(store ? '/dashboard' : '/onboarding/create-store')
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Error al iniciar sesión'
        setError(msg)
        throw err
      }
    },
    [authRepo, loadUserAndStore, router],
  )

  // ── Login with OAuth tokens (Google callback) ────────────────────────────────
  // Tokens arrive in URL params; we hand them to the BFF set-session route
  // so they become httpOnly cookies — they never touch localStorage or JS state.
  const loginWithTokens = useCallback(
    async (accessToken: string, refreshToken: string) => {
      try {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, refreshToken }),
          credentials: 'same-origin',
        })
        const { store } = await loadUserAndStore()
        router.push(store ? '/dashboard' : '/onboarding/create-store')
      } catch {
        logout()
      }
    },
    [loadUserAndStore, router, logout],
  )

  const clearError = useCallback(() => setError(null), [])

  const loadSession = useCallback(async () => {
    try {
      await loadUserAndStore()
    } catch {
      setUser(null)
      setStore(null)
    }
  }, [loadUserAndStore])

  const refreshStore = useCallback(async () => {
    try {
      const activeStore = await loadActiveStore()
      setStore(activeStore)
      setStoreLoadError(false)
    } catch {
      // Keep existing store on failure — don't overwrite good state with null
      setStoreLoadError(true)
    }
  }, [loadActiveStore])

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        isLoading,
        isAuthenticated: user !== null,
        error,
        storeLoadError,
        login,
        loginWithTokens,
        logout,
        clearError,
        refreshStore,
        loadSession,
        http,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
