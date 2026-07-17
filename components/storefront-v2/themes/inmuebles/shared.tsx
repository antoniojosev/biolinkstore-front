"use client"

import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"

/**
 * Constantes y helpers del tema inmuebles (spec docs/legacy-theme-specs/inmuebles.md,
 * HTML aprobado landing-videos/inmuebles — video 2×, medidas ÷2).
 *
 * Regla de tokens: TODA la paleta llega por las CSS vars --bl-* (seed:
 * primary=navy #1a3550, secondary=ink #0a0a0a, accent=dorado #d4a04f,
 * bg=blanco, surface #f6f5f3, border #e5e3df, muted #4a4a4a). Los únicos hex
 * literales permitidos son IDENTIDAD documentada: verde WhatsApp #25d366
 * (hover del CTA Contactar) y verde online #3bd68a + halo (dot del banner,
 * manda el HTML sobre el #5cb85c del React). Derivados intermedios
 * (#8a8a8a, #ebe9e4, #2a4a6a, #6f9bc7, #2a2a2a) se calculan con color-mix
 * sobre los tokens para que sigan a la paleta.
 */
export const INM = {
  /** Superficies negras: banner de estado, footer, CTAs sólidos, fondo raíz. */
  ink: "var(--bl-secondary)",
  text: "var(--bl-text)",
  navy: "var(--bl-primary)",
  gold: "var(--bl-accent)",
  paper: "var(--bl-background)",
  surface: "var(--bl-surface)",
  border: "var(--bl-border)",
  /** Texto secundario (#4a4a4a). */
  body: "var(--bl-text-muted)",
  /** Labels/categorías (#8a8a8a) — muted aclarado hacia el fondo. */
  muted: "color-mix(in srgb, var(--bl-text-muted) 58%, var(--bl-background))",
  /** Placeholder de imágenes (#ebe9e4). */
  imgPh: "color-mix(in srgb, var(--bl-border) 60%, var(--bl-background))",
  /** Cuerpo de descripción del detalle (#2a2a2a, --ink-soft del HTML). */
  inkSoft: "color-mix(in srgb, var(--bl-text) 88%, var(--bl-background))",
  /** Hover del botón de búsqueda (#2a4a6a — navy aclarado). */
  navyHover: "color-mix(in srgb, var(--bl-primary) 78%, #ffffff)",
  /** Punto del logo en el footer oscuro (#6f9bc7 — navy claro). */
  navyLight: "color-mix(in srgb, var(--bl-primary) 45%, #ffffff)",
  heading: "var(--bl-heading-font)",
  bodyFont: "var(--bl-body-font)",
  // ── Identidad literal (spec §1) ──
  waGreen: "#25d366",
  dotGreen: "#3bd68a",
  dotHalo: "rgba(59,214,138,.25)",
} as const

/** Alpha del blanco de página (nav translúcida, barras sticky). */
export function paper(alphaPct: number): string {
  return `color-mix(in srgb, var(--bl-background) ${alphaPct}%, transparent)`
}

/** Alpha del negro del tema (veladuras, overlays). */
export function ink(alphaPct: number): string {
  return `color-mix(in srgb, var(--bl-secondary) ${alphaPct}%, transparent)`
}

// ── Contrato de datos: attributes role='spec' / role='tag' ───────────────────

/** Mapa nombre→valor de los attributes role='spec' (primera option). */
export function specsOf(p: TemplateProduct): Record<string, string> {
  const map: Record<string, string> = {}
  for (const a of p.attributes ?? []) {
    if (a.role === "spec" && a.options[0]) map[a.name] = a.options[0]
  }
  return map
}

/** Todas las options de los attributes role='tag' (Características). */
export function tagsOf(p: TemplateProduct): string[] {
  const list: string[] = []
  for (const a of p.attributes ?? []) {
    if (a.role === "tag") list.push(...a.options)
  }
  return list
}

export type Operation = "preventa" | "alquilar" | "comprar"

export function detectOperation(p: TemplateProduct): Operation {
  const tags = tagsOf(p).map((t) => t.toLowerCase())
  const op = specsOf(p)["Operación"]?.toLowerCase()
  if (tags.includes("preventa") || op === "preventa") return "preventa"
  if (tags.includes("alquiler") || op === "alquilar" || op === "alquiler") return "alquilar"
  return "comprar"
}

export function isRental(p: TemplateProduct): boolean {
  return detectOperation(p) === "alquilar"
}

export function operationLabel(p: TemplateProduct): string {
  const op = detectOperation(p)
  return op === "alquilar" ? "Alquiler" : op === "preventa" ? "Preventa" : "Venta"
}

