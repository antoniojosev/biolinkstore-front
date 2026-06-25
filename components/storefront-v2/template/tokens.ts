import type { ThemeTokens } from "@/lib/page-builder-api"

// Maps the BE-120 ThemeTokens to CSS custom properties applied at the
// renderer root. Sections only need to consume var(--bl-*) and stay
// agnostic of the palette/typography source.

export interface ResolvedThemeStyle {
  cssVars: Record<string, string>
  headingFont: string
  bodyFont: string
  monoFont: string
  radiusPx: number
  spacingPx: number
  buttonStyle: "solid" | "outline" | "ghost"
}

const DEFAULT_TOKENS: Required<{
  primary: string
  accent: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
}> = {
  primary: "#1E3A8A",
  accent: "#DC4A3D",
  background: "#FFFFFF",
  surface: "#F8F9FB",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
}

export function resolveTokens(tokens: ThemeTokens | undefined | null): ResolvedThemeStyle {
  const p = tokens?.palette ?? {}
  const typo = tokens?.typography ?? {}

  const headingFont = `"${typo.headingFont ?? "Inter"}", sans-serif`
  const bodyFont = `"${typo.bodyFont ?? "Inter"}", sans-serif`
  const monoFont = `"${typo.monoFont ?? "JetBrains Mono"}", monospace`

  const radius = tokens?.radius ?? "md"
  const radiusPx = radius === "sm" ? 6 : radius === "md" ? 10 : radius === "lg" ? 16 : 22

  const spacing = tokens?.spacing ?? "normal"
  const spacingPx = spacing === "compact" ? 12 : spacing === "normal" ? 20 : 32

  const buttonStyle = tokens?.buttonStyle ?? "solid"

  const cssVars: Record<string, string> = {
    "--bl-primary": p.primary ?? DEFAULT_TOKENS.primary,
    "--bl-accent": p.accent ?? DEFAULT_TOKENS.accent,
    "--bl-background": p.background ?? DEFAULT_TOKENS.background,
    "--bl-surface": p.surface ?? DEFAULT_TOKENS.surface,
    "--bl-text": p.text ?? DEFAULT_TOKENS.text,
    "--bl-text-muted": p.textMuted ?? DEFAULT_TOKENS.textMuted,
    "--bl-border": p.border ?? DEFAULT_TOKENS.border,
    "--bl-heading-font": headingFont,
    "--bl-body-font": bodyFont,
    "--bl-mono-font": monoFont,
    "--bl-radius": `${radiusPx}px`,
    "--bl-spacing": `${spacingPx}px`,
  }

  return { cssVars, headingFont, bodyFont, monoFont, radiusPx, spacingPx, buttonStyle }
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
