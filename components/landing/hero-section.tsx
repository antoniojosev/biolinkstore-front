import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-20 pb-0 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Mobile: centered card + image below | Desktop: side by side */}
        <div className="flex flex-col lg:flex-row lg:gap-8 items-center lg:items-start">
          <div className="space-y-5 sm:space-y-8 glass-panel-light p-5 sm:p-8 rounded-3xl border border-white/10 text-center lg:text-left lg:sticky lg:top-24 lg:shrink-0 lg:w-[480px]">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance text-white">
              Tu tienda de Instagram,{" "}
              <span className="bg-gradient-to-r from-[#6ee490] via-[#33b380] to-[#327be2] bg-clip-text text-transparent">
                en un solo link
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Crea tu catálogo digital en minutos. Tus clientes pueden explorar productos, filtrar por categorías y
              solicitar cotizaciones directamente por WhatsApp. Sin comisiones, sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
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
                className="gap-2 bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50 text-white"
              >
                <Play className="h-4 w-4" />
                Ver demo
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center w-full lg:w-auto mt-8 lg:mt-0">
            <img
              src="/hero-phone2.png"
              alt="Bio Link Store preview"
              className="mx-auto max-h-[500px] sm:max-h-[600px] lg:max-h-[1000px] rounded-2xl object-contain"
              style={{
                maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              }}
            />
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-[#33b380]/15 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
