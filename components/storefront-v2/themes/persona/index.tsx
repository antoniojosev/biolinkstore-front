"use client"

import type { TemplateRendererProps } from "@/components/storefront-v2/template/template-renderer"
import { ProfileThemeRenderer } from "@/components/storefront-v2/themes/shared/profile-theme"
import { ProfileProductSheet } from "@/components/storefront-v2/themes/shared/profile-theme/product-sheet"
import { createProfileCartSheet } from "@/components/storefront-v2/themes/shared/profile-theme/cart-sheet"

/**
 * Tema **persona** — instancia de la base compartida profile-theme
 * (docs/legacy-theme-specs/persona.md). El legacy persona ≡ servicios salvo
 * 3 strings (spec §0):
 *
 * - Tab 1: "Persona" (fallback cuando la sección grid no define `title`).
 * - Stat 2: el literal legacy era "Persona" (artefacto de find/replace del
 *   rename); se porta como "Servicios", el fallback legible que la propia
 *   spec recomienda (§0.2). Ambos son solo defaults: seed/editor mandan.
 * - Título del cart drawer: "Persona".
 */
export function PersonaRenderer(props: TemplateRendererProps) {
  return (
    <ProfileThemeRenderer
      {...props}
      labels={{ servicesTab: "Persona", servicesStat: "Servicios" }}
    />
  )
}

/** Detalle propio del tema (idéntico entre persona y servicios). */
export const PersonaProductSheet = ProfileProductSheet

/** Drawer informacional propio — título "Persona" (spec persona §5). */
export const PersonaCartSheet = createProfileCartSheet("Persona")
