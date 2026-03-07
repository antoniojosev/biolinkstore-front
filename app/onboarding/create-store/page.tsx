"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Check } from "lucide-react"
import { LogoIcon } from "@/components/brand/logo"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { ApiError } from "@/lib/http/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function CreateStorePage() {
  const router = useRouter()
  const { store, isLoading, http, refreshStore } = useAuth()

  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  const [name, setName]         = useState("")
  const [username, setUsername] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean
    available: boolean | null
    error: string | null
  }>({ checking: false, available: null, error: null })

  // Si ya tiene tienda (registro normal), saltar directo al onboarding
  useEffect(() => {
    if (!isLoading && store) {
      router.replace('/onboarding')
    }
  }, [isLoading, store, router])

  // Auto-suggest username from store name
  useEffect(() => {
    if (name && !username) {
      const suggested = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      setUsername(suggested)
      setUsernameStatus({ checking: false, available: null, error: null })
    }
  }, [name, username])

  const isNameValid = name.trim().length >= 3
  const isUsernameValid = username.length >= 3 && /^[a-z0-9_.]+$/.test(username)

  const checkUsernameAvailability = async (value: string) => {
    if (value.length < 3 || !/^[a-z0-9_.]+$/.test(value)) return
    setUsernameStatus({ checking: true, available: null, error: null })
    try {
      const res = await fetch(`${API_URL}/api/stores/check-username?username=${encodeURIComponent(value)}`)
      const data = await res.json()
      setUsernameStatus({ checking: false, available: data.available, error: null })
    } catch {
      setUsernameStatus({ checking: false, available: null, error: 'Error al verificar' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isNameValid || !isUsernameValid) return
    if (usernameStatus.available === false) return
    setError(null)
    setSubmitting(true)
    try {
      await storeRepo.create({
        name: name.trim(),
        username,
        whatsappNumbers: whatsapp.trim() ? [whatsapp.trim()] : [],
      })
      await refreshStore()
      router.push('/onboarding')
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
            <LogoIcon size={56} />
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
                onChange={(e) => { setName(e.target.value); setUsername("") }}
                minLength={3}
                required
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#33b380] focus:ring-[#33b380]/20"
              />
              {name.length > 0 && !isNameValid && (
                <p className="text-xs text-red-400">Mínimo 3 caracteres</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-username" className="text-sm text-white/80">
                Username <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
                <Input
                  id="store-username"
                  type="text"
                  placeholder="mi-tienda"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))
                    setUsernameStatus({ checking: false, available: null, error: null })
                  }}
                  onBlur={(e) => checkUsernameAvailability(e.target.value)}
                  required
                  className={cn(
                    "h-11 pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#33b380]",
                    usernameStatus.available === false && "border-red-500 focus:border-red-500",
                    usernameStatus.available === true && "border-[#33b380]"
                  )}
                />
                {usernameStatus.checking && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/40" />
                )}
                {usernameStatus.available === true && !usernameStatus.checking && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#33b380]" />
                )}
              </div>
              {usernameStatus.available === false && (
                <p className="text-xs text-red-400">Este usuario ya está tomado</p>
              )}
              {username && usernameStatus.available !== false && (
                <p className="text-xs text-white/30">
                  Tu tienda: <span className="font-mono text-white/50">biolinkstore.com/{username}</span>
                </p>
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
              disabled={submitting || !isNameValid || !isUsernameValid || usernameStatus.available === false}
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
