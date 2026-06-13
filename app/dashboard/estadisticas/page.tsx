import { redirect } from "next/navigation"

export default function LegacyEstadisticasPage() {
  redirect("/dashboard?view=data")
}