/** Estacionamiento con las 3 claves (el seed graba singular — spec §4). */
export function parkingOf(specs: Record<string, string>): string | undefined {
  return specs["Estacionamiento"] ?? specs["Estacionamientos"] ?? specs["Parking"]
}

/** Badge de la card: Nuevo | Preventa | Alquiler | Vendido (spec §3). */
const TAG_LABEL: Record<string, string> = {
  nuevo: "Nuevo",
  preventa: "Preventa",
  alquiler: "Alquiler",
  vendido: "Vendido",
}
export function detectBadge(p: TemplateProduct): { key: string; label: string } | null {
  const lowered = tagsOf(p).map((t) => t.toLowerCase())
  for (const key of Object.keys(TAG_LABEL)) {
    if (lowered.includes(key)) return { key, label: TAG_LABEL[key] }
  }
  return null
}

export function inStock(p: TemplateProduct): boolean {
  return p.stock == null || p.stock > 0
}

export function isSold(p: TemplateProduct): boolean {
  return detectBadge(p)?.key === "vendido" || !inStock(p)
}

/** Referencia visible del listado (spec §4.3 y contrato de copy del HTML). */
export function refOf(p: TemplateProduct): string {
  return p.id.slice(0, 10).toUpperCase()
}

// ── WhatsApp ─────────────────────────────────────────────────────────────────

