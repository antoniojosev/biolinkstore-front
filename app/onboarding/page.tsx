"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight, Check, ChevronLeft, Lock, Sparkles,
  MessageCircle, Mail, Send, X,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { TemplateGallery } from "@/components/templates/template-gallery"
import { CustomDesignBar } from "@/components/templates/custom-cta-versions"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ── Categorías predefinidas ───────────────────────────────────────────────────
const CATEGORIES = [
  "Moda y ropa", "Accesorios", "Calzado", "Joyería y bijouterie",
  "Belleza y cosméticos", "Perfumería", "Alimentación", "Bebidas",
  "Electrónica", "Hogar y decoración", "Arte y artesanías",
  "Juguetes", "Deportes", "Mascotas", "Libros y papelería", "Otro",
]

// ── Planes ────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: "Gratis",
    description: "Para empezar a vender hoy",
    features: ["Hasta 10 productos", "Pedidos ilimitados", "Link de tienda personalizado", "Soporte por email"],
    current: true,
    color: "#33b380",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19 / mes",
    description: "Para tiendas en crecimiento",
    features: ["Productos ilimitados", "Analytics avanzado", "Múltiples números de WhatsApp", "Soporte prioritario", "Sin marca de agua"],
    current: false,
    color: "#327be2",
  },
  {
    id: "business",
    name: "Business",
    price: "$49 / mes",
    description: "Para marcas consolidadas",
    features: ["Todo de Pro", "Múltiples tiendas", "Dominio propio", "Manager dedicado", "API access"],
    current: false,
    color: "#C9A86C",
  },
]

const WA_SALES   = "5491100000000"
const SALES_EMAIL = "ventas@instaorder.com"
type ContactMethod = "whatsapp" | "email"

