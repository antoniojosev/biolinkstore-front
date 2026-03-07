"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"

function generateUsername(name: string): string {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'mi-tienda'
}

export default function CreateStorePage() {
  const router = useRouter()
  const { user, store, isLoading, http, refreshStore } = useAuth()
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  useEffect(() => {
    if (isLoading) return
    if (store) { router.replace('/onboarding'); return }
    if (!user) return

    const create = async () => {
      const base = generateUsername(user.name ?? user.email.split('@')[0])
      // try base username, then with random suffix on conflict
      for (let attempt = 0; attempt < 5; attempt++) {
        const username = attempt === 0 ? base : `${base}-${Math.floor(Math.random() * 900 + 100)}`
        try {
          await storeRepo.create({ name: username, username, whatsappNumbers: [] })
          await refreshStore()
          router.replace('/onboarding')
          return
        } catch {
          if (attempt === 4) router.replace('/onboarding')
        }
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
