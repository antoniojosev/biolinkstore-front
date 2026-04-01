'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Bed, Bath, Ruler, MapPin, Bookmark, Check } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  currency?: string
}

export function InmueblesProductCard({ product, currency = 'USD' }: Props) {
  const { store } = useStore()
  const { addItem, items, removeItem } = useCart()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const [imgLoaded, setImgLoaded] = useState(false)

  const isSaved = items.some((i) => i.productId === product.id)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const image = product.images?.[0] ?? product.image ?? '/placeholder.svg'
  const imageCount = product.images?.length ?? 1

  // Read specs from attributes (role='spec') or fallback to regex on description
  const hab = product.specs?.['Habitaciones']
  const bath = product.specs?.['Baños']
  const m2 = product.specs?.['m²']

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSaved) {
      const cartItem = items.find((i) => i.productId === product.id)
      if (cartItem) removeItem(cartItem.id)
    } else {
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image,
      })
    }
  }

  const card = (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Photo count badge */}
        {imageCount > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-md backdrop-blur-sm">
            1/{imageCount} fotos
          </div>
        )}

        {/* Status badge */}
        {product.inStock ? (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
            Disponible
          </div>
        ) : (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
            No disponible
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isSaved
              ? 'bg-[#D4AF37] text-white shadow-md'
              : 'bg-white/80 text-gray-600 backdrop-blur-sm hover:bg-white hover:text-[#1A3A52]'
          }`}
          aria-label={isSaved ? 'Quitar de guardados' : 'Guardar propiedad'}
        >
          {isSaved ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-2 left-2 mt-7 bg-[#D4AF37] text-[#1A3A52] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
            Destacada
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-[#1A3A52]">
            {fmt(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {fmt(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Specs row */}
        {(hab || bath || m2) && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {hab && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5 text-[#1A3A52]/60" />
                {hab}
              </span>
            )}
            {bath && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-[#1A3A52]/60" />
                {bath}
              </span>
            )}
            {m2 && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5 text-[#1A3A52]/60" />
                {m2}m²
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Category / location hint */}
        {product.category && (
          <p className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3" />
            {product.category}
          </p>
        )}
      </div>
    </div>
  )

  if (product.slug) {
    const href = `/${store.slug}/${product.slug}${preview ? `?preview=${preview}` : ''}`
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    )
  }

  return card
}
