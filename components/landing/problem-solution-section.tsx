"use client"

import { X, Check } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const problems = [
  "Respondes 50 DMs con los mismos precios",
  "Anotas pedidos en el bloc de notas",
  "Pierdes pedidos entre tantos mensajes",
]

const solutions = [
  "Tu catálogo siempre disponible en un link",
  "Pedidos organizados directo a tu WhatsApp",
  "Tu tienda abierta 24/7, incluso cuando duermes",
]

export function ProblemSolutionSection() {
  const sectionRef = useScrollReveal<HTMLElement>()

  return (
    <section
      ref={sectionRef}
      className="reveal relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--bylink-primary)]/20 to-transparent"
      />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 text-balance">
            De contestar DMs todo el día a{" "}
            <span className="text-[var(--bylink-primary)]">tener tu propia tienda</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50 to-rose-50/40 p-6 sm:p-8 shadow-sm shadow-red-900/5 card-lift">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-red-500" />
              </span>
              Así vendes hoy
            </h3>
            <ul className="flex flex-col gap-4">
              {problems.map((problem, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5 transition-transform group-hover:scale-110"
                  >
                    <X className="h-3 w-3 text-red-400" />
                  </span>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    {problem}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--bylink-primary)]/20 bg-gradient-to-br from-[var(--bylink-primary-soft)] to-white p-6 sm:p-8 shadow-sm shadow-[var(--bylink-primary)]/5 card-lift">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-[var(--bylink-primary-soft)] flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-[var(--bylink-primary)]" />
              </span>
              Así vendes con ByLink
            </h3>
            <ul className="flex flex-col gap-4">
              {solutions.map((solution, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--bylink-primary)] flex items-center justify-center mt-0.5 transition-transform group-hover:scale-110"
                  >
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    {solution}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
