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
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Autenticando...
        </h2>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mx-auto sm:w-full sm:max-w-sm">
        <Loader2 className="mx-auto w-8 h-8 animate-spin text-[#33b380]" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Cargando...
        </h2>
      </div>
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
