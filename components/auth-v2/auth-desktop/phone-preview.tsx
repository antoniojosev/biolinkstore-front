"use client"

import { useEffect, useState } from "react"
import { BS_RATE, PREVIEW_PRODUCTS, SCRAPED, TEMPLATES, VERTICALS, type StoreState } from "./data"

export type PreviewMode = "identity" | "instagram" | "instagram-found" | "template" | "final"

interface PhonePreviewProps {
  mode: PreviewMode
  store: StoreState
  onbStep: number
}

export function PhonePreview({ mode, store, onbStep }: PhonePreviewProps) {
  const name = store.name || ""
  const slug = store.slug || ""
  const tpl = TEMPLATES.find((t) => t.id === store.template) || TEMPLATES[0]
  const accent = mode === "instagram-found" || tpl.id === "warm" ? "#C63E2A" : tpl.accent
  const isDark = tpl.id === "dark"
  const subInk = isDark ? "rgba(255,255,255,0.55)" : "var(--ink-3)"
  const bodyInk = isDark ? "rgba(255,255,255,0.85)" : "var(--ink-2)"

  const showPhotos = mode === "instagram-found" || mode === "template" || mode === "final" || onbStep >= 4
  const [currency, setCurrency] = useState<"USD" | "BS">("USD")

  useEffect(() => {
    if (!showPhotos) return
    const t = setInterval(() => setCurrency((c) => (c === "USD" ? "BS" : "USD")), 2400)
    return () => clearInterval(t)
  }, [showPhotos])

  const fmtPrice = (usd: number) => (currency === "USD" ? `$${usd}` : `Bs. ${(usd * BS_RATE).toFixed(0)}`)

  // Empty state: step 0 with no name
  if (!name && onbStep === 0 && mode !== "final") {
    return (
      <div style={{ padding: "56px 22px 22px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "linear-gradient(180deg, #F8FAFF, #fff)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 20%, rgba(30,58,138,0.04), transparent 40%), radial-gradient(circle at 80% 80%, rgba(220,74,61,0.04), transparent 40%)" }} />
        <div style={{ position: "relative", width: 64, height: 64, borderRadius: 20, background: "#fff", border: "2px dashed var(--line-2)", display: "grid", placeItems: "center" }}>
          <div style={{ fontSize: 28, opacity: 0.4 }}>✨</div>
        </div>
        <div style={{ position: "relative", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>— preview en vivo</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Tu tienda <span className="serif-it" style={{ color: "var(--brand)" }}>aparecerá aquí</span></div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.4 }}>Empieza escribiendo el nombre →</div>
        </div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6, width: "100%", marginTop: 8 }}>
          <div className="ad-shimmer" style={{ height: 36, borderRadius: 8, opacity: 0.5 }} />
          <div className="ad-shimmer" style={{ height: 14, width: "60%", borderRadius: 6, opacity: 0.5 }} />
        </div>
      </div>
    )
  }

  const isInstagramStep = mode === "instagram"
  const handle = store.instagram || ""
  const displayName = name || "Tu negocio"
  const displaySlug = slug || "tu-negocio"
  const letter = (displayName[0] || "T").toUpperCase()
  const products = showPhotos ? PREVIEW_PRODUCTS : [null, null, null, null]
  const verticalLabel = VERTICALS.find((v) => v.id === store.vertical)?.label.split(" ")[0] || "Productos"

  return (
    <div style={{ padding: "40px 14px 14px", height: "100%", display: "flex", flexDirection: "column", gap: 12, background: tpl.bg, color: isDark ? "#fff" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: accent, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16, boxShadow: "0 4px 10px -2px rgba(0,0,0,0.15)" }}>{letter}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{displayName}</div>
          <div className="mono" style={{ fontSize: 9, color: subInk }}>bylink.app/{displaySlug}</div>
        </div>
        {showPhotos && <div style={{ background: isDark ? "rgba(255,255,255,0.1)" : "var(--bg-2)", padding: "4px 8px", borderRadius: 999, fontSize: 9, fontWeight: 700, color: isDark ? "#fff" : "var(--ink)" }}>⌖ WhatsApp</div>}
      </div>
      {showPhotos && <div style={{ fontSize: 10, lineHeight: 1.4, color: bodyInk }}>{SCRAPED.bio.split("\n")[0]}</div>}
      {isInstagramStep ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: isDark ? "rgba(255,255,255,0.06)" : "var(--bg-2)", borderRadius: 10, padding: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: isDark ? "rgba(255,255,255,0.1)" : "#fff", border: `2px dashed ${isDark ? "rgba(255,255,255,0.25)" : "var(--line-2)"}`, display: "grid", placeItems: "center", fontSize: 12, flexShrink: 0 }}>📸</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: handle ? undefined : subInk }}>{handle || "@tu-instagram"}</div>
              <div className="mono" style={{ fontSize: 8, color: subInk }}>{handle ? "listo para escanear" : "esperando datos…"}</div>
            </div>
          </div>
          <div style={{ background: isDark ? "rgba(255,255,255,0.06)" : "var(--bg-2)", border: `1px dashed ${isDark ? "rgba(255,255,255,0.2)" : "var(--line-2)"}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: subInk, lineHeight: 1.5 }}>Cuando pongas tu @, escanearemos<br />tus posts y los volveremos productos</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, flex: 1 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ad-shimmer" style={{ aspectRatio: "3/4", background: isDark ? "rgba(255,255,255,0.08)" : "var(--bg-2)", borderRadius: 8 }} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ fontSize: 9, padding: "3px 8px", borderRadius: 999, background: accent, color: "#fff", fontWeight: 600 }}>Todo</div>
            <div style={{ fontSize: 9, padding: "3px 8px", borderRadius: 999, background: isDark ? "rgba(255,255,255,0.1)" : "var(--bg-2)", color: isDark ? "#fff" : "var(--ink-2)" }}>{verticalLabel}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, flex: 1 }}>
            {products.map((p, i) =>
              p ? (
                <div key={i}>
                  <div style={{ aspectRatio: "3/4", background: p.photo, borderRadius: 8, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", color: "#fff", padding: "2px 6px", borderRadius: 999, fontSize: 8, fontWeight: 700 }}>{fmtPrice(p.price)}</div>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>{p.name}</div>
                </div>
              ) : (
                <div key={i}>
                  <div className="ad-shimmer" style={{ aspectRatio: "3/4", background: isDark ? "rgba(255,255,255,0.08)" : "var(--bg-2)", borderRadius: 8 }} />
                </div>
              )
            )}
          </div>
        </>
      )}
      {showPhotos && (
        <div style={{ marginTop: "auto", paddingTop: 8, borderTop: `1px dashed ${isDark ? "rgba(255,255,255,0.15)" : "var(--line)"}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9 }}>
          <div className="mono" style={{ color: subInk }}>precios actualizados</div>
          <div style={{ display: "flex", gap: 4 }}>
            <span style={{ padding: "2px 6px", borderRadius: 4, background: currency === "USD" ? accent : "transparent", color: currency === "USD" ? "#fff" : subInk, fontWeight: 700, transition: "all .25s" }}>USD</span>
            <span style={{ padding: "2px 6px", borderRadius: 4, background: currency === "BS" ? accent : "transparent", color: currency === "BS" ? "#fff" : subInk, fontWeight: 700, transition: "all .25s" }}>Bs</span>
          </div>
        </div>
      )}
    </div>
  )
}
