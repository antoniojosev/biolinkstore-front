'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

function OAuthCallbackContent() {
  const searchParams = useSearchParams()
  const { loginWithTokens, logout } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (accessToken && refreshToken) {
      loginWithTokens(accessToken, refreshToken)
    } else {
      logout()
    }
  }, [searchParams, loginWithTokens, logout])

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center items-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#33b380]" />
      <p className="mt-4 text-sm text-white/50">Autenticando...</p>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center items-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#33b380]" />
      <p className="mt-4 text-sm text-white/50">Cargando...</p>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OAuthCallbackContent />
    </Suspense>
  )
}