export function buildWaHref(phone: string | null | undefined, message: string): string | null {
  if (!phone) return null
  const clean = phone.replace(/\D/g, "")
  if (!clean) return null
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

/**
 * Contrato de copy del mensaje de consulta (pantalla 3 del HTML aprobado):
 * incluye la Referencia — spec §6 pide preferir este formato en los CTAs.
 */
export function waInquiryMessage(
  storeName: string,
  product: TemplateProduct,
  priceLabel: string,
  currency: string,
): string {
  return (
    `¡Hola ${storeName}! 👋\n\n` +
    `Me interesa ${product.name} 🏠\n` +
    `Precio: ${priceLabel} ${currency}\n` +
    `Ref: ${refOf(product)}\n\n` +
    `¿Podemos coordinar una visita?`
  )
}

/** Formato de precio del tema: $185,000 — Intl en-US sin decimales (spec §1). */
export function makeFmt(currency: string | null | undefined, convert?: (n: number) => number) {
  const c = currency ?? "USD"
  const nf = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return (n: number) => nf.format(convert ? convert(n) : n)
}

/**
 * CSS compartido: focus, skip-link, hovers y container queries.
 * Regla del framework: NUNCA @media — los breakpoints miden el contenedor
 * (bl-inmuebles en la home, bl-inm-sheet en el detalle propio).
 */
export const INM_STYLES = `
.bl-inm-root :is(a, button):focus-visible,
.bl-inm-sheet :is(a, button):focus-visible {
  outline: 2px solid var(--bl-primary);
  outline-offset: 2px;
}
.bl-inm-skip {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
}
.bl-inm-skip:focus {
  position: absolute; left: 8px; top: 8px; z-index: 200;
  width: auto; height: auto; clip: auto; overflow: visible;
  border-radius: 4px; background: var(--bl-secondary); color: var(--bl-background);
  padding: 8px 12px; font-size: 12px;
}
.bl-inm-scroll-x { scrollbar-width: none; }
.bl-inm-scroll-x::-webkit-scrollbar { display: none; }

/* Hovers (el estado base vive en estilos inline) */
.bl-inm-navlink { transition: color .2s ease; }
.bl-inm-navlink:hover { color: var(--bl-text) !important; }
.bl-inm-btn-dark { transition: background-color .2s ease, transform .2s ease; }
.bl-inm-btn-dark:hover { background: var(--bl-primary) !important; transform: translateY(-1px); }
.bl-inm-btn-dark:active { transform: scale(.99); }
.bl-inm-btn-outline { transition: background-color .2s ease, border-color .2s ease, color .2s ease; }
.bl-inm-btn-outline:hover { background: var(--bl-surface) !important; }
.bl-inm-searchbtn { transition: background-color .2s ease; }
.bl-inm-searchbtn:hover { background: color-mix(in srgb, var(--bl-primary) 78%, #ffffff) !important; }
.bl-inm-searchbtn:active { transform: scale(.95); }
.bl-inm-chip { transition: background-color .2s ease, border-color .2s ease; }
.bl-inm-chip:not(.is-active):hover { background: rgba(255,255,255,.18) !important; border-color: #ffffff !important; }
.bl-inm-oppill { transition: background-color .2s ease, border-color .2s ease, color .2s ease; }
.bl-inm-oppill:not(.is-active):hover { border-color: var(--bl-text) !important; color: var(--bl-text) !important; }
.bl-inm-peek { transition: transform .25s cubic-bezier(.2,.7,.3,1); }
.bl-inm-peek:hover { transform: translateY(-4px); }
.bl-inm-card { transition: transform .25s cubic-bezier(.2,.7,.3,1); }
.bl-inm-card:hover { transform: translateY(-3px); }
.bl-inm-card-img img { transition: transform .5s cubic-bezier(.2,.7,.3,1); }
.bl-inm-card:hover .bl-inm-card-img img { transform: scale(1.04); }
.bl-inm-cta-wa { transition: background-color .2s ease, transform .1s ease; }
.bl-inm-cta-wa:hover { background: #25d366 !important; }
.bl-inm-cta-wa:active { transform: scale(.98); }
.bl-inm-cta-sold { transition: background-color .2s ease, border-color .2s ease, color .2s ease, transform .1s ease; }
.bl-inm-cta-sold:hover {
  background: var(--bl-surface) !important;
  color: var(--bl-text) !important;
  border-color: var(--bl-text) !important;
}
.bl-inm-cta-sold:active { transform: scale(.98); }
.bl-inm-footlink { transition: color .2s ease; }
.bl-inm-footlink:hover { color: #ffffff !important; }
.bl-inm-footicon { transition: background-color .2s ease, border-color .2s ease; }
.bl-inm-footicon:hover { background: rgba(255,255,255,.1) !important; border-color: #ffffff !important; }
.bl-inm-drawerlink .bl-inm-drawer-arrow { opacity: .4; transition: transform .2s ease, opacity .2s ease; }
.bl-inm-drawerlink:hover { color: var(--bl-primary) !important; }
.bl-inm-drawerlink:hover .bl-inm-drawer-arrow { opacity: 1; transform: translateX(4px); }
.bl-inm-thumb { transition: opacity .2s ease; }
.bl-inm-thumb:not(.is-active):hover { opacity: 1 !important; }
.bl-inm-trash { transition: color .2s ease, background-color .2s ease; }
.bl-inm-trash:hover { color: #ef4444 !important; background: rgba(239,68,68,.08) !important; }

/* ── Home (container bl-inmuebles) ── */
.bl-inm-banner-long { display: none; }
.bl-inm-sm { display: none; }
@container bl-inmuebles (min-width: 640px) {
  .bl-inm-banner-long { display: inline; }
  .bl-inm-banner-short { display: none; }
  .bl-inm-sm { display: inline; }
  .bl-inm-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 32px !important; }
  .bl-inm-gridhead { flex-direction: row !important; align-items: flex-end !important; justify-content: space-between !important; }
}
.bl-inm-nav-links { display: none; }
@container bl-inmuebles (min-width: 1024px) {
  .bl-inm-nav-links { display: flex !important; }
  .bl-inm-grid { grid-template-columns: repeat(3, 1fr) !important; }
}
@container bl-inmuebles (min-width: 960px) {
  .bl-inm-about-grid { grid-template-columns: 1.1fr 1fr !important; }
  .bl-inm-about-img { max-width: none !important; margin: 0 !important; }
}
@container bl-inmuebles (min-width: 760px) {
  .bl-inm-footer-grid { grid-template-columns: 1.6fr 1fr 1fr !important; }
  .bl-inm-footer-bottom { flex-direction: row !important; justify-content: space-between !important; }
}

/* ── Detalle propio (container bl-inm-sheet) ── */
.bl-inm-pd-savedbtn { display: none; }
@container bl-inm-sheet (min-width: 640px) {
  .bl-inm-pd-specs { grid-template-columns: repeat(4, 1fr) !important; }
  .bl-inm-tags-grid { grid-template-columns: 1fr 1fr !important; }
  .bl-inm-sm { display: inline; }
  .bl-inm-banner-long { display: inline; }
  .bl-inm-banner-short { display: none; }
}
@container bl-inm-sheet (min-width: 1024px) {
  .bl-inm-pd-gallery {
    grid-template-columns: 1.5fr 1fr !important;
    height: clamp(380px, 60vh, 580px) !important;
    gap: 12px !important;
  }
  .bl-inm-pd-main { height: 100% !important; }
  .bl-inm-pd-thumbs {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    grid-template-rows: 1fr 1fr !important;
    overflow: visible !important;
  }
  .bl-inm-pd-thumb { width: auto !important; height: 100% !important; }
  .bl-inm-pd-listing { grid-template-columns: 1.45fr 1fr !important; gap: 60px !important; }
  .bl-inm-pd-aside { position: sticky !important; top: 110px !important; }
  .bl-inm-pd-sticky { display: none !important; }
  .bl-inm-pd-savedbtn { display: inline-flex !important; }
}
`
