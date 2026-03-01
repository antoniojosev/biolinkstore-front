import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StorePageClient } from '@/components/store-page-client'
import { getStoreBySlug } from '@/lib/api'

interface Props {
  params: Promise<{ slug: string }>
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

export default async function StorePage({ params }: Props) {
  const { slug } = await params
  const data = await getStoreBySlug(slug)

  if (!data) notFound()

  return <StorePageClient data={data} />
}
