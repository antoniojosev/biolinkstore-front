import Link from "next/link"
import { BrandMark } from "./brand-mark"

const SIGNUP = "/registro"
const LOGIN = "/login"
const DEMO = "/tienda-demo"

const landingStyles = `
.lp-root {
  --bg: #FFFFFF; --bg-2: #F1F5F9; --bg-3: #E2E8F0;
  --ink: #0F172A; --ink-2: #334155; --ink-3: #64748B;
  --line: #E2E8F0; --line-2: #CBD5E1;
  --brand: #1E3A8A; --brand-2: #1E40AF; --brand-dark: #172554;
  --accent: #DC4A3D; --accent-2: #F97066; --success: #10B981;
  background: var(--bg); color: var(--ink);
  font-family: var(--font-sans);
  line-height: 1.5;
}
.lp-root .mono { font-family: var(--font-mono); }
.lp-root .serif-it { font-family: var(--font-serif); font-style: italic; font-weight: 400; letter-spacing: -0.01em; }
.lp-root a { color: inherit; text-decoration: none; }
.lp-btn { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; letter-spacing: -0.01em; border-radius: 12px; white-space: nowrap; transition: all .18s ease; border: none; cursor: pointer; }
.lp-btn-primary { background: var(--brand); color: #fff; box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 16px -4px rgba(25,71,229,0.4); }
.lp-btn-primary:hover { background: var(--brand-dark); transform: translateY(-1px); box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 10px 24px -4px rgba(25,71,229,0.5); }
.lp-btn-ghost { background: #fff; color: var(--ink); border: 1px solid var(--line-2); }
.lp-btn-ghost:hover { background: var(--bg-2); border-color: var(--brand); }
.lp-btn-white { background: #fff; color: var(--brand); }
.lp-root ::selection { background: var(--brand); color: #fff; }
.lp-grid-bg {
  background-image: linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px);
  background-size: 60px 60px;
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
}
.lp-shine { position: relative; overflow: hidden; }
.lp-shine::before { content: ''; position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%); transform: translateX(-100%); transition: transform .8s ease; }
.lp-shine:hover::before { transform: translateX(100%); }
.lp-uc { transition: all .2s; }
.lp-uc:hover { border-color: var(--brand); transform: translateY(-3px); box-shadow: 0 16px 32px -12px rgba(25,71,229,0.15); }
.lp-navlink { color: var(--ink-2); border-radius: 8px; transition: background .15s; }
.lp-navlink:hover { background: var(--bg-2); }
@media (max-width: 960px) {
  .lp-hero-grid { grid-template-columns: 1fr !important; }
  .lp-hero-grid > div:last-child { display: none !important; }
  .lp-feat-head { grid-template-columns: 1fr !important; gap: 20px !important; align-items: start !important; }
  .lp-feat-grid { grid-template-columns: 1fr 1fr !important; }
  .lp-feat-grid > article:first-child { grid-column: span 2 !important; }
  .lp-uc-grid { grid-template-columns: 1fr 1fr !important; }
  .lp-steps { grid-template-columns: 1fr !important; }
  .lp-steps > div:first-child { display: none !important; }
  .lp-pricing { grid-template-columns: 1fr !important; }
}
@media (max-width: 560px) {
  .lp-stats { grid-template-columns: 1fr 1fr !important; }
  .lp-feat-grid { grid-template-columns: 1fr !important; }
  .lp-feat-grid > article:first-child { grid-column: span 1 !important; }
  .lp-uc-grid { grid-template-columns: 1fr !important; }
  .lp-foot { flex-direction: column !important; align-items: flex-start !important; }
}
`

