'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Heart, Plus, Check } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'

interface Props {
  product: Product
  currency?: string
}

export function LuxoraProductCard({ product, currency = 'ARS' }: Props) {
  const { addItem, setIsOpen } = useCart()
  const [added, setAdded] = useState(false)
  const [liked, setLiked] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(n)

  const image = product.images?.[0] ?? product.image ?? '/placeholder.svg'

  const handleAdd = () => {
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

  return (
    <div className="group flex flex-col gap-2">
      {/* Image container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#EFEFEB]">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 45vw, 200px"
        />

        {/* Like button */}
        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute top-2.5 right-2.5 transition-transform active:scale-90"
          aria-label="Me gusta"
        >
          <Heart
            className={`h-5 w-5 drop-shadow-sm transition-colors ${
              liked ? 'fill-red-500 text-red-500' : 'text-white/80'
            }`}
            strokeWidth={liked ? 0 : 1.5}
          />
        </button>

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
}
