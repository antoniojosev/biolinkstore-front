"use client"

import { useEffect, useRef, useState } from "react"
import { BS_RATE, SCRAPED_PRODUCTS } from "./data"

interface LogLine {
  text: string
  color: string
}

interface CinematicScraperProps {
  handle: string
  onDone: () => void
}

const cinemaStyles = `
@keyframes cinemaFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cinemaFadeOut { to { opacity: 0; } }
@keyframes cursorBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes scanLine { 0% { transform: translateY(-100%); opacity: 0; } 20% { opacity: 0.6; } 80% { opacity: 0.6; } 100% { transform: translateY(100vh); opacity: 0; } }
@keyframes flyIn { 0% { opacity: 0; transform: translate(var(--from-x, 0), var(--from-y, -200px)) scale(0.5) rotate(var(--rot, 0deg)); } 60% { opacity: 1; } 100% { opacity: 1; transform: translate(0, 0) scale(1) rotate(0); } }
@keyframes counterPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); color: #F97066; } 100% { transform: scale(1); } }
.cinema-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(59,91,219,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,91,219,0.06) 1px, transparent 1px); background-size: 40px 40px; -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 70%); mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 70%); }
.cinema-scan { position: absolute; left: 0; right: 0; height: 4px; background: linear-gradient(180deg, transparent, rgba(59,91,219,0.8), transparent); animation: scanLine 2.4s ease-in-out infinite; }
.cinema-glow { position: absolute; left: 50%; top: 50%; width: 800px; height: 800px; transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(30,58,138,0.25), transparent 60%); pointer-events: none; filter: blur(40px); }
.cinema-terminal { font-family: var(--font-mono); font-size: 13px; color: rgba(255,255,255,0.85); }
.cinema-cursor { display: inline-block; width: 8px; height: 16px; background: #fff; margin-left: 2px; vertical-align: text-bottom; animation: cursorBlink 1s infinite; }
.cinema-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 8px; animation: flyIn 0.7s cubic-bezier(.2,.8,.3,1.1) forwards; backdrop-filter: blur(8px); position: relative; }
.cinema-price { position: absolute; top: 8px; right: 8px; background: #10B981; color: #fff; padding: 3px 8px; border-radius: 999px; font-family: var(--font-mono); font-size: 10px; font-weight: 700; }
.cinema-ai-badge { display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; border-radius: 999px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); transition: opacity .3s; }
@media (max-width: 900px) { .cinema-body { grid-template-columns: 1fr !important; } .cinema-left { display: none !important; } }
`

