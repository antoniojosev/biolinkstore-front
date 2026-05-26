"use client"

import { useState } from "react"
import Link from "next/link"
import { BrandMark } from "@/components/landing-v2/brand-mark"

const VERTICALS = [
  { id: "moda", icon: "👗", label: "Moda y accesorios" },
  { id: "restaurante", icon: "🍕", label: "Restaurante" },
  { id: "inmobiliaria", icon: "🏠", label: "Inmobiliaria" },
  { id: "servicios", icon: "✨", label: "Servicios" },
]

const COLORS = ["#1E3A8A", "#DC4A3D", "#7C3AED", "#10B981", "#F59E0B", "#EC4899"]

const PAY_METHODS = [
  { icon: "📱", label: "Pago Móvil", desc: "Banesco, Mercantil, Provincial...", checked: true },
  { icon: "💵", label: "Efectivo USD", desc: "Al momento de la entrega", checked: true },
  { icon: "💳", label: "Zelle", desc: "Transferencia internacional", checked: false },
  { icon: "₿", label: "Binance Pay", desc: "USDT, BTC, ETH", checked: false },
]

const PREVIEW_PRODUCTS = [
  { name: "Vestido Sienna", price: "$89 · M, L", grad: "linear-gradient(135deg, #C63E2A, #7A1F10)" },
  { name: "Top Luna", price: "$42", grad: "linear-gradient(135deg, #E8C07A, #B8860B)" },
  { name: "Falda Mara", price: "$56", grad: "linear-gradient(135deg, #8A6B4C, #5A3D1D)" },
  { name: "Blazer Noé", price: "$120", grad: "linear-gradient(135deg, #2A3B5C, #0A1F4D)" },
]

