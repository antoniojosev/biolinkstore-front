"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/lib/hooks/use-theme"
import type { Plan, Template, TemplateNiche } from "@/lib/page-builder-api"
import { ThemePreviewModal } from "./design/theme-preview-modal"

interface Props {
  onOpenEditor: () => void
}

const NICHES: Array<{ id: TemplateNiche | "ALL"; label: string }> = [
  { id: "ALL", label: "Todos" },
  { id: "FASHION", label: "Moda" },
  { id: "RESTAURANT", label: "Restaurante" },
  { id: "REAL_ESTATE", label: "Inmuebles" },
  { id: "SERVICES", label: "Servicios" },
  { id: "GENERAL", label: "General" },
]

function planOrder(plan: Plan): number {
  return plan === "FREE" ? 0 : plan === "PRO" ? 1 : 2
}
function planSatisfies(storePlan: Plan, required: Plan): boolean {
  return planOrder(storePlan) >= planOrder(required)
}

export function ThemesBoard({ onOpenEditor }: Props) {
  const { store } = useAuth()
  const t = useTheme()
  const storePlan: Plan = (store?.subscription?.plan ?? "FREE") as Plan
  const [niche, setNiche] = useState<TemplateNiche | "ALL">("ALL")
  const [applyingKey, setApplyingKey] = useState<string | null>(null)
  const [appliedKey, setAppliedKey] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState<string | null>(null)

  const filtered = useMemo(
    () => (niche === "ALL" ? t.templates : t.templates.filter((tpl) => tpl.niche === niche)),
    [t.templates, niche],
  )

  async function apply(tpl: Template) {
    if (applyingKey || tpl.key === t.theme?.activeTemplate) return
    setApplyingKey(tpl.key)
    setAppliedKey(null)
    try {
      await t.switchTemplate(tpl.key)
      setAppliedKey(tpl.key)
    } finally {
      setApplyingKey(null)
    }
  }

  return (
    <div style={S.wrap}>
      <div style={S.head}>
        <h1 style={S.title}>
          Galería de <em style={S.titleEm}>temas</em>
        </h1>
        <p style={S.subtitle}>Elige un punto de partida — todo es editable después.</p>
      </div>

      <div style={S.filters}>
        {NICHES.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setNiche(n.id)}
            style={{ ...S.chip, ...(niche === n.id ? S.chipActive : null) }}
          >
            {n.label}
          </button>
        ))}
      </div>

      {appliedKey && (
        <div style={S.appliedBanner}>
          <span>Tema aplicado al borrador — todavía no se publicó.</span>
          <button type="button" onClick={onOpenEditor} style={S.appliedLink}>
            Ajustarlo en el editor →
          </button>
        </div>
      )}

      <div style={S.grid}>
        {t.isLoading && t.templates.length === 0 ? (
          <div style={S.muted}>Cargando templates…</div>
        ) : filtered.length === 0 ? (
          <div style={S.muted}>No hay templates en este nicho.</div>
        ) : (
          filtered.map((tpl) => {
            const isActive = tpl.key === t.theme?.activeTemplate
            const isGated = !planSatisfies(storePlan, tpl.planRequired)
            const isApplying = applyingKey === tpl.key
            return (
              <div key={tpl.key} style={{ ...S.card, ...(isActive ? S.cardActive : null) }}>
                <div style={S.thumb} onClick={() => setPreviewKey(tpl.key)}>
                  {tpl.previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tpl.previewImage} alt={tpl.name} style={S.thumbImg} />
                  ) : (
                    <div style={S.thumbPlaceholder}>{tpl.name.slice(0, 2).toUpperCase()}</div>
                  )}
                  {isActive && <div style={S.activeBadge}>Activo</div>}
                  {isGated && <div style={S.lockBadge}>{tpl.planRequired}</div>}
                </div>
                <div style={S.meta}>
                  <div style={S.name}>{tpl.name}</div>
                  <div style={S.niche}>{tpl.niche.toLowerCase().replace(/_/g, " ")}</div>
                </div>
                <div style={S.actions}>
                  <button type="button" onClick={() => setPreviewKey(tpl.key)} style={S.btnGhost}>
                    Vista previa
                  </button>
                  <button
                    type="button"
                    onClick={() => apply(tpl)}
                    disabled={isGated || isApplying || isActive}
                    style={{ ...S.btnPrimary, ...(isGated || isActive ? S.btnDisabled : null) }}
                    title={isGated ? `Requiere plan ${tpl.planRequired}` : undefined}
                  >
                    {isApplying ? "Aplicando…" : isActive ? "Activo" : "Aplicar"}
                  </button>
                </div>
              </div>
            )
          })
        )}

        <a
          href="mailto:hola@bylink.app?subject=ByLink%20Studio"
          style={S.studioCard}
          title="Un diseñador del equipo bylink diseña tu tienda completa"
        >
          <div style={S.studioTag}>bylink studio</div>
          <div style={S.studioHeadline}>¿Ninguno es tu marca?</div>
          <div style={S.studioSub}>Un diseñador del equipo bylink trabaja tu marca de punta a punta. Entrega en 7 días.</div>
          <div style={S.studioFoot}>
            <span>
              Desde <strong style={{ color: "#E8C07A" }}>$199</strong> · pago único
            </span>
            <span style={{ color: "#E8C07A", fontWeight: 600 }}>Hablar con un diseñador →</span>
          </div>
        </a>
      </div>

      <ThemePreviewModal templateKey={previewKey} onClose={() => setPreviewKey(null)} />
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 1200, margin: "0 auto", padding: 24, display: "grid", gap: 18 },
  head: { display: "flex", flexDirection: "column", gap: 4 },
  title: { margin: 0, fontSize: 28, letterSpacing: "-0.02em", fontWeight: 700 },
  titleEm: { fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--brand)", fontWeight: 400 },
  subtitle: { margin: 0, color: "var(--ink-2)", fontSize: 14 },
  filters: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: -4 },
  chip: {
    padding: "6px 14px",
    border: "1px solid var(--line)",
    background: "transparent",
    borderRadius: 999,
    fontSize: 12,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  chipActive: { background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" },
  appliedBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderRadius: 10,
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.3)",
    fontSize: 13,
    color: "var(--ink)",
  },
  appliedLink: { background: "none", border: "none", color: "var(--success)", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 },
  muted: { color: "var(--ink-3)", fontSize: 13, padding: "40px 8px", textAlign: "center", gridColumn: "1 / -1" },
  card: {
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardActive: { borderColor: "var(--brand)", boxShadow: "0 0 0 1px var(--brand)" },
  thumb: {
    position: "relative",
    aspectRatio: "4 / 3",
    background: "linear-gradient(135deg, var(--bg-2), var(--bg-elev))",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  thumbPlaceholder: { fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 30, color: "var(--ink-3)" },
  activeBadge: {
    position: "absolute", top: 8, left: 8, background: "var(--brand)", color: "#fff",
    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase",
  },
  lockBadge: {
    position: "absolute", top: 8, right: 8, background: "rgba(15,23,42,0.85)", color: "#fff",
    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase",
  },
  meta: { padding: "10px 14px 0" },
  name: { fontSize: 14, fontWeight: 700, color: "var(--ink)" },
  niche: { fontSize: 11, color: "var(--ink-3)", marginTop: 2, textTransform: "capitalize" },
  actions: { display: "flex", gap: 8, padding: 14 },
  btnGhost: {
    flex: 1, padding: "8px 10px", border: "1px solid var(--line)", background: "transparent",
    borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--ink-2)", cursor: "pointer", fontFamily: "inherit",
  },
  btnPrimary: {
    flex: 1, padding: "8px 10px", border: "none", background: "var(--brand)", color: "#fff",
    borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  studioCard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 18,
    borderRadius: 14,
    background: "linear-gradient(135deg, #0F1B3D, #1E3A8A)",
    border: "1px solid rgba(232,192,122,0.45)",
    color: "#fff",
    textDecoration: "none",
    minHeight: 220,
    justifyContent: "center",
  },
  studioTag: {
    alignSelf: "flex-start", padding: "4px 10px", borderRadius: 999, background: "rgba(232,192,122,0.16)",
    border: "1px solid rgba(232,192,122,0.4)", color: "#E8C07A", fontFamily: "var(--font-mono)",
    fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600,
  },
  studioHeadline: { fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 20, color: "#E8C07A" },
  studioSub: { fontSize: 12.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 },
  studioFoot: {
    display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10,
    marginTop: 4, borderTop: "1px solid rgba(232,192,122,0.2)", fontSize: 11.5, color: "rgba(255,255,255,0.7)",
  },
}
