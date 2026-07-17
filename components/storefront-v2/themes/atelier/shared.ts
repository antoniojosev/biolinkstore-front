"use client"

import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"

/**
 * Constantes visuales del tema atelier (spec docs/legacy-theme-specs/atelier.md).
 *
 * Regla de tokens: la paleta editable llega por las CSS vars --bl-* (el seed
 * atelier mapea ink→text/primary, ink-soft→secondary, beige→bg, beige-50→surface,
 * sepia→accent). Los hex de abajo son los DOCUMENTADOS COMO IDENTIDAD en la
 * spec (§1/§8): el bloque Filosofía forest y la ficha de reserva del detail
 * (forest + crema + azul petróleo) no entran en la paleta de 8 tokens y no
 * deben seguir a la paleta — son el sello del tema aprobado en el HTML.
 */
export const ATELIER = {
  serif: "var(--bl-heading-font)", // Fraunces (seed)
  body: "var(--bl-body-font)", // Inter (seed)
  // Filosofía / fondo del detail (spec §1 --forest / crema forest).
  forest: "#1f3330",
  forestSoft: "#2a413d",
  forestCream: "#ece6d7",
  // Ficha de reserva del detail (spec §1 --pd-*).
  pdBlue: "#1b6a8a",
  pdBlueDark: "#155973",
  pdBg: "#faf6ef",
  pdChip: "#e4eef3",
} as const

/** Alpha de ink (--bl-text) sin hardcodear el hex — muted 55 / line 12 (spec §1). */
export function ink(alphaPct: number): string {
  return `color-mix(in srgb, var(--bl-text) ${alphaPct}%, transparent)`
}

/** Alpha del beige base (--bl-background) — nav glass y velos del hero. */
export function beige(alphaPct: number): string {
  return `color-mix(in srgb, var(--bl-background) ${alphaPct}%, transparent)`
}

/** Bordes firma del tema: SIEMPRE alpha de ink, nunca sólidos (spec §1 --line). */
export const LINE = ink(12)
export const MUTED = ink(55)

/** Placeholder de imagen (beige-300 legacy) derivado del token bg. */
export const PLACEHOLDER = "color-mix(in srgb, var(--bl-background) 92%, var(--bl-text))"

/**
 * Fondo de página legacy exacto (spec §1): dos radiales + degradado vertical,
 * derivados del token bg vía color-mix para que la paleta editable lo re-tiña.
 */
export const PAGE_BACKGROUND =
  "radial-gradient(1100px 700px at 100% 0%, color-mix(in srgb, var(--bl-background) 85%, #fff) 0%, transparent 60%), " +
  "radial-gradient(800px 500px at 0% 100%, color-mix(in srgb, var(--bl-background) 92%, var(--bl-text)) 0%, transparent 60%), " +
  "linear-gradient(180deg, color-mix(in srgb, var(--bl-background) 90%, #fff) 0%, color-mix(in srgb, var(--bl-background) 97%, var(--bl-text)) 100%)"

/** 2 iniciales del nombre para el monograma del nav (legacy monogramFromName). */
export function monogramFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  if (parts.length === 0) return "AT"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/** Precio del index legacy: Intl en-US currency sin decimales → "desde $30". */
export function atelierPriceFmt(currency: string): (n: number) => string {
  try {
    const f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return (n: number) => f.format(n)
  } catch {
    return (n: number) => `$${n.toLocaleString("en-US")}`
  }
}

