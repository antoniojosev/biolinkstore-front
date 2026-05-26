import { SignupDesktop } from "@/components/auth-v2/signup-desktop"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Signup (variante 4 pasos) — bylink",
  description: "Variante de registro en 4 pasos con preview en vivo.",
}

export default function SignupDemoPage() {
  return <SignupDesktop />
}
