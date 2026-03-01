import { Smartphone, Search, ShoppingCart, MessageCircle, Palette, BarChart3 } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Smartphone,
      title: "Catálogo móvil optimizado",
      description:
        "Tu tienda se ve perfecta en cualquier dispositivo. Diseñada específicamente para la experiencia móvil de Instagram.",
      color: "#33b380",
    },
    {
      icon: Search,
      title: "Búsqueda y filtros",
      description:
        "Tus clientes encuentran lo que buscan al instante con filtros por categoría, precio y búsqueda inteligente.",
      color: "#327be2",
    },
    {
      icon: ShoppingCart,
      title: "Carrito de compras",
      description: "Los clientes agregan múltiples productos y hacen un solo pedido. Más ventas, menos mensajes.",
      color: "#6ee490",
    },
    {
      icon: MessageCircle,
      title: "Checkout por WhatsApp",
      description:
        "El pedido llega directo a tu WhatsApp con todos los detalles. Responde y cierra la venta al instante.",
      color: "#33b380",
    },
    {
      icon: Palette,
      title: "Personalización total",
      description: "Colores, logo, categorías. Tu tienda refleja tu marca con un diseño único y profesional.",
      color: "#327be2",
    },
    {
      icon: BarChart3,
      title: "Analíticas en tiempo real",
      description: "Conoce qué productos ven más, de dónde vienen tus clientes y optimiza tu negocio.",
      color: "#6ee490",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 glass-panel-light py-8 px-6 rounded-2xl border border-white/10 max-w-3xl mx-auto">
          <p className="text-sm text-[#6ee490] font-semibold mb-2">Funciones</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance text-white">
            Todo lo que necesitas para vender más
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para vendedores de Instagram que quieren profesionalizar su negocio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{ backgroundColor: `${feature.color}25` }}
              >
                <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-sm text-white/80 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
