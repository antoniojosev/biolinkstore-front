import { redirect } from "next/navigation"

export default function LegacyPlantillasPage() {
  // Template switching now lives inside the v2 page builder's Diseño view.
  redirect("/dashboard?view=design")
}
