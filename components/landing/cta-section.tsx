import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center glass-panel py-12 px-8 rounded-3xl border border-white/10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance text-white">
          Empieza a vender más{" "}
          <span className="bg-gradient-to-r from-[#6ee490] via-[#33b380] to-[#327be2] bg-clip-text text-transparent">
            hoy mismo
          </span>
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          Crea tu tienda gratis en menos de 5 minutos. Sin tarjeta de crédito, sin compromisos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-[#33b380] to-[#2a9669] hover:from-[#2a9669] hover:to-[#228055] text-white border-0 shadow-lg shadow-[#33b380]/25"
          >
            Crear mi tienda gratis
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50 text-white"
          >
            Agendar demo personalizada
          </Button>
        </div>
        <p className="text-sm text-white/60 mt-6">+5,000 vendedores ya usan InstaOrder</p>
      </div>
    </section>
  )
}
