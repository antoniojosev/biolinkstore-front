"use client"

import { useState } from "react"
import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"

/**
 * Constantes y helpers del tema noir (spec docs/legacy-theme-specs/noir.md).
 *
 * Regla de tokens: TODA la paleta llega por las CSS vars --bl-* (el seed noir
 * ya trae #0A0A0A/#C9A86C/#F0EDE8/#1A1A1A). La escala de grises del legacy
 * (#888/#666/#555/#444/#333/#222) se deriva con color-mix sobre text↔bg para
 * que los presets noir-calido / noir-contraste sigan funcionando (spec §9).
 */
export const NOIR = {
  bg: "var(--bl-background)",
  text: "var(--bl-text)",
  gold: "var(--bl-accent)",
  /** Hover del CTA dorado (#D4B87A legacy) — oro aclarado, sigue al token. */
  goldHover: "color-mix(in srgb, #fff 12%, var(--bl-accent))",
  border: "var(--bl-border)", // #1A1A1A
  /** Borde de grid #141414 — más tenue que --bl-border. */
  borderGrid: "color-mix(in srgb, var(--bl-border) 75%, var(--bl-background))",
  /** Superficie #111 (drawer, inputs, thumbs) — entre bg y surface. */
  surfaceDeep: "color-mix(in srgb, var(--bl-surface) 60%, var(--bl-background))",
  serif: "var(--bl-heading-font)",
  sans: "var(--bl-body-font)",
} as const

/** Escala de grises legacy: color-mix(text pct%, bg). 55≈#888 · 40≈#666 · 33≈#555 · 26≈#444 · 19≈#333 · 11≈#222. */
export function ink(pct: number): string {
  return `color-mix(in srgb, var(--bl-text) ${pct}%, var(--bl-background))`
}

/** Alpha del oro (badges, hairlines, rings). */
export function goldA(pct: number): string {
  return `color-mix(in srgb, var(--bl-accent) ${pct}%, transparent)`
}

/** Alpha del fondo (overlays de gradiente, barras blur). */
export function bgA(pct: number): string {
  return `color-mix(in srgb, var(--bl-background) ${pct}%, transparent)`
}

/** Alpha del texto (iconos del header cinemático). */
export function textA(pct: number): string {
  return `color-mix(in srgb, var(--bl-text) ${pct}%, transparent)`
}

/** Formato de precio del legacy noir: es-AR sin decimales. */
export function fmtNoirPrice(n: number, currency?: string | null): string {
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

/** inStock del contrato v2: sin stock declarado = disponible. */
export function noirInStock(p: TemplateProduct): boolean {
  return p.stock == null || p.stock > 0
}

/** -N% desde compareAtPrice (badge dorado). */
export function noirDiscount(price: number, compareAtPrice?: number): number | null {
  if (compareAtPrice && compareAtPrice > price) {
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
  }
  return null
}

/**
 * googleFontsHref solo trae pesos 400–700 normales; la serifa noir vive en
 * light/italic (Source Serif 4 300/400/600 + italic — sello del tema). Se
 * carga aparte con ejes ital para el heading font que resuelva el token.
 */
export function noirSerifHref(family: string): string {
  const fam = encodeURIComponent(family)
  return `https://fonts.googleapis.com/css2?family=${fam}:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap`
}

/** Hairline dorada firma (spec §1): variant fuerte (40) o suave (20→10). */
export function Hairline({ variant = "strong" }: { variant?: "strong" | "soft" }) {
  const background =
    variant === "strong"
      ? `linear-gradient(to right, transparent, ${goldA(40)}, transparent)`
      : `linear-gradient(to right, ${goldA(20)}, ${goldA(10)}, transparent)`
  return <div aria-hidden="true" style={{ height: 1, background }} />
}

/** navigator.share con fallback clipboard + check dorado 1.8s (useShare legacy). */
export function useNoirShare() {
  const [copied, setCopied] = useState(false)
  async function share(url: string, title: string) {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        return // usuario canceló
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard bloqueado
    }
  }
  return { share, copied }
}

/**
 * CSS del tema: hovers de card/quick-add y responsive por container query
 * (regla del framework: NUNCA @media). Breakpoint sidebar⇄cinemático en
 * 1024px del contenedor bl-noir; el detail apila en 760px de bl-noir-pd.
 */
export const NOIR_STYLES = `
.bl-noir-sidebar { display: none; }
.bl-noir-feed { max-width: 512px; margin: 0 auto; width: 100%; }
.bl-noir-main { padding-bottom: 128px; }
@container bl-noir (min-width: 1024px) {
  .bl-noir-layout { display: flex; max-width: 1280px; margin: 0 auto; }
  .bl-noir-sidebar { display: block; flex-shrink: 0; }
  .bl-noir-feed { max-width: none; flex: 1; min-width: 0; margin: 0; }
  .bl-noir-mobile-header { display: none !important; }
  .bl-noir-cartbar { display: none !important; }
  .bl-noir-main { padding-bottom: 32px; }
}
.bl-noir-card-img { transition: transform .7s ease; }
.bl-noir-card:hover .bl-noir-card-img { transform: scale(1.05); }
.bl-noir-reveal { opacity: 0; transform: translateY(4px); transition: all .3s ease; }
.bl-noir-card:hover .bl-noir-reveal { opacity: 1; transform: translateY(0); }
.bl-noir-goldbtn { transition: background .2s ease, transform .1s ease; }
.bl-noir-goldbtn:hover:not(:disabled) { background: ${NOIR.goldHover} !important; }
.bl-noir-goldbtn:active:not(:disabled) { transform: scale(0.99); }
.bl-noir-mutedbtn { transition: color .2s ease; }
.bl-noir-mutedbtn:hover { color: ${ink(55)} !important; }
.bl-noir-tabs { scrollbar-width: none; }
.bl-noir-tabs::-webkit-scrollbar { display: none; }
.bl-noir-search::placeholder { color: ${ink(19)}; }
.bl-noir-search:focus-visible { outline: none; }
.bl-noir-thumb-dim { opacity: .4; transition: opacity .3s ease; }
.bl-noir-thumb-dim:hover { opacity: .7; }
.bl-noir-qtybtn { transition: color .2s ease, border-color .2s ease; }
.bl-noir-qtybtn:hover { color: var(--bl-accent) !important; border-color: var(--bl-accent) !important; }
.bl-noir-goldhover { transition: color .2s ease; }
.bl-noir-goldhover:hover { color: var(--bl-accent) !important; }
.bl-noir-trash { transition: color .2s ease; }
.bl-noir-trash:hover { color: ${ink(33)} !important; }

/* ── Detail propio (contenedor bl-noir-pd) ── */
.bl-noir-pd-desktop { display: none; }
@container bl-noir-pd (min-width: 760px) {
  .bl-noir-pd-desktop { display: grid; }
  .bl-noir-pd-mobile { display: none; }
}
`
