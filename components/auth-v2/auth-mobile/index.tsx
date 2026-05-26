"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  PAYMENT_METHODS,
  REFERRAL_SOURCES,
  SCRAPED,
  slugify,
  type StoreState,
  TEMPLATES,
  VERTICALS,
} from "@/components/auth-v2/auth-desktop/data"

type Screen = "welcome" | "login" | "register" | "onb" | "celebration" | "ready"

const ONB = [
  { title: <>¿Cómo se llama tu <span className="serif-it" style={{ color: "var(--brand)" }}>negocio</span>?</>, sub: "Este será el nombre que verán tus clientes." },
  { title: <>¿Cuál será tu <span className="serif-it" style={{ color: "var(--brand)" }}>link</span>?</>, sub: "Aquí te encontrarán tus clientes. Cortito y fácil de recordar." },
  { title: <>¿Qué <span className="serif-it" style={{ color: "var(--brand)" }}>vendes</span>?</>, sub: "Esto nos ayuda a sugerir templates y configurar tu tienda." },
  { title: <>¿Tu <span className="serif-it" style={{ color: "var(--brand)" }}>Instagram</span>?</>, sub: "Lo escaneamos para autocompletar todo. Te ahorra horas de trabajo." },
  { title: <>¿Eres <span className="serif-it" style={{ color: "var(--brand)" }}>tú</span>?</>, sub: "Encontramos esta cuenta. Confirma para importar tu información." },
  { title: <>Elige un <span className="serif-it" style={{ color: "var(--brand)" }}>estilo</span></>, sub: "Después puedes personalizar colores, fuentes y todo." },
  { title: <>¿Cómo te <span className="serif-it" style={{ color: "var(--brand)" }}>pagan</span>?</>, sub: "Selecciona los métodos que aceptas. Puedes agregar más después." },
  { title: <>¿Cómo nos <span className="serif-it" style={{ color: "var(--brand)" }}>conociste</span>?</>, sub: "Última pregunta, ¡prometido! Nos ayuda mucho a saber." },
]
const ONB_CTA: (string | null)[] = [null, null, null, "Buscar mi perfil →", "Sí, soy yo · Importar →", null, null, "¡Crear mi tienda! 🎉"]
const SCRAPE_STEPS = (ig: string) => ["Conectando con Instagram", `Encontramos ${ig || "@rosa.atelier"}`, "Leyendo tu bio y posts", "Importando fotos…"]

