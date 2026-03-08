"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, Zap, Crown, Building2, MessageCircle, Mail, Send, Sparkles, Globe, Settings2, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { PaymentReportForm } from "@/components/dashboard/payment-report-form"


const plansMeta: Record<string, { icon: typeof Zap; color: string; colorBg: string }> = {
  free: { icon: Zap, color: "#6ee490", colorBg: "rgba(110, 228, 144, 0.1)" },
  pro: { icon: Crown, color: "#33b380", colorBg: "rgba(51, 179, 128, 0.1)" },
  business: { icon: Building2, color: "#327be2", colorBg: "rgba(50, 123, 226, 0.1)" },
}

const plans = [
  {
    id: "free",
    name: "Gratis",
    price: "$0",
    period: "para siempre",
    description: "Perfecto para empezar a vender",
    icon: Zap,
    features: [
      "Hasta 20 productos",
      "5 fotos por producto",
      "5 categorias",
      "Link personalizado",
      "Checkout por WhatsApp",
      "Dominio personalizado",
      "Analiticas basicas",
      "Soporte por email",
    ],
    limitations: [
      "Marca de agua Bio Link Store",
    ],
    color: "#6ee490",
    colorBg: "rgba(110, 228, 144, 0.1)",
    cta: "Plan actual",
    ctaUpgrade: "Plan actual",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "/mes",
    description: "Para tiendas en crecimiento",
    icon: Crown,
    features: [
      "Hasta 100 productos",
      "10 fotos por producto",
      "Categorias ilimitadas",
      "Sin marca de agua",
      "Analiticas avanzadas",
      "Acceso a templates Pro",
      "Lista de deseos (Wishlist)",
      "Exportar cotizaciones",
      "Soporte prioritario",
    ],
    limitations: [],
    color: "#33b380",
    colorBg: "rgba(51, 179, 128, 0.1)",
    cta: "Mejorar a Pro",
    ctaUpgrade: "Mejorar a Pro",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: "$150",
    period: "/mes",
    description: "Para negocios establecidos",
    icon: Building2,
    features: [
      "Todo de Pro incluido",
      "Productos ilimitados",
      "Fotos ilimitadas",
      "Multiples tiendas (hasta 3)",
      "API de integracion",
      "Reportes exportables",
      "Busqueda con IA por imagen e intencion",
      "Recomendaciones personalizadas con IA",
      "CRM de ventas integrado",
      "Soporte 24/7",
      "Account manager dedicado",
    ],
    limitations: [],
    color: "#327be2",
    colorBg: "rgba(50, 123, 226, 0.1)",
    cta: "Mejorar a Business",
    ctaUpgrade: "Mejorar a Business",
  },
]

const billingHistory = [
  { date: "Gratis desde siempre", amount: "$0.00", status: "Activo", plan: "Gratis" },
]

interface StoreCounts {
  productCount: number
  categoryCount: number
  maxProducts: number
  maxCategories: number
  plan: 'FREE' | 'PRO' | 'BUSINESS'
}

