"use client"

import { Card, CardBody, CardHeader } from "@/components/bylink"

/* ============================================================
   BE-126 analytics widgets — UI only, mock data inline.
   Props mirror the expected BE-126 endpoint shapes so Fase 2
   can pass real data without changing the component contract.
   ============================================================ */

// ---- summary (BE-126 /summary) ----
export interface SummaryMetric {
  key: string
  label: string
  value: string
  delta: string
  trend: "up" | "down" | "flat"
}
export interface SummaryData {
  metrics: SummaryMetric[]
}
const MOCK_SUMMARY: SummaryData = {
  metrics: [
    { key: "revenue", label: "Ingresos (30d)", value: "$4,280", delta: "+18%", trend: "up" },
    { key: "orders", label: "Pedidos", value: "138", delta: "+12", trend: "up" },
    { key: "visitors", label: "Visitantes", value: "5,847", delta: "~", trend: "flat" },
    { key: "conversion", label: "Conversión", value: "2.4%", delta: "-0.3%", trend: "down" },
  ],
}

export function SummaryWidget({ data = MOCK_SUMMARY }: { data?: SummaryData | null }) {
  const metrics = data?.metrics ?? []
  const trendColor = (t: SummaryMetric["trend"]) => (t === "up" ? "#047857" : t === "down" ? "var(--accent)" : "var(--ink-2)")
  const trendBg = (t: SummaryMetric["trend"]) => (t === "up" ? "rgba(16,185,129,0.12)" : t === "down" ? "rgba(220,74,61,0.12)" : "rgba(0,0,0,0.06)")
  return (
    <Card>
      <CardHeader><span className="h-5">Resumen</span><span className="eyebrow">últimos 30 días</span></CardHeader>
      <CardBody>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {metrics.map((m) => (
            <div key={m.key} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "12px 14px", position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: trendColor(m.trend) }} />
              <div className="eyebrow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span>{m.label}</span>
                <span style={{ fontWeight: 700, padding: "1px 6px", borderRadius: 4, fontSize: 9, background: trendBg(m.trend), color: trendColor(m.trend) }}>{m.delta}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{m.value}</div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

// ---- top products (BE-126 /top-products) ----
export interface TopProduct {
  id: string
  name: string
  units: number
  revenue: string
}
export interface TopProductsData {
  products: TopProduct[]
}
const MOCK_TOP: TopProductsData = {
  products: [
    { id: "1", name: "Vestido Camelia", units: 42, revenue: "$3,738" },
    { id: "2", name: "Aretes Luna", units: 33, revenue: "$1,386" },
    { id: "3", name: "Bolso de Cuero", units: 23, revenue: "$1,288" },
    { id: "4", name: "Blusa Olivia", units: 16, revenue: "$608" },
    { id: "5", name: "Collar Sol", units: 10, revenue: "$320" },
  ],
}

export function TopProductsWidget({ data = MOCK_TOP }: { data?: TopProductsData | null }) {
  const products = data?.products ?? []
  const max = Math.max(1, ...products.map((p) => p.units))
  return (
    <Card>
      <CardHeader><span className="h-5">Top productos</span><span className="eyebrow">por unidades</span></CardHeader>
      <CardBody>
        {products.length === 0 ? (
          <div className="muted body-sm">Sin datos todavía.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {products.map((p, i) => (
              <li key={p.id} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 10, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ height: 4, background: "var(--bg-2)", borderRadius: 999, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(p.units / max) * 100}%`, background: "var(--brand)", borderRadius: 999 }} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{p.units}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.revenue}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}

// ---- funnel (BE-126 /funnel) ----
export interface FunnelStage {
  key: string
  label: string
  count: number
}
export interface FunnelData {
  stages: FunnelStage[]
}
const MOCK_FUNNEL: FunnelData = {
  stages: [
    { key: "visits", label: "Visitas", count: 5847 },
    { key: "product_views", label: "Vieron producto", count: 3120 },
    { key: "add_to_cart", label: "Agregaron al carrito", count: 842 },
    { key: "checkout", label: "Iniciaron checkout", count: 311 },
    { key: "order", label: "Pedido enviado", count: 138 },
  ],
}

export function FunnelWidget({ data = MOCK_FUNNEL }: { data?: FunnelData | null }) {
  const stages = data?.stages ?? []
  const top = stages[0]?.count || 1
  return (
    <Card>
      <CardHeader><span className="h-5">Embudo de conversión</span><span className="eyebrow">últimos 30 días</span></CardHeader>
      <CardBody>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stages.map((s, i) => {
            const pct = (s.count / top) * 100
            const prev = i > 0 ? stages[i - 1].count : s.count
            const drop = i > 0 && prev > 0 ? Math.round((1 - s.count / prev) * 100) : 0
            return (
              <div key={s.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{s.count.toLocaleString("es")} · {Math.round(pct)}%</span>
                </div>
                <div style={{ height: 22, background: "var(--bg-2)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--brand), var(--brand-2))", borderRadius: "var(--r-sm)", transition: "width .4s" }} />
                </div>
                {i > 0 && drop > 0 && (
                  <div className="mono" style={{ fontSize: 10, color: "var(--accent)", marginTop: 2 }}>−{drop}% abandono</div>
                )}
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}

// ---- sources (BE-126 /sources) ----
export interface TrafficSource {
  key: string
  label: string
  pct: number
  color: string
}
export interface SourcesData {
  sources: TrafficSource[]
}
const MOCK_SOURCES: SourcesData = {
  sources: [
    { key: "instagram", label: "Instagram", pct: 62, color: "#E1306C" },
    { key: "whatsapp", label: "WhatsApp", pct: 24, color: "#25D366" },
    { key: "direct", label: "Directo", pct: 9, color: "var(--brand)" },
    { key: "tiktok", label: "TikTok", pct: 5, color: "#000000" },
  ],
}

export function SourcesWidget({ data = MOCK_SOURCES }: { data?: SourcesData | null }) {
  const sources = data?.sources ?? []
  return (
    <Card>
      <CardHeader><span className="h-5">De dónde llegan</span><span className="eyebrow">tráfico</span></CardHeader>
      <CardBody>
        {sources.length === 0 ? (
          <div className="muted body-sm">Sin datos de tráfico todavía.</div>
        ) : (
          <>
            <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", marginBottom: 16 }}>
              {sources.map((s) => (
                <div key={s.key} style={{ width: `${s.pct}%`, background: s.color }} aria-hidden="true" />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sources.map((s) => (
                <div key={s.key} style={{ display: "grid", gridTemplateColumns: "80px 1fr 40px", gap: 8, alignItems: "center", fontSize: 12 }}>
                  <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.label}
                  </span>
                  <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 999 }} />
                  </div>
                  <span className="mono" style={{ color: "var(--ink-3)", fontSize: 10, textAlign: "right" }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  )
}