const styles = `
.am-root { --bg: #FFFFFF; --bg-2: #F8FAFC; --bg-3: #F1F5F9; --ink: #0F172A; --ink-2: #334155; --ink-3: #64748B; --ink-4: #94A3B8; --line: #E2E8F0; --line-2: #CBD5E1; --brand: #1E3A8A; --brand-dark: #172554; --accent: #DC4A3D; --accent-2: #F97066; --warm: #FFF7ED; --success: #10B981; font-family: var(--font-sans); color: var(--ink); }
.am-root .mono { font-family: var(--font-mono); }
.am-root .serif-it { font-family: var(--font-serif); font-style: italic; font-weight: 400; }
.am-root a { color: inherit; text-decoration: none; }
.am-stage { position: fixed; inset: 0; display: grid; place-items: center; background: radial-gradient(1200px 800px at 30% 20%, #FAFAFA, #E5E7EB 50%, #CBD5E1); padding: 20px; }
.am-phone { width: 100%; max-width: 420px; height: min(900px, calc(100vh - 40px)); background: #fff; border-radius: 36px; overflow: hidden; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 30px 80px -20px rgba(15,23,42,0.35); display: flex; flex-direction: column; }
.am-notch { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 110px; height: 28px; background: #000; border-radius: 14px; z-index: 60; }
.am-status { position: absolute; top: 0; left: 0; right: 0; height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 28px 0 32px; font-size: 14px; font-weight: 600; z-index: 50; pointer-events: none; }
.am-screen { position: absolute; inset: 0; display: flex; flex-direction: column; padding-top: 44px; background: #fff; animation: amStepIn .35s ease; }
.am-pad { padding: 24px 24px 28px; flex: 1; display: flex; flex-direction: column; min-height: 0; overflow-y: auto; }
.am-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; letter-spacing: -0.01em; border-radius: 14px; transition: all .18s ease; white-space: nowrap; padding: 16px 20px; font-size: 15px; border: none; cursor: pointer; }
.am-btn-primary { background: var(--brand); color: #fff; box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 8px 18px -6px rgba(30,58,138,0.45); }
.am-btn-primary:hover { background: var(--brand-dark); }
.am-btn-primary:disabled { background: #CBD5E1; cursor: not-allowed; box-shadow: none; }
.am-btn-ghost { background: #fff; color: var(--ink); border: 1px solid var(--line-2); }
.am-input { width: 100%; padding: 16px 18px; border: 1.5px solid var(--line); border-radius: 14px; background: #fff; font-size: 16px; transition: all .15s ease; color: var(--ink); outline: none; }
.am-input:focus { border-color: var(--brand); box-shadow: 0 0 0 4px rgba(30,58,138,0.08); }
.am-label { display: block; font-size: 13px; font-weight: 600; color: var(--ink-2); margin-bottom: 8px; }
.am-opt { display: flex; align-items: center; gap: 14px; padding: 16px; border: 1.5px solid var(--line); background: #fff; border-radius: 14px; transition: all .15s ease; cursor: pointer; text-align: left; width: 100%; }
.am-opt.active { border-color: var(--brand); background: rgba(30,58,138,0.04); }
.am-opt-radio { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--line-2); flex-shrink: 0; position: relative; }
.am-opt.active .am-opt-radio { border-color: var(--brand); }
.am-opt.active .am-opt-radio::after { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: var(--brand); }
@keyframes amStepIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes amRingPulse { 0% { box-shadow: 0 0 0 0 rgba(30,58,138,0.4); } 100% { box-shadow: 0 0 0 24px rgba(30,58,138,0); } }
@keyframes amPulseScale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes amSpin { to { transform: rotate(360deg); } }
@keyframes amBurst { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 60% { opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; } }
.am-confetti { position: absolute; top: 50%; left: 50%; width: 10px; height: 14px; border-radius: 2px; pointer-events: none; animation: amBurst 1.4s cubic-bezier(.2,.7,.3,1) forwards; }
.am-navfab { position: fixed; top: 16px; right: 16px; z-index: 999; background: var(--ink); color: #fff; padding: 10px 16px; border-radius: 999px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); cursor: pointer; border: none; }
.am-navmenu { position: fixed; top: 60px; right: 16px; z-index: 999; background: #fff; border-radius: 16px; padding: 8px; box-shadow: 0 20px 60px -10px rgba(0,0,0,0.3); border: 1px solid var(--line); min-width: 220px; }
.am-navmenu button { display: flex; align-items: center; gap: 10px; padding: 10px 12px; width: 100%; text-align: left; border-radius: 8px; font-size: 13px; font-weight: 500; border: none; background: none; cursor: pointer; color: var(--ink); }
.am-navmenu button:hover { background: var(--bg-2); }
.am-navnum { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); padding: 2px 6px; background: var(--bg-2); border-radius: 4px; }
`

function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className="am-status" style={{ color: dark ? "#fff" : "var(--ink)" }}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none"><path d="M1 4C3.5 1.5 6 0.5 9 0.5C12 0.5 14.5 1.5 17 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" /><path d="M5.5 8.5C6.5 7.5 7.5 7 9 7C10.5 7 11.5 7.5 12.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="9" cy="10" r="0.8" fill="currentColor" /></svg>
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor" /><rect x="2" y="2" width="14" height="6" rx="1" fill="currentColor" /><rect x="19.5" y="3.5" width="1.5" height="3" rx="0.5" fill="currentColor" /></svg>
      </span>
    </div>
  )
}

