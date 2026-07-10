import { redirect } from "next/navigation"

export default function LegacyProductosPage() {
  // El catalogo real vive en el panel v2 (variantes + atributos + priceCurrency ya portados).
  redirect("/dashboard?view=catalog")
}
