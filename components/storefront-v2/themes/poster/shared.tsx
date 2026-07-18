"use client"

import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"

/**
 * Constantes visuales del tema poster (spec docs/legacy-theme-specs/poster.md).
 *
 * Regla de tokens: la paleta editable llega por las CSS vars --bl-* (el seed
 * `atardecer` mapea cream→text, red-deep→bg, red-panel→surface, gold→secondary,
 * gold-soft→accent, red-base→primary). Los hex que quedan acá abajo son los
 * DOCUMENTADOS COMO IDENTIDAD del tema en la spec (radiales del fondo,
 * gradiente dorado, verde de ingredientes, red-warm hover, degradado de texto,
 * verde WhatsApp) — no son tokens y no deben seguir a la paleta.
 */
export const POSTER = {
  cream: "var(--bl-text)",
  deep: "var(--bl-background)",
  panel: "var(--bl-surface)",
  gold: "var(--bl-secondary)",
  goldSoft: "var(--bl-accent)",
  base: "var(--bl-primary)",
  anton: "var(--bl-heading-font)",
  allura: "'Allura', cursive",
  inter: "var(--bl-body-font)",
  // Identidad literal (spec §1) — hover del botón add del detail.
  redWarm: "#962020",
  // Verde ingredientes / hojas (spec §1).
  green: "#6cbf6a",
  greenLeafB: "#7dd47b",
  greenStem: "#2f7a3a",
  // Gradientes literales de la spec.
  goldGradient: "linear-gradient(135deg, #f4a23a 0%, #d97a1c 100%)",
  cardGradient: "linear-gradient(160deg, #8a1e1e 0%, #5a0f0f 100%)",
  titleGradient: "linear-gradient(180deg, #fff 0%, #ffd9a3 100%)",
  topbarGradient: "linear-gradient(180deg, rgba(30,3,3,.85), rgba(30,3,3,.4))",
  waGradient: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
  // Fondo de página: radiales identidad + gradiente base derivado del token bg
  // (si el usuario cambia la paleta, la base lo sigue; los radiales quedan como
  // foco cálido — decisión documentada en spec §9.1).
  pageBackground:
    "radial-gradient(1200px 600px at 10% -20%, #8a1e1e 0%, transparent 60%), " +
    "radial-gradient(900px 500px at 110% 30%, #6a1414 0%, transparent 55%), " +
    "linear-gradient(180deg, var(--bl-background) 0%, color-mix(in srgb, var(--bl-background) 55%, #000) 100%)",
  drawerGradient:
    "linear-gradient(180deg, var(--bl-surface) 0%, color-mix(in srgb, var(--bl-surface) 65%, #000) 100%)",
  stickyGradient: "linear-gradient(180deg, rgba(30,3,3,0) 0%, var(--bl-surface) 30%)",
} as const

/** Alpha de cream (--bl-text) sin hardcodear el hex. */
export function cream(alphaPct: number): string {
  return `color-mix(in srgb, var(--bl-text) ${alphaPct}%, transparent)`
}

/** Alpha de gold (--bl-secondary) sin hardcodear el hex. */
export function gold(alphaPct: number): string {
  return `color-mix(in srgb, var(--bl-secondary) ${alphaPct}%, transparent)`
}

/** Alpha de deep (--bl-background) — texto sobre crema/dorado. */
export function deep(alphaPct: number): string {
  return `color-mix(in srgb, var(--bl-background) ${alphaPct}%, transparent)`
}

/** Primera palabra >3 letras, uppercase, cortada a 10 chars (word echo). */
export function echoFrom(name: string): string {
  const words = name.split(/\s+/).filter((w) => w.length > 3)
  const pick = words[0] ?? name
  return pick.toUpperCase().slice(0, 10)
}

/** "Arma tu {primera palabra lowercase}" — badge de customizable. */
export function buildLabel(name: string): string {
  return `Arma tu ${name.split(/\s+/)[0]?.toLowerCase() ?? ""}`.trim()
}

/** Customizable = tiene attributes con rol de ingrediente (flujo "arma tu…"). */
export function isCustomizable(p: TemplateProduct): boolean {
  return Boolean(
    p.attributes?.some((a) => a.role === "ingredient-included" || a.role === "ingredient-extra"),
  )
}

export function inStock(p: TemplateProduct): boolean {
  return p.stock == null || p.stock > 0
}

/** Badge de marketing (cards no customizables): featured → Top, compare → -N%. */
export function topBadgeFor(p: TemplateProduct): string | undefined {
  if (p.featured) return "Top"
  if (p.compareAtPrice && p.compareAtPrice > p.price) {
    const pct = Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
    return `-${pct}%`
  }
  return undefined
}

/** Formato de precio del tema (decisión de port: Intl es-VE, spec §1). */
export function makeFmt(currency: string | null | undefined, convert?: (n: number) => number) {
  const c = currency ?? "USD"
  const nf = new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: c,
    minimumFractionDigits: 0,
  })
  return (n: number) => nf.format(convert ? convert(n) : n)
}