export function LandingPage() {
  return (
    <div className="lp-root">
      <style dangerouslySetInnerHTML={{ __html: landingStyles }} />

      {/* Top announcement */}
      <div style={{ background: "var(--ink)", color: "#fff", padding: "10px 0", textAlign: "center", fontSize: 13, letterSpacing: "0.01em" }}>
        <span className="mono" style={{ color: "var(--accent)", fontSize: 11, marginRight: 10 }}>NUEVO · 2026</span>
        Menús digitales y portafolios inmobiliarios ya disponibles →
      </div>

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 0", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BrandMark size={30} />
            <span style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-0.025em" }}>bylink<span style={{ color: "var(--brand)" }}>.</span></span>
          </div>
          <nav style={{ display: "flex", gap: 2 }}>
            <a href="#funciones" className="lp-navlink" style={{ fontSize: 14, padding: "8px 14px", fontWeight: 500 }}>Funciones</a>
            <a href="#casos" className="lp-navlink" style={{ fontSize: 14, padding: "8px 14px", fontWeight: 500 }}>Casos de uso</a>
            <a href="#como" className="lp-navlink" style={{ fontSize: 14, padding: "8px 14px", fontWeight: 500 }}>Cómo funciona</a>
            <a href="#precios" className="lp-navlink" style={{ fontSize: 14, padding: "8px 14px", fontWeight: 500 }}>Precios</a>
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href={LOGIN} style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-2)" }}>Iniciar sesión</Link>
            <Link href={SIGNUP} className="lp-btn lp-btn-primary lp-shine" style={{ padding: "10px 18px", fontSize: 14 }}>Empezar gratis →</Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section style={{ position: "relative", padding: "80px 24px 120px", overflow: "hidden" }}>
        <div className="lp-grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.7 }} />
        <div style={{ position: "absolute", left: "50%", top: -200, transform: "translateX(-50%)", width: 1000, height: 800, background: "radial-gradient(ellipse, rgba(25,71,229,0.10), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "10%", top: "30%", width: 400, height: 400, background: "radial-gradient(circle, rgba(0,212,255,0.12), transparent 60%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 8px", borderRadius: 999, background: "#fff", border: "1px solid var(--line-2)", boxShadow: "0 4px 12px -4px rgba(10,31,77,0.08)", fontSize: 13 }}>
              <span style={{ background: "var(--brand)", color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.02em" }}>🇻🇪 BETA</span>
              <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>La nueva forma de vender desde Instagram</span>
            </div>
          </div>

          <div className="lp-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "clamp(48px, 6.2vw, 84px)", lineHeight: 0.98, letterSpacing: "-0.035em", fontWeight: 700, margin: 0 }}>
                Tu catálogo,<br />
                <span style={{ color: "var(--brand)" }}>tu checkout</span>,<br />
                <span className="serif-it" style={{ fontWeight: 400, color: "var(--ink)" }}>en un solo link.</span>
              </h1>
              <p style={{ fontSize: 19, color: "var(--ink-2)", maxWidth: 520, margin: "30px 0 36px", lineHeight: 1.55 }}>
                La plataforma hecha para negocios que venden por Instagram y WhatsApp en Venezuela. <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Cero comisiones, cero complicaciones</strong> — lista en 5 minutos.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href={SIGNUP} className="lp-btn lp-btn-primary lp-shine" style={{ padding: "16px 24px", fontSize: 16 }}>Montar mi tienda gratis →</Link>
                <Link href={DEMO} className="lp-btn lp-btn-ghost" style={{ padding: "16px 24px", fontSize: 16 }}>▸ Ver demo en vivo</Link>
              </div>

              <div style={{ marginTop: 36, paddingTop: 28, borderTop: "1px dashed var(--line-2)", display: "flex", gap: 24, flexWrap: "wrap" }}>
                {["Gratis para siempre", "Sin tarjeta", "Soporte en español"].map((t) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--bg-2)", color: "var(--success)", display: "grid", placeItems: "center", border: "1px solid var(--line)", fontWeight: 700 }}>✓</div>
                    <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone mockups */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 640 }}>
              <div style={{ position: "absolute", width: 480, height: 480, background: "linear-gradient(135deg, var(--brand), var(--accent))", borderRadius: "50%", opacity: 0.08, filter: "blur(20px)" }} />

              {/* secondary phone */}
              <div style={{ position: "absolute", right: 0, top: 40, transform: "rotate(8deg)", zIndex: 1 }}>
                <div style={{ width: 220, aspectRatio: "390/844", borderRadius: 30, background: "var(--ink)", padding: 8, boxShadow: "0 30px 60px -15px rgba(10,31,77,0.3)" }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: 24, background: "#0B141A", color: "#fff", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 72, height: 18, background: "#000", borderRadius: 9, zIndex: 10 }} />
                    <div style={{ padding: "32px 10px 8px", background: "#1F2C34", display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand), var(--accent))" }} />
                      <div><div style={{ fontSize: 9, fontWeight: 600 }}>Rosa Atelier</div><div style={{ fontSize: 7, opacity: 0.6 }}>en línea</div></div>
                    </div>
                    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ alignSelf: "flex-end", maxWidth: "85%", background: "#005C4B", padding: "6px 8px", borderRadius: 8, fontSize: 9, lineHeight: 1.4 }}>
                        <div style={{ fontWeight: 700, marginBottom: 3 }}>🛍️ Pedido #1284</div>
                        <div style={{ opacity: 0.9 }}>• Vestido Sienna · M</div>
                        <div style={{ marginTop: 4, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.15)", fontWeight: 700 }}>Total: $89</div>
                      </div>
                      <div style={{ alignSelf: "flex-start", background: "#1F2C34", padding: "5px 8px", borderRadius: 8, fontSize: 9 }}>¡Listo! Despacho mañana ✨</div>
                    </div>
                    <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "4px 7px", borderRadius: 6, fontSize: 8, fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#FF3B30" }}>● VIDEO</span><span style={{ opacity: 0.6 }}>checkout.mp4</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* primary phone */}
              <div style={{ position: "relative", zIndex: 2, transform: "translateX(-30px) rotate(-4deg)" }}>
                <div style={{ width: 300, aspectRatio: "390/844", borderRadius: 40, background: "var(--ink)", padding: 10, boxShadow: "0 40px 80px -20px rgba(25,71,229,0.35), 0 0 0 1px rgba(25,71,229,0.1)" }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: 32, background: "#fff", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 90, height: 22, background: "#000", borderRadius: 11, zIndex: 10 }} />
                    <div style={{ padding: "44px 14px 14px", height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, var(--brand), var(--accent))", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>R</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Rosa Atelier</div>
                          <div style={{ fontSize: 10, color: "var(--ink-3)" }}>@rosa · Moda · Caracas</div>
                        </div>
                        <div style={{ fontSize: 10, padding: "5px 10px", borderRadius: 999, background: "var(--brand)", color: "#fff", fontWeight: 600 }}>Seguir</div>
                      </div>
                      <div style={{ display: "flex", gap: 5 }}>
                        <div style={{ fontSize: 10, padding: "5px 10px", borderRadius: 999, background: "var(--ink)", color: "#fff", fontWeight: 600 }}>Todo</div>
                        {["Vestidos", "Tops", "Sale"].map((c) => (
                          <div key={c} style={{ fontSize: 10, padding: "5px 10px", borderRadius: 999, background: "var(--bg-2)", color: "var(--ink-2)", fontWeight: 500 }}>{c}</div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flex: 1 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ aspectRatio: "3/4", borderRadius: 10, background: "linear-gradient(135deg, #C63E2A, #7A1F10)", position: "relative" }}>
                            <div style={{ position: "absolute", top: 5, right: 5, width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "grid", placeItems: "center", fontSize: 9 }}>♡</div>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700 }}>Vestido Sienna</div>
                          <div style={{ fontSize: 9, color: "var(--ink-3)" }}>$89 · M, L, XL</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ aspectRatio: "3/4", borderRadius: 10, background: "linear-gradient(135deg, #E8C07A, #B8860B)", position: "relative" }}>
                            <div style={{ position: "absolute", top: 5, right: 5, width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "grid", placeItems: "center", fontSize: 9 }}>♡</div>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700 }}>Top Luna</div>
                          <div style={{ fontSize: 9, color: "var(--ink-3)" }}>$42</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, background: "rgba(10,31,77,0.85)", backdropFilter: "blur(8px)", color: "#fff", padding: "5px 10px", borderRadius: 8, fontSize: 10, fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#FF3B30" }}>● VIDEO</span><span style={{ opacity: 0.7 }}>catalogo.mp4</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* floating badges */}
              <div style={{ position: "absolute", left: 0, bottom: 80, zIndex: 3, background: "#fff", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)", boxShadow: "0 12px 30px -10px rgba(10,31,77,0.15)", display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14 }}>0%</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>Comisiones</div>
                  <div style={{ fontSize: 10, color: "var(--ink-3)" }}>Lo que vendes, es tuyo</div>
                </div>
              </div>
              <div style={{ position: "absolute", right: 20, top: 180, zIndex: 3, background: "var(--ink)", color: "#fff", padding: "10px 14px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 12px 30px -10px rgba(10,31,77,0.3)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#25D366", display: "grid", placeItems: "center" }}>💬</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>+1 pedido nuevo</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>hace 23 segundos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS / TRUST BAND */}
      <section style={{ padding: "56px 24px", background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textAlign: "center", marginBottom: 20 }}>CONFIABLE · SIMPLE · HECHO PARA VENEZUELA</div>
          <div className="lp-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
            {[["5 min", "para tener tu tienda"], ["0%", "comisión por venta"], ["$10", "plan Pro al mes"], ["4+", "verticales soportadas"]].map(([big, small]) => (
              <div key={small} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--brand)" }}>{big}</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>{small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="lp-feat-head" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, marginBottom: 56, alignItems: "end" }}>
            <div>
              <div className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--brand)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
                <span style={{ width: 20, height: 1, background: "var(--brand)" }} />Funciones
              </div>
              <h2 style={{ fontSize: "clamp(40px, 5vw, 60px)", lineHeight: 1, letterSpacing: "-0.035em", margin: 0, fontWeight: 700 }}>Todo lo que necesitas, <span className="serif-it" style={{ color: "var(--brand)", fontWeight: 400 }}>nada de lo que sobra.</span></h2>
            </div>
            <p style={{ fontSize: 17, color: "var(--ink-2)", maxWidth: 500, lineHeight: 1.55, marginBottom: 8 }}>
              Construida para negocios reales. Sin features para &quot;verse moderno&quot; — solo lo que vende más y te hace la vida más fácil.
            </p>
          </div>

          <div className="lp-feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <article style={{ gridColumn: "span 2", padding: 36, background: "var(--ink)", color: "#fff", borderRadius: 20, position: "relative", overflow: "hidden", minHeight: 320 }}>
              <div style={{ position: "absolute", right: -100, top: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(25,71,229,0.4), transparent 60%)" }} />
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, height: "100%" }}>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.08em", marginBottom: 14 }}>— 01</div>
                  <h3 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.1 }}>Catálogo completo en minutos</h3>
                  <p style={{ fontSize: 15, opacity: 0.75, lineHeight: 1.6, margin: 0 }}>Fotos, variantes (talla, color), precios en USD y Bs., filtros por categoría. Tus clientes exploran solos — tú dejas de contestar &quot;¿cuánto cuesta?&quot; cincuenta veces al día.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignSelf: "center" }}>
                  <div style={{ aspectRatio: "3/4", borderRadius: 10, background: "linear-gradient(135deg, #C63E2A, #7A1F10)" }} />
                  <div style={{ aspectRatio: "3/4", borderRadius: 10, background: "linear-gradient(135deg, #E8C07A, #B8860B)" }} />
                  <div style={{ aspectRatio: "3/4", borderRadius: 10, background: "linear-gradient(135deg, #8A6B4C, #5A3D1D)" }} />
                  <div style={{ aspectRatio: "3/4", borderRadius: 10, background: "linear-gradient(135deg, #2A3B5C, #0A1F4D)" }} />
                </div>
              </div>
            </article>

            <article style={{ padding: 32, background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 20, minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.08em", marginBottom: 14 }}>— 02</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em", margin: "0 0 10px", lineHeight: 1.2 }}>Checkout directo a WhatsApp</h3>
                <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>El pedido llega armado, listo para despachar. Sin apps raras.</p>
              </div>
              <div style={{ marginTop: 20, padding: 12, background: "#0B141A", borderRadius: 10, fontSize: 11, color: "#fff", lineHeight: 1.4 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: "#25D366" }}>🛍️ Pedido #1284</div>
                <div style={{ opacity: 0.9 }}>Vestido Sienna · M · $89</div>
              </div>
            </article>

            <article style={{ padding: 32, background: "#fff", border: "1px solid var(--line)", borderRadius: 20, minHeight: 260, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.08em", marginBottom: 14 }}>— 03</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em", margin: "0 0 10px", lineHeight: 1.2 }}>Hecho para Venezuela</h3>
                <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>Pago Móvil, Zelle, Binance, tasa BCV automática, Bs. + USD.</p>
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Pago Móvil", "Zelle", "Binance"].map((p) => (
                  <span key={p} className="mono" style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, background: "var(--bg-2)", border: "1px solid var(--line)" }}>{p}</span>
                ))}
              </div>
            </article>

            <article style={{ padding: 32, background: "#fff", border: "1px solid var(--line)", borderRadius: 20, minHeight: 260 }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.08em", marginBottom: 14 }}>— 04</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em", margin: "0 0 10px", lineHeight: 1.2 }}>Tu marca, no la nuestra</h3>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, margin: "0 0 20px" }}>Logo, colores, tipografía, dominio propio. Sin watermarks.</p>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1, height: 32, borderRadius: 6, background: "linear-gradient(135deg, var(--brand), var(--brand-dark))" }} />
                <div style={{ flex: 1, height: 32, borderRadius: 6, background: "linear-gradient(135deg, var(--accent), #00A8CC)" }} />
                <div style={{ flex: 1, height: 32, borderRadius: 6, background: "linear-gradient(135deg, var(--ink), #000)" }} />
              </div>
            </article>

            <article style={{ padding: 32, background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 20, minHeight: 260 }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--brand)", letterSpacing: "0.08em", marginBottom: 14 }}>— 05</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em", margin: "0 0 10px", lineHeight: 1.2 }}>Sabe qué les gusta</h3>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, margin: "0 0 20px" }}>Qué productos ven, qué agregan al carrito, qué se pierde.</p>
              <svg viewBox="0 0 200 60" style={{ width: "100%", height: 60 }}>
                <defs><linearGradient id="lp-g2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--brand)" stopOpacity="0.3" /><stop offset="1" stopColor="var(--brand)" stopOpacity="0" /></linearGradient></defs>
                <path d="M0 50 Q 30 42, 50 30 T 100 22 T 150 14 T 200 8 L 200 60 L 0 60 Z" fill="url(#lp-g2)" />
                <path d="M0 50 Q 30 42, 50 30 T 100 22 T 150 14 T 200 8" stroke="var(--brand)" strokeWidth="2" fill="none" />
              </svg>
            </article>

            <article style={{ padding: 32, background: "var(--brand)", color: "#fff", borderRadius: 20, minHeight: 260, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -50, bottom: -50, width: 200, height: 200, background: "radial-gradient(circle, rgba(0,212,255,0.4), transparent 60%)" }} />
              <div style={{ position: "relative" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.08em", marginBottom: 14 }}>— 06</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em", margin: "0 0 10px", lineHeight: 1.2 }}>Paga solo por lo que usas</h3>
                <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.55, margin: "0 0 20px" }}>$0 hasta que vendas. Luego $10/mes. Sin trucos.</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em" }}>$10</span>
                  <span style={{ fontSize: 14, opacity: 0.8 }}>/mes · plan Pro</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="casos" style={{ padding: "120px 24px", background: "var(--bg-2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
            <div className="mono" style={{ fontSize: 12, color: "var(--brand)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Casos de uso</div>
            <h2 style={{ fontSize: "clamp(40px, 5vw, 60px)", lineHeight: 1, letterSpacing: "-0.035em", margin: "0 0 14px", fontWeight: 700 }}>Un link para <span className="serif-it" style={{ color: "var(--brand)", fontWeight: 400 }}>cada tipo</span> de negocio.</h2>
            <p style={{ fontSize: 17, color: "var(--ink-2)", lineHeight: 1.5 }}>Ropa, comida, servicios, propiedades. bylink se adapta a ti.</p>
          </div>

          <div className="lp-uc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { icon: "👗", bg: "#FEF2F1", title: "Tiendas de ropa", desc: "Catálogo con tallas, colores, variantes y galería múltiple.", url: "bylink.app/rosa.atelier" },
              { icon: "🍕", bg: "#FFF9E0", title: "Restaurantes", desc: "Menú digital con categorías. Sin las comisiones de Yummy.", url: "bylink.app/brooklyn.slice" },
              { icon: "🏠", bg: "var(--bg-3)", title: "Inmobiliarias", desc: "Portafolio de propiedades con ficha técnica completa.", url: "bylink.app/caracas.vivienda" },
              { icon: "✨", bg: "#F3EFFF", title: "Servicios", desc: "Paquetes, portafolio y reservas por WhatsApp.", url: "bylink.app/estudio.clara" },
            ].map((u) => (
              <div key={u.title} className="lp-uc" style={{ padding: 28, background: "#fff", border: "1px solid var(--line)", borderRadius: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: u.bg, display: "grid", placeItems: "center", fontSize: 26, marginBottom: 18 }}>{u.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.015em" }}>{u.title}</h3>
                <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 14px", lineHeight: 1.5 }}>{u.desc}</p>
                <div className="mono" style={{ fontSize: 11, color: "var(--brand)" }}>{u.url}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como" style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="mono" style={{ fontSize: 12, color: "var(--brand)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Cómo funciona</div>
            <h2 style={{ fontSize: "clamp(40px, 5vw, 60px)", lineHeight: 1, letterSpacing: "-0.035em", margin: 0, fontWeight: 700 }}>De cero a vendiendo <span className="serif-it" style={{ color: "var(--brand)", fontWeight: 400 }}>en 5 minutos</span>.</h2>
          </div>
          <div className="lp-steps" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            <div style={{ position: "absolute", top: 40, left: "16.67%", right: "16.67%", height: 1, borderTop: "2px dashed var(--line-2)", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1, padding: 28, background: "#fff", border: "1px solid var(--line)", borderRadius: 18 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--bg-2)", border: "2px solid var(--line)", display: "grid", placeItems: "center", marginBottom: 18, fontWeight: 800, fontSize: 20, color: "var(--brand)" }}>01</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.015em" }}>Crea tu tienda</h3>
              <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>Nombre, logo, colores. En 2 minutos. Sin tarjeta, sin trámites.</p>
            </div>
            <div style={{ position: "relative", zIndex: 1, padding: 28, background: "var(--brand)", color: "#fff", borderRadius: 18, boxShadow: "0 20px 40px -15px rgba(25,71,229,0.4)" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "grid", placeItems: "center", marginBottom: 18, fontWeight: 800, fontSize: 20, color: "var(--accent)" }}>02</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.015em" }}>Sube tus productos</h3>
              <p style={{ fontSize: 14, opacity: 0.85, margin: 0, lineHeight: 1.55 }}>Fotos, precios, variantes. Arrastra y suelta. Si sabes Instagram, sabes bylink.</p>
            </div>
            <div style={{ position: "relative", zIndex: 1, padding: 28, background: "#fff", border: "1px solid var(--line)", borderRadius: 18 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--bg-2)", border: "2px solid var(--line)", display: "grid", placeItems: "center", marginBottom: 18, fontWeight: 800, fontSize: 20, color: "var(--brand)" }}>03</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.015em" }}>Comparte tu link</h3>
              <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>En tu bio, WhatsApp, donde quieras. Ya estás vendiendo.</p>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href={SIGNUP} className="lp-btn lp-btn-primary lp-shine" style={{ padding: "16px 24px", fontSize: 15 }}>Empezar ahora — es gratis →</Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" style={{ padding: "120px 24px", background: "var(--ink)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: -100, transform: "translateX(-50%)", width: 800, height: 500, background: "radial-gradient(ellipse, rgba(25,71,229,0.35), transparent 60%)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="mono" style={{ fontSize: 12, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Precios</div>
            <h2 style={{ fontSize: "clamp(40px, 5vw, 60px)", lineHeight: 1, letterSpacing: "-0.035em", margin: "0 0 14px", fontWeight: 700 }}>Empieza gratis. <span className="serif-it" style={{ color: "var(--accent)", fontWeight: 400 }}>Crece cuando quieras</span>.</h2>
            <p style={{ fontSize: 17, opacity: 0.7 }}>Sin comisiones por venta. Cancela cuando quieras.</p>
          </div>

          <div className="lp-pricing" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ padding: 36, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, backdropFilter: "blur(12px)" }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Gratis</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}><span style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.03em" }}>$0</span><span style={{ opacity: 0.6, fontSize: 14 }}>para siempre</span></div>
              <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 24 }}>Todo lo básico para montar tu tienda.</p>
              <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 24 }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                <li>✓ Hasta 20 productos</li>
                <li>✓ 5 fotos por producto</li>
                <li>✓ Checkout por WhatsApp</li>
                <li>✓ Link bylink.app/tunegocio</li>
                <li>✓ Analíticas básicas</li>
              </ul>
              <Link href={SIGNUP} className="lp-btn lp-btn-white" style={{ width: "100%", justifyContent: "center", padding: 14 }}>Empezar gratis</Link>
            </div>
            <div style={{ padding: 36, background: "linear-gradient(160deg, var(--brand), var(--brand-dark))", borderRadius: 24, position: "relative", boxShadow: "0 30px 60px -20px rgba(25,71,229,0.6)" }}>
              <div style={{ position: "absolute", top: -12, right: 24, background: "var(--accent)", color: "var(--ink)", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>RECOMENDADO</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Pro</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.03em" }}>$10</span><span style={{ opacity: 0.7, fontSize: 14 }}>por mes</span></div>
              <div className="mono" style={{ fontSize: 11, opacity: 0.6, marginBottom: 20 }}>Bs. 483 tasa BCV</div>
              <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 24 }}>Para negocios que quieren crecer.</p>
              <div style={{ height: 1, background: "rgba(255,255,255,0.2)", marginBottom: 24 }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                {["Hasta 100 productos", "Categorías ilimitadas", "Dominio personalizado", 'Sin badge "Hecho con..."', "Analíticas completas", "Soporte prioritario"].map((f) => (
                  <li key={f}><span style={{ color: "var(--accent)" }}>✓</span> {f}</li>
                ))}
              </ul>
              <Link href={SIGNUP} className="lp-btn" style={{ width: "100%", justifyContent: "center", padding: 14, background: "var(--ink)", color: "#fff" }}>Obtener Pro →</Link>
            </div>
          </div>

          <div style={{ marginTop: 32, textAlign: "center", display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", fontSize: 13, opacity: 0.6 }}>
            <span>✓ Sin comisiones por venta</span>
            <span>✓ Cancela cuando quieras</span>
            <span>✓ Cambia de plan en 1 click</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 60px", background: "#fff", border: "1px solid var(--line)", borderRadius: 32, position: "relative", overflow: "hidden" }}>
          <div className="lp-grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
          <div style={{ position: "absolute", right: -80, top: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(25,71,229,0.18), transparent 60%)" }} />
          <div style={{ position: "absolute", left: -60, bottom: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(0,212,255,0.2), transparent 60%)" }} />
          <div style={{ position: "relative", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: 999, fontSize: 13, marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, background: "var(--success)", borderRadius: "50%" }} />
              Lista en 5 minutos
            </div>
            <h2 style={{ fontSize: "clamp(48px, 6.5vw, 88px)", lineHeight: 0.95, letterSpacing: "-0.035em", margin: "0 0 20px", fontWeight: 700 }}>Tu bio merece<br /><span className="serif-it" style={{ color: "var(--brand)", fontWeight: 400 }}>más que un DM</span>.</h2>
            <p style={{ fontSize: 19, color: "var(--ink-2)", maxWidth: 540, margin: "0 auto 36px" }}>Deja de perder ventas entre mensajes. Monta tu tienda ahora.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href={SIGNUP} className="lp-btn lp-btn-primary lp-shine" style={{ padding: "16px 28px", fontSize: 16 }}>Montar mi tienda gratis →</Link>
              <Link href={DEMO} className="lp-btn lp-btn-ghost" style={{ padding: "16px 28px", fontSize: 16 }}>Ver demo en vivo</Link>
            </div>
            <div className="mono" style={{ marginTop: 24, fontSize: 12, color: "var(--ink-3)" }}>gratis · sin tarjeta · cancela cuando quieras</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "56px 24px 32px", borderTop: "1px solid var(--line)" }}>
        <div className="lp-foot" style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BrandMark size={26} withAccent={false} />
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>bylink<span style={{ color: "var(--brand)" }}>.</span></span>
            <span style={{ color: "var(--ink-3)", fontSize: 13, marginLeft: 12 }}>© 2026 · Hecho en Venezuela 🇻🇪</span>
          </div>
          <div style={{ display: "flex", gap: 22, fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>
            <a href="#">Términos</a><a href="#">Privacidad</a><a href="#">Contacto</a><a href="mailto:hola@bylink.app">hola@bylink.app</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
