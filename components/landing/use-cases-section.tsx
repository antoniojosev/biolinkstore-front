"use client"

import { useState, useEffect, useCallback, useId, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

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
    accentLight: "bg-[#E7F2FA]",
    accentText: "text-[#0F6BA8]",
    video: "/videos/rosier-v5.mp4",
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
    accentLight: "bg-[#FFF0EC]",
    accentText: "text-[#FF6B4A]",
    video: "/videos/poster-v12.mp4",
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
    accentLight: "bg-[#F1F5F9]",
    accentText: "text-[#64748B]",
    video: "/videos/inmuebles-v5.mp4",
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
      "Precios claros, sin el “escríbeme”",
    ],
    cta: "Crear mi catálogo",
    accent: "#10B981",
    accentLight: "bg-[#ECFDF5]",
    accentText: "text-[#10B981]",
    video: "/videos/atelier-v8.mp4",
  },
]

export function UseCasesSection() {
  const [active, setActive] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [paused, setPaused] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const [durationMs, setDurationMs] = useState(6000)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const baseId = useId()

  const restartVideo = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    try {
      v.currentTime = 0
    } catch {
      // currentTime may throw if metadata not loaded yet; play() below will still trigger from 0
    }
    v.play().catch(() => {})
  }, [])

  const goTo = useCallback((idx: number) => {
    setAnimKey((k) => k + 1)
    setActive((prev) => {
      // Re-clicking the active tab: no remount will happen (same key), so reset explicitly.
      // Switching to a different tab: <video key={c.video}> remounts and autoplays from 0.
      if (prev === idx) restartVideo()
      return idx
    })
  }, [restartVideo])

  const advance = useCallback(() => {
    setActive((a) => (a + 1) % cases.length)
    setAnimKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (paused || offscreen) v.pause()
    else v.play().catch(() => {})
  }, [paused, offscreen, active])

  const onLoadedMeta = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const d = e.currentTarget.duration
    if (d && Number.isFinite(d)) setDurationMs(Math.round(d * 1000))
  }, [])

  const onEnded = useCallback(() => {
    if (!paused && !offscreen) advance()
  }, [paused, offscreen, advance])

  const c = cases[active]
  const panelId = `${baseId}-panel-${c.id}`
  const tabId = (id: string) => `${baseId}-tab-${id}`

  return (
    <section
      ref={sectionRef}
      id="casos"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bylink-surface-soft)]/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 text-balance">
            Un link para cada tipo de{" "}
            <span className="text-[var(--bylink-primary)]">negocio</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            No importa qué vendas, ByLink se adapta a ti.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Casos de uso por tipo de negocio"
          className="flex gap-2 overflow-x-auto scrollbar-hidden snap-x snap-mandatory px-4 -mx-4 mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:snap-none sm:px-0 sm:mx-0 sm:mb-14"
        >
          {cases.map((cs, i) => {
            const selected = active === i
            return (
              <button
                key={cs.id}
                id={tabId(cs.id)}
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => goTo(i)}
                className={`relative shrink-0 snap-start sm:shrink px-4 sm:px-5 py-3 min-h-[44px] rounded-full text-sm font-semibold cursor-pointer overflow-hidden tab-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bylink-primary)] ${
                  selected
                    ? "text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700"
                }`}
                style={selected ? { backgroundColor: cs.accent } : undefined}
              >
                {cs.tab}
                {selected && !paused && (
                  <span
                    key={`prog-${animKey}`}
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-[3px] bg-white/30"
                    style={{
                      animation: `progressFill ${durationMs}ms linear forwards`,
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div
          key={c.id}
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(c.id)}
          className="case-fade-enter grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
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
                  style={{
                    animation: `bulletSlideIn 0.4s ease ${i * 0.1}s both`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: c.accent }}
                  >
                    ✓
                  </span>
                  <span className="text-gray-600 text-sm">{bullet}</span>
                </div>
              ))}
            </div>

            <Button
              asChild
              className="gap-2 text-white shadow-md cursor-pointer btn-press"
              style={{ backgroundColor: c.accent }}
            >
              <Link href="/registro">
                {c.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex justify-center">
            <div className="relative w-[280px] xs:w-[300px] sm:w-[320px]">
              <div
                className="relative rounded-[2.75rem] bg-gray-900 shadow-2xl p-[10px] aspect-[1170/2532] overflow-hidden"
                style={{ boxShadow: `0 25px 60px -15px ${c.accent}40` }}
                aria-label={`Demo ${c.tab} en móvil`}
                role="img"
              >
                <video
                  key={c.video}
                  ref={videoRef}
                  src={c.video}
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={onLoadedMeta}
                  onEnded={onEnded}
                  className="w-full h-full object-cover rounded-[calc(2.75rem-10px)] block"
                />
                <div
                  aria-hidden="true"
                  className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-gray-900 rounded-full z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
