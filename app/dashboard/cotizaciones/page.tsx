import { redirect } from "next/navigation"

export default function LegacyCotizacionesPage() {
  redirect("/dashboard?view=orders")
}
