"use client"

import { useState } from "react"
import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"

/**
 * Constantes y helpers del tema rosier (spec docs/legacy-theme-specs/rosier.md;
 * fuente primaria: HTML aprobado landing-videos/rosier/index.html).
 *
 * Regla de tokens (spec §9): rose → --bl-primary · ink → --bl-secondary (y
 * --bl-text) · bg/crema/bordes/muted → sus tokens. Derivados (glass del nav,
 * rose-dark hover, ink-soft, líneas suaves) via color-mix sobre los tokens
 * para que cualquier preset de paleta siga funcionando.
 */
export const RS = {
  rose: "var(--bl-primary)",
  /** Hover del CTA rose (#9b2237 legacy) — rose oscurecido, sigue al token. */
  roseDark: "color-mix(in srgb, var(--bl-primary) 78%, #000)",
  ink: "var(--bl-secondary)",
  /** ink-soft #5a4b48 — texto secundario/iconos. */
  inkSoft: "color-mix(in srgb, var(--bl-text) 75%, var(--bl-background))",
  muted: "var(--bl-text-muted)",
  bg: "var(--bl-background)",
  bgSoft: "var(--bl-surface)",
  line: "var(--bl-border)",
  /** --line-soft #f0e7de. */
  lineSoft: "color-mix(in srgb, var(--bl-border) 55%, var(--bl-background))",
  /** #ead9c6 (CTA disabled / placeholders) derivado de muted+surface. */
  cream2: "color-mix(in srgb, var(--bl-text-muted) 20%, var(--bl-surface))",
  /** Glass firma de navs: rgba(253,250,246,0.92). */
  glass: "color-mix(in srgb, var(--bl-background) 92%, transparent)",
  glass96: "color-mix(in srgb, var(--bl-background) 96%, transparent)",
  serif: "var(--bl-heading-font)",
  sans: "var(--bl-body-font)",
  /** Easing firma del HTML. */
  ease: "cubic-bezier(.2,.7,.3,1)",
} as const

/** Alpha del ink (overlays del drawer, gradientes de labels, stats glass). */
export function inkA(pct: number): string {
  return `color-mix(in srgb, var(--bl-secondary) ${pct}%, transparent)`
}

/** Alpha del rose (dots del marquee, glow). */
export function roseA(pct: number): string {
  return `color-mix(in srgb, var(--bl-primary) ${pct}%, transparent)`
}

/** Alpha de blanco — texto/bordes sobre bloques rose e ink (literal del HTML). */
export function whiteA(pct: number): string {
  return `color-mix(in srgb, #fff ${pct}%, transparent)`
}

/** Formato de precio del legacy rosier: es-AR sin decimales ("US$ 89"). */
export function fmtRosierPrice(n: number, currency?: string | null): string {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency ?? "USD",
      minimumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${n.toLocaleString("es")}`
  }
}

export function rosierInStock(p: TemplateProduct): boolean {
  return p.stock == null || p.stock > 0
}

export function rosierDiscount(price: number, compareAtPrice?: number): number | null {
  if (compareAtPrice && compareAtPrice > price) {
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
  }
  return null
}

/** Pool de swatches del legacy (spec §1) — fallback cuando el producto no trae atributo Color con hex. */
export const SWATCH_POOL = ["#9b2237", "#1a1413", "#d4a857", "#c49a6c", "#f1e4cf", "#2e4a3c"]

/** Hex reales de optionsMeta del atributo Color; fallback al pool por hash de id. */
export function swatchesFor(p: TemplateProduct): string[] {
  const colorAttr = p.attributes?.find((a) => a.type === "color")
  if (colorAttr?.optionsMeta) {
    const hexes = colorAttr.options
      .map((o) => colorAttr.optionsMeta?.[o]?.hex)
      .filter((h): h is string => Boolean(h))
    if (hexes.length > 0) return hexes.slice(0, 3)
  }
  return SWATCH_POOL.slice(0, 2 + (hashOf(p.id) % 2))
}

function hashOf(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

/**
 * Rating decorativo estable por producto (spec §9): el HTML varía la cifra
 * por producto (4.9 (124), 4.8 (98), 4.7 (76), 4.9 (52)).
 */
export function ratingFor(id: string): { score: string; count: number } {
  const h = hashOf(id)
  const score = (4.6 + (h % 4) * 0.1).toFixed(1)
  const count = 40 + (h % 110)
  return { score, count }
}

/** Título con la última palabra en em italic rose (HTML: "Vestido *Sienna*"). */
export function splitTitle(name: string): { head: string; em: string } {
  const words = name.trim().split(/\s+/)
  if (words.length < 2) return { head: "", em: name }
  const em = words.pop() as string
  return { head: words.join(" ") + " ", em }
}

/**
 * googleFontsHref no trae itálicas; Fraunces italic es la voz de marca del
 * tema (marca, ems, marquee) — se carga aparte con ejes ital.
 */
export function rosierSerifHref(family: string): string {
  const fam = encodeURIComponent(family)
  return `https://fonts.googleapis.com/css2?family=${fam}:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&display=swap`
}

/** navigator.share con fallback clipboard + check 1.6s. */
export function useRosierShare() {
  const [copied, setCopied] = useState(false)
  async function share(url: string, title: string) {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard bloqueado
    }
  }
  return { share, copied }
}

