import { SignupDesktop } from "@/components/auth-v2/signup-desktop"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crea tu tienda — bylink",
  description: "Crea tu cuenta en bylink y empieza a vender desde Instagram.",
}

export default function RegisterPage() {
  return <SignupDesktop />
}