const styles = `
.su-root { --bg: #FFFFFF; --bg-2: #F1F5F9; --bg-3: #E2E8F0; --ink: #0F172A; --ink-2: #334155; --ink-3: #64748B; --line: #E2E8F0; --line-2: #CBD5E1; --brand: #1E3A8A; --brand-dark: #172554; --accent: #DC4A3D; --success: #10B981; font-family: var(--font-sans); color: var(--ink); }
.su-root .mono { font-family: var(--font-mono); }
.su-root .serif-it { font-family: var(--font-serif); font-style: italic; font-weight: 400; }
.su-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; letter-spacing: -0.01em; border-radius: 12px; transition: all .18s ease; white-space: nowrap; border: none; cursor: pointer; }
.su-btn-primary { background: var(--brand); color: #fff; box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 16px -4px rgba(30,58,138,0.4); }
.su-btn-primary:hover { background: var(--brand-dark); transform: translateY(-1px); }
.su-btn-ghost { background: #fff; color: var(--ink); border: 1px solid var(--line-2); }
.su-btn-ghost:hover { background: var(--bg-2); border-color: var(--brand); }
.su-input { width: 100%; padding: 14px 16px; border: 1px solid var(--line-2); border-radius: 12px; background: #fff; font-size: 15px; transition: all .15s ease; outline: none; color: var(--ink); }
.su-input:focus { border-color: var(--brand); box-shadow: 0 0 0 4px rgba(30,58,138,0.1); }
.su-step { animation: suStepIn .4s cubic-bezier(.2,.7,.3,1); }
@keyframes suStepIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.su-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
@media (max-width: 900px) { .su-grid { grid-template-columns: 1fr; } .su-preview { display: none !important; } }
`

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function SignupDesktop() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("Rosa Atelier")
  const [slug, setSlug] = useState("rosa-atelier")
  const [slugTouched, setSlugTouched] = useState(false)
  const [vertical, setVertical] = useState("moda")
  const [color, setColor] = useState("#1E3A8A")
  const [letter, setLetter] = useState("")
  const [bio, setBio] = useState("Moda femenina hecha en Caracas")
  const [copied, setCopied] = useState(false)

  const effectiveName = name || "Tu negocio"
  const effectiveSlug = slug || "tu-negocio"
  const effectiveLetter = (letter || effectiveName[0] || "B").toUpperCase()

  function onNameChange(v: string) {
    setName(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  function copyLink() {
    navigator.clipboard?.writeText(`bylink.app/${effectiveSlug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="su-root fixed inset-0 z-50 overflow-y-auto" style={{ background: "var(--bg-2)" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="su-grid">
        {/* LEFT: form */}
        <div style={{ padding: "32px 56px", display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fff", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BrandMark size={30} />
              <span style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-0.025em" }}>bylink<span style={{ color: "var(--brand)" }}>.</span></span>
            </Link>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>paso {step} de 4</div>
          </div>

          {/* progress */}
          <div style={{ display: "flex", gap: 6, marginTop: 28 }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ flex: 1, height: 4, borderRadius: 999, background: n <= step ? "var(--brand)" : "var(--line)", transition: "background .3s" }} />
            ))}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 460, margin: "0 auto", width: "100%", padding: "40px 0" }}>
            {step === 1 && (
              <div className="su-step" key="s1">
                <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>— empezar</div>
                <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 12px" }}>¿Cómo se llama <span className="serif-it" style={{ color: "var(--brand)" }}>tu negocio</span>?</h1>
                <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "0 0 32px" }}>Esto será el nombre de tu tienda y tu link público.</p>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--ink-2)" }}>Nombre del negocio</label>
                <input className="su-input" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Ej. Rosa Atelier" autoFocus />

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, margin: "20px 0 8px", color: "var(--ink-2)" }}>Tu link público</label>
                <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", border: "1px solid var(--line-2)", borderRadius: 12, background: "var(--bg-2)" }}>
                  <span className="mono" style={{ fontSize: 14, color: "var(--ink-3)" }}>bylink.app/</span>
                  <input
                    value={slug}
                    onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }}
                    style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--ink)", marginLeft: 2 }}
                    placeholder="rosa-atelier"
                  />
                  {effectiveSlug.length >= 3 && <span style={{ marginLeft: 8, fontSize: 13, color: "var(--success)", fontWeight: 600 }}>✓ disponible</span>}
                </div>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, margin: "20px 0 8px", color: "var(--ink-2)" }}>¿Qué vendes?</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {VERTICALS.map((v) => {
                    const active = vertical === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVertical(v.id)}
                        style={{ padding: 14, border: active ? "1.5px solid var(--brand)" : "1px solid var(--line-2)", background: active ? "rgba(30,58,138,0.04)" : "#fff", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left" }}
                      >
                        <span style={{ fontSize: 22 }}>{v.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{v.label}</span>
                      </button>
                    )
                  })}
                </div>

                <button type="button" className="su-btn su-btn-primary" style={{ marginTop: 32, padding: "16px 24px", fontSize: 16, width: "100%" }} onClick={() => name && slug && setStep(2)}>Continuar →</button>
              </div>
            )}

            {step === 2 && (
              <div className="su-step" key="s2">
                <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>— branding</div>
                <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 12px" }}>Dale tu <span className="serif-it" style={{ color: "var(--brand)" }}>cara</span>.</h1>
                <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "0 0 32px" }}>Logo y colores. Puedes cambiarlos cuando quieras.</p>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--ink-2)" }}>Logo (opcional)</label>
                <div style={{ width: "100%", padding: 24, border: "1.5px dashed var(--line-2)", background: "var(--bg-2)", borderRadius: 12, display: "flex", alignItems: "center", gap: 16, textAlign: "left" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: color, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>{effectiveLetter}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Sube tu logo</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>PNG, JPG · O usa una inicial por ahora</div>
                  </div>
                  <input value={letter} maxLength={2} onChange={(e) => setLetter(e.target.value)} placeholder="R" style={{ width: 60, padding: 10, border: "1px solid var(--line-2)", borderRadius: 8, textAlign: "center", fontWeight: 700, fontSize: 16, outline: "none" }} />
                </div>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, margin: "24px 0 8px", color: "var(--ink-2)" }}>Color de marca</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                  {COLORS.map((c) => (
                    <button key={c} type="button" aria-label={`Color ${c}`} onClick={() => setColor(c)} style={{ aspectRatio: "1", border: color === c ? "2.5px solid var(--ink)" : "1px solid var(--line)", borderRadius: 12, background: c, cursor: "pointer" }} />
                  ))}
                </div>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, margin: "24px 0 8px", color: "var(--ink-2)" }}>Bio corta (opcional)</label>
                <input className="su-input" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ej. Moda femenina hecha en Caracas" />

                <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
                  <button type="button" onClick={() => setStep(1)} className="su-btn su-btn-ghost" style={{ padding: "16px 24px", fontSize: 16 }}>← Atrás</button>
                  <button type="button" onClick={() => setStep(3)} className="su-btn su-btn-primary" style={{ padding: "16px 24px", fontSize: 16, flex: 1 }}>Continuar →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="su-step" key="s3">
                <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>— pagos y entrega</div>
                <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 12px" }}>¿Cómo te <span className="serif-it" style={{ color: "var(--brand)" }}>pagan</span>?</h1>
                <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "0 0 32px" }}>Selecciona los métodos que aceptas. Puedes agregar más después.</p>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--ink-2)" }}>Tu WhatsApp Business</label>
                <div style={{ display: "flex", alignItems: "center", padding: "0 0 0 16px", border: "1px solid var(--line-2)", borderRadius: 12, background: "#fff" }}>
                  <span className="mono" style={{ fontSize: 14, color: "var(--ink-3)" }}>+58</span>
                  <input style={{ flex: 1, border: "none", outline: "none", padding: "14px 8px", fontSize: 15, fontFamily: "inherit", background: "none" }} placeholder="412-1234567" />
                </div>

                <label style={{ display: "block", fontSize: 13, fontWeight: 600, margin: "24px 0 8px", color: "var(--ink-2)" }}>Métodos de pago</label>
                <div style={{ display: "grid", gap: 8 }}>
                  {PAY_METHODS.map((m) => (
                    <label key={m.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1px solid var(--line-2)", borderRadius: 12, background: "#fff", cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked={m.checked} style={{ width: 18, height: 18, accentColor: "var(--brand)" }} />
                      <span style={{ fontSize: 22 }}>{m.icon}</span>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div><div style={{ fontSize: 12, color: "var(--ink-3)" }}>{m.desc}</div></div>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: 20, padding: "12px 14px", background: "rgba(30,58,138,0.06)", border: "1px solid rgba(30,58,138,0.15)", borderRadius: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}><strong>Tasa BCV automática.</strong> Mostramos precios en USD y Bs. con la tasa del día.</div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                  <button type="button" onClick={() => setStep(2)} className="su-btn su-btn-ghost" style={{ padding: "16px 24px", fontSize: 16 }}>← Atrás</button>
                  <button type="button" onClick={() => setStep(4)} className="su-btn su-btn-primary" style={{ padding: "16px 24px", fontSize: 16, flex: 1 }}>Continuar →</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="su-step" key="s4">
                <div className="mono" style={{ fontSize: 11, color: "var(--success)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>— ¡listo!</div>
                <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 12px" }}>Tu tienda está <span className="serif-it" style={{ color: "var(--success)" }}>viva</span>.</h1>
                <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "0 0 24px" }}>Comparte este link y empieza a recibir pedidos. Puedes agregar productos cuando quieras desde el dashboard.</p>

                <div style={{ padding: 20, border: "1px solid var(--line-2)", borderRadius: 14, background: "#fff" }}>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8 }}>TU LINK PÚBLICO</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--brand)", flex: 1, wordBreak: "break-all" }}>bylink.app/{effectiveSlug}</span>
                    <button type="button" onClick={copyLink} className="su-btn" style={{ padding: "8px 14px", background: "var(--bg-2)", color: "var(--ink)", fontSize: 13, border: "1px solid var(--line-2)" }}>{copied ? "✓ Copiado" : "Copiar"}</button>
                  </div>
                </div>

                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[["📸", "Instagram"], ["💬", "WhatsApp"], ["🎵", "TikTok"], ["📋", "QR"]].map(([icon, label]) => (
                    <button key={label} type="button" className="su-btn su-btn-ghost" style={{ padding: "14px 8px", flexDirection: "column", gap: 6, fontSize: 12 }}><span style={{ fontSize: 22 }}>{icon}</span>{label}</button>
                  ))}
                </div>

                <Link href="/demo-vitrina" className="su-btn su-btn-primary" style={{ marginTop: 32, padding: "16px 24px", fontSize: 16, width: "100%" }}>Ver mi tienda en vivo →</Link>
                <Link href="/" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: 13, color: "var(--ink-3)" }}>Volver a la landing</Link>
              </div>
            )}
          </div>

          <div style={{ marginTop: "auto", paddingTop: 20, fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
            ¿Necesitas ayuda? <Link href="/" style={{ color: "var(--brand)", fontWeight: 600 }}>Habla con nosotros →</Link>
          </div>
        </div>

        {/* RIGHT: live preview */}
        <div className="su-preview" style={{ background: "linear-gradient(160deg, var(--bg-2), var(--bg-3))", padding: 56, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "50%", top: -100, transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(30,58,138,0.12), transparent 60%)" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em" }}>VISTA PREVIA EN VIVO</div>

            <div style={{ width: 320, aspectRatio: "390/844", borderRadius: 44, background: "var(--ink)", padding: 10, boxShadow: "0 50px 100px -25px rgba(15,23,42,0.4)" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 36, background: "#fff", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 96, height: 24, background: "#000", borderRadius: 12, zIndex: 10 }} />
                <div style={{ padding: "48px 16px 16px", display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 }}>{effectiveLetter}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{effectiveName}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>bylink.app/{effectiveSlug}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.4 }}>{bio || "Moda femenina hecha en Caracas"}</div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ fontSize: 11, padding: "5px 12px", borderRadius: 999, background: color, color: "#fff", fontWeight: 600 }}>Todo</div>
                    <div style={{ fontSize: 11, padding: "5px 12px", borderRadius: 999, background: "var(--bg-2)", color: "var(--ink-2)", fontWeight: 500 }}>Vestidos</div>
                    <div style={{ fontSize: 11, padding: "5px 12px", borderRadius: 999, background: "var(--bg-2)", color: "var(--ink-2)", fontWeight: 500 }}>Tops</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flex: 1 }}>
                    {PREVIEW_PRODUCTS.map((p) => (
                      <div key={p.name}>
                        <div style={{ aspectRatio: "3/4", borderRadius: 12, background: p.grad }} />
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6 }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 0 4px rgba(16,185,129,0.2)" }} />
              sincronizado en tiempo real
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
