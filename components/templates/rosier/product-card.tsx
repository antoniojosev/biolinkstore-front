'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Heart, Plus, Check, Star } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { useWishlist } from '@/lib/wishlist-context'

interface Props {
  product: Product
  currency?: string
}

const SWATCH_POOL = ['#9b2237', '#1a1413', '#d4a857', '#c49a6c', '#f1e4cf', '#2e4a3c']

export function RosierProductCard({ product, currency = 'USD' }: Props) {
  const { store } = useStore()
  const { addItem, setIsOpen } = useCart()
  const { toggle: toggleWishlist, isWishlisted, setIsOpen: openWishlist } = useWishlist()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const [added, setAdded] = useState(false)
  const wishlistEnabled = store.plan === 'PRO' || store.plan === 'BUSINESS'
  const wishlisted = isWishlisted(product.id)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(n)

  const image = product.images?.[0] ?? product.image ?? '/placeholder.svg'
  const isOnSale = product.comparePrice != null && product.comparePrice > product.price
  const discount = isOnSale
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : null

  const swatches = SWATCH_POOL.slice(0, 2 + (product.id.charCodeAt(0) % 2))

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
    if (!wishlisted) openWishlist(true)
  }

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
    setTimeout(() => setAdded(false), 1400)
  }

  const href = product.slug
    ? `/${store.slug}/${product.slug}${preview ? `?preview=${preview}` : ''}`
    : '#'

  return (
    <li className="relative flex flex-col">
      <Link href={href} className="block group">
        <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden bg-[#f5ece2] mb-2.5">
          <img
            src={image}
            alt={product.name}
            width={600}
            height={800}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(.2,.7,.3,1)] group-hover:scale-105"
          />
          {isOnSale && discount != null && (
            <span className="absolute top-2.5 left-2.5 bg-[#c8334c] text-white text-[10px] font-bold px-2 py-1 rounded-[3px] tracking-wide">
              −{discount}%
            </span>
          )}
          {!isOnSale && product.featured && (
            <span className="absolute top-2.5 left-2.5 bg-[#1a1413] text-white text-[10px] font-bold px-2 py-1 rounded-[3px] tracking-wide">
              Nuevo
            </span>
          )}
          {!product.inStock && (
            <span className="absolute top-2.5 left-2.5 bg-[#1a1413]/70 text-white text-[10px] font-bold px-2 py-1 rounded-[3px] tracking-wide">
              Agotado
            </span>
          )}
          <div className="absolute left-2.5 bottom-2.5 flex gap-1" aria-hidden="true">
            {swatches.map((c) => (
              <span
                key={c}
                className="w-3.5 h-3.5 rounded-full border-2 border-white/95 shadow-[0_1px_4px_rgba(0,0,0,.18)]"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </Link>

      {wishlistEnabled && (
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
          aria-pressed={wishlisted}
          className={`absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-full backdrop-blur-sm transition-all ${
            wishlisted
              ? 'bg-white text-[#c8334c]'
              : 'bg-white/90 text-[#5a4b48] hover:text-[#c8334c] hover:bg-white hover:scale-[1.08]'
          }`}
        >
          <Heart className="w-[15px] h-[15px]" fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={1.6} />
        </button>
      )}

      <h3 className="text-[13.5px] font-medium text-[#1a1413] leading-snug mb-1 line-clamp-1">
        {product.name}
      </h3>

      <p className="flex items-center gap-1 text-[11px] text-[#78685f] mb-1.5">
        <Star className="w-[11px] h-[11px] text-[#c8334c]" fill="currentColor" strokeWidth={0} />
        4.8 <span className="text-[#78685f]">(127)</span>
      </p>

      <div className="flex items-baseline gap-2 mb-2.5 tabular-nums">
        <span className={`text-base font-semibold ${isOnSale ? 'text-[#c8334c]' : 'text-[#1a1413]'}`}>
          {fmt(product.price)}
        </span>
        {isOnSale && (
          <span className="text-[13px] text-[#78685f] line-through">{fmt(product.comparePrice!)}</span>
        )}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!product.inStock}
        className={`self-stretch inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full text-[12.5px] font-medium transition-all ${
          added
            ? 'bg-[#c8334c] text-white'
            : 'bg-[#1a1413] text-white hover:bg-[#c8334c] active:scale-[0.98]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {added ? (
          <>
            <Check className="w-[13px] h-[13px]" strokeWidth={2.2} />
            Añadido
          </>
        ) : (
          <>
            <Plus className="w-[13px] h-[13px]" strokeWidth={1.8} />
            Añadir a la bolsa
          </>
        )}
      </button>
    </li>
  )
}
