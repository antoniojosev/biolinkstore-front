import { redirect } from "next/navigation"

export default function LegacyCrearProductoPage() {
  // Crear producto ahora es el sheet "+ Nuevo producto" del catalogo v2.
  redirect("/dashboard?view=catalog")
}
