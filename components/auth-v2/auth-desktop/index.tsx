"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { BrandMark } from "@/components/landing-v2/brand-mark"
import { PhonePreview, type PreviewMode } from "./phone-preview"
import { CinematicScraper } from "./cinematic-scraper"
import { AiCatalog } from "./ai-catalog"
import {
  AUTH_STYLES,
  PAYMENT_METHODS,
  REFERRAL_SOURCES,
  SCRAPED,
  slugify,
  type StoreState,
  TEMPLATES,
  VERTICALS,
} from "./data"

type Screen =
  | "welcome" | "login" | "login-error" | "forgot" | "register" | "register-exists"
  | "onb" | "celebration" | "ready" | "ai-catalog" | "scraper-failed"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
function startGoogleOAuth() {
  window.location.href = `${API_URL}/api/auth/google`
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <BrandMark size={30} />
      <span className="ad-logo-text">bylink<span style={{ color: "var(--brand)" }}>.</span></span>
    </div>
  )
}

const ONB_TITLES = [
  { t: <>¿Cómo se llama tu <span className="serif-it" style={{ color: "var(--brand)" }}>negocio</span>?</>, s: "Este será el nombre que verán tus clientes en tu tienda." },
  { t: <>¿Cuál será tu <span className="serif-it" style={{ color: "var(--brand)" }}>link</span>?</>, s: "Aquí te encontrarán tus clientes. Cortito y fácil de recordar." },
  { t: <>¿Qué <span className="serif-it" style={{ color: "var(--brand)" }}>vendes</span>?</>, s: "Esto nos ayuda a sugerir templates y configurar tu tienda." },
  { t: <>¿Tu <span className="serif-it" style={{ color: "var(--brand)" }}>Instagram</span>?</>, s: "Lo escaneamos para autocompletar todo. Te ahorra horas de trabajo." },
  { t: <>¿Eres <span className="serif-it" style={{ color: "var(--brand)" }}>tú</span>?</>, s: "Encontramos esta cuenta. Confirma para importar tu información." },
  { t: <>Elige un <span className="serif-it" style={{ color: "var(--brand)" }}>estilo</span></>, s: "Después puedes personalizar colores, fuentes y todo." },
  { t: <>¿Cómo te <span className="serif-it" style={{ color: "var(--brand)" }}>pagan</span>?</>, s: "Selecciona los métodos que aceptas. Puedes agregar más después." },
  { t: <>¿Cómo nos <span className="serif-it" style={{ color: "var(--brand)" }}>conociste</span>?</>, s: "Última pregunta, ¡prometido! Nos ayuda mucho a saber." },
]
const ONB_PREVIEW: PreviewMode[] = ["identity", "identity", "identity", "instagram", "instagram-found", "template", "template", "template"]
const ONB_CTA: (string | null)[] = [null, null, null, "Buscar mi perfil →", "Sí, soy yo · Importar →", null, null, "¡Crear mi tienda! 🎉"]