function GoogleBtn() {
  return (
    <button type="button" className="am-btn am-btn-ghost" style={{ width: "100%", padding: 14 }}>
      <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" /></svg>
      <span style={{ fontWeight: 600 }}>Continuar con Google</span>
    </button>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ width: 40, height: 40, borderRadius: 12, background: "var(--bg-2)", display: "grid", placeItems: "center", alignSelf: "flex-start", marginBottom: 24, border: "none", cursor: "pointer" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  )
}

export function AuthMobileFlow() {
  const [screen, setScreen] = useState<Screen>("welcome")
  const [onbStep, setOnbStep] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [scrapeIdx, setScrapeIdx] = useState(0)
  const [slugTouched, setSlugTouched] = useState(false)
  const [store, setStore] = useState<StoreState>({ name: "", slug: "", vertical: null, instagram: "", template: null, payments: ["pm", "usd"], referral: null })

  const patch = (p: Partial<StoreState>) => setStore((s) => ({ ...s, ...p }))
  const goScreen = (s: Screen) => { setScreen(s); setNavOpen(false) }
  const goOnb = (i: number) => { setOnbStep(i); setScreen("onb"); setNavOpen(false) }

  const valid = useMemo(() => {
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

  function next() {
    if (onbStep === 3) { setScraping(true); setScrapeIdx(0); return }
    if (onbStep === 7) { goScreen("celebration"); return }
    if (onbStep < 7) goOnb(onbStep + 1)
  }
  function back() { if (onbStep > 0) goOnb(onbStep - 1); else goScreen("register") }

  // scraping loader sequence
  useEffect(() => {
    if (!scraping) return
    const ig = store.instagram
    const steps = SCRAPE_STEPS(ig)
    let i = 0
    const cycle = setInterval(() => {
      i++
      if (i >= steps.length) { clearInterval(cycle); return }
      setScrapeIdx(i)
    }, 600)
    const finish = setTimeout(() => { setScraping(false); goOnb(4) }, 2600)
    return () => { clearInterval(cycle); clearTimeout(finish) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scraping])

  const navItems = [
    { num: "00", label: "Welcome", onClick: () => goScreen("welcome") },
    { num: "01", label: "Login", onClick: () => goScreen("login") },
    { num: "02", label: "Registro", onClick: () => goScreen("register") },
    { num: "03", label: "Onboarding (1/8)", onClick: () => goOnb(0) },
    { num: "04", label: "Vertical", onClick: () => goOnb(2) },
    { num: "05", label: "Instagram", onClick: () => goOnb(3) },
    { num: "06", label: "¿Eres tú? (scraper)", onClick: () => goOnb(4) },
    { num: "07", label: "Template", onClick: () => goOnb(5) },
    { num: "08", label: "¿Cómo nos conociste?", onClick: () => goOnb(7) },
    { num: "09", label: "🎉 Celebración", onClick: () => goScreen("celebration") },
    { num: "10", label: "Tienda lista", onClick: () => goScreen("ready") },
  ]

  return (
    <div className="am-root" style={{ position: "fixed", inset: 0, zIndex: 40 }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <button type="button" className="am-navfab" onClick={() => setNavOpen((o) => !o)}><span>📱 Saltar a…</span></button>
      {navOpen && (
        <div className="am-navmenu">
          {navItems.map((it) => (
            <button key={it.num} type="button" onClick={it.onClick}><span className="am-navnum">{it.num}</span> {it.label}</button>
          ))}
        </div>
      )}

      <div className="am-stage">
        <div className="am-phone">
          <div className="am-notch" />
          <StatusBar dark={screen === "celebration"} />
          <div style={{ position: "absolute", inset: 0 }}>
            {screen === "welcome" && <Welcome onRegister={() => goScreen("register")} onLogin={() => goScreen("login")} />}
            {screen === "login" && <Login onBack={() => goScreen("welcome")} onSubmit={() => goScreen("celebration")} onRegister={() => goScreen("register")} />}
            {screen === "register" && <Register onBack={() => goScreen("welcome")} onSubmit={() => goOnb(0)} onLogin={() => goScreen("login")} />}
            {screen === "onb" && (
              <Onboarding step={onbStep} valid={valid} store={store} patch={patch} slugTouched={slugTouched} setSlugTouched={setSlugTouched} next={next} back={back} skip={() => { if (confirm("¿Saltar? Puedes completar esto luego desde el dashboard.")) goScreen("celebration") }} autoNext={() => setTimeout(next, 350)} />
            )}
            {screen === "celebration" && <Celebration onReady={() => goScreen("ready")} />}
            {screen === "ready" && <Ready store={store} />}
            {scraping && <ScrapeLoader status={SCRAPE_STEPS(store.instagram)[scrapeIdx]} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function Welcome({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
  return (
    <div className="am-screen" style={{ background: "linear-gradient(180deg, #FFF 0%, #F1F5F9 100%)" }}>
      <div className="am-pad" style={{ textAlign: "center", justifyContent: "space-between", paddingTop: 60 }}>
        <div />
        <div>
          <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 24px", display: "grid", placeItems: "center" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: "var(--brand)", animation: "amRingPulse 2s infinite" }} />
            <div style={{ position: "relative", width: 96, height: 96, borderRadius: 28, background: "linear-gradient(140deg, var(--brand), var(--brand-dark))", display: "grid", placeItems: "center", boxShadow: "0 20px 40px -15px rgba(30,58,138,0.5)" }}>
              <svg width="44" height="44" viewBox="0 0 32 32" fill="none"><path d="M10 10v12M10 10c3.5 0 5.5 1.3 5.5 3.2S14 16 12.2 16H10M12.2 16c2.3 0 4.3 1 4.3 2.6S14.5 22 11.5 22H10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /><circle cx="22" cy="21" r="2.5" fill="var(--accent)" /></svg>
            </div>
          </div>
          <h1 style={{ fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 12px" }}>Tu negocio, en <span className="serif-it" style={{ color: "var(--brand)" }}>un link</span>.</h1>
          <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "0 auto", maxWidth: 320 }}>Vende por WhatsApp con una tienda hermosa que se monta en menos de 3 minutos.</p>
        </div>
        <div>
          <button type="button" onClick={onRegister} className="am-btn am-btn-primary" style={{ width: "100%" }}>Crear mi tienda gratis</button>
          <button type="button" onClick={onLogin} className="am-btn" style={{ width: "100%", marginTop: 10, color: "var(--ink-2)", fontWeight: 600, background: "none" }}>Ya tengo una cuenta</button>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", margin: "16px 0 0" }}>gratis · sin tarjeta · cancela cuando quieras</p>
        </div>
      </div>
    </div>
  )
}

function Login({ onBack, onSubmit, onRegister }: { onBack: () => void; onSubmit: () => void; onRegister: () => void }) {
  return (
    <div className="am-screen">
      <div className="am-pad">
        <BackBtn onClick={onBack} />
        <h1 style={{ fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.025em", fontWeight: 700, margin: "0 0 8px" }}>¡Qué bueno <span className="serif-it" style={{ color: "var(--brand)" }}>verte!</span></h1>
        <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 28px" }}>Entra a tu tienda en bylink.</p>
        <GoogleBtn />
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} /><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>o con email</span><div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>
        <label className="am-label">Email</label>
        <input className="am-input" type="email" placeholder="hola@tunegocio.com" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "18px 0 8px" }}>
          <label className="am-label" style={{ margin: 0 }}>Contraseña</label>
          <a href="#" style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600 }}>¿Olvidaste tu contraseña?</a>
        </div>
        <input className="am-input" type="password" placeholder="••••••••" />
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, fontSize: 14, color: "var(--ink-2)", cursor: "pointer" }}>
          <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "var(--brand)" }} /> Recordar mi sesión
        </label>
        <button type="button" onClick={onSubmit} className="am-btn am-btn-primary" style={{ width: "100%", marginTop: 24 }}>Entrar a mi tienda →</button>
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-2)", margin: "auto 0 0", paddingTop: 24 }}>¿Aún no tienes cuenta? <button type="button" onClick={onRegister} style={{ color: "var(--brand)", fontWeight: 700, cursor: "pointer", background: "none", border: "none" }}>Regístrate gratis</button></p>
      </div>
    </div>
  )
}

