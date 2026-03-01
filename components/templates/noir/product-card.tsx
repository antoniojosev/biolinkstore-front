'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'

interface Props {
  product: Product
  currency?: string
  featured?: boolean
}

export function NoirProductCard({ product, currency = 'ARS', featured = false }: Props) {
  const { addItem, setIsOpen } = useCart()
  const [added, setAdded] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(n)

  const image = product.images?.[0] ?? product.image ?? '/placeholder.svg'
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null

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
    <div
      className={`group relative overflow-hidden ${
        featured ? 'aspect-[4/3]' : 'aspect-[3/4]'
      } cursor-pointer`}
      onClick={handleAdd}
    >
      {/* Full-bleed image */}
      <Image
        src={image}
        alt={product.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes={featured ? '(max-width: 640px) 100vw, 500px' : '(max-width: 640px) 50vw, 240px'}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />

      {/* Sold out overlay */}
      {!product.inStock && (
        <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-[1px] flex items-center justify-center">
          <span className="text-[11px] font-light tracking-[0.3em] uppercase text-[#888]">
            Agotado
          </span>
        </div>
      )}

      {/* Top badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        {discount && (
          <span className="text-[10px] font-bold tracking-wider bg-[#C9A86C] text-[#0A0A0A] px-2 py-0.5 rounded-sm">
            -{discount}%
          </span>
        )}
        {product.featured && !featured && (
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#C9A86C] font-light">
            ✦ Destacado
          </span>
        )}
      </div>

      {/* Product info — floated over gradient */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-serif text-[#F0EDE8] text-sm leading-snug line-clamp-2 mb-1.5">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[#C9A86C] text-sm font-semibold leading-none">
              {fmt(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-[#555] text-[10px] line-through leading-tight">
                {fmt(product.comparePrice)}
              </span>
            )}
          </div>

          {product.inStock && (
            <button
              className={`h-7 w-7 rounded-full border flex items-center justify-center transition-all duration-300 ${
                added
                  ? 'bg-[#C9A86C] border-[#C9A86C] text-[#0A0A0A] scale-110'
                  : 'border-[#333] text-[#888] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
              }`}
              onClick={(e) => { e.stopPropagation(); handleAdd() }}
              aria-label="Agregar al carrito"
            >
              {added ? (
                <Check className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <Plus className="h-3 w-3" strokeWidth={2} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
