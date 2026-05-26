import { AuthDesktopFlow } from "@/components/auth-v2/auth-desktop"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acceso — bylink",
  description: "Entra o crea tu tienda en bylink.",
}

export default function AccesoPage() {
  return <AuthDesktopFlow />
}