/**
 * CSS del tema: marquee infinito 28s (pausa con prefers-reduced-motion),
 * hovers con el easing firma y responsive por container query — NUNCA @media.
 * bl-rosier: hero apila <760, productos 2→3→4 col, categorías scroller⇄grid-6,
 * testimonios scroller⇄3col, bottom-nav/pb solo mobile, nav links desktop.
 */
export const ROSIER_STYLES = `
@keyframes bl-rosier-marquee { to { transform: translateX(-50%); } }
.bl-rosier-marquee { animation: bl-rosier-marquee 28s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .bl-rosier-marquee { animation: none !important; }
}

.bl-rosier-root { padding-bottom: 68px; }
.bl-rosier-navlinks { display: none; }
.bl-rosier-hero { display: grid; grid-template-rows: minmax(420px, 58dvh) minmax(340px, 48dvh); }
.bl-rosier-products { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px 14px; row-gap: 20px; }
.bl-rosier-cats { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.bl-rosier-cats::-webkit-scrollbar { display: none; }
.bl-rosier-cat { flex-shrink: 0; width: 150px; scroll-snap-align: start; }
.bl-rosier-testimonials { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.bl-rosier-testimonials::-webkit-scrollbar { display: none; }
.bl-rosier-testimonial { flex-shrink: 0; width: 82%; scroll-snap-align: start; }
.bl-rosier-footer-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
.bl-rosier-section { padding: 56px 20px; }

@container bl-rosier (min-width: 760px) {
  .bl-rosier-root { padding-bottom: 0 !important; }
  .bl-rosier-bottomnav { display: none !important; }
  .bl-rosier-navlinks { display: flex; }
  .bl-rosier-hero { grid-template-rows: none; grid-template-columns: 1fr 1fr; min-height: 82dvh; }
  .bl-rosier-heroblock { padding: 96px 64px !important; }
  .bl-rosier-products { grid-template-columns: repeat(3, 1fr); gap: 20px 20px; row-gap: 32px; }
  .bl-rosier-cats { display: grid; grid-template-columns: repeat(6, 1fr); overflow: visible; }
  .bl-rosier-cat { width: auto; }
  .bl-rosier-testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; overflow: visible; }
  .bl-rosier-testimonial { width: auto; }
  .bl-rosier-footer-grid { grid-template-columns: 1.6fr 1fr 1fr; gap: 40px; }
  .bl-rosier-section { padding: 88px 56px; }
}
@container bl-rosier (min-width: 1280px) {
  .bl-rosier-products { grid-template-columns: repeat(4, 1fr); gap: 24px 24px; row-gap: 40px; }
}

.bl-rosier-imghover img { transition: transform .6s ${RS.ease}; }
.bl-rosier-imghover:hover img { transform: scale(1.05); }
.bl-rosier-cathover { transition: transform .3s ${RS.ease}; }
.bl-rosier-cathover:hover { transform: translateY(-4px); }
.bl-rosier-cathover:hover img { transform: scale(1.06); }
.bl-rosier-roundbtn { transition: background .2s ease; }
.bl-rosier-roundbtn:hover { background: var(--bl-surface) !important; }
.bl-rosier-cta-ink { transition: background .2s ease, transform .1s ease; }
.bl-rosier-cta-ink:hover:not(:disabled) { background: ${RS.rose} !important; }
.bl-rosier-cta-ink:active:not(:disabled) { transform: scale(0.98); }
.bl-rosier-cta-rose { transition: background .2s ease, transform .1s ease; }
.bl-rosier-cta-rose:hover:not(:disabled) { background: ${RS.roseDark} !important; }
.bl-rosier-cta-rose:active:not(:disabled) { transform: scale(0.99); }
.bl-rosier-cta-white { transition: background .2s ease, color .2s ease; }
.bl-rosier-cta-white:hover { background: ${RS.ink} !important; color: #fff !important; }
.bl-rosier-cta-outline-white { transition: background .2s ease, border-color .2s ease; }
.bl-rosier-cta-outline-white:hover { background: ${whiteA(10)} !important; border-color: #fff !important; }
.bl-rosier-rosehover { transition: color .2s ease; }
.bl-rosier-rosehover:hover { color: ${RS.rose} !important; }
.bl-rosier-menu-item .bl-rosier-arrow { opacity: .4; transition: all .2s ease; }
.bl-rosier-menu-item:hover .bl-rosier-arrow { opacity: 1; transform: translateX(4px); }
.bl-rosier-seeall { transition: color .2s ease, border-color .2s ease, gap .2s ease; }
.bl-rosier-seeall:hover { color: ${RS.rose} !important; border-color: ${RS.rose} !important; gap: 10px !important; }
.bl-rosier-thumb-dim { opacity: .6; transition: opacity .2s ease; }
.bl-rosier-thumb-dim:hover { opacity: .9; }
.bl-rosier-sizebtn { transition: all .2s ease; }
.bl-rosier-sizebtn:not(:disabled):not(.is-selected):hover { border-color: var(--bl-secondary) !important; }

/* ── Detail propio (contenedor bl-rosier-pd) ── */
.bl-rosier-pd-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
.bl-rosier-pd-ctainline { display: none; }
@container bl-rosier-pd (min-width: 760px) {
  .bl-rosier-pd-grid { grid-template-columns: 1fr 1fr; gap: 56px; }
  .bl-rosier-pd-arrow { display: none !important; }
  .bl-rosier-pd-ctabar { display: none !important; }
  .bl-rosier-pd-ctainline { display: flex; }
}
`
