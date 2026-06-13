import { redirect } from "next/navigation"

export default function LegacyCreateStorePage() {
  // Onboarding now lives inside the AuthDesktopFlow at /acceso (onb screen).
  redirect("/acceso?screen=onb")
}
