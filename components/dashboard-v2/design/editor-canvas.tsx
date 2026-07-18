"use client"

import { useEffect, useState } from "react"
import { fetchTemplatePreview } from "@/lib/page-builder-api"
import type { DraftTheme, Template, PublicStoreTheme } from "@/lib/page-builder-api"
import type { TemplateProduct, TemplateCategory } from "@/components/storefront-v2/template/template-renderer"
import { ThemeRenderer } from "@/components/storefront-v2/themes/registry"
import { useStoreCatalogPreview } from "@/lib/hooks/use-store-catalog-preview"
import type { PreviewDevice } from "./device-toggle"

interface Props {
  template: Template | null
  draft: DraftTheme | null
  selectedKey?: string | null
  onSelectSection?: (key: string) => void
  device?: PreviewDevice
  /** Ancho completo, sin marco de card (móvil real, fase2-P4/P5) — la selección sigue funcionando si se pasan selectedKey/onSelectSection. */
  bare?: boolean
}

export function EditorCanvas({ template, draft, selectedKey, onSelectSection, device = "desktop", bare = false }: Props) {
  const real = useStoreCatalogPreview()
  const [demoProducts, setDemoProducts] = useState<TemplateProduct[]>([])
  const [demoCategories, setDemoCategories] = useState<TemplateCategory[]>([])

  useEffect(() => {
    // Tienda sin productos todavía — mismo fallback a demo data que usa el
    // preview público, para que el canvas no se vea vacío mientras se diseña.
    if (!template || real.isLoading || real.hasProducts) return
    let cancelled = false
    fetchTemplatePreview(template.key).then((demo) => {
      if (cancelled || !demo) return
      setDemoProducts(
        demo.demoData.products.map((dp) => ({
          id: dp.id,
          name: dp.name,
          category: dp.category ?? "",
          price: dp.basePrice,
          image: dp.images?.[0],
          images: dp.images,
          description: dp.description,
          sku: dp.sku,
        })),
      )
      setDemoCategories(demo.demoData.categories.map((c2) => ({ id: c2.id, name: c2.name })))
    })
    return () => {
      cancelled = true
    }
  }, [template, real.isLoading, real.hasProducts])

  if (!real.store || !template) {
    return <div style={S.muted}>Cargando editor…</div>
  }

  const products = real.hasProducts ? real.products : demoProducts
  const categories = real.hasProducts ? real.categories : demoCategories

  const theme: PublicStoreTheme = {
    template: template.key,
    templateVersion: template.version,
    publishedAt: "",
    version: 0,
    tree: draft?.tree ?? { sections: [] },
    tokens: draft?.tokens ?? template.defaultTokens ?? {},
  }

  return (
    <div style={bare ? S.frameBare : device === "mobile" ? S.frameMobile : S.frameDesktop}>
      <ThemeRenderer
        store={real.store}
        products={products}
        categories={categories}
        theme={theme}
        editorSelectedKey={selectedKey ?? undefined}
        onSectionClick={onSelectSection}
      />
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  // > 760px (el breakpoint móvil del renderer) para que el container query
  // no dispare el layout apilado en esta vista. minWidth: 780 asegura que si
  // la ventana es angosta, el canvas scrollee localmente (.canvas tiene
  // overflowX:auto) en vez de que "Desktop" muestre el layout móvil solo por
  // falta de espacio.
  frameDesktop: {
    width: "100%",
    minWidth: 780,
    maxWidth: 1040,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    overflow: "hidden",
    // containing block de los position:fixed del tema (cart bars, sheets) —
    // sin esto se anclan al viewport y flotan sobre el chrome del dashboard.
    contain: "paint",
  },
  // Ancho fijo de iPhone — por debajo del breakpoint, el layout apilado se
  // dispara de verdad (container query, no viewport).
  frameMobile: {
    width: 390,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 24,
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
    overflow: "hidden",
    borderWidth: 8,
    borderStyle: "solid",
    borderColor: "#111",
    contain: "paint",
  },
  // Ancho completo, sin marco — el viewport real del teléfono ya es angosto,
  // así que el container query del renderer apila el layout solo.
  frameBare: { width: "100%", contain: "paint" },
  muted: { margin: "auto", fontSize: 13, color: "var(--ink-3)" },
}
