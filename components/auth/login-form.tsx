"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ShoppingBag, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
  const { login, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsLoading(true)
    try {
      await login({ email, password })
    } catch {
      // error already set in context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#33b380]">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Bienvenido de vuelta</h1>
            <p className="text-sm text-white/60 mt-1">Inicia sesion en tu cuenta de InstaOrder</p>
          </div>
        </div>

        {/* Google Button */}
        <Button
          variant="outline"
          className="w-full h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white mb-6"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/40 uppercase tracking-wider">o con email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#33b380] focus:ring-[#33b380]/20"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm text-white/80">
                Contrasena
              </Label>
              <Link
                href="#"
                className="text-xs text-[#33b380] hover:text-[#6ee490] transition-colors"
              >
                Olvidaste tu contrasena?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#33b380] focus:ring-[#33b380]/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#33b380] hover:bg-[#2a9a6d] text-white font-semibold transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando sesion...
              </>
            ) : (
              "Iniciar Sesion"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-white/50 mt-6">
          No tienes cuenta?{" "}
          <Link
            href="/registro"
            className="text-[#33b380] hover:text-[#6ee490] font-medium transition-colors"
          >
            Crear cuenta gratis
          </Link>
        </p>
      </div>

      {/* Back to home */}
      <div className="text-center mt-4">
        <Link
          href="/home"
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
