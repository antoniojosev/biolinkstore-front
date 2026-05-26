import { AuthDesktopFlow } from "@/components/auth-v2/auth-desktop"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crea tu cuenta — bylink",
  description: "Crea tu cuenta en bylink y empieza a vender desde Instagram.",
}

export default function RegisterPage() {
  return <AuthDesktopFlow initialScreen="register" />
}