export function AuthDesktopFlow({ initialScreen = "welcome", showScreenJumper = false }: { initialScreen?: Screen; showScreenJumper?: boolean }) {
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [onbStep, setOnbStep] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [conflictEmail, setConflictEmail] = useState("")
  const [userWhatsapp, setUserWhatsapp] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [store, setStore] = useState<StoreState>({ name: "", slug: "", vertical: null, instagram: "", template: null, payments: ["pm", "usd"], referral: null })
  const { http, loadSession } = useAuth()
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  const patch = (p: Partial<StoreState>) => setStore((s) => ({ ...s, ...p }))

  function goOnb(idx: number) {
    setOnbStep(idx)
    setScreen("onb")
    setNavOpen(false)
  }
  function goScreen(s: Screen) {
    setScreen(s)
    setNavOpen(false)
  }

  const onbValid = useMemo(() => {
    switch (onbStep) {
      case 0: return store.name.trim().length > 0
      case 1: return store.slug.length >= 3
      case 2: return !!store.vertical
      case 3: return store.instagram.replace("@", "").trim().length >= 2
      case 4: return true
      case 5: return !!store.template
      case 6: return store.payments.length > 0
      case 7: return !!store.referral
      default: return false
    }
  }, [onbStep, store])

  async function onbNext() {
    if (onbStep === 3) { setScraping(true); return }
    if (onbStep === 7) {
      setCreating(true); setCreateError(null)
      try {
        const created = await storeRepo.create({
          name: store.name.trim() || "Mi tienda",
          username: store.slug.trim() || undefined,
          whatsappNumbers: userWhatsapp.trim() ? [userWhatsapp.trim()] : [],
        })
        const handle = store.instagram.replace("@", "").trim()
        if (handle) {
          await storeRepo.update(created.id, { instagramHandle: handle }).catch(() => {})
        }
        await loadSession()
        goScreen("celebration")
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "No se pudo crear la tienda"
        setCreateError(msg)
      } finally {
        setCreating(false)
      }
      return
    }
    if (onbStep < 7) goOnb(onbStep + 1)
  }
  function onbBack() {
    if (onbStep > 0) goOnb(onbStep - 1)
    else goScreen("register")
  }

  const navItems: { num: string; label: string; onClick: () => void }[] = [
    { num: "00", label: "Welcome", onClick: () => goScreen("welcome") },
    { num: "01", label: "Login", onClick: () => goScreen("login") },
    { num: "01a", label: "Login · cuenta no existe", onClick: () => goScreen("login-error") },
    { num: "01b", label: "Forgot password", onClick: () => goScreen("forgot") },
    { num: "02", label: "Registro", onClick: () => goScreen("register") },
    { num: "02a", label: "Registro · ya existe", onClick: () => goScreen("register-exists") },
    { num: "03", label: "Onboarding · Nombre", onClick: () => goOnb(0) },
    { num: "04", label: "Vertical", onClick: () => goOnb(2) },
    { num: "05", label: "Instagram", onClick: () => goOnb(3) },
    { num: "05a", label: "🎬 Scraper cinema", onClick: () => { goOnb(3); setScraping(true) } },
    { num: "05b", label: "Scraper falló", onClick: () => goScreen("scraper-failed") },
    { num: "06", label: "¿Eres tú? (scraper)", onClick: () => goOnb(4) },
    { num: "06a", label: "✨ Catálogo IA", onClick: () => goScreen("ai-catalog") },
    { num: "07", label: "Template", onClick: () => goOnb(5) },
    { num: "08", label: "¿Cómo nos conociste?", onClick: () => goOnb(7) },
    { num: "09", label: "🎉 Celebración", onClick: () => goScreen("celebration") },
    { num: "10", label: "Tienda lista", onClick: () => goScreen("ready") },
  ]

  return (
    <div className="ad-root" style={{ position: "fixed", inset: 0, zIndex: 40, overflowY: "auto", background: "#fff" }}>
      <style dangerouslySetInnerHTML={{ __html: AUTH_STYLES }} />

      {/* floating switcher — solo en la ruta demo /acceso, nunca en /login ni /registro */}
      {showScreenJumper && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999 }}>
          <button type="button" onClick={() => setNavOpen((o) => !o)} style={{ background: "var(--ink)", color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 12px 32px -10px rgba(0,0,0,0.3)", border: "none", cursor: "pointer" }}>
            <span>🧭</span> Saltar a…
          </button>
          {navOpen && (
            <div style={{ position: "absolute", top: 50, right: 0, background: "#fff", borderRadius: 16, padding: 8, boxShadow: "0 24px 60px -10px rgba(0,0,0,0.25)", border: "1px solid var(--line)", minWidth: 240, maxHeight: "70vh", overflowY: "auto" }}>
              {navItems.map((it) => (
                <button key={it.num} type="button" className="ad-navitem" onClick={it.onClick}>
                  <span className="ad-navnum">{it.num}</span> {it.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {screen === "welcome" && <WelcomeScreen onRegister={() => goScreen("register")} onLogin={() => goScreen("login")} />}
      {screen === "login" && <LoginScreen onRegister={() => goScreen("register")} onForgot={() => goScreen("forgot")} />}
      {screen === "login-error" && <LoginErrorScreen email={conflictEmail} onRegister={() => goScreen("register")} onBack={() => goScreen("login")} onForgot={() => goScreen("forgot")} />}
      {screen === "forgot" && <ForgotScreen onBack={() => goScreen("login")} />}
      {screen === "register" && (
        <RegisterScreen
          onLogin={() => goScreen("login")}
          onRegistered={(whatsapp) => { setUserWhatsapp(whatsapp); goOnb(0) }}
          onExisting={(email) => { setConflictEmail(email); goScreen("register-exists") }}
        />
      )}
      {screen === "register-exists" && <RegisterExistsScreen email={conflictEmail} onLogin={() => goScreen("login")} onForgot={() => goScreen("forgot")} onRegister={() => goScreen("register")} />}
      {screen === "scraper-failed" && <ScraperFailedScreen onScratch={() => goOnb(5)} />}
      {screen === "celebration" && <CelebrationScreen onReady={() => goScreen("ready")} />}
      {screen === "ready" && <ReadyScreen store={store} />}
      {screen === "ai-catalog" && <AiCatalog onBack={() => goOnb(4)} onContinue={() => goOnb(5)} />}

      {screen === "onb" && (
        <OnboardingShell
          step={onbStep}
          valid={onbValid}
          store={store}
          patch={patch}
          slugTouched={slugTouched}
          setSlugTouched={setSlugTouched}
          onNext={onbNext}
          onBack={onbBack}
          onSkip={() => { if (confirm("¿Saltar? Puedes completar esto luego desde el dashboard.")) goScreen("celebration") }}
          creating={creating}
          createError={createError}
        />
      )}

      {scraping && (
        <CinematicScraper handle={store.instagram || "@rosa.atelier"} onDone={() => { setScraping(false); goScreen("ai-catalog") }} />
      )}
    </div>
  )
}

/* ============ SCREENS ============ */

function ShellRight({ children }: { children: React.ReactNode }) {
  return (
    <div className="ad-right">
      <div className="ad-glow" />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>{children}</div>
    </div>
  )
}

function WelcomeScreen({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
  return (
    <div className="ad-shell">
      <div className="ad-left">
        <Logo />
        <div className="ad-center-card">
          <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>— bienvenida</div>
          <h1 style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 700, margin: "0 0 18px" }}>Tu negocio,<br />en <span className="serif-it" style={{ color: "var(--brand)" }}>un link</span>.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", margin: "0 0 36px", maxWidth: 380 }}>Vende por WhatsApp con una tienda hermosa que se monta en menos de 3 minutos.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" onClick={onRegister} className="ad-btn ad-btn-primary" style={{ padding: "16px 28px", fontSize: 16 }}>Crear mi tienda gratis →</button>
            <button type="button" onClick={onLogin} className="ad-btn ad-btn-ghost" style={{ padding: "16px 28px", fontSize: 16 }}>Ya tengo una cuenta</button>
          </div>
          <div className="mono" style={{ marginTop: 24, fontSize: 11, color: "var(--ink-3)" }}>gratis · sin tarjeta · cancela cuando quieras</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>¿Necesitas ayuda? <a href="mailto:soporte@bylink.app" style={{ color: "var(--brand)", fontWeight: 600 }}>Habla con nosotros →</a></div>
      </div>
      <ShellRight>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <div style={{ position: "relative", width: 140, height: 140 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 36, background: "var(--brand)", animation: "adRingPulse 2.4s infinite" }} />
            <div style={{ position: "relative", width: 140, height: 140, borderRadius: 36, background: "linear-gradient(140deg, var(--brand), var(--brand-dark))", display: "grid", placeItems: "center", boxShadow: "0 30px 60px -15px rgba(30,58,138,0.5)" }}>
              <svg width="68" height="68" viewBox="0 0 32 32"><path d="M10 10v12M10 10c3.5 0 5.5 1.3 5.5 3.2S14 16 12.2 16H10M12.2 16c2.3 0 4.3 1 4.3 2.6S14.5 22 11.5 22H10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" /><circle cx="22" cy="21" r="3" fill="var(--accent)" /></svg>
            </div>
          </div>
          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--brand)", letterSpacing: "-0.03em" }}>+12K</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>tiendas activas</div>
            </div>
            <div style={{ width: 1, height: 40, background: "var(--line-2)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--brand)", letterSpacing: "-0.03em" }}>3 min</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>para empezar</div>
            </div>
          </div>
        </div>
      </ShellRight>
    </div>
  )
}

function LoginScreen({ onRegister, onForgot }: { onRegister: () => void; onForgot: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setError(null); setPending(true)
    try {
      await login({ email, password })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Error al iniciar sesión"
      setError(msg)
      setPending(false)
    }
  }

  return (
    <div className="ad-shell">
      <div className="ad-left">
        <Logo />
        <form className="ad-center-card" onSubmit={handleSubmit}>
          <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>— iniciar sesión</div>
          <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 10px" }}>¡Qué bueno <span className="serif-it" style={{ color: "var(--brand)" }}>verte!</span></h1>
          <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "0 0 28px" }}>Entra a tu tienda en bylink.</p>
          <button type="button" onClick={startGoogleOAuth} className="ad-btn ad-btn-ghost" style={{ width: "100%", marginBottom: 18 }}><GoogleIcon /> <span>Continuar con Google</span></button>
          <Divider />
          {error && (
            <div role="alert" style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 14, fontSize: 13, color: "#991B1B" }}>
              <span aria-hidden="true">⚠</span><span>{error}</span>
            </div>
          )}
          <label className="ad-label">Email</label>
          <input className="ad-input" type="email" placeholder="hola@tunegocio.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "16px 0 8px" }}>
            <label className="ad-label" style={{ margin: 0 }}>Contraseña</label>
            <button type="button" onClick={onForgot} style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>¿Olvidaste tu contraseña?</button>
          </div>
          <input className="ad-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, fontSize: 13, color: "var(--ink-2)", cursor: "pointer" }}>
            <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "var(--brand)" }} /> Recordar mi sesión
          </label>
          <button type="submit" disabled={pending || !email || !password} className="ad-btn ad-btn-primary" style={{ width: "100%", marginTop: 22 }}>{pending ? "Entrando…" : "Entrar a mi tienda →"}</button>
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-2)", margin: "22px 0 0" }}>¿Aún no tienes cuenta? <button type="button" onClick={onRegister} style={{ color: "var(--brand)", fontWeight: 700, cursor: "pointer", background: "none", border: "none" }}>Regístrate gratis</button></p>
        </form>
        <div />
      </div>
      <ShellRight>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>— por qué bylink</div>
          <p style={{ fontSize: 24, lineHeight: 1.35, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>Pasa de mandar fotos por DM <span className="serif-it" style={{ color: "var(--brand)" }}>a tener un link real</span>. Tus clientes piden por tu catálogo en vez de preguntar precios.</p>
        </div>
      </ShellRight>
    </div>
  )
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
      <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>o con email</span>
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
    </div>
  )
}

