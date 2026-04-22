'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ShoppingCart, ArrowRight, Check, Star } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  currency?: string
  /** Set in the index when we know the product has ingredient-based attrs */
  isCustomizable?: boolean
  /** Marketing pill label ("-20%", "Top vendido", "Nuevo"). Derived from tags/compare. */
  topBadge?: string
}

function echoFrom(name: string): string {
  const words = name.split(/\s+/).filter((w) => w.length > 3)
  const pick = words[0] ?? name
  return pick.toUpperCase().slice(0, 10)
}

export function PosterProductCard({
  product,
  currency = 'USD',
  isCustomizable = false,
  topBadge,
}: Props) {
  const { store } = useStore()
  const { addItem, setIsOpen } = useCart()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const [added, setAdded] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(n)

  const image = product.images?.[0] ?? product.image ?? '/placeholder.svg'
  const echo = echoFrom(product.name)
  const href = product.slug
    ? `/${store.slug}/${product.slug}${preview ? `?preview=${preview}` : ''}`
    : undefined

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
    <article className="poster-card group relative flex flex-col overflow-hidden rounded-[22px] border border-white/5 bg-gradient-to-br from-[#8a1e1e] to-[#5a0f0f] shadow-[0_14px_40px_-12px_rgba(0,0,0,.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-16px_rgba(0,0,0,.7)]">
      {/* Visual zone */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1 / 0.78' }}>
        {/* Word echo — hidden on mobile */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden select-none place-items-center text-transparent sm:grid"
          style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 'clamp(64px, 14vw, 110px)',
            letterSpacing: '-.02em',
            lineHeight: 1,
            WebkitTextStroke: '1.5px rgba(255,255,255,.09)',
          }}
        >
          {echo}
        </div>

        {/* Dish circle */}
        <div
          className="absolute left-1/2 top-1/2 z-[1] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04] group-hover:-rotate-2"
          style={{
            backgroundImage: `url(${image})`,
            boxShadow:
              '0 18px 40px -10px rgba(0,0,0,.65), inset 0 0 0 5px rgba(255,255,255,.08)',
          }}
          role="img"
          aria-label={product.name}
        />

        {/* Badges */}
        {isCustomizable && (
          <div className="absolute left-3 top-3 z-[3] inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#f4a23a] to-[#d97a1c] px-2.5 py-1.5 pl-2 text-[11px] font-extrabold uppercase tracking-wider text-[#4a0a0a] shadow-[0_6px_14px_-4px_rgba(244,162,58,.7)]">
            <Star className="h-3 w-3" fill="currentColor" />
            {`Arma tu ${product.name.split(/\s+/)[0].toLowerCase()}`}
          </div>
        )}
        {!isCustomizable && topBadge && (
          <div className="absolute right-3 top-3 z-[3] rounded-full bg-[#f4a23a] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#4a0a0a]">
            {topBadge}
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 z-[4] grid place-items-center bg-black/55">
            <span className="rounded-full bg-[#fff4e0] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#4a0a0a]">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="border-t border-white/5 bg-gradient-to-b from-[#2e0606]/95 to-[#2e0606] px-4 pb-4 pt-3.5 text-center">
        {product.category && (
          <div
            className="leading-none text-[#ffd07a]"
            style={{ fontFamily: 'var(--font-allura), cursive', fontSize: '22px' }}
          >
            {product.category}
          </div>
        )}
        <h3
          className="uppercase leading-[1.05] text-white"
          style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 'clamp(20px, 4.5vw, 24px)',
            letterSpacing: '.01em',
          }}
        >
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2.5">
          <div
            className="text-left leading-none text-[#f4a23a]"
            style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: '21px',
              letterSpacing: '.02em',
            }}
          >
            {isCustomizable && (
              <span className="mb-[-2px] block text-[10px] font-medium uppercase tracking-widest text-[#fff4e0]/70">
                desde
              </span>
            )}
            {fmt(product.price)}
            {product.comparePrice && (
              <small className="ml-1 text-[11px] font-normal text-[#fff4e0]/70 line-through">
                {fmt(product.comparePrice)}
              </small>
            )}
          </div>

          {isCustomizable ? (
            <span
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#fff4e0] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#4a0a0a] transition-transform hover:scale-[1.04] hover:bg-[#ffd07a]"
              aria-hidden="true"
            >
              Personalizar
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.inStock}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#fff4e0] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#4a0a0a] transition-all hover:scale-[1.04] hover:bg-[#ffd07a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a] disabled:opacity-50"
              aria-label={added ? 'Agregado al pedido' : `Agregar ${product.name} al pedido`}
            >
              {added ? (
                <>
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                  Listo
                </>
              ) : (
                <>
                  Agregar
                  <ShoppingCart className="h-3 w-3" strokeWidth={2.2} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-[22px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4a23a]"
      >
        {card}
      </Link>
    )
  }
  return card
}
