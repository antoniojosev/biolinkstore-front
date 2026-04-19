"use client"

import { Store, Upload, Share2 } from "lucide-react"
import { useStaggerReveal } from "@/hooks/use-scroll-reveal"

const steps = [
  {
    icon: Store,
    step: "1",
    title: "Crea tu tienda",
    description:
      "Pon el nombre de tu negocio, sube tu logo y elige tus colores. En 2 minutos tienes tu tienda.",
  },
  {
    icon: Upload,
    step: "2",
    title: "Sube tus productos",
    description:
      "Agrega fotos, precios y descripción. Organízalos por categorías como quieras.",
  },
  {
    icon: Share2,
    step: "3",
    title: "Comparte tu link",
    description:
      "Pon el link en tu bio de Instagram, en tu estado de WhatsApp, donde quieras. Listo.",
  },
]

export function HowItWorksSection() {
  const stepsRef = useStaggerReveal<HTMLDivElement>()

  return (
    <section id="how-it-works" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#7C3AED]/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 text-balance">
            Lista en <span className="text-[#7C3AED]">5 minutos</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            Si sabes subir una foto a Instagram, sabes usar BioLinkStore.
          </p>
        </div>

        <div ref={stepsRef} className="stagger-children grid sm:grid-cols-3 gap-8 sm:gap-6">
          {steps.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-200/60 flex items-center justify-center transition-all duration-300 group-hover:bg-[#7C3AED] group-hover:shadow-lg group-hover:shadow-[#7C3AED]/20 group-hover:scale-105 group-hover:border-transparent">
                  <item.icon className="h-7 w-7 text-[#7C3AED] transition-colors duration-300 group-hover:text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#7C3AED] text-white font-bold text-sm flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
                  {item.step}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-[260px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
