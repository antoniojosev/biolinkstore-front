import { PanelOfficial } from "@/components/panel-v2/panel-official"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Panel — bylink",
  description: "Panel de control bylink (canon de diseño).",
}

export default function PanelDemoPage() {
  return <PanelOfficial />
}