export function CinematicScraper({ handle, onDone }: CinematicScraperProps) {
  const [typed, setTyped] = useState("")
  const [logs, setLogs] = useState<LogLine[]>([])
  const [profileVisible, setProfileVisible] = useState(false)
  const [counter, setCounter] = useState(0)
  const [counterStatus, setCounterStatus] = useState("esperando…")
  const [counterDone, setCounterDone] = useState(false)
  const [shownProducts, setShownProducts] = useState<typeof SCRAPED_PRODUCTS>([])
  const [aiBadges, setAiBadges] = useState({ title: false, price: false, desc: false })
  const [done, setDone] = useState(false)
  const [closing, setClosing] = useState(false)
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms))
      })

    async function run() {
      // type handle
      for (let i = 0; i < handle.length; i++) {
        await wait(80)
        if (cancelled.current) return
        setTyped(handle.slice(0, i + 1))
      }

      const pushLog = (text: string, color = "rgba(255,255,255,0.6)") =>
        setLogs((prev) => [...prev, { text, color }].slice(-8))

      await wait(400); if (cancelled.current) return; pushLog("→ conectando con instagram.com…", "rgba(255,255,255,0.5)")
      await wait(500); if (cancelled.current) return; pushLog("✓ conexión establecida", "#10B981")
      await wait(600); if (cancelled.current) return; pushLog(`→ leyendo perfil de ${handle}…`, "rgba(255,255,255,0.5)")
      await wait(600); if (cancelled.current) return; pushLog("✓ perfil verificado", "#10B981"); setProfileVisible(true)
      await wait(800); if (cancelled.current) return; pushLog("→ analizando 247 publicaciones…", "rgba(255,255,255,0.5)"); setCounterStatus("analizando posts…")
      await wait(1000); if (cancelled.current) return; pushLog("✓ 12 posts identificados como productos", "#10B981")
      await wait(700); if (cancelled.current) return; pushLog("→ extrayendo precios con IA…", "rgba(255,255,255,0.5)")

      setAiBadges((b) => ({ ...b, title: true }))
      await wait(300); if (cancelled.current) return; setAiBadges((b) => ({ ...b, price: true }))
      await wait(300); if (cancelled.current) return; setAiBadges((b) => ({ ...b, desc: true }))

      setCounterStatus("importando…")
      for (let p = 0; p < SCRAPED_PRODUCTS.length; p++) {
        await wait(200)
        if (cancelled.current) return
        setShownProducts(SCRAPED_PRODUCTS.slice(0, p + 1))
        setCounter(p + 1)
      }

      setCounterStatus("✓ todos los productos importados")
      setCounterDone(true)
      await wait(600); if (cancelled.current) return; pushLog("✓ catálogo generado con IA", "#10B981")
      await wait(400); if (cancelled.current) return; pushLog("— listo para revisar —", "#3B5BDB")
      setDone(true)
    }

    run()
    return () => {
      cancelled.current = true
      timers.forEach(clearTimeout)
    }
  }, [handle])

  function close() {
    if (closing) return
    setClosing(true)
    setTimeout(onDone, 350)
  }

  useEffect(() => {
    if (!done) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") close() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column", color: "#fff", overflow: "hidden", animation: closing ? "cinemaFadeOut .35s ease forwards" : "cinemaFade .5s ease" }}
    >
      <style dangerouslySetInnerHTML={{ __html: cinemaStyles }} />
      <div className="cinema-grid" />
      <div className="cinema-glow" />
      <div className="cinema-scan" />

      {/* top bar */}
      <div style={{ position: "relative", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #3B5BDB, #1E3A8A)", display: "grid", placeItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", boxShadow: "0 0 12px #fff" }} />
          </div>
          bylink<span style={{ color: "#3B5BDB" }}>.</span>
        </div>
        <div className="cinema-terminal" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
          BYLINK.AI ENGINE · scraping en vivo
        </div>
      </div>

      {/* body */}
      <div className="cinema-body" style={{ position: "relative", flex: 1, display: "grid", gridTemplateColumns: "380px 1fr", gap: 40, padding: "0 48px 48px", zIndex: 10, minHeight: 0 }}>
        {/* left: terminal */}
        <div className="cinema-left" style={{ display: "flex", flexDirection: "column", gap: 24, alignSelf: "start", maxHeight: "100%", overflow: "hidden" }}>
          <div>
            <div className="cinema-terminal" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 8 }}>— ANÁLISIS DE INSTAGRAM</div>
            <div className="cinema-terminal" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.3, color: "#fff" }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>$</span> scrape <span style={{ color: "#3B5BDB" }}>{typed}</span><span className="cinema-cursor" />
            </div>
          </div>

          <div className="cinema-terminal" style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.6)", minHeight: 200 }}>
            {logs.map((l, i) => (
              <div key={i} style={{ animation: "cinemaFade .3s ease", color: l.color }}>{l.text}</div>
            ))}
          </div>

          {profileVisible && (
            <div style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 14, backdropFilter: "blur(10px)", animation: "cinemaFade 0.6s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #C63E2A, #7A1F10)", flexShrink: 0, boxShadow: "0 0 0 2px rgba(255,255,255,0.1)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Rosa Atelier</div>
                  <div className="cinema-terminal" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{handle}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>8.4K</div>
                  <div className="cinema-terminal" style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>SEGUIDORES</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* right: counter + grid */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 88, lineHeight: 1, fontWeight: 400, letterSpacing: "-0.04em", color: "#fff" }}>
              <span key={counter} style={{ display: "inline-block", animation: "counterPop 0.4s ease" }}>{counter}</span>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>productos</div>
              <div className="cinema-terminal" style={{ fontSize: 11, color: counterDone ? "#10B981" : "rgba(255,255,255,0.5)" }}>{counterStatus}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <div className="cinema-ai-badge" style={{ opacity: aiBadges.title ? 1 : 0 }}>✨ títulos IA</div>
              <div className="cinema-ai-badge" style={{ opacity: aiBadges.price ? 1 : 0 }}>💰 precios IA</div>
              <div className="cinema-ai-badge" style={{ opacity: aiBadges.desc ? 1 : 0 }}>📝 descripciones IA</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, flex: 1, alignContent: "start", overflow: "hidden" }}>
            {shownProducts.map((prod, p) => {
              const fromX = (Math.random() - 0.5) * 600
              const fromY = -200 - Math.random() * 200
              const rot = (Math.random() - 0.5) * 30
              return (
                <div
                  key={p}
                  className="cinema-card"
                  style={{ "--from-x": `${fromX}px`, "--from-y": `${fromY}px`, "--rot": `${rot}deg` } as React.CSSProperties}
                >
                  <div style={{ aspectRatio: "1", background: prod.photo, borderRadius: 8, position: "relative", overflow: "hidden" }}>
                    <div className="cinema-price">${prod.price}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginTop: 6, padding: "0 2px" }}>{prod.name}</div>
                  <div className="cinema-terminal" style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", padding: "0 2px" }}>${prod.price} · Bs. {(prod.price * BS_RATE).toFixed(0)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {done && (
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, zIndex: 20 }}>
          <button type="button" onClick={close} style={{ padding: "18px 36px", background: "#fff", color: "#1E3A8A", border: "none", borderRadius: 14, fontFamily: "inherit", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 20px 50px -10px rgba(255,255,255,0.3)" }}>
            Continuar →
          </button>
          <div className="cinema-terminal" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>o presiona Enter</div>
        </div>
      )}
    </div>
  )
}
