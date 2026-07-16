"use client"

import { useState } from "react"
import {
  FONT_WHITELIST,
  type ButtonStyle,
  type FontName,
  type PalettePreset,
  type Radius,
  type Spacing,
  type StylePreset,
  type Template,
  type ThemeTokens,
} from "@/lib/page-builder-api"

interface Props {
  tokens: ThemeTokens
  palettes: PalettePreset[]
  onPatch: (partial: ThemeTokens) => void
  /** Template activo — habilita el bloque de Recetas (defaultTokens = "Original" + stylePresets del diseñador). */
  template?: Template | null
  /** Aplica una receta completa (tokens + overrides de sección). Vive en theme-editor porque necesita replaceSections. */
  onApplyPreset?: (preset: StylePreset) => void
}

/**
 * Firma canónica de un set de tokens para detectar qué receta está activa.
 * Compara solo los campos que una receta define (colores en minúscula,
 * tipografía, forma) — inmune al orden de claves del JSON.
 */
function tokensSignature(t: ThemeTokens | undefined | null): string {
  if (!t) return ""
  const p = t.palette ?? {}
  return JSON.stringify({
    c: PALETTE_KEYS.map((k) => (p[k] ?? "").toLowerCase()),
    f: [t.typography?.headingFont ?? "", t.typography?.bodyFont ?? "", t.typography?.scale ?? ""],
    s: [t.radius ?? "", t.spacing ?? "", t.buttonStyle ?? ""],
  })
}

const RADIUS_OPTIONS: Radius[] = ["sm", "md", "lg", "xl"]
const SPACING_OPTIONS: Spacing[] = ["compact", "normal", "comfortable"]
const BUTTON_OPTIONS: ButtonStyle[] = ["solid", "outline", "ghost"]

const PALETTE_KEYS: Array<keyof NonNullable<ThemeTokens["palette"]>> = [
  "primary",
  "secondary",
  "accent",
  "bg",
  "surface",
  "text",
  "muted",
  "border",
]
const PALETTE_LABEL: Record<string, string> = {
  primary: "Primario",
  secondary: "Secundario",
  accent: "Acento",
  bg: "Fondo",
  surface: "Superficie",
  text: "Texto",
  muted: "Texto suave",
  border: "Borde",
}

