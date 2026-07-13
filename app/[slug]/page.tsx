import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { StorefrontDemo, type StorefrontData } from "@/components/storefront-v2/storefront-demo"
import { StorefrontClient } from "@/components/storefront-v2/template/storefront-client"
import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"
import { fetchPublicTheme } from "@/lib/page-builder-api"
import { fetchDraftPreview, type DraftPreviewProduct } from "@/lib/page-builder-api/draft-preview"
import { getStoreBySlug } from "@/lib/api"
import type { Product } from "@/lib/types"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface RawAttribute {
  id: string
  name: string
  type?: string
  options: string[]
  optionsMeta?: Record<string, { hex?: string }> | null
}
interface RawVariant {
  id: string
  combination: Record<string, string>
  priceAdjustment?: number
  stock?: number | null
  image?: string | null
  isAvailable?: boolean
}
interface RawProduct {
  id: string
  sku?: string | null
  stock?: number | null
  attributes?: RawAttribute[]
  variants?: RawVariant[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (!data) return { title: "Tienda no encontrada — ByLink" }

  const { store } = data
  const title = `${store.name} — ByLink`
  const description = store.bio ?? `Catálogo de ${store.name} en ByLink. Cotizá por WhatsApp.`
  const image = store.avatar ?? store.coverImage ?? "https://bylink.app/og-default.png"
  const url = `https://bylink.app/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "ByLink",
      title,
      description,
      url,
      images: [{ url: image, width: 800, height: 800, alt: store.name }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [image],
    },
  }
}

function pickImage(p: Product): string | undefined {
  if (p.images && p.images.length > 0) return p.images[0]
  if (p.image) return p.image
  return undefined
}

function findAttr(attrs: RawAttribute[], match: RegExp, type?: string): RawAttribute | undefined {
  return attrs.find((a) => match.test(a.name) || (type && a.type === type))
}

function sizeAttr(attrs: RawAttribute[]): RawAttribute | undefined {
  return findAttr(attrs, /talla|size/i)
}
function colorAttr(attrs: RawAttribute[]): RawAttribute | undefined {
  return findAttr(attrs, /color/i, "color")
}
function extractColors(attrs: RawAttribute[]): { name: string; hex: string }[] {
  const a = colorAttr(attrs)
  if (!a) return []
  return a.options.map((opt) => ({ name: opt, hex: a.optionsMeta?.[opt]?.hex ?? "#94A3B8" }))
}

async function fetchRawProducts(slug: string): Promise<Map<string, RawProduct>> {
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

interface RawOfficialRate {
  code: string
  valueVes: number
}

/** Público, sin auth — tasa BCV para el toggle USD/Bs del comprador. */
async function fetchPublicRate(): Promise<RawOfficialRate | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/rates`, { cache: "no-store" })
    if (!res.ok) return null
    const list: RawOfficialRate[] = await res.json()
    return list.find((r) => r.code === "USD_BCV") ?? list[0] ?? null
  } catch {
    return null
  }
}

/** Maps the vendor-only draft-preview product shape into TemplateProduct. */
function mapPreviewProduct(
  p: DraftPreviewProduct,
  categoryNameById: Map<string, string>,
): TemplateProduct {
  return {
    id: p.id,
    name: p.name,
    category: p.category ?? (p.categoryIds?.[0] ? categoryNameById.get(p.categoryIds[0]) : undefined) ?? "",
    price: p.basePrice,
    image: p.images?.[0],
    images: p.images,
    description: p.description ?? "",
    sku: p.sku ?? undefined,
    stock: p.stock ?? null,
    variants:
      p.variants && p.variants.length > 0
        ? p.variants.map((v) => ({
            id: v.id,
            combination: v.combination,
            priceAdjustment: v.priceAdjustment ?? 0,
            stock: v.stock ?? null,
            image: v.image ?? null,
            isAvailable: v.isAvailable ?? true,
          }))
        : undefined,
  }
}

export default async function StorePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview } = await searchParams
  const [fetched, rawById, theme, rate] = await Promise.all([
    getStoreBySlug(slug),
    fetchRawProducts(slug),
    fetchPublicTheme(slug),
    fetchPublicRate(),
  ])
  if (!fetched) notFound()

  const draftPreview = preview === "true" ? await fetchDraftPreview(fetched.store.id) : null

  const data: StorefrontData = {
    store: {
      name: fetched.store.name,
      username: fetched.store.username,
      bio: fetched.store.bio,
      avatar: fetched.store.avatar,
      slug: fetched.store.slug,
      whatsappNumber: fetched.store.whatsappNumbers?.[0],
      currency: fetched.store.currency,
    },
    products: fetched.products.map((p) => {
      const raw = rawById.get(p.id)
      const attrs = raw?.attributes ?? []
      const sAttr = sizeAttr(attrs)
      const cAttr = colorAttr(attrs)
      const variants = (raw?.variants ?? []).map((v) => ({
        id: v.id,
        combination: v.combination,
        isAvailable: v.isAvailable ?? true,
      }))
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: pickImage(p),
        description: p.description,
        sizes: sAttr?.options ?? [],
        colors: extractColors(attrs),
        sizeAttrName: sAttr?.name,
        colorAttrName: cAttr?.name,
        variants: variants.length > 0 ? variants : undefined,
      }
    }),
    categories: fetched.categories.map((c) => ({ id: c.id, name: c.name })),
  }

  // BE-120: when the store has a published theme, render through the
  // templated renderer (palette + typography + section tree) with a real
  // cart + checkout. Otherwise fall back to the legacy mobile WhatsApp WOW
  // storefront (in practice unreachable — the backend always returns a
  // fallback theme — but kept for defensive robustness).
  //
  // ?preview=true (only honored when the request carries the vendor's own
  // session cookie for this store — see fetchDraftPreview) overlays the
  // unpublished draft tree/tokens + live products on top of the published
  // storefront, so "Abrir preview" in the theme editor shows real drafts.
  if (draftPreview || theme?.tree?.sections?.length) {
    const effectiveTheme = draftPreview
      ? {
          template: draftPreview.template,
          templateVersion: draftPreview.templateVersion,
          publishedAt: "",
          version: 0,
          tree: draftPreview.tree,
          tokens: draftPreview.tokens,
        }
      : theme!

    const categoryNameById = new Map((draftPreview?.categories ?? []).map((c) => [c.id, c.name]))

    const templateProducts: TemplateProduct[] = draftPreview
      ? draftPreview.products.map((p) => mapPreviewProduct(p, categoryNameById))
      : fetched.products.map((p) => {
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

    const categories = draftPreview
      ? draftPreview.categories.map((c) => ({ id: c.id, name: c.name }))
      : fetched.categories.map((c) => ({ id: c.id, name: c.name }))

    return (
      <StorefrontClient
        store={{
          name: fetched.store.name,
          username: fetched.store.username,
          bio: fetched.store.bio,
          avatar: fetched.store.avatar,
          slug: fetched.store.slug,
          whatsappNumber: fetched.store.whatsappNumbers?.[0],
          currency: fetched.store.currency,
          address: (draftPreview?.store.address as string | undefined) ?? fetched.store.address,
          socials: fetched.store.socials,
        }}
        products={templateProducts}
        categories={categories}
        theme={effectiveTheme}
        rate={rate}
      />
    )
  }

  return <StorefrontDemo data={data} />
}
