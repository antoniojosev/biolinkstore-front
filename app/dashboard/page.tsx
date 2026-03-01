"use client"

import {
  Package,
  ShoppingCart,
  Eye,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

const stats = [
  {
    label: "Productos activos",
    value: "24",
    change: "+3",
    trend: "up" as const,
    icon: Package,
    color: "#33b380",
  },
  {
    label: "Pedidos este mes",
    value: "142",
    change: "+18%",
    trend: "up" as const,
    icon: ShoppingCart,
    color: "#327be2",
  },
  {
    label: "Visitas hoy",
    value: "389",
    change: "-5%",
    trend: "down" as const,
    icon: Eye,
    color: "#6ee490",
  },
  {
    label: "Tasa de conversion",
    value: "4.2%",
    change: "+0.8%",
    trend: "up" as const,
    icon: TrendingUp,
    color: "#33b380",
  },
]

const recentOrders = [
  { id: "#1024", customer: "Maria Lopez", items: 3, total: 12500, status: "Nuevo", time: "Hace 5 min" },
  { id: "#1023", customer: "Carlos Ruiz", items: 1, total: 4500, status: "Enviado", time: "Hace 2h" },
  { id: "#1022", customer: "Ana Torres", items: 2, total: 7800, status: "Entregado", time: "Hace 5h" },
  { id: "#1021", customer: "Pedro Garcia", items: 4, total: 15200, status: "Nuevo", time: "Hace 8h" },
  { id: "#1020", customer: "Laura Diaz", items: 1, total: 2800, status: "Enviado", time: "Hace 1d" },
]

const topProducts = [
  { name: "Vestido Floral Verano", sold: 38, revenue: 171000 },
  { name: "Jean Mom Fit", sold: 27, revenue: 113400 },
  { name: "Blusa Elegante Saten", sold: 22, revenue: 61600 },
  { name: "Vestido Midi Negro", sold: 19, revenue: 110200 },
]

function getStatusStyle(status: string) {
  switch (status) {
    case "Nuevo":
      return "bg-[#327be2]/15 text-[#327be2]"
    case "Enviado":
      return "bg-[#33b380]/15 text-[#6ee490]"
    case "Entregado":
      return "bg-white/10 text-white/60"
    default:
      return "bg-white/10 text-white/60"
  }
}

export default function DashboardPage() {
  const { store } = useAuth()
  const [copied, setCopied] = useState(false)
  const storeSlug = store?.slug || ''
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const host = typeof window !== 'undefined' ? window.location.host : ''
  const storeUrl = storeSlug && origin ? `${origin}/${storeSlug}` : ''
  const displayUrl = storeSlug && host ? `${host}/${storeSlug}` : 'Cargando...'

  const handleCopy = () => {
    if (!storeUrl) return
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
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
          <Button
            size="sm"
            className="h-8 text-xs bg-[#33b380] hover:bg-[#2a9a6d] text-white"
            asChild
          >
            <Link href={`/${storeSlug}`} target="_blank">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Abrir
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#0d1218] border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    stat.trend === "up" ? "text-[#6ee490]" : "text-red-400"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent orders */}
        <Card className="lg:col-span-3 bg-[#0d1218] border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">
                Pedidos recientes
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-[#33b380] hover:text-[#6ee490] hover:bg-transparent h-auto p-0" asChild>
                <Link href="/dashboard/pedidos">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-mono text-white/40">{order.id}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{order.customer}</p>
                      <p className="text-xs text-white/40">
                        {order.items} {order.items === 1 ? "producto" : "productos"} &middot; {order.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">
                      ${order.total.toLocaleString()}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="lg:col-span-2 bg-[#0d1218] border-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">
                Top productos
              </CardTitle>
              <span className="text-xs text-white/40">Este mes</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-white/30 w-4">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{product.name}</p>
                  <p className="text-xs text-white/40">{product.sold} vendidos</p>
                </div>
                <span className="text-sm font-medium text-[#6ee490]">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
