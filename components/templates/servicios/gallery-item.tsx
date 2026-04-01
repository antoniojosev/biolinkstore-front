'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Product } from '@/lib/types'

interface Props {
  src: string
  product: Product
  storeSlug: string
}

export function ServiciosGalleryItem({ src, product, storeSlug }: Props) {
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')

  const content = (
    <div className="relative aspect-square overflow-hidden bg-gray-100 group">
      <img
        src={src}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
    </div>
  )

  if (product.slug) {
    const href = `/${storeSlug}/${product.slug}${preview ? `?preview=${preview}` : ''}`
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
