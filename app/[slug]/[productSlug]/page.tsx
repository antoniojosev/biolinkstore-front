import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ProductPageClient } from "@/components/storefront-v2/template/product-page-client"
import { fetchPublicTheme } from "@/lib/page-builder-api"
import { getStoreBySlug } from "@/lib/api"
import {
  fetchPublicProduct,
  fetchPublicRate,
  fetchRawProducts,
  mapTemplateProducts,
} from "@/lib/storefront-data"

interface Props {
  params: Promise<{ slug: string; productSlug: string }>
}

/**
 * Página propia de cada producto — obligatoria en todos los temas (se
 * renderiza una vez en la capa base, estilizada por los tokens del tema).
 * El OG sale server-rendered a propósito: el crawler de WhatsApp no ejecuta
 * JS, y este link se comparte principalmente por WhatsApp.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productSlug } = await params
  const [product, storeData] = await Promise.all([
    fetchPublicProduct(slug, productSlug),
    getStoreBySlug(slug),
  ])
  if (!product || !storeData) return { title: "Producto no encontrado — ByLink" }

  const store = storeData.store
  const symbol = (store.currency ?? "USD") === "VES" ? "Bs. " : "$"
  const priceLine = `${symbol}${product.basePrice.toLocaleString("es")}`
  const title = `${product.name} — ${store.name}`
  // Precio adelante: WhatsApp muestra la description en el preview del chat.
  const description = [priceLine, product.description?.trim()].filter(Boolean).join(" · ").slice(0, 200)
  const image = product.images?.[0] ?? store.avatar ?? "https://bylink.app/og-default.png"
  const url = `https://bylink.app/${slug}/${productSlug}`

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
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug, productSlug } = await params
  const [fetched, rawById, theme, rate] = await Promise.all([
    getStoreBySlug(slug),
    fetchRawProducts(slug),
    fetchPublicTheme(slug),
    fetchPublicRate(),
  ])
  if (!fetched) redirect(`/${slug}`)

  const products = mapTemplateProducts(fetched.products, rawById)
  const product = products.find((p) => p.slug === productSlug)
  // Producto inexistente u oculto (los endpoints públicos solo devuelven
  // visibles) → a la tienda, nunca 404. Mismo destino que el redirect viejo.
  if (!product) redirect(`/${slug}`)

  const otherProducts = products.filter((p) => p.id !== product.id)

  const effectiveTheme = theme?.tree?.sections?.length
    ? theme
    : {
        template: "vitrina",
        templateVersion: 1,
        publishedAt: "",
        version: 0,
        tree: { sections: [] },
        tokens: {},
      }

  return (
    <ProductPageClient
      store={{
        name: fetched.store.name,
        username: fetched.store.username,
        bio: fetched.store.bio,
        avatar: fetched.store.avatar,
        slug: fetched.store.slug,
        whatsappNumber: fetched.store.whatsappNumbers?.[0],
        currency: fetched.store.currency,
        address: fetched.store.address,
        socials: fetched.store.socials,
      }}
      product={product}
      otherProducts={otherProducts}
      theme={effectiveTheme}
      rate={rate}
    />
  )
}
