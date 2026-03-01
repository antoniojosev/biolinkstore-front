"use client"

import { useState } from "react"
import { Check, Zap, Crown, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
      "Link personalizado",
      "Checkout por WhatsApp",
      "1 categoria",
      "Soporte por email",
    ],
    limitations: [
      "Marca de agua InstaOrder",
      "Sin analiticas",
      "Sin dominio propio",
    ],
    color: "#6ee490",
    colorBg: "rgba(110, 228, 144, 0.1)",
    cta: "Plan actual",
    current: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "/mes",
    description: "Para tiendas en crecimiento",
    icon: Crown,
    features: [
      "Productos ilimitados",
      "Dominio personalizado",
      "Sin marca de agua",
      "Analiticas avanzadas",
      "Categorias ilimitadas",
      "Soporte prioritario",
      "Personalizacion completa",
      "Exportar pedidos",
    ],
    limitations: [],
    color: "#33b380",
    colorBg: "rgba(51, 179, 128, 0.1)",
    cta: "Mejorar a Pro",
    current: false,
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: "$29",
    period: "/mes",
    description: "Para negocios establecidos",
    icon: Building2,
    features: [
      "Todo de Pro incluido",
      "Multiples tiendas (hasta 5)",
      "API de integracion",
      "Gestion de inventario",
      "Reportes exportables",
      "Soporte 24/7",
      "Account manager dedicado",
      "Facturacion automatica",
    ],
    limitations: [],
    color: "#327be2",
    colorBg: "rgba(50, 123, 226, 0.1)",
    cta: "Mejorar a Business",
    current: false,
  },
]

const billingHistory = [
  { date: "Gratis desde siempre", amount: "$0.00", status: "Activo", plan: "Gratis" },
]

export default function PlanPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Plan y facturacion</h1>
        <p className="text-white/60 mt-1">Administra tu suscripcion y metodo de pago</p>
      </div>

      {/* Current plan banner */}
      <div className="rounded-xl border border-[#6ee490]/20 bg-[#6ee490]/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#6ee490]/15 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#6ee490]" />
          </div>
          <div>
            <p className="text-sm text-white/60">Tu plan actual</p>
            <p className="text-lg font-bold text-white">Gratis</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="px-3 py-1.5 rounded-lg bg-[#0d1218] border border-white/10">
            <span className="text-white/50">Productos:</span>{" "}
            <span className="text-white font-medium">8 / 20</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0d1218] border border-white/10">
            <span className="text-white/50">Categorias:</span>{" "}
            <span className="text-white font-medium">1 / 1</span>
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
                plan.popular
                  ? "border-[#33b380]/40 bg-[#33b380]/5 shadow-lg shadow-[#33b380]/10"
                  : plan.current
                  ? "border-[#6ee490]/20 bg-white/[0.02]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              {plan.popular && (
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
                    <X className="w-4 h-4 mt-0.5 shrink-0 text-white/25" />
                    <span className="text-white/35 line-through">{limitation}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full ${
                  plan.current
                    ? "bg-white/5 border border-white/10 text-white/50 cursor-default hover:bg-white/5"
                    : plan.popular
                    ? "bg-gradient-to-r from-[#33b380] to-[#2a9669] hover:from-[#2a9669] hover:to-[#228055] text-white border-0"
                    : "bg-white/10 hover:bg-white/15 text-white border-0"
                }`}
                disabled={plan.current}
              >
                {plan.current ? (
                  plan.cta
                ) : (
                  <span className="flex items-center gap-2">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Payment method & billing */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Payment method */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="font-semibold text-white mb-4">Metodo de pago</h3>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
            <div className="w-12 h-8 rounded bg-white/10 flex items-center justify-center">
              <span className="text-xs font-bold text-white/60">VISA</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/40">No hay metodo de pago agregado</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-white/10 text-white/70 hover:text-white hover:bg-white/5 bg-transparent"
          >
            Agregar metodo de pago
          </Button>
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
              a: "No, InstaOrder no cobra comisiones por venta. Solo pagas tu suscripcion mensual o anual.",
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
    </div>
  )
}

function X({ className, style }: { className?: string; style?: React.CSSProperties }) {
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