/** Precio de la ficha del detail — el HTML aprobado muestra "US$ 30". */
export function pdPriceFmt(currency: string): (n: number) => string {
  if (currency === "USD")
    return (n: number) => `US$ ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
  return atelierPriceFmt(currency)
}

/** Layout fijo de la galería editorial 12-col (legacy GALLERY_LAYOUT). */
export const GALLERY_LAYOUT: Array<{ colSpan: number; aspect: string }> = [
  { colSpan: 7, aspect: "7/5" },
  { colSpan: 5, aspect: "5/5" },
  { colSpan: 4, aspect: "4/5" },
  { colSpan: 4, aspect: "4/5" },
  { colSpan: 4, aspect: "4/5" },
  { colSpan: 8, aspect: "8/5" },
  { colSpan: 4, aspect: "4/5" },
]

/** Fotos únicas de los productos, máx GALLERY_LAYOUT.length (legacy). */
export function gatherGalleryImages(products: TemplateProduct[], seed: string[] = []): string[] {
  const out: string[] = [...seed]
  const push = (img: string) => {
    if (img && !out.includes(img)) out.push(img)
    return out.length >= GALLERY_LAYOUT.length
  }
  for (const p of products) {
    const imgs = p.images?.length ? p.images : p.image ? [p.image] : []
    for (const img of imgs) if (push(img)) return out.slice(0, GALLERY_LAYOUT.length)
  }
  return out.slice(0, GALLERY_LAYOUT.length)
}

/** Easing firma de los hovers de imagen (spec §6). */
export const EASE = "cubic-bezier(.2,.7,.3,1)"

/**
 * CSS compartido: hovers, focus, skip-link y container queries.
 * Regla del framework: NUNCA @media — el breakpoint mide el contenedor
 * (containerName bl-atelier / bl-atelier-pd), así un preview embebido en un
 * frame angosto muestra el layout móvil real. El styled-jsx legacy de la
 * galería (@media max-width 768) se reescribe acá como container query.
 */
export const ATELIER_STYLES = `
.bl-atelier-root :is(a, button):focus-visible {
  outline: 2px solid var(--bl-accent);
  outline-offset: 2px;
}
.bl-at-skip {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
}
.bl-at-skip:focus {
  position: absolute; left: 8px; top: 8px; z-index: 200;
  width: auto; height: auto; clip: auto; overflow: visible;
  background: var(--bl-primary); color: var(--bl-surface);
  padding: 8px 12px; font-size: 12px; border-radius: 4px;
}
.bl-at-navlinks { display: none; }
.bl-at-navlink { transition: color .2s ease; }
.bl-at-navlink:hover { color: var(--bl-text) !important; }
.bl-at-card .bl-at-service-img img { transition: transform .6s ${EASE}; }
.bl-at-card:hover .bl-at-service-img img { transform: scale(1.03); }
.bl-at-arrow { transition: transform .25s ${EASE}; }
.bl-at-card:hover .bl-at-arrow { transform: translateX(6px); }
.bl-at-cell img { transition: transform .5s ${EASE}; }
.bl-at-cell:hover img { transform: scale(1.02); }
.bl-at-wa { transition: background-color .2s ease, transform .2s ease; }
.bl-at-wa:hover { background: var(--bl-accent) !important; transform: translateY(-1px); }
.bl-at-icon { transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .2s ease; }
.bl-at-icon:hover {
  background: var(--bl-primary) !important;
  color: var(--bl-surface) !important;
  border-color: var(--bl-primary) !important;
  transform: translateY(-2px);
}
.bl-at-featured { display: none; }
.bl-at-heroaside { display: none; }

/* ── Detail (ficha de reserva) ── */
.bl-at-pd-cta { transition: transform .2s ease, opacity .2s ease; }
.bl-at-pd-cta:hover:not(:disabled) { transform: scale(1.02); }
.bl-at-pd-cta:active:not(:disabled) { transform: scale(.97); }
.bl-at-pd-back { transition: opacity .2s ease; }
.bl-at-pd-back:hover { opacity: .65; }
.bl-at-pd-thumb { transition: border-color .2s ease, box-shadow .2s ease; }
.bl-at-pd-qty { transition: filter .15s ease; }
.bl-at-pd-qty:hover:not(:disabled) { filter: brightness(.95); }

/* ── Breakpoints del CONTENEDOR ── */
@container bl-atelier (min-width: 640px) {
  .bl-at-pillars { grid-template-columns: repeat(4, 1fr) !important; }
  .bl-at-heroaside { display: block !important; }
}
@container bl-atelier (min-width: 768px) {
  .bl-at-navlinks { display: flex !important; }
  .bl-at-featured { display: flex !important; }
  .bl-at-services { grid-template-columns: repeat(2, 1fr) !important; column-gap: 40px !important; row-gap: 60px !important; }
  .bl-at-service-img { aspect-ratio: 5 / 4 !important; }
  .bl-at-gallery { grid-template-columns: repeat(12, 1fr) !important; gap: 14px !important; padding-left: 14px !important; padding-right: 14px !important; }
  .bl-at-gallery > li { grid-column: var(--at-span) !important; aspect-ratio: var(--at-aspect) !important; }
}
`
