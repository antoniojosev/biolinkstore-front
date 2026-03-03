import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProductDetailClient } from '@/components/product-detail-client'
import { getStoreBySlug, getProductBySlug } from '@/lib/api'
import type { TemplateId } from '@/lib/types'

const VALID_TEMPLATES: TemplateId[] = ['vitrina', 'luxora', 'noir']

interface Props {
  params: Promise<{ slug: string; productSlug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productSlug } = await params
  const [storeData, product] = await Promise.all([
    getStoreBySlug(slug),
    getProductBySlug(slug, productSlug),
  ])
  if (!storeData || !product) return { title: 'Producto no encontrado' }
  return {
    title: `${product.name} — ${storeData.store.name}`,
    description: product.description || `${product.name} en ${storeData.store.name}`,
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug, productSlug } = await params
  const { preview } = await searchParams
  const [storeData, product] = await Promise.all([
    getStoreBySlug(slug),
    getProductBySlug(slug, productSlug),
  ])

  if (!storeData || !product) notFound()

  // Apply template preview override
  if (preview && VALID_TEMPLATES.includes(preview as TemplateId)) {
    storeData.store.template = preview as TemplateId
  }

  return <ProductDetailClient storeData={storeData} product={product} />
}
