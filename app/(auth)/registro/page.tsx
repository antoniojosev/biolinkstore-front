import { RegisterForm } from "@/components/auth/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear Cuenta - ByLink",
  description: "Crea tu cuenta en ByLink y empieza a vender desde Instagram.",
}

export default function RegisterPage() {
  return <RegisterForm />
}
