"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"

export default function CreateStorePage() {
  const router = useRouter()
  const { user, store, isLoading, http, refreshStore } = useAuth()
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  useEffect(() => {
    if (isLoading) return
    if (store) { router.replace('/onboarding'); return }
    if (!user) return

    const create = async () => {
      try {
        const name = user.name ?? user.email.split('@')[0]
        await storeRepo.create({ name, whatsappNumbers: [] })
        await refreshStore()
      } finally {
        router.replace('/onboarding')
      }
    }

    create()
  }, [isLoading, store, user, storeRepo, refreshStore, router])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-7 h-7 animate-spin text-[#33b380]" />
      <p className="text-sm text-white/40">Preparando tu tienda...</p>
    </div>
  )
}
