"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, Package } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { OrdersHttpRepository } from "@/lib/orders-api"
import type { StoreStats } from "@/lib/orders-api"

type DateRange = '7d' | '30d' | 'month'

function getDateRange(range: DateRange): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString()
  let from: Date

  switch (range) {
    case '7d':
      from = new Date(now)
      from.setDate(from.getDate() - 7)
      break
    case '30d':
      from = new Date(now)
      from.setDate(from.getDate() - 30)
      break
    case 'month':
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1)
      break
  }

  return { from: from.toISOString(), to }
}

export default function StatsPage() {
  const { store, http } = useAuth()
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<DateRange>('month')

  const ordersRepo = useMemo(() => new OrdersHttpRepository(http), [http])

  useEffect(() => {
    if (!store?.id) return
    setLoading(true)
    const { from, to } = getDateRange(range)
    ordersRepo.getStats(store.id, from, to)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [store?.id, ordersRepo, range])

  const monthStats = [
    { label: "Total cotizaciones", value: stats ? String(stats.totalQuotes) : "—", icon: ShoppingCart, color: "#327be2" },
    { label: "Visitantes únicos", value: stats ? String(stats.uniqueVisitors) : "—", icon: Users, color: "#6ee490" },
  ]

  const maxVisits = stats?.visitsByDay
    ? Math.max(...stats.visitsByDay.map((d) => d.count), 1)
    : 1

  const dateRanges: { label: string; value: DateRange }[] = [
    { label: '7 días', value: '7d' },
    { label: '30 días', value: '30d' },
    { label: 'Este mes', value: 'month' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Estadísticas</h1>
          <p className="text-sm text-white/50">Rendimiento de tu tienda</p>
        </div>
        <div className="flex gap-1.5">
          {dateRanges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r.value
                  ? "bg-[#33b380] text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {monthStats.map((stat) => (
          <Card key={stat.label} className="bg-[#0d1218] border-white/5">
            <CardContent className="p-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white">
                {loading ? <span className="inline-block w-12 h-7 bg-white/5 rounded animate-pulse" /> : stat.value}
              </p>
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
              Visitas por día
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-5 h-5 border-2 border-white/10 border-t-[#33b380] rounded-full animate-spin" />
              </div>
            ) : stats?.visitsByDay && stats.visitsByDay.length > 0 ? (
              <div className="flex items-end gap-1 h-48 overflow-x-auto">
                {stats.visitsByDay.map((d) => (
                  <div key={d.date} className="flex-1 min-w-[24px] flex flex-col items-center gap-2">
                    <span className="text-[10px] text-white/50">{d.count}</span>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#33b380] to-[#6ee490] transition-all min-h-[2px]"
                      style={{ height: `${(d.count / maxVisits) * 100}%` }}
                    />
                    <span className="text-[9px] text-white/40 truncate max-w-[40px]">
                      {d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-white/30 text-sm">
                Sin datos de visitas
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="bg-[#0d1218] border-white/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">
              Vistas por categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : stats?.viewsByCategory && stats.viewsByCategory.length > 0 ? (
              (() => {
                const maxViews = Math.max(...stats.viewsByCategory.map((c) => c.views), 1)
                return stats.viewsByCategory.map((cat) => (
                  <div key={cat.categoryName} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{cat.categoryName}</span>
                      <span className="text-xs text-white/50">{cat.views}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#33b380] to-[#6ee490] transition-all"
                        style={{ width: `${(cat.views / maxViews) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              })()
            ) : (
              <p className="text-sm text-white/30 text-center py-4">Sin datos aún</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Views by product */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-[#33b380]" />
            Vistas por producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : stats?.viewsByProduct && stats.viewsByProduct.length > 0 ? (
            (() => {
              const maxProductViews = Math.max(...stats.viewsByProduct.map((p) => p.views), 1)
              return (
                <div className="space-y-3">
                  {stats.viewsByProduct.map((product, idx) => (
                    <div key={product.productId} className="flex items-center gap-3">
                      <span className="text-xs text-white/30 w-5 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-white truncate">{product.productName}</span>
                          <span className="text-xs text-white/50 shrink-0">{product.views} vistas</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#33b380] to-[#6ee490] transition-all"
                            style={{ width: `${(product.views / maxProductViews) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()
          ) : (
            <p className="text-sm text-white/30 text-center py-8">Sin datos de vistas aún</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
