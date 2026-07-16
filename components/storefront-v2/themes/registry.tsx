"use client"

import type { ComponentType } from "react"
import {
  TemplateRenderer,
  type TemplateRendererProps,
} from "@/components/storefront-v2/template/template-renderer"
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
 */
const THEME_RENDERERS: Record<string, ComponentType<TemplateRendererProps>> = {
  persona: PersonaRenderer,
}

/**
 * Punto único de despacho: renderer custom si el template lo registró,
 * catálogo base para todos los demás. El key sale de theme.template, así
 * que los 4 contextos (tienda pública, canvas del editor, preview de Temas,
 * probador) despachan igual sin props extra.
 */
export function ThemeRenderer(props: TemplateRendererProps) {
  const Custom = THEME_RENDERERS[props.theme.template]
  if (Custom) return <Custom {...props} />
  return <TemplateRenderer {...props} />
}
