"use client"

import { useMemo, useState } from "react"
import type { Plan, Template, TemplateNiche } from "@/lib/page-builder-api"

interface Props {
  templates: Template[]
  activeTemplate: string
  storePlan: Plan
  loading: boolean
  onPick: (templateKey: string) => void
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

export function TemplatesSidebar({ templates, activeTemplate, storePlan, loading, onPick }: Props) {
  const [niche, setNiche] = useState<TemplateNiche | "ALL">("ALL")
  const [pickingKey, setPickingKey] = useState<string | null>(null)

  const filtered = useMemo(
    () => (niche === "ALL" ? templates : templates.filter((t) => t.niche === niche)),
    [templates, niche],
  )

  async function handlePick(key: string) {
    if (pickingKey || key === activeTemplate) return
    setPickingKey(key)
    try {
      await onPick(key)
    } finally {
      setPickingKey(null)
    }
  }

  return (
    <aside style={S.aside}>
      <div style={S.header}>
        <h3 style={S.title}>Templates</h3>
        <span style={S.count}>{filtered.length}</span>
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

      <div style={S.list}>
        {loading && templates.length === 0 ? (
          <div style={S.muted}>Cargando templates…</div>
        ) : filtered.length === 0 ? (
          <div style={S.muted}>No hay templates en este nicho.</div>
        ) : (
          filtered.map((t) => {
            const isActive = t.key === activeTemplate
            const isGated = !planSatisfies(storePlan, t.planRequired)
            const isPicking = pickingKey === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => !isGated && handlePick(t.key)}
                disabled={isGated || isPicking}
                style={{
                  ...S.card,
                  ...(isActive ? S.cardActive : null),
                  ...(isGated ? S.cardGated : null),
                  cursor: isGated ? "not-allowed" : isPicking ? "default" : "pointer",
                }}
                title={isGated ? `Requiere plan ${t.planRequired}` : t.name}
              >
                <div style={S.thumb}>
                  {t.previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.previewImage} alt={t.name} style={S.thumbImg} />
                  ) : (
                    <div style={S.thumbPlaceholder}>{t.name.slice(0, 2).toUpperCase()}</div>
                  )}
                  {isActive && <div style={S.activeBadge}>Activo</div>}
                  {isGated && <div style={S.lockBadge}>{t.planRequired}</div>}
                  {isPicking && <div style={S.overlayLoading}>Aplicando…</div>}
                </div>
                <div style={S.meta}>
                  <div style={S.name}>{t.name}</div>
                  <div style={S.niche}>{t.niche.toLowerCase().replace(/_/g, " ")}</div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}

const S: Record<string, React.CSSProperties> = {
  aside: {
    width: 280,
    flexShrink: 0,
    borderRight: "1px solid var(--line)",
    background: "var(--bg-elev)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    height: "100%",
    overflowY: "auto",
  },
  header: { display: "flex", alignItems: "baseline", justifyContent: "space-between" },
  title: { margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" },
  count: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" },
  filters: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    padding: "4px 10px",
    border: "1px solid var(--line)",
    background: "transparent",
    borderRadius: 999,
    fontSize: 11,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  chipActive: { background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" },
  list: { display: "grid", gridTemplateColumns: "1fr", gap: 12, paddingTop: 4 },
  muted: { color: "var(--ink-3)", fontSize: 12, padding: "20px 8px", textAlign: "center" },
  card: {
    textAlign: "left",
    background: "var(--bg)",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: 0,
    overflow: "hidden",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    fontFamily: "inherit",
    color: "var(--ink)",
  },
  cardActive: { borderColor: "var(--brand)", boxShadow: "0 0 0 1px var(--brand)" },
  cardGated: { opacity: 0.55 },
  thumb: {
    position: "relative",
    aspectRatio: "4 / 3",
    background: "linear-gradient(135deg, var(--bg-2), var(--bg-elev))",
    display: "grid",
    placeItems: "center",
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" as const },
  thumbPlaceholder: {
    fontFamily: "var(--font-serif)",
    fontStyle: "italic",
    fontSize: 24,
    color: "var(--ink-3)",
  },
  activeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    background: "var(--brand)",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 999,
    letterSpacing: 0.04,
    textTransform: "uppercase",
  },
  lockBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    background: "rgba(15,23,42,0.85)",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 999,
    letterSpacing: 0.04,
    textTransform: "uppercase",
  },
  overlayLoading: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.85)",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    color: "var(--ink-2)",
  },
  meta: { padding: "8px 10px" },
  name: { fontSize: 12, fontWeight: 600, color: "var(--ink)" },
  niche: { fontSize: 10, color: "var(--ink-3)", marginTop: 2, textTransform: "capitalize" },
}
