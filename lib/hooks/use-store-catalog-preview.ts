"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProductHttpRepository } from "@/lib/products-api/product.http-repository"
import { CategoryHttpRepository } from "@/lib/categories-api/category.http-repository"
import type { ProductResponse } from "@/lib/products-api/types"
import type { CategoryResponse } from "@/lib/categories-api/types"
import type { TemplateProduct, TemplateCategory, TemplateStore } from "@/components/storefront-v2/template/template-renderer"

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

export interface StoreCatalogPreview {
  store: TemplateStore | null
  products: TemplateProduct[]
  categories: TemplateCategory[]
  hasProducts: boolean
  isLoading: boolean
}

/** Datos reales de la tienda del vendedor (no demo), listos para pasar al TemplateRenderer. */
export function useStoreCatalogPreview(): StoreCatalogPreview {
  const { http, store } = useAuth()
  const productRepo = useMemo(() => new ProductHttpRepository(http), [http])
  const categoryRepo = useMemo(() => new CategoryHttpRepository(http), [http])
  const [products, setProducts] = useState<TemplateProduct[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!store?.id) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    setIsLoading(true)
    Promise.all([
      productRepo.findAll(store.id, { limit: 100, isVisible: true }).catch(() => ({ data: [] as ProductResponse[] })),
      categoryRepo.findAll(store.id).catch(() => ({ data: [] as CategoryResponse[] })),
    ]).then(([p, c]) => {
      if (cancelled) return
      const categoryNameById = new Map(c.data.map((cat) => [cat.id, cat.name]))
      setProducts(p.data.map((prod) => mapRealProduct(prod, categoryNameById)))
      setCategories(c.data.map((cat) => ({ id: cat.id, name: cat.name })))
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [store?.id, productRepo, categoryRepo])

  const templateStore: TemplateStore | null = store
    ? {
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
    : null

  return { store: templateStore, products, categories, hasProducts: products.length > 0, isLoading }
}
