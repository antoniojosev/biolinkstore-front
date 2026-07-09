"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { OrdersHttpRepository, type StoreStats } from "@/lib/orders-api"
import { ApiError } from "@/lib/http/types"
import {
  SummaryWidget, TopProductsWidget, FunnelWidget, SourcesWidget,
  type SummaryData, type TopProductsData, type FunnelData, type SourcesData,
} from "./analytics-widgets"

interface AnalyticsBoardProps {
  /** Layout: "auto" responsive grid, "single" stacks vertically (mobile panel). */
  layout?: "auto" | "single"
}

function toSummary(s: StoreStats): SummaryData {
  const visitors = s.uniqueVisitors
  const quotes = s.newQuotesCount
  const conv = visitors > 0 ? (quotes / visitors) * 100 : 0
  return {
    metrics: [
      { key: "quotes", label: "Cotizaciones", value: String(quotes), delta: `+${quotes}`, trend: "up" },
      { key: "visitors", label: "Visitantes únicos", value: visitors.toLocaleString("es"), delta: "~", trend: "flat" },
      { key: "views", label: "Vistas de producto", value: s.productViews.toLocaleString("es"), delta: "~", trend: "flat" },
      { key: "conv", label: "Conversión", value: `${conv.toFixed(1)}%`, delta: "—", trend: conv >= 2 ? "up" : "down" },
    ],
  }
}

function toTopProducts(s: StoreStats): TopProductsData {
  return {
    products: s.viewsByProduct.slice(0, 5).map((p) => ({
      id: p.productId,
      name: p.productName,
      units: p.views,
      revenue: `${p.views} vistas`,
    })),
  }
}

function toFunnel(s: StoreStats): FunnelData {
  return {
    stages: [
      { key: "visits", label: "Visitantes", count: s.uniqueVisitors },
      { key: "product_views", label: "Vieron producto", count: s.productViews },
      { key: "quotes", label: "Cotizaron", count: s.newQuotesCount },
    ],
  }
}

const EMPTY_SOURCES: SourcesData = { sources: [] }

export function AnalyticsBoard({ layout = "auto" }: AnalyticsBoardProps) {
  const { http, store } = useAuth()
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const repo = useMemo(() => new OrdersHttpRepository(http), [http])
  const storeId = store?.id

  useEffect(() => {
    if (!storeId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    repo.getStats(storeId)
      .then((s) => { if (!cancelled) setStats(s) })
      .catch((err) => {
        if (cancelled) return
        const msg = err instanceof ApiError ? err.message : "No se pudieron cargar los datos"
        setError(msg)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [repo, storeId])

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: layout === "single" ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 18,
    alignItems: "start",
  }

  if (!storeId) {
    return <div className="muted" style={{ padding: 24, textAlign: "center" }}>Selecciona una tienda para ver sus datos.</div>
  }

  if (loading) {
    return (
      <div style={gridStyle}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card shimmer" style={{ height: 200 }} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" style={{ padding: 20, background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 12, color: "#991B1B" }}>
        {error}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div style={gridStyle}>
      <SummaryWidget data={toSummary(stats)} />
      <TopProductsWidget data={toTopProducts(stats)} />
      <FunnelWidget data={toFunnel(stats)} />
      <SourcesWidget data={EMPTY_SOURCES} />
    </div>
  )
}
