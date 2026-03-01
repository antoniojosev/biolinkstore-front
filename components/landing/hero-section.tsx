import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 glass-panel-light p-8 rounded-3xl border border-white/10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance text-white">
              Tu tienda de Instagram,{" "}
              <span className="bg-gradient-to-r from-[#6ee490] via-[#33b380] to-[#327be2] bg-clip-text text-transparent">
                en un solo link
              </span>
            </h1>
            <p className="text-lg text-white/90 max-w-xl leading-relaxed">
              Crea tu catálogo digital en minutos. Tus clientes pueden explorar productos, filtrar por categorías y
              hacer pedidos directamente por WhatsApp. Sin comisiones, sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
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

          <div className="relative">
            <div className="relative mx-auto w-[280px] h-[560px] glass-panel rounded-[3rem] border-4 border-white/20 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
              <div className="h-full w-full bg-[#0a0f14] p-4 pt-8 overflow-hidden">
                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#33b380]/20 flex items-center justify-center">
                    <span className="text-2xl">👗</span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-sm text-white">Fashion Store</h3>
                    <p className="text-xs text-white/70">@fashionstore</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {["Todo", "Vestidos", "Blusas"].map((cat, i) => (
                    <span
                      key={cat}
                      className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                        i === 0 ? "bg-[#33b380] text-white" : "bg-white/10 text-white/80"
                      }`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-lg bg-white/10 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-black/30 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
