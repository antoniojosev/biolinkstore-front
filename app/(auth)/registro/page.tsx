import { RegisterForm } from "@/components/auth/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear Cuenta - InstaOrder",
  description: "Crea tu cuenta en InstaOrder y empieza a vender desde Instagram.",
}

export default function RegisterPage() {
  return <RegisterForm />
}
