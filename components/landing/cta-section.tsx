"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function CtaSection() {
  const sectionRef = useScrollReveal<HTMLElement>()

  return (
    <section ref={sectionRef} className="reveal relative overflow-hidden">
      {/* Gradient transition from white to violet */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />

      <div className="pt-24 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EDE9FE] to-[#7C3AED]">
        {/* Decorative elements */}
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-white/[0.05] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Tu negocio merece más que un DM
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Crea tu tienda en minutos. Gratis, sin tarjeta, sin complicaciones.
          </p>
          <div className="mt-8">
            <Link href="/registro">
              <Button
                size="lg"
                className="gap-2 bg-white text-[#7C3AED] hover:bg-gray-50 shadow-lg text-base px-8 h-12 rounded-xl font-bold cursor-pointer btn-press btn-shimmer"
              >
                Montar mi tienda gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Gratis. Sin tarjeta. Lista en 5 minutos.
          </p>
        </div>
      </div>
    </section>
  )
}
