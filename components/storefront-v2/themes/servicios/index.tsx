"use client"

import type { TemplateRendererProps } from "@/components/storefront-v2/template/template-renderer"
import { ProfileThemeRenderer } from "@/components/storefront-v2/themes/shared/profile-theme"
import { ProfileProductSheet } from "@/components/storefront-v2/themes/shared/profile-theme/product-sheet"
import { createProfileCartSheet } from "@/components/storefront-v2/themes/shared/profile-theme/cart-sheet"

/**
 * Tema **servicios** — instancia de la base compartida profile-theme
 * (docs/legacy-theme-specs/servicios.md). Byte-idéntico a persona en el
 * legacy salvo los labels: tab 1 "Servicios", stat 2 "Servicios" y título
 * del cart drawer "Servicios".
 */
export function ServiciosRenderer(props: TemplateRendererProps) {
  return (
    <ProfileThemeRenderer
      {...props}
      labels={{ servicesTab: "Servicios", servicesStat: "Servicios" }}
    />
  )
}

/** Detalle propio del tema (idéntico entre persona y servicios). */
export const ServiciosProductSheet = ProfileProductSheet

/** Drawer informacional propio — título "Servicios" (spec servicios §5). */
export const ServiciosCartSheet = createProfileCartSheet("Servicios")