function LoginErrorScreen({ email, onRegister, onBack, onForgot }: { email?: string; onRegister: () => void; onBack: () => void; onForgot: () => void }) {
  const shown = email || "maria@ejemplo.com"
  return (
    <div className="ad-shell">
      <div className="ad-left">
        <Logo />
        <div className="ad-center-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, background: "#FEF3C7", border: "1.5px solid #FCD34D", borderRadius: 12, marginBottom: 22 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FBBF24", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, flexShrink: 0 }}>!</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#92400E" }}>No encontramos esa cuenta</div>
              <div style={{ fontSize: 12, color: "#92400E", opacity: 0.85 }}>El email <span className="mono">{shown}</span> no está registrado.</div>
            </div>
          </div>
          <h1 style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 10px" }}>¿Quieres <span className="serif-it" style={{ color: "var(--brand)" }}>crear tu cuenta</span>?</h1>
          <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 26px" }}>Es gratis y solo toma 3 minutos. Tu tienda queda lista hoy mismo.</p>
          <button type="button" onClick={onRegister} className="ad-btn ad-btn-primary" style={{ width: "100%", marginBottom: 12 }}>Crear mi cuenta gratis →</button>
          <button type="button" onClick={onBack} className="ad-btn ad-btn-ghost" style={{ width: "100%" }}>← Volver e intentar otro email</button>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-3)", margin: "22px 0 0" }}>¿Olvidaste cuál usaste? <button type="button" onClick={onForgot} style={{ color: "var(--brand)", fontWeight: 700, cursor: "pointer", background: "none", border: "none" }}>Recupera tu acceso</button></p>
        </div>
        <div />
      </div>
      <ShellRight>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🤝</div>
          <p style={{ fontSize: 22, lineHeight: 1.35, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>Cada negocio <span className="serif-it" style={{ color: "var(--brand)" }}>empieza con un paso</span>. El tuyo está aquí.</p>
        </div>
      </ShellRight>
    </div>
  )
}

function ForgotScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError(null); setPending(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = Array.isArray(data.message) ? data.message[0] : (data.message ?? "Error al enviar el email")
        setError(typeof msg === "string" ? msg : "Error al enviar el email")
        return
      }
      setSent(true)
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="ad-shell">
      <div className="ad-left">
        <Logo />
        <form className="ad-center-card" onSubmit={handleSend}>
          <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "var(--ink-3)", fontSize: 13, cursor: "pointer", marginBottom: 18, padding: 0 }}>← Volver</button>
          <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>— recuperar acceso</div>
          <h1 style={{ fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 10px" }}>Pasa, <span className="serif-it" style={{ color: "var(--brand)" }}>no te preocupes</span>.</h1>
          <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 26px" }}>Te enviamos instrucciones al email para recuperar tu acceso.</p>
          {error && (
            <div role="alert" style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 14, fontSize: 13, color: "#991B1B" }}>
              <span aria-hidden="true">⚠</span><span>{error}</span>
            </div>
          )}
          <label className="ad-label">Tu email</label>
          <input className="ad-input" type="email" placeholder="hola@tunegocio.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" disabled={sent} />
          {!sent && <button type="submit" disabled={pending || !email.trim()} className="ad-btn ad-btn-primary" style={{ width: "100%", marginTop: 16 }}>{pending ? "Enviando…" : "Enviarme instrucciones ✨"}</button>}
          {sent && (
            <div style={{ marginTop: 16, padding: 18, background: "#ECFDF5", border: "1.5px solid #A7F3D0", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#10B981", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#065F46" }}>Revisa tu email</div>
              </div>
              <p style={{ fontSize: 13, color: "#047857", margin: 0, paddingLeft: 38 }}>Te enviamos instrucciones a {email}.</p>
            </div>
          )}
        </form>
        <div />
      </div>
      <ShellRight>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--bg-2)", border: "2px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 24px", fontSize: 40 }}>📬</div>
          <p style={{ fontSize: 20, lineHeight: 1.4, fontWeight: 500, color: "var(--ink)", margin: 0 }}>Sin estrés, en un minuto <span className="serif-it" style={{ color: "var(--brand)" }}>vuelves a entrar</span>.</p>
        </div>
      </ShellRight>
    </div>
  )
}

