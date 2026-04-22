"use client"

import { Store, MessageCircle, Palette, Smartphone, Search, BarChart3 } from "lucide-react"
import { useStaggerReveal } from "@/hooks/use-scroll-reveal"

const features = [
  {
    icon: Store,
    title: "Tu catálogo, siempre listo",
    description: "Como una vitrina que nunca cierra. Tus clientes ven todo sin preguntarte.",
  },
  {
    icon: MessageCircle,
    title: "Pedidos directo a WhatsApp",
    description: "El pedido te llega con todos los detalles. Solo confirmas y listo.",
  },
  {
    icon: Palette,
    title: "Tu tienda con tu estilo",
    description: "Colores, logo, tipografía. Que digan “ay, qué bonita esta tienda”.",
  },
  {
    icon: Smartphone,
    title: "Funciona en celular",
    description: "Tus clientes ven todo perfecto desde su teléfono. Diseñada mobile-first.",
  },
  {
    icon: Search,
    title: "Búsqueda inteligente",
    description: "No más “¿tienes esto en azul?”. Filtros por categoría, talla y precio.",
  },
  {
    icon: BarChart3,
    title: "Sabe qué les gusta",
    description: "Conoce qué ven más tus clientes. Vende mejor, no a ciegas.",
  },
]

export function FeaturesSection() {
  const gridRef = useStaggerReveal<HTMLDivElement>()

  return (
    <section id="features" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bylink-surface-soft)]/40 to-[var(--bylink-primary-softer)]/60 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--bylink-primary)]/[0.05] rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 text-balance">
            Todo lo que necesitas,{" "}
            <span className="text-[var(--bylink-primary)]">sin lo que no</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Herramientas pensadas para negocios reales que quieren vender más.
          </p>
        </div>

        <div ref={gridRef} className="stagger-children grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl p-6 shadow-sm shadow-black/5 border border-gray-200/60 group cursor-default transition-[transform,box-shadow] duration-300 hover:shadow-md hover:shadow-[var(--bylink-primary)]/10 hover:-translate-y-0.5"
            >
              <div
                aria-hidden="true"
                className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-[var(--bylink-primary)] to-[var(--bylink-primary-light)] opacity-40 group-hover:opacity-100 transition-opacity duration-300"
              />

              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--bylink-primary)] to-[var(--bylink-primary-hover)] flex items-center justify-center mb-4 shadow-md shadow-[var(--bylink-primary)]/20 group-hover:scale-105 transition-transform duration-300">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
