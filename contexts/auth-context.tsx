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
import { LocalTokenStorage } from '@/lib/auth/token-storage'
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
   * Use this to instantiate repositories in hooks/components:
   *   const repo = useMemo(() => new StoreHttpRepository(http), [http])
   */
  http: HttpClient
}

const AuthContext = createContext<AuthContextValue | null>(null)

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [store, setStore] = useState<DashboardStore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Composition root ────────────────────────────────────────────────────────
  // To swap implementations (e.g. CookieTokenStorage, MockAuthRepository),
  // change the classes instantiated here. Nothing else needs to change.

  const tokenStorage = useMemo(() => new LocalTokenStorage(), [])

  // logoutRef breaks the circular dependency between `logout` ↔ `http`
  const logoutRef = useRef<() => void>(() => {})

  const http = useMemo(
    () => new HttpClient(API_URL, tokenStorage, () => logoutRef.current()),
    [tokenStorage],
  )

  const authRepo: IAuthRepository = useMemo(() => new AuthHttpRepository(http), [http])
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    tokenStorage.clearTokens()
    setUser(null)
    setStore(null)
    router.push('/login')
  }, [tokenStorage, router])

  // Keep ref in sync so HttpClient always calls the latest logout
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
  useEffect(() => {
    const restore = async () => {
      // If no refresh token, skip — user is not logged in
      if (!tokenStorage.getRefreshToken()) {
        setIsLoading(false)
        return
      }
      try {
        await loadUserAndStore()
      } catch {
        logout()
      } finally {
        setIsLoading(false)
      }
    }
    restore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentional: run once on mount

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (dto: LoginDto) => {
      setError(null)
      try {
        const tokens = await authRepo.login(dto)
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken)
        const { store } = await loadUserAndStore()
        router.push(store ? '/dashboard' : '/onboarding/create-store')
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Error al iniciar sesión'
        setError(msg)
        throw err
      }
    },
    [authRepo, tokenStorage, loadUserAndStore, router],
  )

  // ── Login with OAuth tokens (e.g. Google callback) ──────────────────────────
  const loginWithTokens = useCallback(
    async (accessToken: string, refreshToken: string) => {
      tokenStorage.setTokens(accessToken, refreshToken)
      try {
        const { store } = await loadUserAndStore()
        router.push(store ? '/dashboard' : '/onboarding/create-store')
      } catch {
        logout()
      }
    },
    [tokenStorage, loadUserAndStore, router, logout],
  )

  // ── Register ─────────────────────────────────────────────────────────────────
  const register = useCallback(
    async (dto: RegisterDto & { storeName: string; whatsapp: string }) => {
      setError(null)
      try {
        // 1. Create user account
        const tokens = await authRepo.register({
          name: dto.name,
          email: dto.email,
          password: dto.password,
          username: dto.username,
          gender: dto.gender,
          dateOfBirth: dto.dateOfBirth,
        })
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken)

        // 2. Create their first store
        const newStore = await storeRepo.create({
          name: dto.storeName,
          whatsappNumbers: dto.whatsapp ? [dto.whatsapp] : [],
        })
        const me = await authRepo.me()

        // flushSync garantiza que los setters se commiteen ANTES de navegar,
        // evitando la race condition donde el onboarding page lee store=null
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
    [authRepo, storeRepo, tokenStorage, router],
  )

  const clearError = useCallback(() => setError(null), [])

  const refreshStore = useCallback(async () => {
    try {
      const stores = await storeRepo.findAll()
      setStore(stores.data[0] ?? null)
    } catch {
      // Si falla, conserva el store actual — no lo pisa con null
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