interface RegisterScreenProps {
  onLogin: () => void
  onRegistered: (whatsapp: string) => void
  onExisting: (email: string) => void
}

function RegisterScreen({ onLogin, onRegistered, onExisting }: RegisterScreenProps) {
  const { loadSession } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [accept, setAccept] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordValid = password.length >= 8
  const passwordsMatch = password === confirm && confirm.length > 0
  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && passwordValid && passwordsMatch && accept

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null); setPending(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 409) { onExisting(email.trim()); return }
        const msg = Array.isArray(data.message) ? data.message[0] : (data.message ?? "Error al crear la cuenta")
        setError(typeof msg === "string" ? msg : "Error al crear la cuenta")
        return
      }
      await loadSession()
      onRegistered(whatsapp.trim())
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setPending(false)
    }
  }

  const features = [
    { icon: "🔗", bg: "rgba(30,58,138,0.1)", color: "var(--brand)", title: "Tu link público", desc: "bylink.app/tu-negocio listo en segundos." },
    { icon: "🛍️", bg: "rgba(220,74,61,0.1)", color: "var(--accent)", title: "Tienda con productos", desc: "Importamos automáticamente desde tu Instagram." },
    { icon: "💬", bg: "rgba(37,211,102,0.1)", color: "var(--whatsapp)", title: "Pedidos por WhatsApp", desc: "Cada pedido te llega con todo el detalle." },
    { icon: "📊", bg: "rgba(245,158,11,0.1)", color: "#F59E0B", title: "Estadísticas en vivo", desc: "Visitas, clicks y ventas, todo a la mano." },
  ]
  return (
    <div className="ad-shell">
      <div className="ad-left">
        <Logo />
        <form className="ad-center-card" style={{ maxWidth: 440 }} onSubmit={handleSubmit}>
          <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>— crear cuenta</div>
          <h1 style={{ fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 8px" }}>Tu tienda en <span className="serif-it" style={{ color: "var(--brand)" }}>3 minutos</span>.</h1>
          <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 22px" }}>Empieza gratis, sin tarjeta de crédito.</p>
          <button type="button" onClick={startGoogleOAuth} className="ad-btn ad-btn-ghost" style={{ width: "100%", marginBottom: 14 }}><GoogleIcon /> <span>Continuar con Google</span></button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>o con email</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>
          {error && (
            <div role="alert" style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 12, fontSize: 13, color: "#991B1B" }}>
              <span aria-hidden="true">⚠</span><span>{error}</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label className="ad-label">Tu nombre</label><input className="ad-input" placeholder="María González" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" /></div>
            <div><label className="ad-label">Email</label><input className="ad-input" type="email" placeholder="maria@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
          </div>
          <label className="ad-label" style={{ marginTop: 14 }}>WhatsApp <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>(opcional)</span></label>
          <div style={{ display: "flex", alignItems: "center", padding: "0 0 0 14px", border: "1.5px solid var(--line)", borderRadius: 12, background: "#fff" }}>
            <span style={{ fontSize: 18 }}>🇻🇪</span>
            <span className="mono" style={{ fontSize: 14, color: "var(--ink-3)", marginLeft: 8 }}>+58</span>
            <input style={{ flex: 1, border: "none", padding: "14px 12px", fontSize: 15, background: "none", outline: "none" }} placeholder="412-1234567" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} autoComplete="tel" />
          </div>
          <p style={{ fontSize: 11, color: "var(--ink-3)", margin: "6px 0 0", paddingLeft: 4 }}>Es por aquí que tus clientes te van a contactar.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <div><label className="ad-label">Contraseña</label><input className="ad-input" type="password" placeholder="Mín. 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" /></div>
            <div><label className="ad-label">Confirmar</label><input className="ad-input" type="password" placeholder="Repite la contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" /></div>
          </div>
          {password.length > 0 && (
            <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11 }}>
              <span style={{ color: passwordValid ? "var(--success)" : "var(--ink-3)" }}>{passwordValid ? "✓" : "·"} mínimo 8 caracteres</span>
              {confirm.length > 0 && <span style={{ color: passwordsMatch ? "var(--success)" : "var(--accent)" }}>{passwordsMatch ? "✓ coinciden" : "✗ no coinciden"}</span>}
            </div>
          )}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 18, fontSize: 13, color: "var(--ink-2)", cursor: "pointer", lineHeight: 1.5 }}>
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--brand)", marginTop: 2 }} />
            <span>Acepto los <a href="/home/terminos" target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand)", fontWeight: 600 }}>términos</a> y la <a href="/home/terminos#privacidad" target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand)", fontWeight: 600 }}>política de privacidad</a>.</span>
          </label>
          <button type="submit" disabled={pending || !canSubmit} className="ad-btn ad-btn-primary" style={{ width: "100%", marginTop: 20 }}>{pending ? "Creando cuenta…" : "Crear mi cuenta →"}</button>
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-2)", margin: "18px 0 0" }}>¿Ya tienes cuenta? <button type="button" onClick={onLogin} style={{ color: "var(--brand)", fontWeight: 700, cursor: "pointer", background: "none", border: "none" }}>Inicia sesión</button></p>
        </form>
        <div />
      </div>
      <ShellRight>
        <div style={{ maxWidth: 400 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18, textAlign: "center" }}>— LO QUE VAS A TENER</div>
          <div style={{ display: "grid", gap: 14 }}>
            {features.map((f) => (
              <div key={f.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 16, background: "#fff", borderRadius: 14, boxShadow: "0 4px 20px -6px rgba(15,23,42,0.08)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, color: f.color, display: "grid", placeItems: "center", flexShrink: 0, fontSize: 22 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ShellRight>
    </div>
  )
}

function RegisterExistsScreen({ email, onLogin, onForgot, onRegister }: { email?: string; onLogin: () => void; onForgot: () => void; onRegister: () => void }) {
  const shown = email || "maria@ejemplo.com"
  return (
    <div className="ad-shell">
      <div className="ad-left">
        <Logo />
        <div className="ad-center-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 12, marginBottom: 22 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #C63E2A, #7A1F10)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1E40AF" }}>Ya tienes cuenta con este email</div>
              <div className="mono" style={{ fontSize: 12, color: "#1E40AF", opacity: 0.8 }}>{shown}</div>
            </div>
          </div>
          <h1 style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 10px" }}>¡Bienvenida <span className="serif-it" style={{ color: "var(--brand)" }}>de vuelta</span>!</h1>
          <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 26px" }}>Detectamos que ya tienes una cuenta en bylink. Inicia sesión y sigue donde quedaste.</p>
          <button type="button" onClick={onLogin} className="ad-btn ad-btn-primary" style={{ width: "100%", marginBottom: 12 }}>Iniciar sesión →</button>
          <button type="button" onClick={onForgot} className="ad-btn ad-btn-ghost" style={{ width: "100%" }}>Olvidé mi contraseña</button>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-3)", margin: "22px 0 0" }}>¿No eras tú? <button type="button" onClick={onRegister} style={{ color: "var(--brand)", fontWeight: 700, cursor: "pointer", background: "none", border: "none" }}>Usar otro email</button></p>
        </div>
        <div />
      </div>
      <ShellRight>
        <div style={{ maxWidth: 380 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>— TU TIENDA YA EXISTE</div>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 18, padding: 18, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #C63E2A, #7A1F10)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 }}>R</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Rosa Atelier</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>bylink.app/rosa-atelier</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              <div style={{ aspectRatio: "1", background: "linear-gradient(135deg, #C63E2A, #7A1F10)", borderRadius: 8 }} />
              <div style={{ aspectRatio: "1", background: "linear-gradient(135deg, #E8C07A, #B8860B)", borderRadius: 8 }} />
              <div style={{ aspectRatio: "1", background: "linear-gradient(135deg, #8A6B4C, #5A3D1D)", borderRadius: 8 }} />
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <div><span style={{ fontWeight: 700 }}>12</span> <span style={{ color: "var(--ink-3)" }}>productos</span></div>
              <div><span style={{ fontWeight: 700 }}>347</span> <span style={{ color: "var(--ink-3)" }}>visitas</span></div>
            </div>
          </div>
        </div>
      </ShellRight>
    </div>
  )
}

function ScraperFailedScreen({ onScratch }: { onScratch: () => void }) {
  const opts = [
    { title: "Empezar desde cero", desc: "Subo mis productos uno por uno (toma 5 min)", onClick: onScratch },
    { title: "Probar con otro Instagram", desc: "Quizá puse mal el usuario, déjame intentar otra vez", onClick: () => alert("En producción: input para otro usuario") },
    { title: "Subir CSV o Excel", desc: "Tengo mis productos en una hoja de cálculo", onClick: () => alert("En producción: upload CSV") },
  ]
  return (
    <div className="ad-shell">
      <div className="ad-left">
        <Logo />
        <div className="ad-center-card">
          <div style={{ marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: "#FEF3C7", display: "grid", placeItems: "center", marginBottom: 18, fontSize: 26 }}>🔍</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>— momento</div>
            <h1 style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 12px" }}>No pudimos <span className="serif-it" style={{ color: "var(--brand)" }}>leer ese perfil</span>.</h1>
            <p style={{ fontSize: 15, color: "var(--ink-2)", margin: 0 }}>Puede ser un perfil privado, un usuario nuevo, o que tenga muy pocos posts. Pero <strong>no pasa nada</strong> — armamos tu tienda igual.</p>
          </div>
          <div style={{ background: "var(--bg-2)", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>¿Qué prefieres?</div>
            {opts.map((o) => (
              <button key={o.title} type="button" onClick={o.onClick} style={{ width: "100%", padding: 14, background: "#fff", border: "1.5px solid var(--line)", borderRadius: 10, textAlign: "left", cursor: "pointer", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{o.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{o.desc}</div>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center" }}>Lo importante es que tu tienda quede lista. <span style={{ color: "var(--brand)", fontWeight: 600 }}>Cualquier camino funciona.</span></p>
        </div>
        <div />
      </div>
      <ShellRight>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <p style={{ fontSize: 22, lineHeight: 1.4, fontWeight: 500, color: "var(--ink)", margin: 0 }}>El <span className="serif-it" style={{ color: "var(--brand)" }}>94%</span> de tiendas en bylink se arman en menos de 5 minutos, con o sin Instagram.</p>
        </div>
      </ShellRight>
    </div>
  )
}

function CelebrationScreen({ onReady }: { onReady: () => void }) {
  const pieces = useMemo(() => {
    const colors = ["#FFFFFF", "#F97066", "#DC4A3D", "#FCD34D", "#10B981", "#FBBF24", "#3B82F6"]
    return Array.from({ length: 100 }, (_, i) => {
      const angle = Math.PI * 2 * (i / 100) + Math.random() * 0.4
      const dist = 300 + Math.random() * 350
      return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist, color: colors[i % colors.length], delay: Math.random() * 0.4, rot: Math.random() * 360 }
    })
  }, [])
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, var(--brand), var(--brand-dark))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {pieces.map((p, i) => (
          <div key={i} className="ad-confetti" style={{ background: p.color, animationDelay: `${p.delay}s`, transform: `translate(-50%, -50%) rotate(${p.rot}deg)`, "--tx": `${p.tx}px`, "--ty": `${p.ty}px` } as React.CSSProperties} />
        ))}
      </div>
      <div style={{ position: "relative", textAlign: "center", maxWidth: 580, padding: 40 }}>
        <div style={{ width: 160, height: 160, margin: "0 auto 36px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", backdropFilter: "blur(10px)", animation: "adPulseScale 2s infinite" }}>
          <svg width="84" height="84" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h1 style={{ fontSize: 80, lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 700, margin: "0 0 18px" }}>¡Tu tienda está <span className="serif-it" style={{ color: "var(--accent-2)" }}>viva!</span></h1>
        <p style={{ fontSize: 20, color: "rgba(255,255,255,0.85)", margin: "0 0 36px" }}>Bienvenida, María 💕 Ya puedes empezar a vender por bylink.</p>
        <button type="button" onClick={onReady} style={{ padding: "18px 32px", background: "#fff", color: "var(--brand)", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 16px 40px -10px rgba(0,0,0,0.4)" }}>Ver mi tienda →</button>
      </div>
    </div>
  )
}

function ReadyScreen({ store }: { store: StoreState }) {
  const [copied, setCopied] = useState(false)
  const slug = store.slug || "rosa-atelier"
  const nextSteps = [
    { icon: "👀", bg: "rgba(30,58,138,0.1)", color: "var(--brand)", title: "Ver mi tienda en vivo", desc: "Como la verán tus clientes", href: "/tienda-demo" },
    { icon: "📦", bg: "rgba(220,74,61,0.1)", color: "var(--accent)", title: "Revisar mis productos", desc: "Importamos 12 desde tu Instagram", href: "/panel-demo" },
    { icon: "📊", bg: "rgba(16,185,129,0.1)", color: "var(--success)", title: "Ir al dashboard", desc: "Estadísticas, pedidos y configuración", href: "/panel-demo" },
  ]
  return (
    <div className="ad-shell">
      <div className="ad-left">
        <Logo />
        <div style={{ flex: 1, maxWidth: 480, margin: "0 auto", width: "100%", padding: "40px 0" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--success)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>— ¡todo listo!</div>
          <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 12px" }}>Tu tienda está en <span className="serif-it" style={{ color: "var(--brand)" }}>vivo</span>.</h1>
          <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "0 0 28px" }}>Comparte tu link y empieza a recibir pedidos hoy mismo.</p>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", marginBottom: 8 }}>TU LINK PÚBLICO</div>
          <div style={{ padding: 18, border: "1.5px solid var(--brand)", borderRadius: 14, background: "rgba(30,58,138,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--brand)", wordBreak: "break-all" }}>bylink.app/{slug}</div>
            </div>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(`bylink.app/${slug}`); setCopied(true); setTimeout(() => setCopied(false), 1500) }} style={{ padding: "10px 16px", background: "var(--brand)", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 13, flexShrink: 0, border: "none", cursor: "pointer" }}>{copied ? "✓ Copiado" : "Copiar"}</button>
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[["📸", "Instagram"], ["💬", "WhatsApp"], ["🎵", "TikTok"], ["🔗", "QR"]].map(([icon, label]) => (
              <button key={label} type="button" className="ad-btn ad-btn-ghost" style={{ padding: "14px 8px", flexDirection: "column", gap: 6, fontSize: 12 }}><span style={{ fontSize: 22 }}>{icon}</span>{label}</button>
            ))}
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", margin: "32px 0 12px" }}>SIGUIENTES PASOS</div>
          <div style={{ display: "grid", gap: 10 }}>
            {nextSteps.map((s) => (
              <Link key={s.title} href={s.href} className="ad-opt">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.color, display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="ad-right">
        <div className="ad-glow" />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em" }}>YA ESTÁ EN VIVO</div>
          <div className="ad-phone">
            <div className="ad-phone-notch" />
            <div className="ad-phone-screen"><PhonePreview mode="final" store={store} onbStep={7} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============ ONBOARDING SHELL ============ */

interface OnboardingShellProps {
  step: number
  valid: boolean
  store: StoreState
  patch: (p: Partial<StoreState>) => void
  slugTouched: boolean
  setSlugTouched: (v: boolean) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  creating?: boolean
  createError?: string | null
}

function OnboardingShell({ step, valid, store, patch, slugTouched, setSlugTouched, onNext, onBack, onSkip, creating = false, createError = null }: OnboardingShellProps) {
  const meta = ONB_TITLES[step]
  return (
    <div className="ad-shell">
      <div className="ad-left">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <Logo />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>paso {step + 1} de 8</span>
            <button type="button" onClick={onSkip} className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "6px 12px", borderRadius: 8, background: "var(--bg-2)", border: "none", cursor: "pointer" }}>SALTAR</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= step ? "var(--brand)" : "var(--line)", transition: "background .35s" }} />
          ))}
        </div>
        <div key={step} className="ad-step" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 480, margin: "0 auto", width: "100%", padding: "40px 0" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>— paso {step + 1}</div>
          <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 12px" }}>{meta.t}</h1>
          <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "0 0 30px" }}>{meta.s}</p>
          <OnbStepBody step={step} store={store} patch={patch} slugTouched={slugTouched} setSlugTouched={setSlugTouched} onBack={onBack} />
        </div>
        {createError && (
          <div role="alert" style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 10, fontSize: 13, color: "#991B1B" }}>
            <span aria-hidden="true">⚠</span><span>{createError}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button type="button" onClick={onBack} disabled={creating} className="ad-btn ad-btn-ghost" style={{ padding: "14px 18px", visibility: step === 0 ? "hidden" : "visible" }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg> Atrás
          </button>
          <button type="button" onClick={onNext} disabled={!valid || creating} className="ad-btn ad-btn-primary" style={{ flex: 1 }}>
            {creating && step === 7 ? "Creando tu tienda…" : (ONB_CTA[step] || "Continuar →")}
          </button>
        </div>
      </div>
      <div className="ad-right">
        <div className="ad-glow" />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em" }}>VISTA PREVIA EN VIVO</div>
          <div className="ad-phone">
            <div className="ad-phone-notch" />
            <div className="ad-phone-screen"><PhonePreview mode={ONB_PREVIEW[step]} store={store} onbStep={step} /></div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 0 4px rgba(16,185,129,0.2)" }} />
            sincronizado en tiempo real
          </div>
        </div>
      </div>
    </div>
  )
}

interface OnbBodyProps {
  step: number
  store: StoreState
  patch: (p: Partial<StoreState>) => void
  slugTouched: boolean
  setSlugTouched: (v: boolean) => void
  onBack: () => void
}

function OnbStepBody({ step, store, patch, slugTouched, setSlugTouched, onBack }: OnbBodyProps) {
  if (step === 0) {
    return (
      <>
        <input
          className="ad-input"
          autoFocus
          value={store.name}
          onChange={(e) => { const v = e.target.value; patch({ name: v, ...(slugTouched ? {} : { slug: slugify(v) }) }) }}
          placeholder="Ej. Rosa Atelier"
          style={{ fontSize: 22, padding: 22, fontWeight: 600 }}
        />
        <p style={{ margin: "14px 0 0", fontSize: 13, color: "var(--ink-3)" }}>No te preocupes, lo puedes cambiar luego desde el dashboard.</p>
      </>
    )
  }
  if (step === 1) {
    const ok = store.slug.length >= 3
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", padding: "0 18px", border: `1.5px solid ${ok ? "var(--success)" : "var(--line)"}`, borderRadius: 14, background: "#fff" }}>
          <span className="mono" style={{ fontSize: 16, color: "var(--ink-3)", flexShrink: 0 }}>bylink.app/</span>
          <input autoFocus value={store.slug} onChange={(e) => { setSlugTouched(true); patch({ slug: slugify(e.target.value) }) }} style={{ flex: 1, padding: "22px 6px", fontSize: 19, background: "none", border: "none", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--brand)", minWidth: 0, outline: "none" }} placeholder="rosa-atelier" />
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: ok ? "var(--success)" : "var(--ink-3)", fontWeight: 600 }}>
          <span>{ok ? "✓" : "·"}</span><span>{ok ? "¡Está disponible!" : "Mínimo 3 caracteres"}</span>
        </div>
      </>
    )
  }
  if (step === 2) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {VERTICALS.map((v) => (
          <button key={v.id} type="button" className={`ad-opt ${store.vertical === v.id ? "active" : ""}`} onClick={() => patch({ vertical: v.id })}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg-2)", display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0 }}>{v.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{v.label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{v.desc}</div>
            </div>
          </button>
        ))}
      </div>
    )
  }
  if (step === 3) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", padding: "0 18px", border: "1.5px solid var(--line)", borderRadius: 14, background: "#fff" }}>
          <span className="mono" style={{ fontSize: 16, color: "var(--ink-3)" }}>@</span>
          <input autoFocus value={store.instagram.replace("@", "")} onChange={(e) => patch({ instagram: "@" + e.target.value.trim() })} style={{ flex: 1, padding: "22px 8px", fontSize: 19, background: "none", border: "none", fontWeight: 600, outline: "none" }} placeholder="rosa.atelier" />
        </div>
        <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(30,58,138,0.06)", borderRadius: 12, display: "flex", gap: 12 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}><strong>Tu cuenta sigue siendo tuya.</strong> Solo leemos lo que ya es público.</div>
        </div>
        <button type="button" className="mono" style={{ marginTop: 14, fontSize: 12, color: "var(--ink-3)", padding: 4, background: "none", border: "none", cursor: "pointer" }}>— No tengo Instagram, llenar a mano</button>
      </>
    )
  }
  if (step === 4) {
    return (
      <>
        <div style={{ border: "1.5px solid var(--brand)", borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 16px 40px -12px rgba(30,58,138,0.18)" }}>
          <div style={{ padding: 22, display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--line)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: SCRAPED.avatar, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{SCRAPED.name}</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{SCRAPED.handle}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12, color: "var(--ink-2)" }}>
                <span><strong>{SCRAPED.followers}</strong> seguidores</span>
                <span><strong>{SCRAPED.posts}</strong> posts</span>
              </div>
            </div>
          </div>
          <div style={{ padding: "14px 22px", background: "var(--bg-2)", fontSize: 13, color: "var(--ink-2)", whiteSpace: "pre-line", lineHeight: 1.5 }}>{SCRAPED.bio}</div>
          <div style={{ padding: "18px 22px" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em", marginBottom: 10 }}>VAMOS A IMPORTAR</div>
            <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ color: "var(--success)" }}>✓</span> Foto de perfil como logo</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ color: "var(--success)" }}>✓</span> Bio y nombre del negocio</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ color: "var(--success)" }}>✓</span> 12 posts como productos iniciales</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
              {SCRAPED.photos.map((g, i) => (<div key={i} style={{ aspectRatio: "1", background: g, borderRadius: 6 }} />))}
            </div>
          </div>
        </div>
        <button type="button" onClick={onBack} style={{ marginTop: 14, fontSize: 13, color: "var(--ink-3)", padding: 8, background: "none", border: "none", cursor: "pointer" }}>No soy yo, buscar otra cuenta</button>
      </>
    )
  }
  if (step === 5) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {TEMPLATES.map((t) => (
          <button key={t.id} type="button" onClick={() => patch({ template: t.id })} style={{ border: `2px solid ${store.template === t.id ? "var(--brand)" : "var(--line)"}`, borderRadius: 14, padding: 0, overflow: "hidden", background: "#fff", cursor: "pointer", textAlign: "left", transition: "all .15s ease" }}>
            <div style={{ aspectRatio: "9/14", background: t.bg, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: 6, background: t.accent }} />
                <div style={{ height: 5, flex: 1, background: t.accent, opacity: 0.4, borderRadius: 2 }} />
              </div>
              <div style={{ height: 4, background: t.accent, opacity: 0.3, borderRadius: 1, width: "60%" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, flex: 1, marginTop: 4 }}>
                <div style={{ background: t.accent, opacity: 0.7, borderRadius: 4 }} />
                <div style={{ background: t.accent, opacity: 0.5, borderRadius: 4 }} />
                <div style={{ background: t.accent, opacity: 0.4, borderRadius: 4 }} />
                <div style={{ background: t.accent, opacity: 0.6, borderRadius: 4 }} />
              </div>
            </div>
            <div style={{ padding: "10px 12px", background: "#fff" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{t.desc}</div>
            </div>
          </button>
        ))}
      </div>
    )
  }
  if (step === 6) {
    const toggle = (id: string) => patch({ payments: store.payments.includes(id) ? store.payments.filter((x) => x !== id) : [...store.payments, id] })
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {PAYMENT_METHODS.map((m) => {
            const on = store.payments.includes(m.id)
            return (
              <button key={m.id} type="button" className={`ad-opt ${on ? "active" : ""}`} onClick={() => toggle(m.id)}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${on ? "var(--brand)" : "var(--line-2)"}`, background: on ? "var(--brand)" : "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <div style={{ fontSize: 22 }}>{m.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{m.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(30,58,138,0.06)", borderRadius: 12, display: "flex", gap: 10 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}><strong>Tasa BCV automática.</strong> Tus precios se muestran en USD y Bs.</div>
        </div>
      </>
    )
  }
  // step 7 referral
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {REFERRAL_SOURCES.map((s) => (
        <button key={s.id} type="button" className={`ad-opt ${store.referral === s.id ? "active" : ""}`} onClick={() => patch({ referral: s.id })}>
          <div style={{ fontSize: 22 }}>{s.emoji}</div>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{s.label}</div>
          <div className="ad-opt-radio" />
        </button>
      ))}
    </div>
  )
}
