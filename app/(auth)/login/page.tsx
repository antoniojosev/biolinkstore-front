import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar Sesion - ByLink",
  description: "Inicia sesion en tu cuenta de ByLink para gestionar tu tienda.",
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
