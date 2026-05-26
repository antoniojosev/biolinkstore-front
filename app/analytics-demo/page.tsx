import { SummaryWidget, TopProductsWidget, FunnelWidget, SourcesWidget } from "@/components/dashboard-v2/analytics-widgets"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics — bylink",
  description: "Widgets de analítica bylink (BE-126).",
}

export default function AnalyticsDemoPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <h1 className="h-2" style={{ marginBottom: 24 }}>Analítica</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
        <SummaryWidget />
        <TopProductsWidget />
        <FunnelWidget />
        <SourcesWidget />
      </div>
    </main>
  )
}