export function TokensEditor({ tokens, palettes, onPatch, template, onApplyPreset }: Props) {
  const [section, setSection] = useState<"palette" | "type" | "shape">("palette")

  // Recetas: "Original" (defaultTokens del template, siempre presente) + las
  // curadas por el diseñador. Es la vía recomendada de personalización; los
  // controles de abajo siguen siendo la edición libre.
  // Guard de defaultTokens: activeTemplate llega primero del catálogo liviano
  // (sin defaultTokens/stylePresets) y el detalle se mergea async — hasta que
  // llega, no hay recetas que mostrar.
  const recipes: StylePreset[] =
    template && onApplyPreset && template.defaultTokens
      ? [
          { key: "__original", name: "Original", tokens: template.defaultTokens },
          ...(template.stylePresets ?? []).filter((p) => p && p.tokens),
        ]
      : []
  const currentSig = tokensSignature(tokens)

  return (
    <div style={S.wrap}>
      {recipes.length > 0 && (
        <div>
          <div style={S.subTitle}>Recetas del tema</div>
          <div style={S.recipeList}>
            {recipes.map((r) => {
              const active = tokensSignature(r.tokens) === currentSig
              const pal = r.tokens?.palette ?? {}
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => !active && onApplyPreset?.(r)}
                  style={{ ...S.recipe, ...(active ? S.recipeActive : null) }}
                  title={r.description}
                >
                  <div style={S.recipeSwatches}>
                    {(["primary", "accent", "bg", "text"] as const).map((k) => (
                      <span key={k} style={{ ...S.swatch, background: pal[k] ?? "#ccc" }} />
                    ))}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={S.recipeName}>{r.name}</div>
                    <div style={S.recipeFont}>{r.tokens?.typography?.headingFont ?? "—"}</div>
                  </div>
                  {active && <span style={S.recipeCheck}>✓</span>}
                </button>
              )
            })}
          </div>
          <div style={{ ...S.subTitle, marginTop: 18 }}>Personalizar</div>
        </div>
      )}

      <div style={S.tabs}>
        <button type="button" onClick={() => setSection("palette")} style={section === "palette" ? S.tabActive : S.tab}>
          Paleta
        </button>
        <button type="button" onClick={() => setSection("type")} style={section === "type" ? S.tabActive : S.tab}>
          Tipografía
        </button>
        <button type="button" onClick={() => setSection("shape")} style={section === "shape" ? S.tabActive : S.tab}>
          Forma
        </button>
      </div>

      {section === "palette" && (
        <div style={S.section}>
          <div style={S.subTitle}>Presets</div>
          <div style={S.presetGrid}>
            {palettes.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => onPatch({ palette: { ...p.colors } })}
                style={S.preset}
                title={p.name}
              >
                <div style={S.presetSwatches}>
                  {(["primary", "accent", "bg", "text"] as const).map((k) => (
                    <span
                      key={k}
                      style={{
                        ...S.swatch,
                        background: p.colors[k] ?? "#ccc",
                      }}
                    />
                  ))}
                </div>
                <div style={S.presetName}>{p.name}</div>
              </button>
            ))}
          </div>

          <div style={{ ...S.subTitle, marginTop: 18 }}>Colores</div>
          <div style={S.fieldGrid}>
            {PALETTE_KEYS.map((k) => (
              <ColorField
                key={k}
                label={PALETTE_LABEL[k] ?? k}
                value={tokens.palette?.[k] ?? "#000000"}
                onChange={(v) => onPatch({ palette: { [k]: v } as Record<string, string> })}
              />
            ))}
          </div>
        </div>
      )}

      {section === "type" && (
        <div style={S.section}>
          <FontField
            label="Fuente de títulos"
            value={(tokens.typography?.headingFont as FontName) ?? "Inter"}
            onChange={(v) => onPatch({ typography: { headingFont: v } })}
          />
          <FontField
            label="Fuente de cuerpo"
            value={(tokens.typography?.bodyFont as FontName) ?? "Inter"}
            onChange={(v) => onPatch({ typography: { bodyFont: v } })}
          />
          <FontField
            label="Fuente mono"
            value={(tokens.typography?.monoFont as FontName) ?? "Inter"}
            onChange={(v) => onPatch({ typography: { monoFont: v } })}
          />
        </div>
      )}

      {section === "shape" && (
        <div style={S.section}>
          <SegmentField
            label="Radius"
            value={tokens.radius ?? "md"}
            options={RADIUS_OPTIONS}
            onChange={(v) => onPatch({ radius: v as Radius })}
          />
          <SegmentField
            label="Spacing"
            value={tokens.spacing ?? "normal"}
            options={SPACING_OPTIONS}
            onChange={(v) => onPatch({ spacing: v as Spacing })}
          />
          <SegmentField
            label="Estilo de botón"
            value={tokens.buttonStyle ?? "solid"}
            options={BUTTON_OPTIONS}
            onChange={(v) => onPatch({ buttonStyle: v as ButtonStyle })}
          />
        </div>
      )}
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label style={S.colorField}>
      <span style={S.colorLabel}>{label}</span>
      <span style={S.colorRow}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={S.colorInput}
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={S.colorText}
          spellCheck={false}
          maxLength={9}
        />
      </span>
    </label>
  )
}

function FontField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label style={S.fontField}>
      <span style={S.fontLabel}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={S.fontSelect}>
        {FONT_WHITELIST.map((f) => (
          <option key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>
            {f}
          </option>
        ))}
      </select>
      <span style={{ ...S.fontPreview, fontFamily: `"${value}", sans-serif` }}>
        Buenos Aires · ByLink
      </span>
    </label>
  )
}

