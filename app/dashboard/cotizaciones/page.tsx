"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, MessageCircle, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { OrdersHttpRepository } from "@/lib/orders-api"
import type { OrderResponse, OrderStatus } from "@/lib/orders-api"
import type { PaginatedResult } from "@/lib/http/types"

const STATUS_FILTERS: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
  { label: "Todos", value: "ALL" },
  { label: "Pendiente", value: "PENDING" },
  { label: "Contactado", value: "CONTACTED" },
  { label: "Aceptado", value: "ACCEPTED" },
  { label: "Rechazado", value: "REJECTED" },
]

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONTACTED: "Contactado",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
}

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
      return "bg-white/10 text-white/50"
  }
}

export default function CotizacionesPage() {
  const { store, http } = useAuth()
  const ordersRepo = useMemo(() => new OrdersHttpRepository(http), [http])

  const [data, setData] = useState<PaginatedResult<OrderResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'ALL'>("ALL")
  const [page, setPage] = useState(1)

  const fetchOrders = useCallback(() => {
    if (!store?.id) return
    setLoading(true)
    ordersRepo.getOrders(store.id, {
      page,
      limit: 10,
      status: activeFilter === 'ALL' ? undefined : activeFilter,
    })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [store?.id, ordersRepo, page, activeFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!store?.id) return
    try {
      await ordersRepo.updateStatus(store.id, orderId, newStatus)
      fetchOrders()
    } catch { /* TODO: toast error */ }
  }

  const handleExport = async () => {
    if (!store?.id) return
    try {
      const csv = await ordersRepo.exportCsv(store.id)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cotizaciones.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* TODO: toast error */ }
  }

  const orders = data?.data ?? []
  const filtered = search
    ? orders.filter((o) =>
        (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Cotizaciones</h1>
          <p className="text-sm text-white/50">Gestiona las cotizaciones que llegan por WhatsApp</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          className="h-8 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/5 bg-transparent"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                placeholder="Buscar por cliente o ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
              />
            </div>
            <div className="flex gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setActiveFilter(f.value); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeFilter === f.value
                      ? "bg-[#33b380] text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-white/10 border-t-[#33b380] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">
          No hay cotizaciones
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card key={order.id} className="bg-[#0d1218] border-white/5">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-white/40">{order.id.slice(0, 8)}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusStyle(order.status)}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="text-xs text-white/30">
                        {new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{order.customerName || 'Sin nombre'}</p>
                      <p className="text-xs text-white/40">{order.customerPhone || ''}</p>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-white/50">${(item.quantity * item.unitPrice).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-sm font-medium text-white">Total</span>
                        <span className="text-sm font-bold text-[#6ee490]">
                          ${order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    {order.customerPhone && (
                      <Button
                        size="sm"
                        className="bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs h-8"
                        asChild
                      >
                        <a
                          href={order.whatsappUrl || `https://wa.me/${order.customerPhone.replace(/\+/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                          Contactar
                        </a>
                      </Button>
                    )}
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="h-8 px-2 text-xs bg-white/5 border border-white/10 text-white rounded-lg"
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="CONTACTED">Contactado</option>
                      <option value="ACCEPTED">Aceptado</option>
                      <option value="REJECTED">Rechazado</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={!data.meta.hasPreviousPage}
            onClick={() => setPage((p) => p - 1)}
            className="h-8 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/5 bg-transparent"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Anterior
          </Button>
          <span className="text-xs text-white/40">
            Página {data.meta.page} de {data.meta.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!data.meta.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/5 bg-transparent"
          >
            Siguiente
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
