'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus, Check } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  currency?: string
}

export function MenuProductCard({ product, currency = 'USD' }: Props) {
  const { store } = useStore()
  const { addItem, setIsOpen } = useCart()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const [added, setAdded] = useState(false)

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

  const card = (
    <div className="group flex gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Info — left side */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
              {product.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-gray-900">{fmt(product.price)}</span>
        </div>
      </div>

      {/* Image + add button — right side */}
      <div className="relative shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center rounded-xl">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Agotado
              </span>
            </div>
          )}
        </div>
        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: added ? '#16a34a' : '#B45309' }}
          aria-label="Agregar al pedido"
        >
          {added ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>
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
