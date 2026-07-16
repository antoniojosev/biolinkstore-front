"use client"

import type { ComponentType } from "react"
import {
  TemplateRenderer,
  type TemplateProduct,
  type TemplateRendererProps,
  type TemplateStore,
} from "@/components/storefront-v2/template/template-renderer"
import type { PaymentProvider } from "@/lib/payment-providers/types"
import { PersonaRenderer } from "./persona"

/**
 * Registro de renderers custom por tema (Fase E del framework de temas).
 *
 * La mayoría de los temas NO están acá: se componen con secciones del
 * catálogo base y los dibuja TemplateRenderer. Un tema entra al registro
 * solo cuando su diseño necesita libertad que el sistema de secciones no
 * da (layouts propios, interacciones como tabs, etc.). El contrato es
 * TemplateRendererProps completo: tokens del tema (no colores propios),
 * árbol de secciones respetado (orden/visibilidad/props + selección del
 * editor), productHref para navegar a la página de producto, y responsive
 * por container query. Ver igsotre-back/docs/theme-framework.md.
 *
 * Además del renderer, un tema puede traer sus overlays PROPIOS — en los
 * temas legacy el detalle de producto y el carrito eran parte del diseño
 * (cart-drawer.tsx / product-detail.tsx por tema). Sin slots registrados se
 * usan los sheets genéricos.
 */
export interface ThemeProductSheetProps {
  product: TemplateProduct | null
  store: TemplateStore
  onClose: () => void
}

export interface ThemeCartSheetProps {
  store: TemplateStore
  paymentProvider: PaymentProvider
}

interface ThemeEntry {
  Renderer: ComponentType<TemplateRendererProps>
  /** Detalle propio del tema (sheet/modal). Lo usan los previews; la tienda
   *  pública navega a la página de producto salvo que el tema no la use. */
  ProductSheet?: ComponentType<ThemeProductSheetProps>
  /** Carrito propio del tema (drawer/barra de pedido). */
  CartSheet?: ComponentType<ThemeCartSheetProps>
}

const THEME_REGISTRY: Record<string, ThemeEntry> = {
  persona: { Renderer: PersonaRenderer },
}

/** Overlays propios del tema (o undefined → el caller usa los genéricos). */
export function getThemeOverlays(templateKey: string): Pick<ThemeEntry, "ProductSheet" | "CartSheet"> {
  const entry = THEME_REGISTRY[templateKey]
  return { ProductSheet: entry?.ProductSheet, CartSheet: entry?.CartSheet }
}

/**
 * Punto único de despacho: renderer custom si el template lo registró,
 * catálogo base para todos los demás. El key sale de theme.template, así
 * que los 4 contextos (tienda pública, canvas del editor, preview de Temas,
 * probador) despachan igual sin props extra.
 */
export function ThemeRenderer(props: TemplateRendererProps) {
  const Custom = THEME_REGISTRY[props.theme.template]?.Renderer
  if (Custom) return <Custom {...props} />
  return <TemplateRenderer {...props} />
}
