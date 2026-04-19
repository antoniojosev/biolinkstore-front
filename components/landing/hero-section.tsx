"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white to-[var(--bylink-surface-soft)]">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--bylink-primary)]/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text side */}
          <div className="text-center lg:text-left">
            {/* Badge — turquesa con dot coral para micro-acento */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--bylink-primary)]/20 bg-[var(--bylink-primary-soft)] px-4 py-1.5 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--bylink-accent)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--bylink-accent)]" />
              </span>
              <span className="text-sm font-medium text-[var(--bylink-primary-hover)]">
                Nuevo: Menús y portafolios inmobiliarios
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 text-balance leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              Deja de perder pedidos{" "}
              <span className="text-[var(--bylink-accent)]">en los DMs</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.35s', animationFillMode: 'both' }}>
              Tus clientes te escriben, pero entre tantos mensajes se te escapan pedidos.
              Pon un link en tu bio y listo — tu catálogo con precios, fotos y pedidos
              directo a tu WhatsApp.
            </p>

            {/* CTA — turquesa, accion primaria */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              <Link href="/registro">
                <Button
                  size="lg"
                  className="gap-2 bg-[var(--bylink-primary)] hover:bg-[var(--bylink-primary-hover)] text-white shadow-lg shadow-[var(--bylink-primary)]/25 w-full sm:w-auto text-base px-8 h-12 rounded-xl cursor-pointer btn-press btn-shimmer"
                >
                  Montar mi tienda gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
              Gratis. Sin tarjeta. Lista en 5 minutos.
            </p>

            {/* Trust bullets */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
              {["Sin comisiones", "WhatsApp nativo", "Listo en minutos"].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--bylink-primary-soft)] flex items-center justify-center">
                    <span className="text-[var(--bylink-primary)] text-[10px] font-bold">&#10003;</span>
                  </span>
                  <span className="text-sm text-gray-600">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup side */}
          <div className="relative flex justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--bylink-primary)]/[0.09] rounded-full blur-3xl animate-gentle-pulse" />

            <div className="relative w-[280px] sm:w-[300px] phone-reveal">
              <div className="rounded-[2.5rem] border-[8px] border-gray-900 bg-white shadow-2xl overflow-hidden">
                <div className="h-6 bg-gray-900 rounded-b-2xl mx-auto w-[40%]" />
                <div className="aspect-[9/18] bg-gradient-to-b from-[var(--bylink-surface-soft)] to-white flex flex-col items-center p-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--bylink-primary)]/15 mt-4 mb-3" />
                  <div className="h-3 w-24 bg-gray-200/80 rounded-full mb-1" />
                  <div className="h-2 w-16 bg-gray-100 rounded-full mb-6" />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100" />
                        <div className="p-2">
                          <div className="h-2 w-full bg-gray-100 rounded-full mb-1" />
                          <div className="h-2 w-12 bg-[var(--bylink-primary)]/15 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto mb-2 w-full">
                    <div className="h-10 bg-[#25D366] rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-semibold">Pedir por WhatsApp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute top-8 -right-2 sm:right-0 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 badge-pop animate-float">
              <div className="text-2xl font-extrabold text-[var(--bylink-primary)] count-pulse">0%</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Comisiones</div>
            </div>

            <div className="absolute bottom-12 -left-2 sm:left-0 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 badge-pop-delayed animate-float-delayed">
              <div className="text-lg">💬</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">WhatsApp</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
