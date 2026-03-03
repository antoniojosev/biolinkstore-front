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
  return {
    title: `${data.store.name} — Catálogo`,
    description: data.store.bio ?? `Catálogo online de ${data.store.name}`,
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
