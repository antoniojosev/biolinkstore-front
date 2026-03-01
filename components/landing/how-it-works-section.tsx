import { UserPlus, Upload, Share2, MessageCircle } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: UserPlus,
      step: "1",
      title: "Crea tu cuenta",
      description: "Regístrate en segundos con tu email o cuenta de Instagram. Sin tarjeta de crédito.",
    },
    {
      icon: Upload,
      step: "2",
      title: "Sube tus productos",
      description: "Añade fotos, precios y descripciones. Organiza por categorías como quieras.",
    },
    {
      icon: Share2,
      step: "3",
      title: "Comparte tu link",
      description: "Pon el link en tu bio de Instagram. Un solo link para todo tu catálogo.",
    },
    {
      icon: MessageCircle,
      step: "4",
      title: "Recibe pedidos",
      description: "Los pedidos llegan a tu WhatsApp listos para confirmar y enviar.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm text-[#6ee490] font-semibold mb-2">Cómo funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance text-white">De 0 a vendiendo en 5 minutos</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            No necesitas conocimientos técnicos. Si sabes usar Instagram, puedes crear tu tienda.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 md:gap-4">
          {steps.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Círculo con número e icono combinados */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#33b380] to-[#327be2] flex items-center justify-center shadow-lg shadow-[#33b380]/30">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                {/* Número en esquina */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-[#0f1419] font-bold text-sm flex items-center justify-center shadow-md">
                  {item.step}
                </div>

                {/* Línea conectora - solo entre elementos, no después del último */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-[2px] bg-gradient-to-r from-[#33b380]/50 to-transparent -translate-y-1/2 ml-2" />
                )}
              </div>

              {/* Contenido */}
              <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed max-w-[200px]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