function UpgradeModal({
  open,
  onClose,
  planName,
  storeId,
}: {
  open: boolean
  onClose: () => void
  planName: string
  storeId: string
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto scrollbar-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#33b380]/10 border border-[#33b380]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#33b380]" />
            </div>
            <DialogTitle>Mejorar a {planName}</DialogTitle>
          </div>
          <DialogDescription>
            Realizá la transferencia y subí el comprobante para activar tu plan.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <PaymentReportForm
            storeId={storeId}
            type="PLAN_UPGRADE"
            targetPlan={planName}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DomainPaymentModal({
  open,
  onClose,
  storeId,
}: {
  open: boolean
  onClose: () => void
  storeId: string
}) {
  const [domain, setDomain] = useState('')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto scrollbar-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#327be2]/10 border border-[#327be2]/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-[#327be2]" />
            </div>
            <DialogTitle>Dominio personalizado</DialogTitle>
          </div>
          <DialogDescription>
            Ingresa tu dominio y reporta el pago para activarlo.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 font-medium">Tu dominio</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="mitienda.com"
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#327be2]/50 focus:bg-white/8 transition-all"
            />
          </div>

          {domain.trim() ? (
            <PaymentReportForm
              storeId={storeId}
              type="DOMAIN"
              notes={`Dominio: ${domain.trim()}`}
              onSuccess={onClose}
              onCancel={onClose}
            />
          ) : (
            <p className="text-xs text-white/30 text-center py-2">
              Ingresa un dominio para continuar
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatCount(count: number, max: number) {
  return `${count} / ${max === -1 ? '∞' : max}`
}

export default function PlanPage() {
  const { user, store, http } = useAuth()
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; planName: string }>({
    open: false,
    planName: '',
  })
  const [domainModal, setDomainModal] = useState(false)
  const [customPlanModal, setCustomPlanModal] = useState(false)
  const [counts, setCounts] = useState<StoreCounts | null>(null)

  useEffect(() => {
    if (!store?.id || !http) return
    http.get<StoreCounts>(`/api/stores/${store.id}/counts`)
      .then(setCounts)
      .catch(() => {})
  }, [store?.id, http])

  const currentPlan = counts?.plan?.toLowerCase() ?? store?.subscription?.plan?.toLowerCase() ?? 'free'
  const meta = plansMeta[currentPlan] ?? plansMeta.free
  const PlanIcon = meta.icon
  const planDisplayName = currentPlan === 'free' ? 'Gratis' : currentPlan === 'pro' ? 'Pro' : 'Business'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Plan y facturacion</h1>
        <p className="text-white/60 mt-1">Administra tu suscripcion y metodo de pago</p>
      </div>

      {/* Current plan banner */}
      <div
        className="rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          borderColor: `${meta.color}33`,
          backgroundColor: `${meta.color}0d`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${meta.color}26` }}
          >
            <PlanIcon className="w-6 h-6" style={{ color: meta.color }} />
          </div>
          <div>
            <p className="text-sm text-white/60">Tu plan actual</p>
            <p className="text-lg font-bold text-white">{planDisplayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="px-3 py-1.5 rounded-lg bg-[#0d1218] border border-white/10">
            <span className="text-white/50">Productos:</span>{" "}
            <span className="text-white font-medium">
              {counts ? formatCount(counts.productCount, counts.maxProducts) : '…'}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0d1218] border border-white/10">
            <span className="text-white/50">Categorias:</span>{" "}
            <span className="text-white font-medium">
              {counts ? formatCount(counts.categoryCount, counts.maxCategories) : '…'}
            </span>
          </div>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            billing === "monthly"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white"
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setBilling("annual")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            billing === "annual"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white"
          }`}
        >
          Anual
          <Badge className="bg-[#33b380]/20 text-[#6ee490] border-0 text-[10px] px-1.5">
            -20%
          </Badge>
        </button>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan
          const displayPrice =
            billing === "annual" && plan.price !== "$0"
              ? `$${Math.round(parseInt(plan.price.replace("$", "")) * 0.8)}`
              : plan.price
          const displayPeriod =
            plan.price === "$0" ? plan.period : billing === "annual" ? "/mes (facturado anual)" : plan.period

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 flex flex-col transition-all ${
                plan.popular && !isCurrent
                  ? "border-[#33b380]/40 bg-[#33b380]/5 shadow-lg shadow-[#33b380]/10"
                  : isCurrent
                  ? `border-white/20 bg-white/[0.03]`
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              {plan.popular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-[#33b380] to-[#2a9669] text-white text-xs font-semibold rounded-full">
                  Recomendado
                </div>
              )}

              {/* Plan icon & name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: plan.colorBg }}
                >
                  <plan.icon className="w-5 h-5" style={{ color: plan.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-white/50">{plan.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold" style={{ color: plan.color }}>
                  {displayPrice}
                </span>
                <span className="text-sm text-white/50">{displayPeriod}</span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: plan.color }}
                    />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <li key={`lim-${i}`} className="flex items-start gap-2.5 text-sm">
                    <XIcon className="w-4 h-4 mt-0.5 shrink-0 text-white/25" />
                    <span className="text-white/35 line-through">{limitation}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full ${
                  isCurrent
                    ? "bg-white/5 border border-white/10 text-white/50 cursor-default hover:bg-white/5"
                    : plan.popular
                    ? "bg-gradient-to-r from-[#33b380] to-[#2a9669] hover:from-[#2a9669] hover:to-[#228055] text-white border-0"
                    : "bg-white/10 hover:bg-white/15 text-white border-0"
                }`}
                disabled={isCurrent}
                onClick={() => !isCurrent && setUpgradeModal({ open: true, planName: plan.name })}
              >
                {isCurrent ? "Plan actual" : plan.cta}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Custom plan CTA */}
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6ee490] via-[#33b380] to-[#327be2] p-px">
          <div className="w-full h-full rounded-xl bg-[#0d1218]" />
        </div>
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[250px] h-[80px] bg-[#33b380]/15 blur-3xl" />
        <div className="relative p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#33b380]/20 to-[#327be2]/20 flex items-center justify-center shrink-0">
              <Settings2 className="w-5 h-5 text-[#6ee490]" />
            </div>
            <div>
              <h3 className="font-bold text-white">
                ¿Necesitas algo{" "}
                <span className="bg-gradient-to-r from-[#6ee490] via-[#33b380] to-[#327be2] bg-clip-text text-transparent">
                  a tu medida
                </span>
                ?
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Elige funciones individuales sin pagar un plan completo. Armamos la combinacion perfecta para tu negocio.
              </p>
            </div>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-[#33b380] to-[#327be2] hover:from-[#2a9669] hover:to-[#2a6bc7] text-white border-0 shadow-lg shadow-[#33b380]/15 shrink-0"
            onClick={() => setCustomPlanModal(true)}
          >
            <MessageCircle className="h-4 w-4" />
            Cotizar mi plan
          </Button>
        </div>
      </div>

      {/* Add-ons */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white text-lg">Add-ons</h3>
        <div
          className="rounded-xl border border-[#327be2]/20 bg-[#327be2]/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#327be2]/15 flex items-center justify-center">
              <Globe className="w-6 h-6 text-[#327be2]" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Dominio personalizado</p>
              <p className="text-sm text-white/50">Usa tu propio dominio en vez de biolinkstore.com/tu-tienda</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-[#327be2]">$2<span className="text-sm text-white/40 font-normal">/mes</span></p>
              <p className="text-xs text-white/30">o $15/año</p>
            </div>
            <Button
              className="bg-[#327be2] hover:bg-[#2a6acc] text-white border-0"
              onClick={() => setDomainModal(true)}
            >
              Configurar
            </Button>
          </div>
        </div>
      </div>

      {/* Billing history */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="font-semibold text-white mb-4">Historial de facturacion</h3>
        <div className="space-y-3">
          {billingHistory.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]"
            >
              <div>
                <p className="text-sm text-white/80">{item.plan}</p>
                <p className="text-xs text-white/40">{item.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{item.amount}</p>
                <Badge className="bg-[#33b380]/15 text-[#6ee490] border-0 text-[10px]">
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="font-semibold text-white mb-4">Preguntas frecuentes</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              q: "Puedo cancelar en cualquier momento?",
              a: "Si, puedes cancelar tu suscripcion en cualquier momento. Seguiras teniendo acceso hasta el final de tu periodo de facturacion.",
            },
            {
              q: "Que pasa si excedo el limite de productos?",
              a: "No podras agregar mas productos hasta que mejores tu plan o elimines productos existentes.",
            },
            {
              q: "Hay comisiones por venta?",
              a: "No, Bio Link Store no cobra comisiones por venta. Solo pagas tu suscripcion mensual o anual.",
            },
            {
              q: "Puedo cambiar de plan en cualquier momento?",
              a: "Si, puedes subir o bajar de plan cuando quieras. El cambio se aplica inmediatamente.",
            },
          ].map((faq, i) => (
            <div key={i} className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
              <p className="text-sm font-medium text-white mb-1.5">{faq.q}</p>
              <p className="text-xs text-white/50 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, planName: '' })}
        planName={upgradeModal.planName}
        storeId={store?.id ?? ''}
      />

      {/* Domain Modal */}
      <DomainPaymentModal
        open={domainModal}
        onClose={() => setDomainModal(false)}
        storeId={store?.id ?? ''}
      />

      {/* Custom Plan Modal */}
      <CustomPlanModal
        open={customPlanModal}
        onClose={() => setCustomPlanModal(false)}
        storeId={store?.id ?? ''}
        storeName={store?.name ?? 'Mi tienda'}
        defaultEmail={user?.email ?? ''}
      />
    </div>
  )
}

function CustomPlanModal({
  open,
  onClose,
  storeId,
  storeName,
  defaultEmail,
}: {
  open: boolean
  onClose: () => void
  storeId: string
  storeName: string
  defaultEmail: string
}) {
  const { http } = useAuth()
  const [method, setMethod]           = useState<'whatsapp' | 'email'>('whatsapp')
  const [whatsapp, setWhatsapp]       = useState('')
  const [email, setEmail]             = useState(defaultEmail)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState('')

  const handleSend = async () => {
    setError('')
    setSubmitting(true)
    try {
      await http.post('/api/contact/inquiry', {
        type: 'CUSTOM_PLAN',
        storeId,
        storeName,
        method,
        contact: method === 'whatsapp' ? whatsapp.trim() : email.trim(),
        description: description.trim() || undefined,
      })
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#33b380]/15 to-[#327be2]/15 border border-[#33b380]/20 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-[#6ee490]" />
            </div>
            <DialogTitle>Plan personalizado</DialogTitle>
          </div>
          <DialogDescription>
            Contanos qué necesitas y te armamos una propuesta a medida.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#33b380]/15 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[#33b380]" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">¡Solicitud recibida!</p>
                <p className="text-sm text-white/50 mt-1.5 leading-relaxed max-w-xs">
                  Te contactaremos en las próximas <span className="text-white/70 font-medium">24 horas</span> con una propuesta a medida.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-1 px-6 py-2.5 rounded-xl bg-[#33b380] hover:bg-[#2a9a6d] text-white text-sm font-semibold transition-all"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              {/* Method selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethod('whatsapp')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    method === 'whatsapp'
                      ? "border-[#25D366] bg-[#25D366]/8 text-white"
                      : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
                  )}
                >
                  <MessageCircle className={cn("w-5 h-5", method === 'whatsapp' ? "text-[#25D366]" : "")} />
                  <span className="text-[11px] font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={() => setMethod('email')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    method === 'email'
                      ? "border-[#327be2] bg-[#327be2]/8 text-white"
                      : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
                  )}
                >
                  <Mail className={cn("w-5 h-5", method === 'email' ? "text-[#327be2]" : "")} />
                  <span className="text-[11px] font-medium">Email</span>
                </button>
              </div>

              {/* Contact input */}
              {method === 'whatsapp' ? (
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Tu número de WhatsApp</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+54 9 11 XXXX XXXX"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#25D366]/50 focus:bg-white/8 transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Tu email de contacto</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#327be2]/50 focus:bg-white/8 transition-all"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium">
                  ¿Qué funciones te interesan? <span className="text-white/20">(opcional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Necesito integraciones con MercadoLibre, reportes personalizados..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#33b380]/50 focus:bg-white/8 transition-all resize-none"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSend}
                  disabled={submitting || (method === 'whatsapp' ? !whatsapp.trim() : !email.trim())}
                  className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#33b380] to-[#327be2] hover:from-[#2a9669] hover:to-[#2a6bc7] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {submitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>

              <p className="text-[11px] text-white/25 text-center">
                Te contactaremos en menos de 24 horas con una propuesta.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function XIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
