"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Save,
  Store,
  Phone,
  Image as ImageIcon,
  Share2,
  Upload,
  X,
  Loader2,
  Check,
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

  // Form state — initialized from store
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean
    available: boolean | null
    error: string | null
  }>({ checking: false, available: null, error: null })
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [instagramHandle, setInstagramHandle] = useState("")
  const [facebookUrl, setFacebookUrl] = useState("")
  const [tiktokUrl, setTiktokUrl] = useState("")

  // Branding
  const [showBranding, setShowBranding] = useState(true)

  // Image state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Populate form when store loads
  useEffect(() => {
    if (!store) return
    setName(store.name || "")
    setUsername(store.username ?? "")
    setDescription(store.description ?? store.bio ?? "")
    setEmail(store.email ?? "")
    setAddress(store.address ?? "")
    setWhatsapp(store.whatsappNumbers?.[0] ?? "")
    setInstagramHandle(store.instagramHandle ?? "")
    setFacebookUrl(store.facebookUrl ?? "")
    setTiktokUrl(store.tiktokUrl ?? "")
    setShowBranding(store.showBranding ?? true)
    setAvatarPreview(store.logo ?? store.avatar ?? null)
    setBannerPreview(store.banner ?? store.coverImage ?? null)
  }, [store])

  const handleImageSelect = useCallback(
    (type: "avatar" | "banner") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      if (type === "avatar") {
        setAvatarFile(file)
        setAvatarPreview(url)
      } else {
        setBannerFile(file)
        setBannerPreview(url)
      }
    },
    [],
  )

  const removeImage = useCallback((type: "avatar" | "banner") => {
    if (type === "avatar") {
      setAvatarFile(null)
      setAvatarPreview(null)
    } else {
      setBannerFile(null)
      setBannerPreview(null)
    }
  }, [])

  const checkUsernameAvailability = async (username: string, currentUsername: string) => {
    if (username === currentUsername) {
      setUsernameStatus({ checking: false, available: true, error: null })
      return true
    }
    if (username.length < 3) {
      setUsernameStatus({ checking: false, available: null, error: null })
      return false
    }
    if (!/^[a-z0-9_.]+$/.test(username)) {
      setUsernameStatus({ checking: false, available: false, error: 'Solo letras, números, guiones y guiones bajos' })
      return false
    }
    setUsernameStatus({ checking: true, available: null, error: null })
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const res = await fetch(`${API_URL}/api/stores/check-username?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      setUsernameStatus({ checking: false, available: data.available, error: null })
      return data.available
    } catch {
      setUsernameStatus({ checking: false, available: null, error: 'Error al verificar' })
      return false
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    if (!store) throw new Error("No store")
    const formData = new FormData()
    formData.append("files", file)
    const results = await http.postFormData<{ url: string }[]>(
      `/api/stores/${store.id}/uploads`,
      formData,
    )
    return results[0].url
  }

  const handleSave = async () => {
    if (!store) return
    
    // Validate username if changed
    if (username !== store.username && username.trim()) {
      const isAvailable = await checkUsernameAvailability(username, store.username ?? "")
      if (!isAvailable) {
        toast.error("El nombre de usuario no está disponible")
        return
      }
    }
    
    setSaving(true)

    try {
      // Upload new images if needed
      let logoUrl = store.logo ?? store.avatar
      let bannerUrl = store.banner ?? store.coverImage

      if (avatarFile) {
        logoUrl = await uploadFile(avatarFile)
      } else if (!avatarPreview) {
        logoUrl = undefined
      }

      if (bannerFile) {
        bannerUrl = await uploadFile(bannerFile)
      } else if (!bannerPreview) {
        bannerUrl = undefined
      }

      const dto: UpdateStoreDto = {
        name: name.trim() || undefined,
        username: username.trim() || undefined,
        description: description.trim() || undefined,
        logo: logoUrl ?? undefined,
        banner: bannerUrl ?? undefined,
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

      // Clear file references after successful upload
      setAvatarFile(null)
      setBannerFile(null)

      toast.success("Configuracion guardada")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar"
      toast.error(message)
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
          Personaliza tu tienda y datos de contacto
        </p>
      </div>

      {/* Images */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#33b380]" />
            <CardTitle className="text-base font-semibold text-white">
              Imagenes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Banner */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Foto de portada</Label>
            <div
              className="relative h-36 rounded-xl overflow-hidden bg-white/5 border border-dashed border-white/10 hover:border-[#33b380]/40 transition-colors cursor-pointer group"
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerPreview ? (
                <>
                  <img
                    src={bannerPreview}
                    alt="Portada"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        bannerInputRef.current?.click()
                      }}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Cambiar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage("banner")
                      }}
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      Quitar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-white/30">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">
                    Sube una imagen de portada (1200x400 recomendado)
                  </span>
                </div>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect("banner")}
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Logo / Avatar</Label>
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-dashed border-white/10 hover:border-[#33b380]/40 transition-colors cursor-pointer group shrink-0"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <>
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/30">
                    <Upload className="w-5 h-5" />
                  </div>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect("avatar")}
                />
              </div>
              <div className="text-xs text-white/40 space-y-1">
                <p>Imagen cuadrada recomendada (200x200)</p>
                {avatarPreview && (
                  <button
                    className="text-red-400 hover:text-red-300 transition-colors"
                    onClick={() => removeImage("avatar")}
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store info */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#33b380]" />
            <CardTitle className="text-base font-semibold text-white">
              Informacion de la tienda
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Nombre de la tienda</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
              placeholder="Mi Tienda"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">
              Username <span className="text-white/30 font-normal">(URL de tu tienda)</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))
                  setUsernameStatus({ checking: false, available: null, error: null })
                }}
                onBlur={(e) => checkUsernameAvailability(e.target.value, store.username ?? "")}
                className={`h-10 pl-7 bg-white/5 border-white/10 text-white focus:border-[#33b380] ${
                  usernameStatus.available === false ? "border-red-500 focus:border-red-500" : ""
                } ${usernameStatus.available === true ? "border-[#33b380]" : ""}`}
                placeholder="mi-tienda"
              />
              {usernameStatus.checking && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/40" />
              )}
              {usernameStatus.available === true && !usernameStatus.checking && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#33b380]" />
              )}
            </div>
            {usernameStatus.error && (
              <p className="text-xs text-red-400">{usernameStatus.error}</p>
            )}
            {usernameStatus.available === false && !usernameStatus.error && (
              <p className="text-xs text-red-400">Este usuario ya está tomado</p>
            )}
            {username && !usernameStatus.error && usernameStatus.available !== false && (
              <p className="text-xs text-white/40">
                Tu tienda: biolinkstore.com/{username}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Descripcion</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-white/5 border-white/10 text-white focus:border-[#33b380] resize-none"
              placeholder="Describe tu tienda..."
            />
          </div>
        </CardContent>
      </Card>

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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                @
              </span>
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
