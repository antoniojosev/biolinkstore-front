"use client"

import { useState } from "react"
import { BS_RATE, DEFAULT_AI_PRODUCTS, type AiProduct } from "./data"
import { BrandMark } from "@/components/landing-v2/brand-mark"

const VARIATIONS = ["Premium", "Edición Limitada", "Hecho a mano", "Exclusivo"]

interface AiCatalogProps {
  onBack: () => void
  onContinue: () => void
}

export function AiCatalog({ onBack, onContinue }: AiCatalogProps) {
  const [products, setProducts] = useState<AiProduct[]>(() => DEFAULT_AI_PRODUCTS.map((p) => ({ ...p })))
  const approvedCount = products.filter((p) => p.approved).length

  const update = (id: number, patch: Partial<AiProduct>) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const toggleApprove = (id: number) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, approved: !p.approved } : p)))

  const approveAll = () => setProducts((prev) => prev.map((p) => ({ ...p, approved: true })))

  const regenerate = (id: number) =>
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, name: `${p.name.split(" ").slice(0, 2).join(" ")} ${VARIATIONS[Math.floor(Math.random() * VARIATIONS.length)]}`, confidence: Math.min(0.99, p.confidence + 0.05) }
          : p
      )
    )

  return (
    <div className="ad-shell" style={{ gridTemplateColumns: "1fr" }}>
      <div style={{ padding: "28px 36px 32px", background: "#fff", minHeight: "100vh", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BrandMark size={30} />
            <span className="ad-logo-text">bylink<span style={{ color: "var(--brand)" }}>.</span></span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em" }}>PASO 6 DE 8 · CATÁLOGO IA</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end", marginBottom: 28 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", borderRadius: 999, marginBottom: 14 }}>
              <span style={{ fontSize: 14 }}>✨</span>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#92400E", letterSpacing: "0.05em" }}>GENERADO POR IA</span>
            </div>
            <h1 style={{ fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, margin: "0 0 8px" }}>Tus <span className="serif-it" style={{ color: "var(--brand)" }}>12 productos</span>, listos.</h1>
            <p style={{ fontSize: 16, color: "var(--ink-2)", margin: 0 }}>La IA nombró, puso precio y describió cada uno. Aprueba lo que te guste, edita lo que no.</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", marginBottom: 4 }}>APROBADOS</div>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>{approvedCount}<span style={{ color: "var(--ink-3)" }}>/12</span></div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, padding: "14px 16px", background: "var(--bg-2)", borderRadius: 12, alignItems: "center" }}>
          <button type="button" onClick={approveAll} style={{ padding: "8px 14px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: 8, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Aprobar todos</button>
          <button type="button" onClick={() => setProducts((p) => p.map((x) => ({ ...x })))} style={{ padding: "8px 14px", background: "#fff", color: "var(--ink)", border: "1.5px solid var(--line)", borderRadius: 8, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>↻ Regenerar todos con IA</button>
          <div style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>moneda: USD · Bs. (auto)</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {products.map((p) => {
            const conf = Math.round(p.confidence * 100)
            const confColor = conf >= 90 ? "#10B981" : conf >= 80 ? "#3B5BDB" : "#F59E0B"
            const confLabel = conf >= 90 ? "alta" : conf >= 80 ? "buena" : "revisar"
            return (
              <div
                key={p.id}
                style={{ display: "grid", gridTemplateColumns: "80px 1fr auto auto", gap: 16, padding: 14, border: "1.5px solid", borderRadius: 14, alignItems: "center", transition: "all .15s", borderColor: p.approved ? "#10B981" : "var(--line)", background: p.approved ? "linear-gradient(180deg, #F0FDF4, #fff)" : "#fff" }}
              >
                <div style={{ aspectRatio: "1", background: p.photo, borderRadius: 10, position: "relative", overflow: "hidden" }}>
                  {p.approved && <div style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "#10B981", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>✓</div>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <input
                      value={p.name}
                      onChange={(e) => update(p.id, { name: e.target.value, edited: true })}
                      style={{ fontSize: 15, fontWeight: 700, border: "none", background: "none", padding: "2px 0", flex: 1, minWidth: 0, color: "var(--ink)", outline: "none", borderBottom: "1.5px dashed transparent" }}
                    />
                    <div className="mono" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 999, background: `${confColor}15`, color: confColor, fontWeight: 700, letterSpacing: "0.05em", flexShrink: 0 }}>IA · {confLabel}</div>
                  </div>
                  <textarea
                    value={p.desc}
                    rows={2}
                    onChange={(e) => update(p.id, { desc: e.target.value, edited: true })}
                    style={{ width: "100%", fontSize: 12, color: "var(--ink-2)", border: "none", background: "none", padding: 0, resize: "none", fontFamily: "inherit", outline: "none", lineHeight: 1.4 }}
                  />
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 12, color: "var(--ink-3)" }}>$</span>
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => update(p.id, { price: parseFloat(e.target.value) || 0, edited: true })}
                      style={{ width: 60, fontSize: 18, fontWeight: 700, border: "none", background: "none", padding: "2px 0", textAlign: "right", outline: "none", borderBottom: "1.5px dashed transparent", color: "var(--ink)" }}
                    />
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>Bs. {(p.price * BS_RATE).toFixed(0)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button type="button" onClick={() => toggleApprove(p.id)} style={{ padding: "8px 14px", background: p.approved ? "#10B981" : "var(--brand)", color: "#fff", border: "none", borderRadius: 8, fontFamily: "inherit", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>{p.approved ? "✓ Aprobado" : "Aprobar"}</button>
                  <button type="button" onClick={() => regenerate(p.id)} style={{ padding: "6px 10px", background: "none", color: "var(--ink-3)", border: "1px solid var(--line)", borderRadius: 8, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>↻ IA</button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ position: "sticky", bottom: 0, margin: "28px -36px -32px", padding: "18px 36px", background: "linear-gradient(180deg, transparent, #fff 30%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button type="button" onClick={onBack} className="ad-btn ad-btn-ghost" style={{ padding: "12px 20px" }}>← Atrás</button>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>puedes editar cualquier cosa después</span>
            <button type="button" onClick={onContinue} className="ad-btn ad-btn-primary">Continuar con plantilla →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
