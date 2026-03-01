"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { ApiError } from "@/lib/http/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CreateStorePage() {
  const router = useRouter()
  const { store, isLoading, http, refreshStore } = useAuth()

  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  const [name, setName]         = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Si ya tiene tienda (registro normal), saltar directo al template
  useEffect(() => {
    if (!isLoading && store) {
      router.replace('/onboarding/template')
    }
  }, [isLoading, store, router])

  const isNameValid = name.trim().length >= 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isNameValid) return
    setError(null)
    setSubmitting(true)
    try {
      await storeRepo.create({
        name: name.trim(),
        whatsappNumbers: whatsapp.trim() ? [whatsapp.trim()] : [],
      })
      await refreshStore()
      router.push('/onboarding/template')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear la tienda')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-[#33b380] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#33b380]">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Crea tu tienda</h1>
              <p className="text-sm text-white/50 mt-1">
                Solo necesitamos el nombre para empezar.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name" className="text-sm text-white/80">
                Nombre de tu tienda
              </Label>
              <Input
                id="store-name"
                type="text"
                placeholder="Mi Tienda Increíble"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={3}
                required
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#33b380] focus:ring-[#33b380]/20"
              />
              {name.length > 0 && !isNameValid && (
                <p className="text-xs text-red-400">Mínimo 3 caracteres</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-whatsapp" className="text-sm text-white/80">
                WhatsApp{" "}
                <span className="text-white/30 font-normal">(opcional)</span>
              </Label>
              <Input
                id="store-whatsapp"
                type="tel"
                placeholder="+54 9 11 2345 6789"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#33b380] focus:ring-[#33b380]/20"
              />
              <p className="text-xs text-white/30">
                Podés agregarlo más tarde desde Configuración.
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting || !isNameValid}
              className="w-full h-11 bg-[#33b380] hover:bg-[#2a9a6d] text-white font-semibold mt-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando tienda...
                </>
              ) : (
                "Continuar →"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
