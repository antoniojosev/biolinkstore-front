import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar Sesion - InstaOrder",
  description: "Inicia sesion en tu cuenta de InstaOrder para gestionar tu tienda.",
}

export default function LoginPage() {
  return <LoginForm />
}
