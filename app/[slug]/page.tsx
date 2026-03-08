import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StorePageClient } from '@/components/store-page-client'
import { getStoreBySlug } from '@/lib/api'
import type { TemplateId } from '@/lib/types'

const VALID_TEMPLATES: TemplateId[] = ['vitrina', 'luxora', 'noir']

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (!data) return { title: 'Tienda no encontrada' }

  const { store } = data
  const title = `${store.name} — Catálogo`
  const description = store.bio ?? `Explorá el catálogo de ${store.name} y cotizá por WhatsApp.`
  const image = store.avatar ?? store.coverImage ?? '/og-default.png'
  const url = `https://biolinkstore.com/${slug}`

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName: 'Bio Link Store',
      title,
      description,
      url,
      images: [{ url: image, width: 800, height: 800, alt: store.name }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
  }
}

export default async function StorePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview } = await searchParams
  const data = await getStoreBySlug(slug)

  if (!data) notFound()

  // Allow template preview via ?preview=templateId
  if (preview && VALID_TEMPLATES.includes(preview as TemplateId)) {
    data.store.template = preview as TemplateId
  }

  return <StorePageClient data={data} />
}
