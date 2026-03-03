import { RegisterForm } from "@/components/auth/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear Cuenta - Bio Link Store",
  description: "Crea tu cuenta en Bio Link Store y empieza a vender desde Instagram.",
}

export default function RegisterPage() {
  return <RegisterForm />
}
