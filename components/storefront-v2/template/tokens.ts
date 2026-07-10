import type { ThemeTokens } from "@/lib/page-builder-api"

// Maps the BE-120 ThemeTokens to CSS custom properties applied at the
// renderer root. Sections only need to consume var(--bl-*) and stay
// agnostic of the palette/typography source.

export interface ResolvedThemeStyle {
  cssVars: Record<string, string>
  headingFont: string
  bodyFont: string
  monoFont: string
  /** Bare family names (no quotes/fallback stack) — for loading, not CSS. */
  headingFontName: string
  bodyFontName: string
  monoFontName: string
  radiusPx: number
  spacingPx: number
  buttonStyle: "solid" | "outline" | "ghost"
}

const DEFAULT_TOKENS: Required<{
  primary: string
  secondary: string
  accent: string
  bg: string
  surface: string
  text: string
  muted: string
  border: string
}> = {
  primary: "#1E3A8A",
  secondary: "#475569",
  accent: "#DC4A3D",
  bg: "#FFFFFF",
  surface: "#F8F9FB",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
}

export function resolveTokens(tokens: ThemeTokens | undefined | null): ResolvedThemeStyle {
  const p = tokens?.palette ?? {}
  const typo = tokens?.typography ?? {}

  const headingFontName = typo.headingFont ?? "Inter"
  const bodyFontName = typo.bodyFont ?? "Inter"
  const monoFontName = typo.monoFont ?? "JetBrains Mono"

  const headingFont = `"${headingFontName}", sans-serif`
  const bodyFont = `"${bodyFontName}", sans-serif`
  const monoFont = `"${monoFontName}", monospace`

  const radius = tokens?.radius ?? "md"
  const radiusPx = radius === "sm" ? 6 : radius === "md" ? 10 : radius === "lg" ? 16 : 22

  const spacing = tokens?.spacing ?? "normal"
  const spacingPx = spacing === "compact" ? 12 : spacing === "normal" ? 20 : 32

  const buttonStyle = tokens?.buttonStyle ?? "solid"

  const cssVars: Record<string, string> = {
    "--bl-primary": p.primary ?? DEFAULT_TOKENS.primary,
    "--bl-secondary": p.secondary ?? DEFAULT_TOKENS.secondary,
    "--bl-accent": p.accent ?? DEFAULT_TOKENS.accent,
    "--bl-background": p.bg ?? DEFAULT_TOKENS.bg,
    "--bl-surface": p.surface ?? DEFAULT_TOKENS.surface,
    "--bl-text": p.text ?? DEFAULT_TOKENS.text,
    "--bl-text-muted": p.muted ?? DEFAULT_TOKENS.muted,
    "--bl-border": p.border ?? DEFAULT_TOKENS.border,
    "--bl-heading-font": headingFont,
    "--bl-body-font": bodyFont,
    "--bl-mono-font": monoFont,
    "--bl-radius": `${radiusPx}px`,
    "--bl-spacing": `${spacingPx}px`,
  }

  return {
    cssVars,
    headingFont,
    bodyFont,
    monoFont,
    headingFontName,
    bodyFontName,
    monoFontName,
    radiusPx,
    spacingPx,
    buttonStyle,
  }
}

export function buttonStyleProps(
  style: "solid" | "outline" | "ghost",
  radiusPx: number,
  variant: "primary" | "secondary" = "primary",
): React.CSSProperties {
  const color = variant === "primary" ? "var(--bl-primary)" : "var(--bl-text)"
  return {
    padding: "10px 18px",
    borderRadius: radiusPx,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "var(--bl-body-font)",
    transition: "all 0.15s ease",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: style === "solid" ? color : "transparent",
    color: style === "solid" ? "#FFF" : color,
    border:
      style === "outline"
        ? `1.5px solid ${color}`
        : style === "ghost"
        ? "1.5px solid transparent"
        : "1.5px solid transparent",
  }
}
