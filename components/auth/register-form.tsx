"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ShoppingBag, Loader2, Check, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other',  label: 'Prefiero no decir' },
]

export function RegisterForm() {
  const { register, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)

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
  const canSubmit       = isPasswordValid && formData.name.trim().length > 0 && formData.email.trim().length > 0

  const set = (field: string, value: string) => {
    clearError()
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setIsLoading(true)
    try {
      await register({
        name:        formData.name.trim(),
        username:    formData.username.trim() || undefined,
        gender:      formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        email:       formData.email.trim(),
        password:    formData.password,
        storeName:   formData.name.trim(),   // default — onboarding step 0 lo actualiza
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
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#33b380]">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
            <p className="text-sm text-white/50 mt-1">Empieza a vender en minutos</p>
          </div>
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
              Usuario <span className="text-white/30 font-normal">(opcional)</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
              <Input
                id="username"
                type="text"
                placeholder="juangarcia"
                value={formData.username}
                onChange={(e) => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                className="h-10 pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]"
              />
            </div>
            <p className="text-[11px] text-white/30">
              URL de tu tienda:{" "}
              <span className="text-white/50 font-mono">
                instaorder.com/{formData.username || "tu-usuario"}
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
                <option value="">Seleccionar…</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
