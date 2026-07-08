import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { StorefrontDemo, type StorefrontData } from "@/components/storefront-v2/storefront-demo"
import { TemplateRenderer } from "@/components/storefront-v2/template/template-renderer"
import { fetchPublicTheme } from "@/lib/page-builder-api"
import { getStoreBySlug } from "@/lib/api"
import type { Product } from "@/lib/types"

interface Props {
  params: Promise<{ slug: string }>
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
  isAvailable?: boolean
}
interface RawProduct {
  id: string
  attributes?: RawAttribute[]
  variants?: RawVariant[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (!data) return { title: "Tienda no encontrada — bylink" }
  return {
    title: `${data.store.name} — bylink`,
    description: data.store.bio ?? `Catálogo de ${data.store.name} en bylink.`,
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
function extractSizes(attrs: RawAttribute[]): string[] {
  return sizeAttr(attrs)?.options ?? []
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

export default async function StorefrontV2Page({ params }: Props) {
  const { slug } = await params
  const [fetched, rawById, theme] = await Promise.all([
    getStoreBySlug(slug),
    fetchRawProducts(slug),
    fetchPublicTheme(slug),
  ])
  if (!fetched) notFound()

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
  // templated renderer (palette + typography + section tree). Otherwise
  // fall back to the legacy mobile WhatsApp WOW storefront.
  if (theme?.tree?.sections?.length) {
    return (
      <TemplateRenderer
        store={{
          name: fetched.store.name,
          username: fetched.store.username,
          bio: fetched.store.bio,
          avatar: fetched.store.avatar,
          slug: fetched.store.slug,
          whatsappNumber: fetched.store.whatsappNumbers?.[0],
          currency: fetched.store.currency,
        }}
        products={fetched.products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          image: pickImage(p),
          description: p.description,
        }))}
        categories={fetched.categories.map((c) => ({ id: c.id, name: c.name }))}
        theme={theme}
      />
    )
  }

  return <StorefrontDemo data={data} />
}