// ── Modal de contacto para planes ─────────────────────────────────────────────
function PlanContactModal({
  open, onClose, planName, defaultEmail,
}: {
  open: boolean; onClose: () => void; planName: string; defaultEmail: string
}) {
  const [method, setMethod] = useState<ContactMethod>("whatsapp")
  const [email, setEmail]   = useState(defaultEmail)
  const [phone, setPhone]   = useState("")

  const handleSend = () => {
    if (method === "whatsapp") {
      const msg = encodeURIComponent(`Hola! Me interesa el plan ${planName} de InstaOrder. Mi WhatsApp es: ${phone}`)
      window.open(`https://wa.me/${WA_SALES}?text=${msg}`, "_blank")
    } else {
      const sub  = encodeURIComponent(`Consulta plan ${planName} — InstaOrder`)
      const body = encodeURIComponent(`Hola!\n\nMe interesa el plan ${planName}.\n\nContactarme al email: ${email}`)
      window.open(`mailto:${SALES_EMAIL}?subject=${sub}&body=${body}`, "_blank")
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Consultar plan {planName}</DialogTitle>
          <DialogDescription>¿Cómo querés que te contactemos?</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["whatsapp", "email"] as ContactMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                  method === m
                    ? m === "whatsapp" ? "border-[#25D366] bg-[#25D366]/8 text-white" : "border-[#327be2] bg-[#327be2]/8 text-white"
                    : "border-white/10 bg-white/3 text-white/40 hover:border-white/20"
                )}
              >
                {m === "whatsapp" ? <MessageCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                <span className="text-xs font-medium capitalize">{m === "whatsapp" ? "WhatsApp" : "Email"}</span>
              </button>
            ))}
          </div>

          {method === "whatsapp" ? (
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Tu número de WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 XXXX XXXX"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#25D366]/50 transition-all"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Tu email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#327be2]/50 transition-all"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/40 hover:text-white transition-all">
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={method === "whatsapp" ? !phone.trim() : !email.trim()}
              className={cn(
                "flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40",
                method === "whatsapp" ? "bg-[#25D366] hover:bg-[#20bb5a]" : "bg-[#327be2] hover:bg-[#2a6acc]"
              )}
            >
              <Send className="w-3.5 h-3.5" /> Enviar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Barra de progreso ─────────────────────────────────────────────────────────
const STEP_LABELS = ["Tu empresa", "Categorías", "Diseño", "Tu plan"]

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="px-6 sm:px-10 py-5 shrink-0">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/30">{STEP_LABELS[step]}</span>
          <span className="text-xs text-white/20">{step + 1} / {total}</span>
        </div>
        <div className="h-0.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#33b380] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Onboarding principal ──────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router  = useRouter()
  const { user, store, isLoading, http, refreshStore } = useAuth()
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  const [step, setStep]               = useState(0)
  const [sliding, setSliding]         = useState(false)
  const [slideDir, setSlideDir]       = useState<"forward" | "back">("forward")

  // Step 0 — store name
  const [storeName, setStoreName]     = useState("")

  // Step 1 — categories
  const [categories, setCategories]   = useState<string[]>([])

  // Step 3 — plans modal
  const [planModal, setPlanModal]     = useState<{ open: boolean; planName: string }>({ open: false, planName: "" })

  // Saving state
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState<string | null>(null)

  // Pre-fill store name
  useEffect(() => {
    if (store?.name) setStoreName(store.name)
  }, [store?.name])

  // Guard: sin store → create-store
  useEffect(() => {
    if (!isLoading && !store) router.replace("/onboarding/create-store")
  }, [isLoading, store, router])

  // Keyboard: Enter to advance
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !sliding && !saving) {
        if (step < 3) handleNext()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  })

  const TOTAL = 4

  const navigate = useCallback((dir: "forward" | "back") => {
    setSlideDir(dir)
    setSliding(true)
    setTimeout(() => setSliding(false), 420)
    setStep((s) => dir === "forward" ? s + 1 : s - 1)
    setSaveError(null)
  }, [])

  const handleNext = async () => {
    setSaveError(null)
    if (step === 0) {
      // Save store name
      if (storeName.trim().length < 3) return
      setSaving(true)
      try {
        await storeRepo.update(store!.id, { name: storeName.trim() })
        await refreshStore()
        navigate("forward")
      } catch { setSaveError("No se pudo guardar. Intentá de nuevo.") }
      finally { setSaving(false) }
    } else if (step === 1) {
      // Save categories as bio
      if (categories.length > 0) {
        setSaving(true)
        try {
          await storeRepo.update(store!.id, { bio: categories.join(", ") })
        } catch { /* non-critical */ }
        finally { setSaving(false) }
      }
      navigate("forward")
    } else if (step === 2) {
      navigate("forward")
    }
  }

  const handleFinish = () => router.push("/dashboard")

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : prev.length < 3 ? [...prev, cat] : prev
    )
  }

  if (isLoading || !store) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-[#33b380] rounded-full animate-spin" />
      </div>
    )
  }

  // Slide animation
  const slideClass = sliding
    ? slideDir === "forward"
      ? "opacity-0 translate-x-8"
      : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0"

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ProgressBar step={step} total={TOTAL} />

      {/* Step container */}
      <div className={cn(
        "flex-1 flex flex-col overflow-y-auto transition-all duration-400 ease-out",
        slideClass
      )}>
        {/* ── Step 0: Nombre de la empresa ── */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
            <div className="w-full max-w-xl">
              <p className="text-xs font-semibold text-[#33b380] uppercase tracking-widest mb-4">
                Tu empresa
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                ¿Cómo se llama<br />tu tienda?
              </h1>
              <p className="text-white/40 text-sm mb-10">
                Este será el nombre que verán tus clientes.
              </p>

              <input
                autoFocus
                type="text"
                value={storeName}
                onChange={(e) => { setStoreName(e.target.value); setSaveError(null) }}
                placeholder="Ej: Moda Latina, TechStore…"
                className="w-full bg-transparent border-b-2 border-white/15 focus:border-[#33b380] outline-none text-2xl sm:text-3xl text-white placeholder:text-white/15 pb-3 transition-colors"
              />

              {saveError && <p className="text-sm text-red-400 mt-3">{saveError}</p>}

              <div className="flex items-center justify-between mt-10">
                <span className="text-xs text-white/20 hidden sm:block">
                  Presioná <kbd className="px-1.5 py-0.5 rounded bg-white/8 font-mono text-white/30">Enter</kbd> para continuar
                </span>
                <button
                  onClick={handleNext}
                  disabled={storeName.trim().length < 3 || saving}
                  className="ml-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-[#33b380] hover:bg-[#2a9a6d] text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? "Guardando…" : "Continuar"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Categorías ── */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
            <div className="w-full max-w-xl">
              <p className="text-xs font-semibold text-[#33b380] uppercase tracking-widest mb-4">
                Tu rubro
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                ¿A qué te dedicás?
              </h1>
              <p className="text-white/40 text-sm mb-8">
                Elegí hasta 3 categorías que describan tu tienda.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map((cat) => {
                  const selected = categories.includes(cat)
                  const maxed    = categories.length >= 3 && !selected
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      disabled={maxed}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-all",
                        selected
                          ? "border-[#33b380] bg-[#33b380]/15 text-[#33b380] font-medium"
                          : maxed
                          ? "border-white/5 bg-white/2 text-white/20 cursor-not-allowed"
                          : "border-white/10 bg-white/4 text-white/60 hover:border-white/25 hover:text-white"
                      )}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      {cat}
                    </button>
                  )
                })}
              </div>

              {categories.length > 0 && (
                <p className="text-xs text-white/30 mb-6">
                  {3 - categories.length === 0 ? "Llegaste al máximo" : `Podés elegir ${3 - categories.length} más`}
                </p>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate("back")}
                  className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#33b380] hover:bg-[#2a9a6d] text-white font-semibold text-sm transition-all"
                >
                  {categories.length === 0 ? "Omitir" : "Continuar"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Templates ── */}
        {step === 2 && (
          <div className="flex-1 flex flex-col px-4 sm:px-6 pb-24">
            <div className="max-w-4xl mx-auto w-full pt-4">
              <p className="text-xs font-semibold text-[#33b380] uppercase tracking-widest mb-3">
                Diseño
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Elige el diseño de tu catálogo
              </h1>
              <p className="text-white/40 text-sm mb-8">
                Podés cambiarlo cuando quieras desde el dashboard.
              </p>

              <TemplateGallery
                mode="onboarding"
                storeId={store.id}
                currentTemplate={store.template}
                storeRepo={storeRepo}
                onSuccess={() => navigate("forward")}
              />

              <div className="flex items-center mt-6">
                <button
                  onClick={() => navigate("back")}
                  className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Planes ── */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-10">
            <div className="w-full max-w-3xl">
              <p className="text-xs font-semibold text-[#33b380] uppercase tracking-widest mb-4 text-center">
                Tu plan
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight text-center">
                Comenzás gratis,<br />
                <span className="text-[#33b380]">crecés cuando quieras</span>
              </h1>
              <p className="text-white/40 text-sm mb-10 text-center">
                Tu plan actual está activo. Podés upgradear cuando lo necesites.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-2xl border p-5 flex flex-col gap-4 transition-all",
                      plan.current
                        ? "border-[#33b380] bg-[#33b380]/5"
                        : "border-white/8 bg-white/2"
                    )}
                  >
                    {plan.current && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#33b380] text-white">
                          <Sparkles className="w-2.5 h-2.5" /> Plan activo
                        </span>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: plan.color }}>
                        {plan.name}
                      </p>
                      <p className="text-2xl font-bold text-white">{plan.price}</p>
                      <p className="text-xs text-white/35 mt-1">{plan.description}</p>
                    </div>

                    <ul className="space-y-2 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                          <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: plan.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {plan.current ? (
                      <div className="flex items-center gap-1.5 justify-center py-2 rounded-xl bg-[#33b380]/10 text-[#33b380] text-xs font-semibold">
                        <Check className="w-3.5 h-3.5" /> Activo
                      </div>
                    ) : (
                      <button
                        onClick={() => setPlanModal({ open: true, planName: plan.name })}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:text-white"
                        style={{ borderColor: `${plan.color}40`, color: plan.color }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${plan.color}15` }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <Lock className="w-3 h-3" /> Consultar
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate("back")}
                  className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#33b380] hover:bg-[#2a9a6d] text-white font-semibold text-sm transition-all"
                >
                  Ir al dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/*
        CTA diseño personalizado — renderizado FUERA del contenedor con translate-x.
        Los elementos fixed dentro de un ancestor con transform quedan atrapados en ese
        bloque contenedor y no se posicionan relativo al viewport. Al sacarlo aquí,
        position:fixed funciona correctamente sin importar el slide.
      */}
      {step === 2 && (
        <CustomDesignBar
          noSidebar
          storeName={store.name}
          defaultWhatsapp={store.whatsappNumbers[0] ?? ""}
          defaultEmail={user?.email ?? ""}
        />
      )}

      {/* Plan contact modal */}
      <PlanContactModal
        open={planModal.open}
        onClose={() => setPlanModal({ open: false, planName: "" })}
        planName={planModal.planName}
        defaultEmail={user?.email ?? ""}
      />
    </div>
  )
}
