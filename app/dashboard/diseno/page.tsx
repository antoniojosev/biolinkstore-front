"use client"

import { useMemo, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Palette } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { TemplateGallery } from "@/components/templates/template-gallery"
import { CustomDesignBar } from "@/components/templates/custom-cta-versions"

export default function DisenoDashboardPage() {
  const router = useRouter()
  const { user, store, isLoading, http, refreshStore } = useAuth()

  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  // Intenta cargar el store una sola vez si el contexto lo tiene como null
  const retried = useRef(false)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (!isLoading && !store && !retried.current) {
      retried.current = true
      setRetrying(true)
      refreshStore().finally(() => setRetrying(false))
    }
  }, [isLoading, store, refreshStore])

  if (isLoading || retrying) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-white/40">No se encontró tu tienda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#33b380]/15 flex items-center justify-center">
            <Palette className="w-4 h-4 text-[#33b380]" />
          </div>
          <h1 className="text-xl font-bold text-white">Diseño</h1>
        </div>
        <p className="text-sm text-white/40 ml-10">
          Elige la plantilla visual de tu catálogo. Los cambios aplican de inmediato.
        </p>
      </div>

      {/* Gallery */}
      <TemplateGallery
        mode="dashboard"
        storeId={store.id}
        currentTemplate={store.template}
        storeRepo={storeRepo}
        onSuccess={() => { refreshStore(); router.refresh() }}
      />

      {/* CTA diseño personalizado */}
      <CustomDesignBar
        storeName={store.name}
        storeId={store.id}
        defaultWhatsapp={store.whatsappNumbers[0] ?? ''}
        defaultEmail={user?.email ?? ''}
      />
    </div>
  )
}
