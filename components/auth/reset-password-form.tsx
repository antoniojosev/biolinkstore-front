"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { LogoIcon } from "@/components/brand/logo";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }
    // Optionally validate token on mount
    setIsValidToken(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al restablecer contrasena");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ocurrio un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || isValidToken === false) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl text-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <LogoIcon size={72} />
          </div>

          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Enlace invalido
          </h1>
          <p className="text-sm text-white/60 mb-6">
            Este enlace de recuperacion es invalido o ha expirado
          </p>

          <Link href="/olvide-password">
            <Button className="bg-[#33b380] hover:bg-[#2a9a6d]">
              Solicitar nuevo enlace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl text-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <LogoIcon size={72} />
          </div>

          <div className="w-16 h-16 rounded-full bg-[#33b380]/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[#33b380]" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Contrasena restablecida
          </h1>
          <p className="text-sm text-white/60 mb-6">
            Tu contrasena ha sido actualizada exitosamente
          </p>

          <Link href="/login">
            <Button className="w-full bg-[#33b380] hover:bg-[#2a9a6d]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Iniciar sesion
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <LogoIcon size={72} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Nueva contrasena</h1>
            <p className="text-sm text-white/60 mt-1">
              Ingresa tu nueva contrasena
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-white/80">
              Nueva contrasena
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#33b380] focus:ring-[#33b380]/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm text-white/80">
              Confirmar contrasena
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contrasena"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#33b380] focus:ring-[#33b380]/20"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#33b380] hover:bg-[#2a9a6d] text-white font-semibold transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar nueva contrasena"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-white/50 mt-6">
          <Link
            href="/login"
            className="text-[#33b380] hover:text-[#6ee490] font-medium transition-colors"
          >
            Cancelar
          </Link>
        </p>
      </div>
    </div>
  );
}