function Register({ onBack, onSubmit, onLogin }: { onBack: () => void; onSubmit: () => void; onLogin: () => void }) {
  return (
    <div className="am-screen">
      <div className="am-pad">
        <BackBtn onClick={onBack} />
        <h1 style={{ fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.025em", fontWeight: 700, margin: "0 0 6px" }}>Crea tu <span className="serif-it" style={{ color: "var(--brand)" }}>cuenta</span></h1>
        <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 22px" }}>Empieza a vender en menos de 3 minutos.</p>
        <GoogleBtn />
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} /><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>o con email</span><div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>
        <label className="am-label">Tu nombre</label>
        <input className="am-input" placeholder="María González" />
        <label className="am-label" style={{ marginTop: 14 }}>Email</label>
        <input className="am-input" type="email" placeholder="maria@ejemplo.com" />
        <label className="am-label" style={{ marginTop: 14 }}>WhatsApp <span style={{ color: "var(--accent)", fontWeight: 700 }}>*</span></label>
        <div style={{ display: "flex", alignItems: "center", padding: "0 0 0 16px", border: "1.5px solid var(--line)", borderRadius: 14, background: "#fff" }}>
          <span style={{ fontSize: 18 }}>🇻🇪</span>
          <span className="mono" style={{ fontSize: 14, color: "var(--ink-3)", marginLeft: 8 }}>+58</span>
          <input style={{ flex: 1, border: "none", padding: "16px 12px", fontSize: 16, background: "none", outline: "none" }} placeholder="412-1234567" />
        </div>
        <p style={{ fontSize: 11, color: "var(--ink-3)", margin: "6px 0 0", paddingLeft: 4 }}>Es por aquí que tus clientes te van a contactar.</p>
        <label className="am-label" style={{ marginTop: 14 }}>Contraseña</label>
        <input className="am-input" type="password" placeholder="Mínimo 8 caracteres" />
        <label className="am-label" style={{ marginTop: 14 }}>Confirmar contraseña</label>
        <input className="am-input" type="password" placeholder="Escríbela otra vez" />
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 18, fontSize: 13, color: "var(--ink-2)", cursor: "pointer", lineHeight: 1.5 }}>
          <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "var(--brand)", marginTop: 2 }} />
          <span>Acepto los <a href="#" style={{ color: "var(--brand)", fontWeight: 600 }}>términos</a> y la <a href="#" style={{ color: "var(--brand)", fontWeight: 600 }}>política de privacidad</a>.</span>
        </label>
        <button type="button" onClick={onSubmit} className="am-btn am-btn-primary" style={{ width: "100%", marginTop: 22 }}>Crear mi cuenta →</button>
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-2)", margin: "18px 0 0" }}>¿Ya tienes cuenta? <button type="button" onClick={onLogin} style={{ color: "var(--brand)", fontWeight: 700, cursor: "pointer", background: "none", border: "none" }}>Inicia sesión</button></p>
      </div>
    </div>
  )
}

