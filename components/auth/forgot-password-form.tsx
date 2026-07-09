"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Check, ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/landing-v2/brand-mark";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.message || "Error al enviar email de recuperación",
        );
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl text-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <BrandMark size={56} />
          </div>

          <div className="w-16 h-16 rounded-full bg-[var(--brand)]/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[var(--brand)]" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Revisa tu email
          </h1>
          <p className="text-sm text-white/60 mb-6">
            Te enviamos instrucciones para recuperar tu contraseña a{" "}
            <span className="text-white">{email}</span>
          </p>

          <p className="text-xs text-white/40 mb-6">
            No recibiste el email? Revisa tu carpeta de spam o{" "}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-[var(--brand)] hover:underline"
            >
              intenta de nuevo
            </button>
          </p>

          <Link href="/login">
            <Button
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a iniciar sesión
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
          <BrandMark size={56} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">
              Recuperar contrasena
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Ingresa tu email y te enviaremos instrucciones para crear una
              nueva contrasena
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
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--brand)] focus:ring-[var(--brand)]/20"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[var(--brand)] hover:bg-[var(--brand-3)] text-white font-semibold transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar instrucciones"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-white/50 mt-6">
          Recordaste tu contrasena?{" "}
          <Link
            href="/login"
            className="text-[var(--brand)] hover:text-[var(--brand-2)] font-medium transition-colors"
          >
            Iniciar sesion
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
  );
}
