"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { OrdersHttpRepository, type StoreStats, type OrderResponse, type OrderStatus } from "@/lib/orders-api"

interface DashboardOverviewProps {
  /** Reserved for future mobile-specific tweaks; CSS already adapts via .bpanel.bp-mobile. */
  mobile?: boolean
}

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]

function greeting(name?: string | null) {
  const h = new Date().getHours()
  const greet = h < 12 ? "buen día" : h < 19 ? "buena tarde" : "buena noche"
  const first = (name?.trim().split(" ")[0]) || "Hola"
  return { name: first, greet }
}

function formatDate(d = new Date()) {
  return `— ${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return "ahora"
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  return `hace ${d}d`
}

function initials(name: string | null) {
  if (!name) return "??"
  const parts = name.trim().split(" ").filter(Boolean)
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "??"
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "pendiente",
  CONTACTED: "contactado",
  ACCEPTED: "aceptado",
  REJECTED: "rechazado",
}
const STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING: "pending",
  CONTACTED: "shipped",
  ACCEPTED: "paid",
  REJECTED: "pending",
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, var(--brand), var(--brand-2))",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#ea580c,#fb923c)",
  "linear-gradient(135deg,#0891b2,#22d3ee)",
  "linear-gradient(135deg,#be185d,#f472b6)",
]

function chartPathFromCounts(counts: number[]) {
  if (counts.length === 0) return { line: "", area: "" }
  const W = 800, H = 200
  const max = Math.max(1, ...counts)
  const step = W / Math.max(1, counts.length - 1)
  const xy = counts.map((v, i) => [i === counts.length - 1 ? W : i * step, H - (v / max) * (H - 30) - 10])
  const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(0)},${y.toFixed(0)}`).join(" ")
  const area = `${line} L${W},${H} L0,${H} Z`
  return { line, area }
}

function fmtMoney(n: number, currency = "VES") {
  return `${currency === "VES" ? "Bs. " : "$"}${n.toLocaleString("es-VE", { maximumFractionDigits: 0 })}`
}

