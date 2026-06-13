import { redirect } from "next/navigation"

export default function LegacyCategoriasPage() {
  // Categories are managed inline from the new Catalog view's toolbar.
  redirect("/dashboard?view=catalog")
}
