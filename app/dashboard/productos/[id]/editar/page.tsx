import { redirect } from "next/navigation"

export default function LegacyEditarProductoPage() {
  // Editar producto ahora abre el sheet del catalogo v2 (clic en la tarjeta del producto).
  redirect("/dashboard?view=catalog")
}
