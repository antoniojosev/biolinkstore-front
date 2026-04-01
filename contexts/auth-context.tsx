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
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import { HttpClient } from '@/lib/http/client'
import { AuthHttpRepository } from '@/lib/auth/auth.http-repository'
import { StoreHttpRepository } from '@/lib/stores-api/store.http-repository'
import { ApiError } from '@/lib/http/types'
import type { IAuthRepository } from '@/lib/auth/auth.repository'
import type { User, LoginDto, RegisterDto } from '@/lib/auth/types'
import type { DashboardStore } from '@/lib/stores-api/types'

interface AuthContextValue {
  // State
  user: User | null
  store: DashboardStore | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // Actions
  login(dto: LoginDto): Promise<void>
  loginWithTokens(accessToken: string, refreshToken: string): Promise<void>
  register(dto: RegisterDto & { storeName: string; whatsapp: string }): Promise<void>
  logout(): void
  clearError(): void
  refreshStore(): Promise<void>

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

  // logoutRef breaks the circular dependency between `logout` ↔ `http`
  const logoutRef = useRef<() => void>(() => {})

  // HttpClient points to the BFF proxy — no token management client-side
  const http = useMemo(
    () => new HttpClient('/api/proxy', () => logoutRef.current()),
    [],
  )

  const authRepo: IAuthRepository = useMemo(() => new AuthHttpRepository(http), [http])
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

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
    const [me, stores] = await Promise.all([
      authRepo.me(),
      storeRepo.findAll().catch(() => ({ data: [] })),
    ])
    const firstStore = stores.data[0] ?? null
    setUser(me)
    setStore(firstStore)
    return { user: me, store: firstStore }
  }, [authRepo, storeRepo])

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

  // ── Register ─────────────────────────────────────────────────────────────────
  const register = useCallback(
    async (dto: RegisterDto & { storeName: string; whatsapp: string }) => {
      setError(null)
      try {
        await authRepo.register({
          name: dto.name,
          email: dto.email,
          password: dto.password,
          username: dto.username,
          gender: dto.gender,
          dateOfBirth: dto.dateOfBirth,
          fingerprint: dto.fingerprint,
        })

        const newStore = await storeRepo.create({
          name: dto.storeName,
          whatsappNumbers: dto.whatsapp ? [dto.whatsapp] : [],
        })
        const me = await authRepo.me()

        flushSync(() => {
          setUser(me)
          setStore(newStore)
        })

        router.push('/onboarding')
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Error al crear la cuenta'
        setError(msg)
        throw err
      }
    },
    [authRepo, storeRepo, router],
  )

  const clearError = useCallback(() => setError(null), [])

  const refreshStore = useCallback(async () => {
    try {
      const stores = await storeRepo.findAll()
      setStore(stores.data[0] ?? null)
    } catch {
      // Keep existing store on failure
    }
  }, [storeRepo])

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        isLoading,
        isAuthenticated: user !== null,
        error,
        login,
        loginWithTokens,
        register,
        logout,
        clearError,
        refreshStore,
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
