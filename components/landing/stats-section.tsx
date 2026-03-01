export function StatsSection() {
  const stats = [
    { value: "+5,000", label: "Tiendas activas", description: "confían en InstaShop", color: "text-[#6ee490]" },
    { value: "98%", label: "Más conversiones", description: "vs. solo Instagram", color: "text-[#33b380]" },
    { value: "+1M", label: "Pedidos procesados", description: "cada mes", color: "text-[#327be2]" },
    { value: "0%", label: "Comisiones", description: "por venta", color: "text-[#6ee490]" },
  ]

  return (
    <section className="py-16 border-y border-white/10 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center lg:text-left">
              <p className={`text-3xl sm:text-4xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm font-medium mt-1 text-white">{stat.label}</p>
              <p className="text-xs text-white/70">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
