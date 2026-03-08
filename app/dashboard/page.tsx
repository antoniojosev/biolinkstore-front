"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { OrdersHttpRepository } from "@/lib/orders-api"
import type { StoreStats, OrderResponse } from "@/lib/orders-api"
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card"

export default function DashboardPage() {
  const { store, http } = useAuth()
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  const ordersRepo = useMemo(() => new OrdersHttpRepository(http), [http])

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://biolinkstore.com'
  const storeUrl = store?.slug ? `${origin}/${store.slug}` : ''
  const displayUrl = store?.username ? `${origin.replace(/^https?:\/\//, '')}/${store.slug}` : 'Pendiente — completá el onboarding'

  useEffect(() => {
    if (!store?.id) return
    setLoading(true)
    Promise.all([
      ordersRepo.getStats(store.id).catch(() => null),
      ordersRepo.getOrders(store.id, { page: 1, limit: 5 }).catch(() => null),
    ]).then(([statsData, ordersData]) => {
      if (statsData) setStats(statsData)
      if (ordersData) setRecentOrders(ordersData.data)
      setLoading(false)
    })
  }, [store?.id, ordersRepo])

  const handleCopy = () => {
    if (!storeUrl) return
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statCards = [
    {
      label: "Productos activos",
      value: "—",
      icon: Package,
      color: "#33b380",
    },
    {
      label: "Cotizaciones este mes",
      value: stats ? String(stats.newQuotesCount) : "—",
      icon: ShoppingCart,
      color: "#327be2",
    },
    {
      label: "Visitantes únicos",
      value: stats ? String(stats.uniqueVisitors) : "—",
      icon: Users,
      color: "#6ee490",
    },
  ]

  function getStatusStyle(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-[#327be2]/15 text-[#327be2]"
      case "CONTACTED":
        return "bg-[#33b380]/15 text-[#6ee490]"
      case "ACCEPTED":
        return "bg-[#6ee490]/15 text-[#6ee490]"
      case "REJECTED":
        return "bg-red-500/15 text-red-400"
      default:
        return "bg-white/10 text-white/60"
    }
  }

  const statusLabel: Record<string, string> = {
    PENDING: 'Pendiente',
    CONTACTED: 'Contactado',
    ACCEPTED: 'Aceptado',
    REJECTED: 'Rechazado',
  }

  return (
    <div className="space-y-6">
      {store && <ProfileCompletionCard store={store} />}

      {/* Store link bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-[#33b380]/10 border border-[#33b380]/20">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#6ee490] font-medium mb-0.5">Tu link de tienda</p>
          <p className="text-sm text-white font-mono truncate">{displayUrl}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-8 text-xs border-[#33b380]/30 text-[#6ee490] hover:bg-[#33b380]/20 hover:text-white bg-transparent"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          {store?.username ? (
            <Button
              size="sm"
              className="h-8 text-xs bg-[#33b380] hover:bg-[#2a9a6d] text-white"
              asChild
            >
              <Link href={storeUrl} target="_blank">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Abrir
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 text-xs bg-[#33b380]/50 text-white/60 cursor-not-allowed"
              disabled
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Abrir
            </Button>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-[#0d1218] border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                {loading && (
                  <div className="w-6 h-3 bg-white/5 rounded animate-pulse" />
                )}
              </div>
              <p className="text-2xl font-bold text-white">
                {loading ? <span className="inline-block w-12 h-7 bg-white/5 rounded animate-pulse" /> : stat.value}
              </p>
              <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent quotes */}
        <Card className="lg:col-span-3 bg-[#0d1218] border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">
                Cotizaciones recientes
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-[#33b380] hover:text-[#6ee490] hover:bg-transparent h-auto p-0" asChild>
                <Link href="/dashboard/cotizaciones">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="w-5 h-5 border-2 border-white/10 border-t-[#33b380] rounded-full animate-spin mx-auto" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-white/30 text-sm">
                No hay cotizaciones aún
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-mono text-white/40">{order.id.slice(0, 8)}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{order.customerName || 'Sin nombre'}</p>
                        <p className="text-xs text-white/40">
                          {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">
                        ${order.total.toLocaleString('es-AR')}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusStyle(order.status)}`}
                      >
                        {statusLabel[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats summary */}
        <Card className="lg:col-span-2 bg-[#0d1218] border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">
                Vistas por categoría
              </CardTitle>
              <span className="text-xs text-white/40">Este mes</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : stats && stats.viewsByCategory.length > 0 ? (
              stats.viewsByCategory.slice(0, 5).map((cat) => (
                <div key={cat.categoryName} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{cat.categoryName}</p>
                    <p className="text-xs text-white/40">{cat.views} vistas</p>
                  </div>
                  <span className="text-sm font-medium text-[#6ee490]">
                    {cat.views}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/30 text-center py-4">Sin datos aún</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
