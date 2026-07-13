"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProductHttpRepository } from "@/lib/products-api/product.http-repository"
import { CategoryHttpRepository } from "@/lib/categories-api/category.http-repository"
import type { ProductResponse } from "@/lib/products-api/types"
import type { CategoryResponse } from "@/lib/categories-api/types"
import { fetchTemplatePreview } from "@/lib/page-builder-api"
import type { DraftTheme, Template, PublicStoreTheme } from "@/lib/page-builder-api"
import { TemplateRenderer, type TemplateProduct, type TemplateCategory, type TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import type { PreviewDevice } from "./device-toggle"

interface Props {
  template: Template | null
  draft: DraftTheme | null
  selectedKey: string | null
  onSelectSection: (key: string) => void
  device?: PreviewDevice
}

function mapRealProduct(p: ProductResponse, categoryNameById: Map<string, string>): TemplateProduct {
  return {
    id: p.id,
    name: p.name,
    category: categoryNameById.get(p.categoryIds?.[0] ?? "") ?? "",
    price: p.basePrice,
    image: p.images?.[0],
    images: p.images,
    description: p.description ?? "",
    sku: p.sku ?? undefined,
    stock: p.stock,
    variants: p.variants.length > 0
      ? p.variants.map((v) => ({
          id: v.id,
          combination: v.combination,
          priceAdjustment: v.priceAdjustment,
          stock: v.stock,
          image: v.image,
          isAvailable: v.isAvailable,
        }))
      : undefined,
  }
}

export function EditorCanvas({ template, draft, selectedKey, onSelectSection, device = "desktop" }: Props) {
  const { http, store } = useAuth()
  const productRepo = useMemo(() => new ProductHttpRepository(http), [http])
  const categoryRepo = useMemo(() => new CategoryHttpRepository(http), [http])
  const [products, setProducts] = useState<TemplateProduct[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])

  useEffect(() => {
    if (!store?.id || !template) return
    let cancelled = false

    Promise.all([
      productRepo.findAll(store.id, { limit: 100, isVisible: true }).catch(() => ({ data: [] as ProductResponse[] })),
      categoryRepo.findAll(store.id).catch(() => ({ data: [] as CategoryResponse[] })),
    ]).then(async ([p, c]) => {
      if (cancelled) return
      if (p.data.length > 0) {
        const categoryNameById = new Map(c.data.map((cat) => [cat.id, cat.name]))
        setProducts(p.data.map((prod) => mapRealProduct(prod, categoryNameById)))
        setCategories(c.data.map((cat) => ({ id: cat.id, name: cat.name })))
        return
      }
      // Tienda sin productos todavía — mismo fallback a demo data que usa el
      // preview público, para que el canvas no se vea vacío mientras se diseña.
      const demo = await fetchTemplatePreview(template.key)
      if (cancelled || !demo) return
      setProducts(
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
      setCategories(demo.demoData.categories.map((c2) => ({ id: c2.id, name: c2.name })))
    })

    return () => {
      cancelled = true
    }
  }, [store?.id, template, productRepo, categoryRepo])

  if (!store || !template) {
    return <div style={S.muted}>Cargando editor…</div>
  }

  const templateStore: TemplateStore = {
    name: store.name,
    slug: store.slug,
    bio: store.description,
    avatar: store.logo,
    address: store.address,
    email: store.email,
    phone: undefined,
    currency: store.currency,
    whatsappNumber: store.whatsappNumbers?.[0],
  }

  const theme: PublicStoreTheme = {
    template: template.key,
    templateVersion: template.version,
    publishedAt: "",
    version: 0,
    tree: draft?.tree ?? { sections: [] },
    tokens: draft?.tokens ?? template.defaultTokens ?? {},
  }

  return (
    <div style={device === "mobile" ? S.frameMobile : S.frameDesktop}>
      <TemplateRenderer
        store={templateStore}
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
  // no dispare el layout apilado en esta vista.
  frameDesktop: {
    width: "100%",
    maxWidth: 1040,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    overflow: "hidden",
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
  },
  muted: { margin: "auto", fontSize: 13, color: "var(--ink-3)" },
}
