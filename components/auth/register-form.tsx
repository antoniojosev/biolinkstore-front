"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react"
import { LogoIcon } from "@/components/brand/logo"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other',  label: 'Prefiero no decir' },
]

export function RegisterForm() {
  const { register, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean
    available: boolean | null
    error: string | null
  }>({ checking: false, available: null, error: null })

  const [formData, setFormData] = useState({
    name:        "",
    username:    "",
    gender:      "",
    dateOfBirth: "",
    email:       "",
    password:    "",
    whatsapp:    "",
  })

  const passwordChecks = [
    { label: "Mínimo 8 caracteres",  valid: formData.password.length >= 8 },
    { label: "Una mayúscula",         valid: /[A-Z]/.test(formData.password) },
    { label: "Un número",             valid: /[0-9]/.test(formData.password) },
  ]
  const isPasswordValid = passwordChecks.every((c) => c.valid)
  const isUsernameValid = formData.username.length >= 3 && /^[a-z0-9_.]+$/.test(formData.username)
  const canSubmit = isPasswordValid && formData.name.trim().length > 0 && formData.email.trim().length > 0 && isUsernameValid

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus({ checking: false, available: null, error: null })
      return
    }
    if (!/^[a-z0-9_.]+$/.test(username)) {
      setUsernameStatus({ checking: false, available: false, error: 'Solo letras, números, guiones y guiones bajos' })
      return
    }
    setUsernameStatus({ checking: true, available: null, error: null })
    try {
      const res = await fetch(`${API_URL}/api/stores/check-username?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      setUsernameStatus({ checking: false, available: data.available, error: null })
    } catch {
      setUsernameStatus({ checking: false, available: null, error: 'Error al verificar' })
    }
  }

  const set = (field: string, value: string) => {
    clearError()
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === 'username') {
      setUsernameStatus({ checking: false, available: null, error: null })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setIsLoading(true)
    try {
      await register({
        name:        formData.name.trim(),
        username:    formData.username.trim(),
        gender:      formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        email:       formData.email.trim(),
        password:    formData.password,
        storeName:   formData.name.trim(),
        whatsapp:    formData.whatsapp.trim(),
      })
    } catch {
      // error set in context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-7">
          <LogoIcon size={72} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
            <p className="text-sm text-white/50 mt-1">Empieza a vender en minutos</p>
          </div>
        </div>

        {/* Google Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white mb-2"
          onClick={() => { window.location.href = `${API_URL}/api/auth/google` }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Registrarse con Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/40 uppercase tracking-wider">o con email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Error global */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre completo */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm text-white/70">Nombre completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Juan García"
              value={formData.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]"
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm text-white/70">
              Usuario <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
              <Input
                id="username"
                type="text"
                placeholder="mi-tienda"
                value={formData.username}
                onChange={(e) => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                onBlur={(e) => checkUsernameAvailability(e.target.value)}
                required
                className={cn(
                  "h-10 pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]",
                  usernameStatus.available === false && "border-red-500 focus:border-red-500",
                  usernameStatus.available === true && "border-[#33b380]"
                )}
              />
              {usernameStatus.checking && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/40" />
              )}
              {usernameStatus.available === true && !usernameStatus.checking && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#33b380]" />
              )}
            </div>
            {usernameStatus.error && (
              <p className="text-xs text-red-400">{usernameStatus.error}</p>
            )}
            {usernameStatus.available === false && !usernameStatus.error && (
              <p className="text-xs text-red-400">Este usuario ya está tomado</p>
            )}
            <p className="text-[11px] text-white/30">
              URL de tu tienda:{" "}
              <span className="text-white/50 font-mono">
                biolinkstore.com/{formData.username || "mi-tienda"}
              </span>
            </p>
          </div>

          {/* Género + Fecha de nacimiento en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-sm text-white/70">Género</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#33b380] focus:outline-none [color-scheme:dark]"
              >
                <option value="" className="bg-[#0d1218] text-white">Seleccionar…</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0d1218] text-white">{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-sm text-white/70">Fecha de nacimiento</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => set("dateOfBirth", e.target.value)}
                max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380] [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-email" className="text-sm text-white/70">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => set("email", e.target.value)}
              required
              className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-password" className="text-sm text-white/70">Contraseña</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => set("password", e.target.value)}
                required
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formData.password.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                {passwordChecks.map((c) => (
                  <div key={c.label} className="flex items-center gap-1">
                    <div className={cn("w-3 h-3 rounded-full flex items-center justify-center", c.valid ? "bg-[#33b380]" : "bg-white/10")}>
                      {c.valid && <Check className="w-2 h-2 text-white" />}
                    </div>
                    <span className={cn("text-[11px]", c.valid ? "text-[#6ee490]" : "text-white/35")}>{c.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp" className="text-sm text-white/70">
              WhatsApp <span className="text-white/30 font-normal">(opcional)</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+54 9 11 2345 6789"
              value={formData.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !canSubmit}
            className="w-full h-11 bg-[#33b380] hover:bg-[#2a9a6d] text-white font-semibold mt-1 disabled:opacity-40"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creando tu cuenta...</>
            ) : "Crear mi cuenta gratis"}
          </Button>

          <p className="text-xs text-white/30 text-center">
            Al registrarte aceptás nuestros{" "}
            <Link href="#" className="text-[#33b380] hover:underline">Términos</Link>
            {" "}y{" "}
            <Link href="#" className="text-[#33b380] hover:underline">Política de Privacidad</Link>
          </p>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-[#33b380] hover:text-[#6ee490] font-medium transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </div>

      <div className="text-center mt-4">
        <Link href="/home" className="text-sm text-white/30 hover:text-white/60 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
