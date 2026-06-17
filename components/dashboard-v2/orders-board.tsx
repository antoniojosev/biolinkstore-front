"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { OrdersHttpRepository, type OrderResponse, type OrderStatus } from "@/lib/orders-api"
import { ApiError } from "@/lib/http/types"

function I({ id }: { id: string }) {
  return <svg><use href={`#ic-${id}`} /></svg>
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "pendiente",
  CONTACTED: "contactado",
  ACCEPTED: "aceptado",
  REJECTED: "rechazado",
}
const STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING: "pending", CONTACTED: "shipped", ACCEPTED: "paid", REJECTED: "pending",
}
const FILTERS: Array<{ id: "all" | OrderStatus; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "PENDING", label: "Pendientes" },
  { id: "CONTACTED", label: "Contactadas" },
  { id: "ACCEPTED", label: "Aceptadas" },
  { id: "REJECTED", label: "Rechazadas" },
]

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return "ahora"
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

function initials(name: string | null) {
  if (!name) return "??"
  const parts = name.trim().split(" ").filter(Boolean)
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "??"
}

const GRADS = [
  "linear-gradient(135deg, var(--brand), var(--brand-2))",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#ea580c,#fb923c)",
  "linear-gradient(135deg,#0891b2,#22d3ee)",
  "linear-gradient(135deg,#be185d,#f472b6)",
]

function fmtMoney(n: number, currency = "VES") {
  if (currency === "USD") return `$${n.toLocaleString("es", { maximumFractionDigits: 2 })}`
  return `Bs. ${n.toLocaleString("es-VE", { maximumFractionDigits: 0 })}`
}

const PAGE_SIZE = 20

