import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { StorefrontDemo, type StorefrontData } from "@/components/storefront-v2/storefront-demo"
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
interface RawProduct {
  id: string
  attributes?: RawAttribute[]
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

function extractSizes(attrs: RawAttribute[]): string[] {
  return findAttr(attrs, /talla|size/i)?.options ?? []
}

function extractColors(attrs: RawAttribute[]): { name: string; hex: string }[] {
  const a = findAttr(attrs, /color/i, "color")
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
  const [fetched, rawById] = await Promise.all([
    getStoreBySlug(slug),
    fetchRawProducts(slug),
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
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: pickImage(p),
        description: p.description,
        sizes: extractSizes(attrs),
        colors: extractColors(attrs),
      }
    }),
    categories: fetched.categories.map((c) => ({ id: c.id, name: c.name })),
  }

  return <StorefrontDemo data={data} />
}