function ScrapeLoader({ status }: { status: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
      <div style={{ position: "relative", width: 80, height: 80, marginBottom: 28 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid var(--line)", borderTopColor: "var(--brand)", animation: "amSpin 0.9s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 32 }}>📸</div>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Buscando tu perfil…</h2>
      <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0 }}>{status}</p>
    </div>
  )
}

function Celebration({ onReady }: { onReady: () => void }) {
  const pieces = useMemo(() => {
    const colors = ["#FFFFFF", "#F97066", "#DC4A3D", "#FCD34D", "#10B981", "#FBBF24"]
    return Array.from({ length: 60 }, (_, i) => {
      const angle = Math.PI * 2 * (i / 60) + Math.random() * 0.3
      const dist = 200 + Math.random() * 200
      return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist, color: colors[i % colors.length], delay: Math.random() * 0.3, rot: Math.random() * 360 }
    })
  }, [])
  return (
    <div className="am-screen" style={{ background: "linear-gradient(160deg, var(--brand), var(--brand-dark))", color: "#fff", overflow: "hidden" }}>
      <div className="am-pad" style={{ textAlign: "center", justifyContent: "center", alignItems: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {pieces.map((p, i) => (
            <div key={i} className="am-confetti" style={{ background: p.color, animationDelay: `${p.delay}s`, transform: `translate(-50%, -50%) rotate(${p.rot}deg)`, "--tx": `${p.tx}px`, "--ty": `${p.ty}px` } as React.CSSProperties} />
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ width: 120, height: 120, margin: "0 auto 32px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", backdropFilter: "blur(10px)", animation: "amPulseScale 2s infinite" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 style={{ fontSize: 42, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 14px", color: "#fff" }}>¡Tu tienda está <span className="serif-it" style={{ color: "var(--accent-2)" }}>viva!</span></h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: 300 }}>Bienvenida, María 💕<br />Ya puedes empezar a vender.</p>
        </div>
        <div style={{ position: "absolute", bottom: 28, left: 24, right: 24 }}>
          <button type="button" onClick={onReady} style={{ width: "100%", padding: 18, background: "#fff", color: "var(--brand)", borderRadius: 14, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>Ver mi tienda →</button>
        </div>
      </div>
    </div>
  )
}

function Ready({ store }: { store: StoreState }) {
  const [copied, setCopied] = useState(false)
  const slug = store.slug || "rosa-atelier"
  const steps = [
    { icon: "👀", bg: "rgba(30,58,138,0.1)", color: "var(--brand)", title: "Ver mi tienda en vivo", desc: "Como la verán tus clientes", href: "/tienda-demo" },
    { icon: "📦", bg: "rgba(220,74,61,0.1)", color: "var(--accent)", title: "Agregar más productos", desc: "Importamos 12 desde tu IG", href: "/panel-demo" },
    { icon: "📊", bg: "rgba(16,185,129,0.1)", color: "var(--success)", title: "Ver mis estadísticas", desc: "Visitas, clicks, ventas", href: "/panel-demo" },
  ]
  return (
    <div className="am-screen">
      <div className="am-pad" style={{ paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect x="1" y="1" width="30" height="30" rx="9" fill="var(--brand)" /><path d="M10 10v12M10 10c3.5 0 5.5 1.3 5.5 3.2S14 16 12.2 16H10M12.2 16c2.3 0 4.3 1 4.3 2.6S14.5 22 11.5 22H10" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><circle cx="22" cy="21" r="2" fill="var(--accent)" /></svg>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.025em" }}>bylink<span style={{ color: "var(--brand)" }}>.</span></span>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>— tu link público</div>
        <div style={{ padding: 18, border: "1.5px solid var(--brand)", borderRadius: 16, background: "rgba(30,58,138,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: "var(--brand)", wordBreak: "break-all" }}>bylink.app/{slug}</div>
          </div>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(`bylink.app/${slug}`); setCopied(true); setTimeout(() => setCopied(false), 1500) }} style={{ padding: "10px 14px", background: "var(--brand)", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 13, flexShrink: 0, border: "none", cursor: "pointer" }}>{copied ? "✓" : "Copiar"}</button>
        </div>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {[["📸", "Instagram"], ["💬", "WhatsApp"], ["🎵", "TikTok"], ["🔗", "QR"]].map(([icon, label]) => (
            <button key={label} type="button" className="am-btn am-btn-ghost" style={{ padding: "12px 4px", flexDirection: "column", gap: 4, fontSize: 11 }}><span style={{ fontSize: 22 }}>{icon}</span>{label}</button>
          ))}
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "28px 0 12px" }}>— próximos pasos</div>
        <div style={{ display: "grid", gap: 10 }}>
          {steps.map((s) => (
            <Link key={s.title} href={s.href} className="am-opt">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.color, display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{s.desc}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: "auto", padding: 16, background: "var(--warm)", borderRadius: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 22 }}>💡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>Tip de la casa</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>Comparte tu link en la bio de Instagram para empezar a recibir pedidos hoy mismo.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OnbProps {
  step: number
  valid: boolean
  store: StoreState
  patch: (p: Partial<StoreState>) => void
  slugTouched: boolean
  setSlugTouched: (v: boolean) => void
  next: () => void
  back: () => void
  skip: () => void
  autoNext: () => void
}

function Onboarding({ step, valid, store, patch, slugTouched, setSlugTouched, next, back, skip, autoNext }: OnbProps) {
  const meta = ONB[step]
  return (
    <div className="am-screen">
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px" }}>
        <button type="button" onClick={back} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-2)", display: "grid", placeItems: "center", flexShrink: 0, visibility: step === 0 ? "hidden" : "visible", border: "none", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ flex: 1, height: 4, background: "var(--bg-3)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "var(--brand)", width: `${((step + 1) / 8) * 100}%`, borderRadius: 999, transition: "width .4s cubic-bezier(.2,.7,.3,1)" }} />
        </div>
        <button type="button" onClick={skip} className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "6px 10px", borderRadius: 8, background: "none", border: "none", cursor: "pointer" }}>SALTAR</button>
      </div>
      <div key={step} style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px", display: "flex", flexDirection: "column", animation: "amStepIn .45s cubic-bezier(.2,.7,.3,1)" }}>
        <h1 style={{ fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.025em", fontWeight: 700, margin: "12px 0 8px" }}>{meta.title}</h1>
        <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 24px" }}>{meta.sub}</p>
        <OnbBody step={step} store={store} patch={patch} slugTouched={slugTouched} setSlugTouched={setSlugTouched} autoNext={autoNext} back={back} />
      </div>
      <div style={{ padding: "16px 24px 28px", background: "linear-gradient(180deg, transparent, #fff 30%)", borderTop: "1px solid var(--line)" }}>
        <button type="button" onClick={next} disabled={!valid} className="am-btn am-btn-primary" style={{ width: "100%" }}>{ONB_CTA[step] || "Continuar →"}</button>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--ink-3)", margin: "10px 0 0" }}>paso {step + 1} de 8</p>
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
  autoNext: () => void
  back: () => void
}

function OnbBody({ step, store, patch, slugTouched, setSlugTouched, autoNext, back }: OnbBodyProps) {
  if (step === 0) {
    return (
      <>
        <input className="am-input" autoFocus value={store.name} onChange={(e) => { const v = e.target.value; patch({ name: v, ...(slugTouched ? {} : { slug: slugify(v) }) }) }} placeholder="Ej. Rosa Atelier" style={{ fontSize: 22, padding: 20, fontWeight: 600, textAlign: "center" }} />
        <p style={{ margin: "14px 0 0", fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>No te preocupes, lo puedes cambiar luego.</p>
      </>
    )
  }
  if (step === 1) {
    const ok = store.slug.length >= 3
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", padding: "0 16px", border: `1.5px solid ${ok ? "var(--success)" : "var(--line)"}`, borderRadius: 14, background: "#fff" }}>
          <span className="mono" style={{ fontSize: 15, color: "var(--ink-3)", flexShrink: 0 }}>bylink.app/</span>
          <input autoFocus value={store.slug} onChange={(e) => { setSlugTouched(true); patch({ slug: slugify(e.target.value) }) }} style={{ flex: 1, padding: "18px 6px", fontSize: 17, background: "none", border: "none", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--brand)", minWidth: 0, outline: "none" }} placeholder="rosa-atelier" />
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: ok ? "var(--success)" : "var(--ink-3)", fontWeight: 600 }}>
          <span>{ok ? "✓" : "·"}</span> <span>{ok ? "¡Está disponible!" : "Mínimo 3 caracteres"}</span>
        </div>
      </>
    )
  }
  if (step === 2) {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        {VERTICALS.map((v) => (
          <button key={v.id} type="button" className={`am-opt ${store.vertical === v.id ? "active" : ""}`} onClick={() => { patch({ vertical: v.id }); autoNext() }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-2)", display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0 }}>{v.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{v.label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{v.desc}</div>
            </div>
            <div className="am-opt-radio" />
          </button>
        ))}
      </div>
    )
  }
  if (step === 3) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", padding: "0 16px", border: "1.5px solid var(--line)", borderRadius: 14, background: "#fff" }}>
          <span className="mono" style={{ fontSize: 15, color: "var(--ink-3)" }}>@</span>
          <input autoFocus value={store.instagram.replace("@", "")} onChange={(e) => patch({ instagram: "@" + e.target.value.trim() })} style={{ flex: 1, padding: "18px 8px", fontSize: 17, background: "none", border: "none", fontWeight: 600, outline: "none" }} placeholder="rosa.atelier" />
        </div>
        <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(30,58,138,0.06)", borderRadius: 12, display: "flex", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}><strong>Tu cuenta sigue siendo tuya.</strong> Solo leemos lo que ya es público.</div>
        </div>
        <button type="button" className="mono" style={{ marginTop: 12, fontSize: 11, color: "var(--ink-3)", textAlign: "left", padding: 4, background: "none", border: "none", cursor: "pointer" }}>— No tengo Instagram, llenar a mano</button>
      </>
    )
  }
  if (step === 4) {
    return (
      <>
        <div style={{ border: "1.5px solid var(--brand)", borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 16px 40px -12px rgba(30,58,138,0.2)" }}>
          <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid var(--line)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: SCRAPED.avatar, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{SCRAPED.name}</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{SCRAPED.handle}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: "var(--ink-2)" }}>
                <span><strong>{SCRAPED.followers}</strong> seguidores</span>
                <span><strong>{SCRAPED.posts}</strong> posts</span>
              </div>
            </div>
          </div>
          <div style={{ padding: "14px 20px", background: "var(--bg-2)", fontSize: 13, color: "var(--ink-2)", whiteSpace: "pre-line", lineHeight: 1.5 }}>{SCRAPED.bio}</div>
          <div style={{ padding: "16px 20px" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em", marginBottom: 8 }}>VAMOS A IMPORTAR</div>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ color: "var(--success)" }}>✓</span> Foto de perfil como logo</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ color: "var(--success)" }}>✓</span> Bio y nombre</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ color: "var(--success)" }}>✓</span> 12 posts como productos iniciales</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginTop: 14 }}>
              {SCRAPED.photos.map((g, i) => (<div key={i} style={{ aspectRatio: "1", background: g, borderRadius: 6 }} />))}
            </div>
          </div>
        </div>
        <button type="button" onClick={back} style={{ marginTop: 14, width: "100%", fontSize: 13, color: "var(--ink-3)", padding: 10, background: "none", border: "none", cursor: "pointer" }}>No soy yo, buscar otra cuenta</button>
      </>
    )
  }
  if (step === 5) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {TEMPLATES.map((t) => (
          <button key={t.id} type="button" onClick={() => patch({ template: t.id })} style={{ border: `2px solid ${store.template === t.id ? "var(--brand)" : "var(--line)"}`, borderRadius: 16, padding: 0, overflow: "hidden", background: "#fff", cursor: "pointer", textAlign: "left", transition: "all .15s ease" }}>
            <div style={{ aspectRatio: "9/14", background: t.bg, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: 6, background: t.accent }} />
                <div style={{ height: 6, flex: 1, background: t.accent, opacity: 0.4, borderRadius: 2 }} />
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
        <div style={{ display: "grid", gap: 10 }}>
          {PAYMENT_METHODS.map((m) => {
            const on = store.payments.includes(m.id)
            return (
              <button key={m.id} type="button" className={`am-opt ${on ? "active" : ""}`} onClick={() => toggle(m.id)}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${on ? "var(--brand)" : "var(--line-2)"}`, background: on ? "var(--brand)" : "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <div style={{ fontSize: 22 }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{m.desc}</div>
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
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {REFERRAL_SOURCES.map((s) => (
        <button key={s.id} type="button" className={`am-opt ${store.referral === s.id ? "active" : ""}`} onClick={() => patch({ referral: s.id })}>
          <div style={{ fontSize: 22 }}>{s.emoji}</div>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{s.label}</div>
          <div className="am-opt-radio" />
        </button>
      ))}
    </div>
  )
}
