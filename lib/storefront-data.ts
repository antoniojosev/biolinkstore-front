// Helpers de datos compartidos entre la página de tienda (app/[slug]/page.tsx)
// y la página de producto (app/[slug]/[productSlug]/page.tsx). Server-safe:
// fetch plano contra los endpoints públicos, sin next/headers.
import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"
import type { Product } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface RawAttribute {
  id: string
  name: string
  type?: string
  options: string[]
  optionsMeta?: Record<string, { hex?: string }> | null
}

export interface RawVariant {
  id: string
  combination: Record<string, string>
  priceAdjustment?: number
  stock?: number | null
  image?: string | null
  isAvailable?: boolean
}

export interface RawProduct {
  id: string
  sku?: string | null
  stock?: number | null
  attributes?: RawAttribute[]
  variants?: RawVariant[]
}

export async function fetchRawProducts(slug: string): Promise<Map<string, RawProduct>> {
  try {
    const res = await fetch(`${API_URL}/api/public/${slug}/products?limit=100`, { cache: "no-store" })
    if (!res.ok) return new Map()
    const json = await res.json()
    const list: RawProduct[] = Array.isArray(json?.data) ? json.data : []
    return new Map(list.map((p) => [p.id, p]))
  } catch {
    return new Map()
  }
}

export interface RawOfficialRate {
  code: string
  valueVes: number
}

/** Público, sin auth — tasa BCV para el toggle USD/Bs del comprador. */
export async function fetchPublicRate(): Promise<RawOfficialRate | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/rates`, { cache: "no-store" })
    if (!res.ok) return null
    const list: RawOfficialRate[] = await res.json()
    return list.find((r) => r.code === "USD_BCV") ?? list[0] ?? null
  } catch {
    return null
  }
}

/** Producto público individual — usado por generateMetadata de la página de producto. */
export interface PublicProductLite {
  id: string
  name: string
  slug: string
  description?: string | null
  basePrice: number
  priceCurrency?: string
  images?: string[]
}

export async function fetchPublicProduct(
  slug: string,
  productSlug: string,
): Promise<PublicProductLite | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/public/${encodeURIComponent(slug)}/products/${encodeURIComponent(productSlug)}`,
      { cache: "no-store" },
    )
    if (!res.ok) return null
    return (await res.json()) as PublicProductLite
  } catch {
    return null
  }
}

function pickImage(p: Product): string | undefined {
  if (p.images && p.images.length > 0) return p.images[0]
  if (p.image) return p.image
  return undefined
}

/** Mapea los productos adaptados (+ crudos con variantes) al shape del renderer. */
export function mapTemplateProducts(
  products: Product[],
  rawById: Map<string, RawProduct>,
): TemplateProduct[] {
  return products.map((p) => {
    const raw = rawById.get(p.id)
    const variants: TemplateProduct["variants"] = (raw?.variants ?? []).map((v) => ({
      id: v.id,
      combination: v.combination,
      priceAdjustment: v.priceAdjustment ?? 0,
      stock: v.stock ?? null,
      image: v.image ?? null,
      isAvailable: v.isAvailable ?? true,
    }))
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.price,
      image: pickImage(p),
      images: p.images,
      description: p.description,
      sku: raw?.sku ?? undefined,
      stock: raw?.stock ?? null,
      variants: variants.length > 0 ? variants : undefined,
    }
  })
}
