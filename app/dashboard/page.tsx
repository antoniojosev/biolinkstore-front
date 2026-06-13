import { PanelOfficial } from "@/components/panel-v2/panel-official"

export default function DashboardPage() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 30, background: "var(--bg)", overflowY: "auto" }}>
      <PanelOfficial />
    </div>
  )
}
