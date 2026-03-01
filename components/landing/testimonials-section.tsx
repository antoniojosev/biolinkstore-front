import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "María García",
      handle: "@mariamodas",
      avatar: "/smiling-woman-portrait.png",
      content:
        "Antes perdía horas respondiendo DMs con precios. Ahora mis clientes ven todo en mi catálogo y me escriben listos para comprar. Mis ventas subieron un 40%.",
      rating: 5,
    },
    {
      name: "Carlos Mendoza",
      handle: "@carlostech",
      avatar: "/professional-man-portrait.png",
      content:
        "El checkout por WhatsApp es genial. El cliente ya llega con el pedido armado, solo confirmo y envío. Proceso 3x más pedidos en el mismo tiempo.",
      rating: 5,
    },
    {
      name: "Ana Rodríguez",
      handle: "@anajoyeria",
      avatar: "/woman-entrepreneur-portrait.png",
      content:
        "Probé otras plataformas pero cobraban comisión por venta. InstaShop me deja quedarme con todo. Es como tener mi propia tienda online profesional.",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 glass-panel">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm text-[#33b380] font-semibold mb-2">Testimonios</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance text-white">
            Vendedores que ya transformaron su negocio
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Más de 5,000 tiendas de Instagram confían en InstaShop para vender más.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 rounded-2xl bg-[#0a0f14] border border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#6ee490] text-[#6ee490]" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6 text-white/90">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">{testimonial.name}</p>
                  <p className="text-xs text-[#33b380]">{testimonial.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