/** Hoja SVG decorativa del hero (solo React — parte del template shipping). */
export function Leaf({ style, variant = "a" }: { style?: React.CSSProperties; variant?: "a" | "b" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" style={style} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 10 C 80 25 90 60 60 90 C 30 75 20 40 50 10 Z"
        fill={variant === "a" ? POSTER.green : POSTER.greenLeafB}
      />
      <path d="M50 10 L 60 90" stroke={POSTER.greenStem} strokeWidth="2" />
    </svg>
  )
}

/**
 * CSS compartido del tema: hovers, focus dorado, skip-link, container queries
 * (regla del framework: NUNCA @media — el breakpoint mide el contenedor).
 */
export const POSTER_STYLES = `
.bl-poster-root :is(a, button):focus-visible {
  outline: 2px solid var(--bl-secondary);
  outline-offset: 2px;
}
.bl-poster-skip {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
}
.bl-poster-skip:focus {
  position: absolute; left: 8px; top: 8px; z-index: 100;
  width: auto; height: auto; clip: auto; overflow: visible;
  border-radius: 999px; background: var(--bl-text); color: var(--bl-background);
  padding: 8px 16px; font-size: 14px; font-weight: 700;
}
.bl-poster-pills { scrollbar-width: none; }
.bl-poster-pills::-webkit-scrollbar { display: none; }
.bl-poster-pill-inactive:hover { background: rgba(255,255,255,.15) !important; }
.bl-poster-card { transition: transform .3s ease, box-shadow .3s ease; }
.bl-poster-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 50px -16px rgba(0,0,0,.7) !important;
}
.bl-poster-dish { transition: transform .5s ease; }
.bl-poster-card:hover .bl-poster-dish {
  transform: translate(-50%, -50%) scale(1.04) rotate(-2deg);
}
.bl-poster-echo { display: none; }
.bl-poster-cream-btn { transition: transform .2s ease, background .2s ease; }
.bl-poster-cream-btn:hover:not(:disabled) {
  transform: scale(1.04);
  background: var(--bl-accent) !important;
}
.bl-poster-iconbtn { transition: background .2s ease; }
.bl-poster-iconbtn:hover { background: rgba(255,255,255,.2) !important; }
.bl-poster-ig { transition: transform .2s ease, background .2s ease, color .2s ease; }
.bl-poster-ig:hover {
  transform: translateY(-2px);
  background: var(--bl-secondary) !important;
  color: var(--bl-background) !important;
}
.bl-poster-cartbar { transition: transform .2s ease; }
.bl-poster-cartbar:hover { transform: scale(1.02); }
.bl-poster-sizechip { transition: background .2s ease, border-color .2s ease, color .2s ease; }
.bl-poster-sizechip:not(.is-selected):hover { background: rgba(255,255,255,.1) !important; }
.bl-poster-extrachip { transition: background .2s ease, box-shadow .2s ease; }
.bl-poster-extrachip:not(.is-selected):hover {
  background: color-mix(in srgb, var(--bl-secondary) 20%, transparent) !important;
}
.bl-poster-qtybtn:hover:not(:disabled) { background: rgba(255,255,255,.1) !important; }
.bl-poster-addbtn { transition: transform .2s ease, background .2s ease; }
.bl-poster-addbtn:hover { transform: scale(1.03); background: #962020 !important; }
.bl-poster-ghostbtn:hover { background: rgba(255,255,255,.1) !important; }
.bl-poster-trash:hover { color: #f87171 !important; }
.bl-poster-wa-btn { transition: transform .2s ease, filter .2s ease; }
.bl-poster-wa-btn:hover:not(:disabled) { transform: scale(1.01); filter: brightness(1.05); }
@keyframes bl-poster-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
.bl-poster-pulse { display: inline-block; animation: bl-poster-pulse .3s ease; }

/* ── Grid de posters: 1 → 2 (640) → 3 (1024) → 4 (1280) del CONTENEDOR ── */
@container bl-poster (min-width: 640px) {
  .bl-poster-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 18px !important;
    padding-left: 20px !important;
    padding-right: 20px !important;
    padding-bottom: 150px !important;
  }
  .bl-poster-echo { display: grid; }
  .bl-poster-pills {
    justify-content: center !important;
    flex-wrap: wrap !important;
    overflow: visible !important;
  }
}
@container bl-poster (min-width: 1024px) {
  .bl-poster-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
}
@container bl-poster (min-width: 1280px) {
  .bl-poster-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
}

/* ── Detalle "Arma tu…" (contenedor propio del sheet) ── */
.bl-poster-cart-suffix { display: none; }
@container bl-poster-sheet (min-width: 640px) {
  .bl-poster-sizes { flex-direction: row !important; }
  .bl-poster-sizechip { width: auto !important; flex: 1; }
  .bl-poster-cart-suffix { display: inline; }
}
`
