"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const faqs = [
  {
    question: "¿De verdad es gratis?",
    answer:
      "Sí. El plan gratis no tiene límite de tiempo ni te pide tarjeta de crédito. Incluye hasta 20 productos y una tienda completamente funcional. Úsalo todo el tiempo que quieras.",
  },
  {
    question: "¿Necesito saber de tecnología?",
    answer:
      "Si sabes subir una foto a Instagram, sabes usar ByLink. Tu tienda está lista en 5 minutos. Sin código, sin configuraciones complicadas.",
  },
  {
    question: "¿Cómo recibo los pedidos?",
    answer:
      "Cuando un cliente hace un pedido, te llega directo a tu WhatsApp con todos los detalles: productos, cantidades y el total. Solo confirmas y listo.",
  },
  {
    question: "¿Puedo cobrar con Pago Móvil?",
    answer:
      "ByLink no procesa pagos directamente — tus clientes te contactan por WhatsApp y tú coordinas el pago como siempre: Pago Móvil, Zelle, efectivo, lo que uses.",
  },
  {
    question: "¿Y si quiero cambiar de plan?",
    answer:
      "Puedes subir a Pro cuando quieras. Si no te convence, puedes volver al plan gratis sin perder tu tienda ni tus productos.",
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sectionRef = useScrollReveal<HTMLElement>()

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <section id="faq" ref={sectionRef} className="reveal py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 text-balance">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-xl border bg-white overflow-hidden transition-all duration-300 ${
                openIndex === i
                  ? "border-[var(--bylink-primary)]/30 shadow-md shadow-[var(--bylink-primary)]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer group"
              >
                <span className="text-base font-semibold text-gray-900 pr-4 group-hover:text-[var(--bylink-primary)] transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 transition-all duration-300 ${
                    openIndex === i ? "rotate-180 text-[var(--bylink-primary)]" : "text-gray-400"
                  }`}
                />
              </button>
              <div className={`faq-answer ${openIndex === i ? "is-open" : ""}`}>
                <div>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
