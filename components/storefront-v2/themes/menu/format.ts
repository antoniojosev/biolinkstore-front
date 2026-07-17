// Helpers compartidos del tema menu (renderer + sheets propios).

/**
 * Formato de precio del legacy menu: es-AR, sin decimales (ej. "$ 1.100").
 * Guard por si la currency de la tienda no es un código ISO válido.
 */
export function fmtMenuPrice(n: number, currency?: string | null): string {
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
export function productInStock(p: { stock?: number | null }): boolean {
  return p.stock == null || p.stock > 0
}

// Equivalentes tokenizados de la escala de grises Tailwind del legacy.
// gray-900→text · gray-500/600→text-muted · gray-400/300→muted diluido.
export const GRAY_400 = "color-mix(in srgb, var(--bl-text-muted) 70%, transparent)"
export const GRAY_300 = "color-mix(in srgb, var(--bl-text-muted) 45%, transparent)"
// rgba(255,248,240,.85|.95) del legacy, derivado del token de fondo.
export const BG_BLUR_85 = "color-mix(in srgb, var(--bl-background) 85%, transparent)"
export const BG_BLUR_95 = "color-mix(in srgb, var(--bl-background) 95%, transparent)"
// bg-white/75 del overlay "Agotado", derivado de la superficie.
export const SURFACE_75 = "color-mix(in srgb, var(--bl-surface) 75%, transparent)"
// border-gray-100 de las cards (más tenue que --bl-border).
export const BORDER_SOFT = "color-mix(in srgb, var(--bl-border) 55%, transparent)"
// bg-gray-100 de placeholders de imagen / botones secondary.
export const SURFACE_DIM = "color-mix(in srgb, var(--bl-border) 45%, var(--bl-surface))"
