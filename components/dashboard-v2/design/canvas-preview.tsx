"use client"

import type { Template, ThemeTokens } from "@/lib/page-builder-api"

interface Props {
  template: Template | null
  tokens: ThemeTokens
}

/**
 * Live preview of how the active template + current draft tokens look.
 *
 * Fase A renders a stylized "story" of the storefront — hero, product
 * grid, CTA — using the in-memory tokens. The real renderer (task #21)
 * will swap this out for the actual sectioned tree.
 */
export function CanvasPreview({ template, tokens }: Props) {
  const palette = tokens.palette ?? {}
  const typography = tokens.typography ?? {}
  const radius = tokens.radius ?? "md"
  const buttonStyle = tokens.buttonStyle ?? "solid"

  const radiusPx =
    radius === "sm" ? 6 : radius === "md" ? 10 : radius === "lg" ? 16 : 22

  const headingFont = `"${typography.headingFont ?? "Inter"}", sans-serif`
  const bodyFont = `"${typography.bodyFont ?? "Inter"}", sans-serif`

  const primary = palette.primary ?? "#1E3A8A"
  const accent = palette.accent ?? "#DC4A3D"
  const background = palette.background ?? "#FFFFFF"
  const surface = palette.surface ?? "#F8F9FB"
  const text = palette.text ?? "#0F172A"
  const textMuted = palette.textMuted ?? "#64748B"
  const border = palette.border ?? "#E2E8F0"

  const button = {
    padding: "10px 18px",
    borderRadius: radiusPx,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: bodyFont,
    transition: "all 0.15s ease",
    background:
      buttonStyle === "solid"
        ? primary
        : buttonStyle === "outline"
        ? "transparent"
        : "transparent",
    color: buttonStyle === "solid" ? "#FFF" : primary,
    border:
      buttonStyle === "outline"
        ? `1.5px solid ${primary}`
        : buttonStyle === "ghost"
        ? "1.5px solid transparent"
        : "1.5px solid transparent",
  } as React.CSSProperties

  return (
    <div style={S.frame}>
      <div style={S.frameHead}>
        <div style={S.dots}>
          <span style={{ ...S.dot, background: "#FF5F57" }} />
          <span style={{ ...S.dot, background: "#FEBC2E" }} />
          <span style={{ ...S.dot, background: "#28C840" }} />
        </div>
        <div style={S.frameUrl}>
          bylink.app/<strong>{template?.key ?? "vitrina"}</strong>
        </div>
      </div>

      <div style={{ ...S.page, background, color: text, fontFamily: bodyFont }}>
        {/* Header */}
        <div style={{ ...S.header, borderBottom: `1px solid ${border}` }}>
          <div style={{ ...S.brand, fontFamily: headingFont, color: text }}>
            ByLink<span style={{ color: accent }}>.</span>
          </div>
          <div style={S.headerNav}>
            <span style={{ ...S.navLink, color: textMuted }}>Catálogo</span>
            <span style={{ ...S.navLink, color: textMuted }}>Sobre nosotros</span>
            <button style={button} type="button">
              Comprar
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ ...S.hero, color: text, fontFamily: headingFont }}>
          <div style={{ ...S.eyebrow, color: accent, fontFamily: bodyFont }}>
            {template?.niche?.toLowerCase().replace(/_/g, " ") ?? "tienda"}
          </div>
          <h1 style={S.heroTitle}>{template?.name ?? "Tu tienda en bylink"}</h1>
          <p style={{ ...S.heroBody, color: textMuted, fontFamily: bodyFont }}>
            Preview en vivo de la paleta, tipografía y forma elegidas. Los cambios
            se guardan en draft hasta que publiques.
          </p>
          <div style={S.heroCtas}>
            <button style={button} type="button">
              Ver catálogo
            </button>
            <button
              style={{
                ...button,
                background: "transparent",
                color: text,
                border: `1.5px solid ${border}`,
              }}
              type="button"
            >
              Reservar
            </button>
          </div>
        </div>

        {/* Product grid mock */}
        <div style={S.gridSection}>
          <div style={{ ...S.sectionTitle, color: text, fontFamily: headingFont }}>
            Destacados
          </div>
          <div style={S.grid}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  ...S.card,
                  background: surface,
                  border: `1px solid ${border}`,
                  borderRadius: radiusPx,
                }}
              >
                <div
                  style={{
                    ...S.cardImage,
                    background: `linear-gradient(135deg, ${primary}, ${accent})`,
                    borderRadius: radiusPx,
                  }}
                />
                <div style={{ ...S.cardTitle, color: text }}>Producto {i}</div>
                <div style={{ ...S.cardPrice, color: textMuted }}>$ 0.00</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  frame: {
    border: "1px solid var(--line)",
    background: "var(--bg-elev)",
    borderRadius: 16,
    overflow: "hidden",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 16px 36px -16px rgba(15,23,42,0.18)",
  },
  frameHead: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "10px 14px",
    borderBottom: "1px solid var(--line)",
    background: "var(--bg-2)",
  },
  dots: { display: "flex", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 999 },
  frameUrl: {
    flex: 1,
    textAlign: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--ink-3)",
  },
  page: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 28px",
  },
  brand: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" },
  headerNav: { display: "flex", alignItems: "center", gap: 18 },
  navLink: { fontSize: 13 },
  hero: { padding: "56px 28px", maxWidth: 760 },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.08,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: 700,
    letterSpacing: "-0.025em",
    lineHeight: 1.08,
    margin: 0,
  },
  heroBody: { fontSize: 16, lineHeight: 1.55, marginTop: 14, maxWidth: 540 },
  heroCtas: { display: "flex", gap: 10, marginTop: 22 },
  gridSection: { padding: "0 28px 56px" },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: 18,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  card: { padding: 14, display: "flex", flexDirection: "column", gap: 10 },
  cardImage: { aspectRatio: "4 / 3", width: "100%" },
  cardTitle: { fontSize: 14, fontWeight: 600 },
  cardPrice: { fontSize: 13, fontFamily: "var(--font-mono)" },
}
