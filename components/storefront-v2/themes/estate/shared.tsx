"use client"

import { useMemo } from "react"
import type { TemplateProduct, TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import { WhatsAppPaymentProvider } from "@/lib/payment-providers/whatsapp"

/**
 * Constantes visuales del tema estate (spec docs/legacy-theme-specs/estate.md).
 *
 * Regla de tokens: la paleta editable llega por las CSS vars --bl-* (el seed
 * estate ya trae navy #1A3A52 → primary/text, dorado #D4AF37 → accent,
 * #F8F9FA → bg, blanco → surface, grises → muted/border). Los hex literales
 * de abajo son SEMÁNTICOS, no de paleta: verde WhatsApp (marca), emerald/red
 * de estado disponible/no disponible y el overlay negro del contador de fotos
 * (spec §1: "estado/marca, no tema").
 */
export const ESTATE = {
  navy: "var(--bl-primary)",
  gold: "var(--bl-accent)",
  bg: "var(--bl-background)",
  surface: "var(--bl-surface)",
  text: "var(--bl-text)",
  muted: "var(--bl-text-muted)",
  border: "var(--bl-border)",
  heading: "var(--bl-heading-font)",
  body: "var(--bl-body-font)",
  // Identidad semántica (spec §1) — no siguen a la paleta.
  waGreen: "#25D366",
  waGreenHover: "#20BD5A",
  emerald: "#10b981",
  red: "#ef4444",
  photoOverlay: "rgba(0,0,0,.6)",
} as const

/** Alpha del navy (--bl-primary) sin hardcodear el hex. */
export function navy(alphaPct: number): string {
  return `color-mix(in srgb, var(--bl-primary) ${alphaPct}%, transparent)`
}

/** Alpha del dorado (--bl-accent). */
export function gold(alphaPct: number): string {
  return `color-mix(in srgb, var(--bl-accent) ${alphaPct}%, transparent)`
}

// Escala neutra del legacy (grises Tailwind) derivada de los tokens:
// gray-900 → text · gray-600/500 → muted (±) · gray-400 → muted aclarado ·
// gray-200 → border · gray-100/50 → border diluido en surface.
export const GRAY = {
  strong: "var(--bl-text)",
  g600: "color-mix(in srgb, var(--bl-text-muted) 82%, black)",
  g500: "var(--bl-text-muted)",
  g400: "color-mix(in srgb, var(--bl-text-muted) 62%, var(--bl-surface))",
  border200: "var(--bl-border)",
  border100: "color-mix(in srgb, var(--bl-border) 55%, var(--bl-surface))",
  chip100: "color-mix(in srgb, var(--bl-border) 45%, var(--bl-surface))",
  input50: "color-mix(in srgb, var(--bl-border) 22%, var(--bl-surface))",
  skeleton200: "color-mix(in srgb, var(--bl-border) 80%, var(--bl-text-muted))",
} as const

// Radios derivados del token (lg = 16px en el seed): 2xl de cards = token,
// xl = 3/4, lg (badges/thumbs) = 1/2 — mantienen la jerarquía del legacy.
export const RADIUS = {
  xxl: "var(--bl-radius)",
  xl: "calc(var(--bl-radius) * .75)",
  lg: "calc(var(--bl-radius) * .5)",
  md: "calc(var(--bl-radius) * .4)",
} as const

/** Formato de precio del tema (spec §1: Intl es-VE, 0 decimales). */
export function makeFmt(currency: string | null | undefined, convert?: (n: number) => number) {
  const c = currency ?? "USD"
  try {
    const nf = new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: c,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return (n: number) => nf.format(convert ? convert(n) : n)
  } catch {
    // Moneda no-ISO en data demo/manual — fallback manual.
    return (n: number) => `$${Math.round(convert ? convert(n) : n).toLocaleString("es")}`
  }
}

export interface EstateSpecs {
  hab?: string
  bath?: string
  m2?: string
  year?: string
  parking?: string
}

/** Ficha del inmueble desde attributes role='spec' (contrato §3/§4). */
export function specsOf(p: TemplateProduct): EstateSpecs {
  const map: Record<string, string> = {}
  for (const a of p.attributes ?? []) {
    if (a.role === "spec" && a.options[0]) map[a.name] = a.options[0]
  }
  return {
    hab: map["Habitaciones"],
    bath: map["Baños"],
    m2: map["m²"],
    year: map["Año"],
    parking: map["Estacionamiento"],
  }
}

/** Tags desde attributes role='tag'. */
export function tagsOf(p: TemplateProduct): string[] {
  return (p.attributes ?? []).filter((a) => a.role === "tag").flatMap((a) => a.options)
}

export function inStock(p: TemplateProduct): boolean {
  return p.stock == null || p.stock > 0
}

/** Número de WhatsApp de la tienda (fallback al teléfono). */
export function waNumberOf(store: TemplateStore): string | null {
  const n = store.whatsappNumber ?? store.phone
  return n ? n.replace(/\D/g, "") : null
}

/** Provider WhatsApp propio del tema para el checkout de consulta (spec §4/§5). */
export function useEstateWhatsAppProvider(store: TemplateStore) {
  return useMemo(
    () => new WhatsAppPaymentProvider(waNumberOf(store) ?? "", store.currency ?? "USD"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.whatsappNumber, store.phone, store.currency],
  )
}

/**
 * CSS compartido del tema: hovers, focus navy, skeleton pulse, scrollbars
 * ocultos y container queries (regla del framework: NUNCA @media).
 */
export const ESTATE_STYLES = `
.bl-estate-root :is(a, button, input):focus-visible {
  outline: 2px solid color-mix(in srgb, var(--bl-primary) 45%, transparent);
  outline-offset: 2px;
}
.bl-estate-hscroll { scrollbar-width: none; }
.bl-estate-hscroll::-webkit-scrollbar { display: none; }
/* La X de limpiar es propia (spec §2.2) — fuera el cancel nativo de WebKit */
.bl-estate-root input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

@keyframes bl-estate-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
.bl-estate-skeleton { animation: bl-estate-pulse 2s cubic-bezier(.4,0,.6,1) infinite; }

/* Property card (spec §3): shadow-sm → shadow-lg + zoom 105% de la foto */
.bl-estate-card { transition: box-shadow .3s ease; }
.bl-estate-card:hover { box-shadow: 0 10px 30px -8px rgba(0,0,0,.18) !important; }
.bl-estate-card-img { transition: transform .5s ease, opacity .5s ease; }
.bl-estate-card:hover .bl-estate-card-img { transform: scale(1.05); }

.bl-estate-savebtn { transition: all .2s ease; }
.bl-estate-savebtn:not(.is-saved):hover {
  background: var(--bl-surface) !important;
  color: var(--bl-primary) !important;
}
.bl-estate-pill { transition: all .2s ease; }
.bl-estate-pill:not(.is-active):hover { color: var(--bl-text) !important; }
.bl-estate-clearbtn:hover { color: color-mix(in srgb, var(--bl-text-muted) 82%, black) !important; }
.bl-estate-phonebtn { transition: background .2s ease; }
.bl-estate-phonebtn:hover { background: rgba(255,255,255,.2) !important; }
.bl-estate-navbtn { transition: all .2s ease; }
.bl-estate-navbtn:not(.is-saved):hover {
  background: color-mix(in srgb, var(--bl-border) 45%, var(--bl-surface)) !important;
}
.bl-estate-backlink { transition: color .2s ease; }
.bl-estate-backlink:hover { color: var(--bl-primary) !important; }
.bl-estate-thumb { transition: opacity .2s ease, border-color .2s ease; }
.bl-estate-thumb:not(.is-active):hover { opacity: 1 !important; }
.bl-estate-savebig { transition: all .2s ease; }
.bl-estate-savebig:not(.is-saved):hover {
  border-color: var(--bl-primary) !important;
  color: var(--bl-primary) !important;
}
.bl-estate-wabtn { transition: background .2s ease, opacity .2s ease; }
.bl-estate-wabtn:hover:not(:disabled) { background: #20BD5A !important; }
.bl-estate-floatbar { transition: opacity .2s ease, transform .2s ease; }
.bl-estate-floatbar:hover { opacity: .9; }
.bl-estate-floatbar:active { transform: scale(.98); }
.bl-estate-descbtn { transition: color .2s ease; }
.bl-estate-descbtn:hover { color: var(--bl-primary) !important; }
.bl-estate-trash { transition: color .2s ease; }
.bl-estate-trash:hover { color: #ef4444 !important; }

/* ── Grid de propiedades: 1 col → 2 (≥640 del CONTENEDOR, legacy sm:) ── */
@container bl-estate (min-width: 640px) {
  .bl-estate-grid:not(.is-list) { grid-template-columns: repeat(2, 1fr) !important; }
  .bl-estate-pad { padding-left: 24px !important; padding-right: 24px !important; }
}
/* Variante grid-3 del schema (layout del editor) */
@container bl-estate (min-width: 960px) {
  .bl-estate-grid.is-3 { grid-template-columns: repeat(3, 1fr) !important; }
}
`
