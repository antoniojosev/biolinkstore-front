"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Save,
  Phone,
  Share2,
  Loader2,
  Instagram,
  Mail,
  MapPin,
  Droplets,
  Lock,
  Globe,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import type { UpdateStoreDto } from "@/lib/stores-api/types"
import { toast } from "sonner"

export default function SettingsPage() {
  const { store, http, refreshStore } = useAuth()
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  const [saving, setSaving] = useState(false)
  const storePlan = store?.subscription?.plan ?? "FREE"

  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [instagramHandle, setInstagramHandle] = useState("")
  const [facebookUrl, setFacebookUrl] = useState("")
  const [tiktokUrl, setTiktokUrl] = useState("")
  const [showBranding, setShowBranding] = useState(true)

  useEffect(() => {
    if (!store) return
    setEmail(store.email ?? "")
    setAddress(store.address ?? "")
    setWhatsapp(store.whatsappNumbers?.[0] ?? "")
    setInstagramHandle(store.instagramHandle ?? "")
    setFacebookUrl(store.facebookUrl ?? "")
    setTiktokUrl(store.tiktokUrl ?? "")
    setShowBranding(store.showBranding ?? true)
  }, [store])

  const handleSave = async () => {
    if (!store) return
    setSaving(true)
    try {
      const dto: UpdateStoreDto = {
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        whatsappNumbers: whatsapp.trim() ? [whatsapp.trim()] : [],
        instagramHandle: instagramHandle.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        tiktokUrl: tiktokUrl.trim() || undefined,
        showBranding,
      }
      await storeRepo.update(store.id, dto)
      await refreshStore()
      toast.success("Configuracion guardada")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  if (!store) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Configuracion</h1>
        <p className="text-sm text-white/50">
          Datos de contacto y ajustes de tu tienda
        </p>
      </div>

      {/* Contact */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#327be2]" />
            <CardTitle className="text-base font-semibold text-white">
              Contacto
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-white/70">
              WhatsApp (con codigo de pais)
            </Label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
              placeholder="+5491123456789"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">
              <Mail className="w-3.5 h-3.5 inline mr-1.5" />
              Email de contacto
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
              placeholder="contacto@mitienda.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">
              <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
              Direccion (opcional)
            </Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
              placeholder="Calle 123, Ciudad"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social media */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#6ee490]" />
            <CardTitle className="text-base font-semibold text-white">
              Redes sociales
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-white/70">
              <Instagram className="w-3.5 h-3.5 inline mr-1.5" />
              Instagram
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
              <Input
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="h-10 pl-7 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
                placeholder="mitienda"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Facebook</Label>
            <Input
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
              placeholder="https://facebook.com/mitienda"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">TikTok</Label>
            <Input
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
              placeholder="https://tiktok.com/@mitienda"
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#33b380]" />
            <CardTitle className="text-base font-semibold text-white">
              Marca de agua
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-white/70">
                Marca de agua &ldquo;Bio Link Store&rdquo; en fotos de productos
              </p>
              {storePlan === "FREE" && (
                <p className="text-xs text-amber-400/80 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Disponible en Pro para desactivar
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showBranding}
              disabled={storePlan === "FREE"}
              onClick={() => setShowBranding(!showBranding)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33b380] ${
                showBranding ? "bg-[#33b380]" : "bg-white/20"
              } ${storePlan === "FREE" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  showBranding ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#327be2]" />
            <CardTitle className="text-base font-semibold text-white">
              Dominio personalizado
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {store.customDomain ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{store.customDomain}</span>
                  <a
                    href={`https://${store.customDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/30 hover:text-white/60 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {store.domainVerified ? (
                  <div className="flex items-center gap-1.5 text-[#33b380]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Verificado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[#f59e0b]">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Pendiente</span>
                  </div>
                )}
              </div>
              {!store.domainVerified && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/15">
                  <AlertTriangle className="w-4 h-4 text-[#f59e0b] mt-0.5 shrink-0" />
                  <p className="text-xs text-white/50">
                    Tu dominio está pendiente de verificación. Configurá los registros DNS y te notificaremos cuando esté activo.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-white/70">
                  Conecta tu propio dominio a tu tienda
                </p>
                <p className="text-xs text-white/40">
                  Desde $2/mes — configuralo desde Mi Plan
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-[#327be2]/30 text-[#327be2] hover:bg-[#327be2]/10"
                onClick={() => window.location.href = '/dashboard/plan'}
              >
                Configurar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#33b380] hover:bg-[#2a9a6d] text-white h-10"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  )
}
