import { PanelOfficial } from "@/components/panel-v2/panel-official"

type View = "dashboard" | "catalog" | "orders" | "design" | "themes" | "data" | "config"
const VALID: View[] = ["dashboard", "catalog", "orders", "design", "themes", "data", "config"]

interface Props {
  searchParams: Promise<{ view?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { view } = await searchParams
  const initialView: View = (view && VALID.includes(view as View) ? view : "dashboard") as View
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "var(--bg)", overflowY: "auto" }}>
      <PanelOfficial initialView={initialView} />
    </div>
  )
}
