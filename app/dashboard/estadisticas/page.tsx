"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react"

const weeklyData = [
  { day: "Lun", visits: 45, orders: 4 },
  { day: "Mar", visits: 62, orders: 7 },
  { day: "Mie", visits: 58, orders: 5 },
  { day: "Jue", visits: 71, orders: 9 },
  { day: "Vie", visits: 89, orders: 12 },
  { day: "Sab", visits: 112, orders: 15 },
  { day: "Dom", visits: 78, orders: 8 },
]

const maxVisits = Math.max(...weeklyData.map((d) => d.visits))

const monthStats = [
  { label: "Ingresos totales", value: "$385,200", icon: DollarSign, color: "#33b380" },
  { label: "Total pedidos", value: "142", icon: ShoppingCart, color: "#327be2" },
  { label: "Visitantes unicos", value: "2,847", icon: Users, color: "#6ee490" },
  { label: "Conversion", value: "4.2%", icon: TrendingUp, color: "#33b380" },
]

const topCategories = [
  { name: "Vestidos", percentage: 35, revenue: 134820 },
  { name: "Pantalones", percentage: 25, revenue: 96300 },
  { name: "Blusas", percentage: 20, revenue: 77040 },
  { name: "Zapatos", percentage: 12, revenue: 46224 },
  { name: "Accesorios", percentage: 8, revenue: 30816 },
]

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Estadisticas</h1>
        <p className="text-sm text-white/50">Rendimiento de tu tienda este mes</p>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {monthStats.map((stat) => (
          <Card key={stat.label} className="bg-[#0d1218] border-white/5">
            <CardContent className="p-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <Card className="lg:col-span-2 bg-[#0d1218] border-white/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">
              Visitas esta semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-white/50">{d.visits}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#33b380] to-[#6ee490] transition-all"
                    style={{ height: `${(d.visits / maxVisits) * 100}%` }}
                  />
                  <span className="text-[11px] text-white/40">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="bg-[#0d1218] border-white/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">
              Ventas por categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{cat.name}</span>
                  <span className="text-xs text-white/50">{cat.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#33b380] to-[#6ee490] transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
