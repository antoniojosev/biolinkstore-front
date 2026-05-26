import { AuthDesktopFlow } from "@/components/auth-v2/auth-desktop"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar sesión — bylink",
  description: "Inicia sesión en tu cuenta de bylink para gestionar tu tienda.",
}

export default function LoginPage() {
  return <AuthDesktopFlow initialScreen="login" />
}
