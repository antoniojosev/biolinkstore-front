'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Heart, Plus, Check, Share2 } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useShare } from '@/components/templates/shared/use-share'

interface Props {
  product: Product
  currency?: string
}

export function LuxoraProductCard({ product, currency = 'ARS' }: Props) {
  const { store } = useStore()
  const { addItem, setIsOpen } = useCart()
  const { toggle: toggleWishlist, isWishlisted, setIsOpen: openWishlist } = useWishlist()
  const { share, copied } = useShare()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const [added, setAdded] = useState(false)
  const wishlistEnabled = store.plan === 'PRO' || store.plan === 'BUSINESS'
  const wishlisted = isWishlisted(product.id)

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/${store.slug}/${product.slug}`
    share(url, product.name)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
    if (!wishlisted) openWishlist(true)
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(n)

  const image = product.images?.[0] ?? product.image ?? '/placeholder.svg'

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock) return
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image,
    })
    setAdded(true)
    setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked((v) => !v)
  }

  const card = (
    <div className="group flex flex-col gap-2">
      {/* Image container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#EFEFEB]">
        <img
          src={image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top-right actions */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
          {wishlistEnabled && (
            <button
              onClick={handleWishlist}
              className="transition-transform active:scale-90"
              aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart
                className={`h-5 w-5 drop-shadow-sm transition-colors ${
                  wishlisted ? 'fill-red-500 text-red-500' : 'text-white/80'
                }`}
                strokeWidth={wishlisted ? 0 : 1.5}
              />
            </button>
          )}
          {product.slug && (
            <button
              onClick={handleShare}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Compartir"
            >
              {copied ? (
                <Check className="h-4 w-4 drop-shadow-sm text-[#1A1A1A] bg-white rounded-full p-0.5" strokeWidth={2.5} />
              ) : (
                <Share2 className="h-4 w-4 drop-shadow-sm text-white/80" strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>

        {/* Badges */}
        {product.comparePrice && product.comparePrice > product.price && (
          <div className="absolute top-2.5 left-2.5 bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            SALE
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <span className="text-xs font-semibold text-[#1A1A1A] tracking-widest uppercase">
              Agotado
            </span>
          </div>
        )}

        {/* Quick add button */}
        {product.inStock && (
          <button
            onClick={handleAdd}
            className={`absolute bottom-2.5 right-2.5 h-8 w-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
              added
                ? 'bg-[#1A1A1A] text-white scale-110'
                : 'bg-white/90 text-[#1A1A1A] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
            }`}
            aria-label="Agregar al carrito"
          >
            {added ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />}
          </button>
        )}
      </div>

      {/* Product info */}
      <div className="px-0.5">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-1 leading-snug">
            {product.name}
          </p>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-sm font-bold text-[#1A1A1A]">{fmt(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-[#999] line-through">{fmt(product.comparePrice)}</span>
          )}
        </div>
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