export function OrdersBoard() {
  const { http, store } = useAuth()
  const repo = useMemo(() => new OrdersHttpRepository(http), [http])
  const storeId = store?.id

  const [filter, setFilter] = useState<"all" | OrderStatus>("all")
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState<OrderResponse[] | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    if (!storeId) return
    let cancelled = false
    setLoading(true); setError(null)
    repo
      .getOrders(storeId, { page, limit: PAGE_SIZE, status: filter === "all" ? undefined : filter, sortOrder: "desc" })
      .then((res) => { if (!cancelled) { setOrders(res.data); setTotal(res.meta?.total ?? res.data.length) } })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : "No se pudieron cargar") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [repo, storeId, filter, page, refreshTick])

  useEffect(() => {
    if (!openMenuId) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Element | null
      if (t?.closest?.("[data-status-menu]")) return
      setOpenMenuId(null)
    }
    document.addEventListener("click", onDoc)
    return () => document.removeEventListener("click", onDoc)
  }, [openMenuId])

  async function changeStatus(orderId: string, newStatus: OrderStatus) {
    if (!storeId || updatingId) return
    setUpdatingId(orderId)
    try {
      await repo.updateStatus(storeId, orderId, newStatus)
      setRefreshTick((n) => n + 1)
      setOpenMenuId(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al actualizar el estado")
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleExport() {
    if (!storeId || exporting) return
    setExporting(true)
    try {
      const csv = await repo.exportCsv(storeId)
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "pedidos.csv"
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Error al exportar pedidos")
    } finally {
      setExporting(false)
    }
  }

  const visibleOrders = useMemo(() => {
    if (!orders) return null
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) =>
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.customerPhone || "").toLowerCase().includes(q),
    )
  }, [orders, search])

  const noSession = !storeId
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="cat-wrap">
      <div className="cat-header">
        <div>
          <h1>Pedidos {total > 0 && <em>· {total}</em>}</h1>
          <div className="meta">cotizaciones recibidas por WhatsApp e Instagram</div>
        </div>
        <div className="h-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleExport} disabled={!storeId || exporting || (orders?.length ?? 0) === 0}>
            {exporting ? "Exportando…" : "Exportar CSV"}
          </button>
        </div>
      </div>

      <div className="cat-toolbar" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="filter-chip" onClick={() => { setFilter(f.id); setPage(1) }} style={filter === f.id ? { background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" } : undefined}>{f.label}</button>
        ))}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono…"
          aria-label="Buscar pedidos"
          style={{ marginLeft: "auto", padding: "6px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "var(--ink)", background: "#fff", minWidth: 220 }}
        />
      </div>

      {noSession && (
        <div className="muted" style={{ padding: 24, textAlign: "center" }}>Inicia sesión para ver tus pedidos. <a href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Ir a login →</a></div>
      )}
      {error && <div role="alert" style={{ padding: 14, background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 10, color: "#991B1B", marginBottom: 12 }}>{error}</div>}
      {loading && orders == null && <div className="muted" style={{ padding: 24, textAlign: "center" }}>Cargando pedidos…</div>}
      {orders != null && orders.length === 0 && !loading && (
        <div className="muted" style={{ padding: 24, textAlign: "center" }}>
          {filter === "all" ? "Aún no recibís pedidos. Compartí tu link." : `No hay pedidos en estado "${STATUS_LABEL[filter as OrderStatus]}".`}
        </div>
      )}
      {visibleOrders != null && orders != null && orders.length > 0 && visibleOrders.length === 0 && (
        <div className="muted" style={{ padding: 24, textAlign: "center" }}>
          No hay pedidos que coincidan con &quot;{search}&quot;.
        </div>
      )}

      {visibleOrders != null && visibleOrders.length > 0 && (
        <>
          <div className="panel" style={{ padding: 0 }}>
            {visibleOrders.map((o, i) => {
              const status = o.status
              const isOpen = openMenuId === o.id
              const isUpd = updatingId === o.id
              const transitions = (Object.keys(STATUS_LABEL) as OrderStatus[]).filter((s) => s !== status)
              const itemsSummary = o.items[0]?.productName + (o.items.length > 1 ? ` +${o.items.length - 1}` : "")
              return (
                <div key={o.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 14, alignItems: "center", padding: "14px 18px", borderBottom: i < visibleOrders.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <div className="ord-avatar" style={{ background: GRADS[i % GRADS.length] }}>{initials(o.customerName)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{o.customerName || "Cliente"}</span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>#{o.id.slice(-6)}</span>
                      {o.channel === "WHATSAPP" && <span className="badge" style={{ background: "rgba(37,211,102,0.12)", color: "#0E6940" }}>WhatsApp</span>}
                      {o.channel === "INSTAGRAM" && <span className="badge" style={{ background: "rgba(225,48,108,0.12)", color: "#9D1B4C" }}>Instagram</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{itemsSummary} · {timeAgo(o.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{fmtMoney(o.total, o.currency)}</div>
                    {o.customerPhone && <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{o.customerPhone}</div>}
                  </div>
                  <div data-status-menu style={{ position: "relative" }}>
                    <button type="button" className={`ord-status ${STATUS_CLASS[status]}`} onClick={(e) => { e.stopPropagation(); if (!isUpd) setOpenMenuId(isOpen ? null : o.id) }} disabled={isUpd} style={{ border: "none", cursor: isUpd ? "default" : "pointer", fontFamily: "inherit", opacity: isUpd ? 0.5 : 1 }}>
                      {isUpd ? "…" : STATUS_LABEL[status]}
                    </button>
                    {isOpen && (
                      <div role="menu" style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#fff", border: "1px solid var(--line)", borderRadius: 8, boxShadow: "0 8px 24px -8px rgba(15,23,42,0.18)", padding: 4, zIndex: 30, minWidth: 140 }}>
                        {transitions.map((s) => (
                          <button key={s} type="button" role="menuitem" onClick={() => changeStatus(o.id, s)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", border: "none", background: "transparent", borderRadius: 6, fontSize: 12, fontFamily: "inherit", color: "var(--ink)", cursor: "pointer", textAlign: "left" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                            <span className={`ord-status ${STATUS_CLASS[s]}`} style={{ pointerEvents: "none" }}>{STATUS_LABEL[s]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 18 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>← Anterior</button>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)", padding: "0 10px" }}>{page} / {pages}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages || loading}>Siguiente →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
