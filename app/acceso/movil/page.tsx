import { AuthMobileFlow } from "@/components/auth-v2/auth-mobile"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acceso — bylink",
  description: "Crea tu tienda en bylink desde tu teléfono.",
}

export default function AccesoMovilPage() {
  return <AuthMobileFlow />
}