function fmtChartDate(s?: string) {
  if (!s) return ""
  const d = new Date(s)
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`
}

const MOCK_ORDERS = [
  { name: "María Alvarado", initials: "MA", grad: AVATAR_GRADIENTS[0], summary: "Vestido Camelia", ago: "hace 6 min", amount: "$89", status: "ACCEPTED" as OrderStatus },
  { name: "Julián Rodríguez", initials: "JR", grad: AVATAR_GRADIENTS[1], summary: "Bolso de cuero", ago: "hace 18 min", amount: "$56", status: "PENDING" as OrderStatus },
  { name: "Carla Guzmán", initials: "CG", grad: AVATAR_GRADIENTS[2], summary: "Aretes Luna +1", ago: "hace 42 min", amount: "$84", status: "CONTACTED" as OrderStatus },
  { name: "Andrea Peña", initials: "AP", grad: AVATAR_GRADIENTS[3], summary: "Blusa Olivia", ago: "hace 1h", amount: "$38", status: "ACCEPTED" as OrderStatus },
  { name: "Valentina Sánchez", initials: "VS", grad: AVATAR_GRADIENTS[4], summary: "Collar Sol +2", ago: "hace 2h", amount: "$96", status: "ACCEPTED" as OrderStatus },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DashboardOverview({ mobile: _mobile }: DashboardOverviewProps) {
  const { http, store, user } = useAuth()
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [orders, setOrders] = useState<OrderResponse[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const repo = useMemo(() => new OrdersHttpRepository(http), [http])
  const storeId = store?.id

  useEffect(() => {
    if (!storeId) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      repo.getStats(storeId),
      repo.getOrders(storeId, { limit: 5, sortOrder: "desc" }).catch(() => ({ data: [] as OrderResponse[] })),
    ])
      .then(([s, o]) => { if (!cancelled) { setStats(s); setOrders(o.data) } })
      .catch(() => { if (!cancelled) { setStats(null); setOrders(null) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [repo, storeId])

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
      const o = await repo.getOrders(storeId, { limit: 5, sortOrder: "desc" })
      setOrders(o.data)
      setOpenMenuId(null)
    } catch {
      // silent — status pill snaps back to server value on next fetch
    } finally {
      setUpdatingId(null)
    }
  }

  const { name: greetName, greet } = greeting(user?.name)
  const dateLabel = formatDate()

  // KPIs — adapt to what /stats actually has
  const visitorsCount = stats?.uniqueVisitors ?? 847
  const productViewsCount = stats?.productViews ?? 4280
  const quotesCount = stats?.newQuotesCount ?? 12
  const conversion = visitorsCount > 0 ? (quotesCount / visitorsCount) * 100 : 0

  const visitsCounts = (stats?.visitsByDay ?? []).map((d) => d.count)
  const { line, area } = useMemo(() => chartPathFromCounts(visitsCounts), [visitsCounts])
  const firstDate = stats?.visitsByDay?.[0]?.date
  const lastDate = stats?.visitsByDay?.[stats.visitsByDay.length - 1]?.date
  const midDate = stats?.visitsByDay?.[Math.floor((stats?.visitsByDay?.length ?? 0) / 2)]?.date

  const topProducts = (stats?.viewsByProduct ?? []).slice(0, 5)
  const topMax = Math.max(1, ...topProducts.map((p) => p.views))

  const useRealOrders = orders != null
  const recent = useRealOrders
    ? orders.slice(0, 5).map((o, i) => ({
        id: o.id,
        name: o.customerName || "Cliente",
        initials: initials(o.customerName),
        grad: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
        summary: o.items[0]?.productName + (o.items.length > 1 ? ` +${o.items.length - 1}` : ""),
        ago: timeAgo(o.createdAt),
        amount: fmtMoney(o.total, o.currency),
        status: o.status,
      }))
    : MOCK_ORDERS.map((m, i) => ({ ...m, id: `mock-${i}` }))

  return (
    <div className="dash-grid">
      <div className="dash-header">
        <div className="greet">
          <div className="h-eyebrow">{dateLabel}</div>
          <h1>Hola {greetName}, <em>{greet}</em></h1>
        </div>
        <div className="h-actions">
          <button type="button" className="h-btn ghost"><svg><use href="#ic-share" /></svg>Compartir tienda</button>
          <button type="button" className="h-btn"><svg><use href="#ic-plus" /></svg>Nuevo producto</button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi up">
          <div className="kpi-label"><span>Cotizaciones</span><span className="delta">+{quotesCount}</span></div>
          <div className="kpi-value">{quotesCount}<span className="unit">en 30d</span></div>
          <svg className="kpi-spark" viewBox="0 0 100 24" preserveAspectRatio="none"><path d="M0,18 L15,16 L25,12 L40,14 L55,8 L70,10 L85,5 L100,6" stroke="#10b981" strokeWidth="1.5" fill="none" /></svg>
        </div>
        <div className="kpi up">
          <div className="kpi-label"><span>Visitantes únicos</span><span className="delta">~</span></div>
          <div className="kpi-value">{visitorsCount.toLocaleString("es")}</div>
          <svg className="kpi-spark" viewBox="0 0 100 24" preserveAspectRatio="none"><path d="M0,20 L15,18 L25,15 L40,10 L55,12 L70,8 L85,6 L100,4" stroke="#10b981" strokeWidth="1.5" fill="none" /></svg>
        </div>
        <div className="kpi flat">
          <div className="kpi-label"><span>Vistas de producto</span><span className="delta">~</span></div>
          <div className="kpi-value">{productViewsCount.toLocaleString("es")}</div>
          <svg className="kpi-spark" viewBox="0 0 100 24" preserveAspectRatio="none"><path d="M0,12 L15,14 L25,10 L40,12 L55,14 L70,10 L85,12 L100,11" stroke="var(--ink-3)" strokeWidth="1.5" fill="none" /></svg>
        </div>
        <div className={`kpi ${conversion >= 2 ? "up" : "down"}`}>
          <div className="kpi-label"><span>Conversión</span><span className="delta">{conversion.toFixed(1)}%</span></div>
          <div className="kpi-value">{conversion.toFixed(1)}<span className="unit">%</span></div>
          <svg className="kpi-spark" viewBox="0 0 100 24" preserveAspectRatio="none"><path d="M0,8 L15,10 L25,12 L40,10 L55,14 L70,16 L85,18 L100,20" stroke="var(--accent)" strokeWidth="1.5" fill="none" /></svg>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="panel">
          <h3>Visitas · últimos 30 días <span className="more">Más opciones →</span></h3>
          <div className="chart">
            {line ? (
              <svg viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs><linearGradient id="dov-cha" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.25" /><stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" /></linearGradient></defs>
                <path d={area} fill="url(#dov-cha)" />
                <path d={line} stroke="#1E3A8A" strokeWidth="2" fill="none" />
              </svg>
            ) : (
              <div className="muted" style={{ padding: 24, textAlign: "center" }}>{loading ? "Cargando…" : "Sin datos aún"}</div>
            )}
          </div>
          {line && <div className="chart-meta"><span>{fmtChartDate(firstDate)}</span><span>{fmtChartDate(midDate)}</span><span>{fmtChartDate(lastDate)}</span></div>}
        </div>

        <div className="panel">
          <h3>Pedidos recientes <span className="more">Ver todos →</span></h3>
          {recent.length === 0 ? (
            <div className="muted" style={{ padding: 16, textAlign: "center" }}>Aún no hay pedidos.</div>
          ) : recent.map((o) => {
            const status = o.status as OrderStatus
            const isOpen = openMenuId === o.id
            const isUpdating = updatingId === o.id
            const transitions = (Object.keys(STATUS_LABEL) as OrderStatus[]).filter((s) => s !== status)
            return (
              <div className="ord" key={o.id}>
                <div className="ord-avatar" style={{ background: o.grad }}>{o.initials}</div>
                <div><div className="ord-name">{o.name}</div><div className="ord-meta">{o.summary} · {o.ago}</div></div>
                <div className="ord-amount">{o.amount}</div>
                <div data-status-menu style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`ord-status ${STATUS_CLASS[status]}`}
                    onClick={(e) => { e.stopPropagation(); if (useRealOrders && !isUpdating) setOpenMenuId(isOpen ? null : o.id) }}
                    disabled={!useRealOrders || isUpdating}
                    style={{ border: "none", cursor: useRealOrders && !isUpdating ? "pointer" : "default", fontFamily: "inherit", opacity: isUpdating ? 0.5 : 1 }}
                    title={useRealOrders ? "Cambiar estado" : undefined}
                  >
                    {isUpdating ? "…" : (STATUS_LABEL[status] ?? status)}
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
      </div>

      <div className="side-stack">
        <div className="panel">
          <h3>Top productos</h3>
          {topProducts.length === 0 ? (
            <div className="muted" style={{ padding: 8, fontSize: 12 }}>Sin vistas registradas.</div>
          ) : (
            <ul className="top-products" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {topProducts.map((p, i) => (
                <li key={p.productId}>
                  <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="name">{p.productName}</div>
                    <div className="bar"><div className="bar-fill" style={{ width: `${(p.views / topMax) * 100}%` }} /></div>
                  </div>
                  <div className="units">{p.views} vistas</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h3>De dónde llegan <span className="more" title="Endpoint aún no disponible">demo</span></h3>
          <div className="traffic-bars">
            <div className="tr-row"><span className="tr-label">Instagram</span><div className="tr-bar"><div className="tr-bar-fill" style={{ width: "62%", background: "#E1306C" }} /></div><span className="tr-pct">62%</span></div>
            <div className="tr-row"><span className="tr-label">WhatsApp</span><div className="tr-bar"><div className="tr-bar-fill" style={{ width: "24%", background: "#25D366" }} /></div><span className="tr-pct">24%</span></div>
            <div className="tr-row"><span className="tr-label">Directo</span><div className="tr-bar"><div className="tr-bar-fill" style={{ width: "9%", background: "var(--brand)" }} /></div><span className="tr-pct">9%</span></div>
            <div className="tr-row"><span className="tr-label">TikTok</span><div className="tr-bar"><div className="tr-bar-fill" style={{ width: "5%", background: "#000" }} /></div><span className="tr-pct">5%</span></div>
          </div>
        </div>

        <div className="panel">
          <h3>Pendiente esta semana <span className="more">3 · ver todo</span></h3>
          <ul className="next-up" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li><div className="ck" /><span>Subir 3 fotos del nuevo lote</span><span className="badge">URGENTE</span></li>
            <li><div className="ck" /><span>Responder 7 mensajes en WA</span><span className="badge" style={{ background: "rgba(251,191,36,0.18)", color: "#92400e" }}>7</span></li>
            <li><div className="ck done" /><span style={{ textDecoration: "line-through", color: "var(--ink-3)" }}>Actualizar tasa Bs/USD</span><span /></li>
            <li><div className="ck" /><span>Configurar domicilio Petare</span><span /></li>
          </ul>
        </div>
      </div>

    </div>
  )
}
