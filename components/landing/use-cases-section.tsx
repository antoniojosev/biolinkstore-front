"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const INTERVAL = 6000

const cases = [
  {
    id: "tiendas",
    tab: "Tiendas de ropa",
    tag: "#Moda",
    headline: "Tu vitrina, siempre abierta",
    description:
      "Catálogo completo con tallas, colores y fotos profesionales. Tus clientes eligen lo que quieren y tú solo confirmas el pedido.",
    bullets: [
      "Catálogo organizado por categorías",
      "Pedidos claros por WhatsApp",
      "Se ve profesional en tu bio",
    ],
    cta: "Crear mi tienda de ropa",
    accent: "#0F6BA8",
    accentBg: "bg-[#0F6BA8]",
    accentLight: "bg-[#E7F2FA]",
    accentText: "text-[#0F6BA8]",
    phoneBg: "from-[#E7F2FA] to-[#FAFAF7]",
    phoneAccent: "bg-[#0F6BA8]/15",
  },
  {
    id: "restaurantes",
    tab: "Restaurantes",
    tag: "#Delivery",
    headline: "Tu menú digital, sin comisiones",
    description:
      "Menú con fotos, precios y categorías. Tus clientes hacen pedidos desde su mesa o piden delivery sin que tú pagues comisión.",
    bullets: [
      "Sin comisión por pedido (vs Yummy/PedidosYa)",
      "Pedidos directo a tu WhatsApp",
      "Actualiza precios en segundos",
    ],
    cta: "Crear mi menú digital",
    accent: "#FF6B4A",
    accentBg: "bg-[#FF6B4A]",
    accentLight: "bg-[#FFF0EC]",
    accentText: "text-[#FF6B4A]",
    phoneBg: "from-[#FFF0EC] to-[#FAFAF7]",
    phoneAccent: "bg-[#FF6B4A]/15",
  },
  {
    id: "inmobiliarias",
    tab: "Inmobiliarias",
    tag: "#Inmuebles",
    headline: "Tu portafolio profesional",
    description:
      "Portfolio de propiedades con galería de fotos y características. Tu marca personal como agente, accesible desde un link.",
    bullets: [
      "Galería de fotos por propiedad",
      "Contacto directo por WhatsApp",
      "Tu marca personal como agente",
    ],
    cta: "Crear mi portafolio",
    accent: "#64748B",
    accentBg: "bg-[#64748B]",
    accentLight: "bg-[#F1F5F9]",
    accentText: "text-[#64748B]",
    phoneBg: "from-[#F1F5F9] to-[#FAFAF7]",
    phoneAccent: "bg-[#64748B]/15",
  },
  {
    id: "servicios",
    tab: "Servicios",
    tag: "#Emprendedoras",
    headline: "Tu negocio, tu marca",
    description:
      "Para manicuristas, reposteras, fotógrafas, freelancers. Muestra tu trabajo, tus precios y deja que te contacten fácil.",
    bullets: [
      "Muestra tu trabajo con fotos",
      "Agenda citas por WhatsApp",
      "Precios claros, sin el \"escríbeme\"",
    ],
    cta: "Crear mi catálogo",
    accent: "#10B981",
    accentBg: "bg-[#10B981]",
    accentLight: "bg-[#ECFDF5]",
    accentText: "text-[#10B981]",
    phoneBg: "from-[#ECFDF5] to-[#FAFAF7]",
    phoneAccent: "bg-[#10B981]/15",
  },
]

export function UseCasesSection() {
  const [active, setActive] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const sectionRef = useScrollReveal<HTMLElement>()

  // Auto-advance: simple timeout that resets when `active` changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((a) => (a + 1) % cases.length)
      setAnimKey((k) => k + 1)
    }, INTERVAL)
    return () => clearTimeout(timer)
  }, [active])

  const goTo = useCallback((idx: number) => {
    setActive(idx)
    setAnimKey((k) => k + 1)
  }, [])

  const c = cases[active]

  return (
    <section
      id="casos"
      ref={sectionRef}
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bylink-surface-soft)]/50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 text-balance">
            Un link para cada tipo de{" "}
            <span className="text-[var(--bylink-primary)]">negocio</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            No importa qué vendas, ByLink se adapta a ti.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 sm:mb-14">
          {cases.map((cs, i) => (
            <button
              key={cs.id}
              onClick={() => goTo(i)}
              className={`relative px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer overflow-hidden tab-pill ${
                active === i
                  ? "text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700"
              }`}
              style={active === i ? { backgroundColor: cs.accent } : undefined}
            >
              {cs.tab}
              {active === i && (
                <div
                  key={`prog-${animKey}`}
                  className="absolute bottom-0 left-0 h-[3px] bg-white/30"
                  style={{
                    animation: `progressFill ${INTERVAL}ms linear forwards`,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          key={c.id}
          className="case-fade-enter grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          {/* Text */}
          <div>
            <div
              className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 ${c.accentLight} ${c.accentText}`}
            >
              {c.tag}
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              {c.headline}
            </h3>

            <p className="text-gray-600 text-base leading-relaxed mb-6 max-w-md">
              {c.description}
            </p>

            <div className="flex flex-col gap-3 mb-8">
              {c.bullets.map((bullet, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                  style={{ animation: `bulletSlideIn 0.4s ease ${i * 0.1}s both` }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: c.accent }}
                  >
                    &#10003;
                  </span>
                  <span className="text-gray-600 text-sm">{bullet}</span>
                </div>
              ))}
            </div>

            <Link href="/registro">
              <Button
                className="gap-2 text-white shadow-md cursor-pointer btn-press"
                style={{ backgroundColor: c.accent }}
              >
                {c.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-[260px] sm:w-[280px]">
              <div className="rounded-[2.5rem] border-[8px] border-gray-900 bg-white shadow-2xl overflow-hidden transition-shadow duration-500" style={{ boxShadow: `0 25px 60px -15px ${c.accent}20` }}>
                <div className="h-6 bg-gray-900 rounded-b-2xl mx-auto w-[40%]" />
                <div className={`aspect-[9/18] bg-gradient-to-b ${c.phoneBg} flex flex-col items-center p-4`}>
                  <div className={`w-14 h-14 rounded-full ${c.phoneAccent} mt-3 mb-2 transition-colors duration-500`} />
                  <div className="h-3 w-20 bg-gray-200/80 rounded-full mb-1" />
                  <div className="h-2 w-14 bg-gray-100 rounded-full mb-4" />

                  <div className="grid grid-cols-2 gap-2 w-full">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-white shadow-sm">
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100" />
                        <div className="p-1.5">
                          <div className="h-1.5 w-full bg-gray-100 rounded-full mb-1" />
                          <div
                            className="h-1.5 w-10 rounded-full transition-colors duration-500"
                            style={{ backgroundColor: `${c.accent}25` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto mb-2 w-full">
                    <div
                      className="h-9 rounded-lg flex items-center justify-center transition-colors duration-500 shadow-sm"
                      style={{ backgroundColor: c.accent }}
                    >
                      <span className="text-white text-[10px] font-semibold">Pedir por WhatsApp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
