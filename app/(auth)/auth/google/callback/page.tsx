'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

function GoogleCallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { loginWithTokens } = useAuth()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=oauth_failed')
      return
    }

    loginWithTokens(accessToken, refreshToken).catch(() => {
      router.replace('/login?error=oauth_failed')
    })
  }, [searchParams, loginWithTokens, router])

  return null
}

export default function GoogleCallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      <p className="text-sm text-white/40">Iniciando sesión con Google...</p>
      <Suspense>
        <GoogleCallbackHandler />
      </Suspense>
    </div>
  )
}