function SegmentField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <div style={S.segWrap}>
      <span style={S.segLabel}>{label}</span>
      <div style={S.segGroup}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={value === opt ? S.segActive : S.seg}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", flexDirection: "column", gap: 14, height: "100%" },
  tabs: {
    display: "flex",
    gap: 4,
    padding: 4,
    background: "var(--bg-2)",
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "transparent",
    padding: "8px 6px",
    borderRadius: 6,
    fontSize: 12,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tabActive: {
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "var(--bg-elev)",
    padding: "8px 6px",
    borderRadius: 6,
    fontSize: 12,
    color: "var(--ink)",
    fontWeight: 600,
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
  },
  section: { display: "flex", flexDirection: "column", gap: 14, paddingBottom: 24 },
  subTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--ink-3)",
    textTransform: "uppercase",
    letterSpacing: 0.06,
  },
  presetGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 },
  preset: {
    minWidth: 0,
    border: "1px solid var(--line)",
    background: "var(--bg-elev)",
    borderRadius: 8,
    padding: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    color: "var(--ink)",
  },
  presetSwatches: { display: "flex", gap: 3 },
  swatch: { width: 18, height: 18, borderRadius: 4, border: "1px solid var(--line)" },
  recipeList: { display: "flex", flexDirection: "column", gap: 8 },
  recipe: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 10px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--line)",
    borderRadius: 10,
    background: "var(--bg-elev)",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "var(--ink)",
    textAlign: "left",
    width: "100%",
    minWidth: 0,
  },
  recipeActive: {
    borderColor: "var(--brand)",
    boxShadow: "0 0 0 1px var(--brand)",
    cursor: "default",
  },
  recipeSwatches: { display: "flex", gap: 3, flexShrink: 0 },
  recipeName: { fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  recipeFont: { fontSize: 10.5, color: "var(--ink-3)", fontFamily: "var(--font-mono)" },
  recipeCheck: { fontSize: 12, color: "var(--brand)", fontWeight: 700, flexShrink: 0 },
  presetName: { fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  // minWidth:0 en el ítem de la grilla (no solo en colorText, adentro):
  // el "ancho mínimo automático" de un grid item con `1fr` se calcula sobre
  // SU PROPIO min-content, y sin esto la grilla se ensancha para acomodarlo
  // aunque los descendientes ya puedan achicarse.
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, minWidth: 0 },
  colorField: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  colorLabel: { fontSize: 11, color: "var(--ink-2)", fontWeight: 500 },
  colorRow: { display: "flex", alignItems: "center", gap: 6 },
  colorInput: {
    width: 28,
    height: 28,
    border: "1px solid var(--line)",
    borderRadius: 6,
    padding: 0,
    background: "transparent",
    cursor: "pointer",
  },
  colorText: {
    flex: 1,
    minWidth: 0,
    padding: "6px 8px",
    border: "1px solid var(--line)",
    borderRadius: 6,
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    background: "var(--bg)",
    color: "var(--ink)",
  },
  fontField: { display: "flex", flexDirection: "column", gap: 6 },
  fontLabel: { fontSize: 11, color: "var(--ink-2)", fontWeight: 500 },
  fontSelect: {
    padding: "8px 10px",
    border: "1px solid var(--line)",
    borderRadius: 8,
    fontSize: 13,
    background: "var(--bg)",
    color: "var(--ink)",
    fontFamily: "inherit",
  },
  fontPreview: {
    fontSize: 22,
    color: "var(--ink)",
    padding: "8px 12px",
    border: "1px dashed var(--line)",
    borderRadius: 8,
    background: "var(--bg-elev)",
  },
  segWrap: { display: "flex", flexDirection: "column", gap: 6 },
  segLabel: { fontSize: 11, color: "var(--ink-2)", fontWeight: 500 },
  segGroup: {
    display: "flex",
    gap: 4,
    padding: 4,
    background: "var(--bg-2)",
    borderRadius: 8,
  },
  seg: {
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "transparent",
    padding: "6px 6px",
    borderRadius: 5,
    fontSize: 11,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
    textTransform: "capitalize" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  segActive: {
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "var(--bg-elev)",
    padding: "6px 6px",
    borderRadius: 5,
    fontSize: 11,
    color: "var(--ink)",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textTransform: "capitalize" as const,
    boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
  },
}
