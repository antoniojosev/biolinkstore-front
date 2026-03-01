import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Gratis",
      price: "$0",
      period: "para siempre",
      description: "Perfecto para empezar a vender",
      features: [
        "Hasta 20 productos",
        "Link personalizado",
        "Checkout por WhatsApp",
        "Diseño básico",
        "Soporte por email",
      ],
      cta: "Comenzar gratis",
      highlighted: false,
      color: "#6ee490",
    },
    {
      name: "Pro",
      price: "$9",
      period: "por mes",
      description: "Para tiendas en crecimiento",
      features: [
        "Productos ilimitados",
        "Dominio personalizado",
        "Sin marca de agua",
        "Analíticas avanzadas",
        "Múltiples categorías",
        "Soporte prioritario",
        "Personalización completa",
      ],
      cta: "Probar 14 días gratis",
      highlighted: true,
      color: "#33b380",
    },
    {
      name: "Business",
      price: "$29",
      period: "por mes",
      description: "Para negocios establecidos",
      features: [
        "Todo de Pro",
        "Múltiples tiendas",
        "API de integración",
        "Gestión de inventario",
        "Reportes exportables",
        "Soporte 24/7",
        "Account manager dedicado",
      ],
      cta: "Contactar ventas",
      highlighted: false,
      color: "#327be2",
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 glass-panel-light py-8 px-6 rounded-2xl border border-white/10 max-w-3xl mx-auto">
          <p className="text-sm text-[#6ee490] font-semibold mb-2">Precios</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance text-white">
            Planes para cada etapa de tu negocio
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Comienza gratis y escala cuando lo necesites. Sin sorpresas, sin comisiones por venta.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border glass-panel ${
                plan.highlighted
                  ? "border-[#33b380]/50 shadow-lg shadow-[#33b380]/20 ring-1 ring-[#33b380]/30"
                  : "border-white/10"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#33b380] to-[#2a9669] text-white text-xs font-medium rounded-full">
                  Más popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: plan.color }}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-white/70">{plan.period}</span>
                </div>
                <p className="text-sm text-white/70 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-[#33b380] to-[#2a9669] hover:from-[#2a9669] hover:to-[#228055] text-white border-0"
                    : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                }`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
