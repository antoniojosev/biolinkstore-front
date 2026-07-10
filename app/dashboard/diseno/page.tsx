import { redirect } from "next/navigation"

export default function LegacyDisenoPage() {
  // Design/theming is now the v2 page builder (BE-120) inside the Diseño view.
  redirect("/dashboard?view=design")
}
