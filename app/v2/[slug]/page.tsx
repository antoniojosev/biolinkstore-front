import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { StorefrontDemo, type StorefrontData } from "@/components/storefront-v2/storefront-demo"
import { getStoreBySlug } from "@/lib/api"
import type { Product } from "@/lib/types"

interface Props {
  params: Promise<{ slug: string }>
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

export default async function StorefrontV2Page({ params }: Props) {
  const { slug } = await params
  const fetched = await getStoreBySlug(slug)
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
    products: fetched.products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      image: pickImage(p),
      description: p.description,
    })),
    categories: fetched.categories.map((c) => ({ id: c.id, name: c.name })),
  }

  return <StorefrontDemo data={data} />
}
