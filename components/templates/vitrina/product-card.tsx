'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus, Check, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { useShare } from '@/components/templates/shared/use-share'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  currency?: string
}

export function VitrinaProductCard({ product, currency = 'ARS' }: Props) {
  const { store } = useStore()
  const { addItem, setIsOpen } = useCart()
  const { share, copied } = useShare()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const [added, setAdded] = useState(false)

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/${store.slug}/${product.slug}`
    share(url, product.name)
  }

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
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-107"
        />

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5">
              -{discount}%
            </Badge>
          )}
          {product.featured && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              Destacado
            </Badge>
          )}
        </div>

        {/* Share button */}
        {product.slug && (
          <button
            onClick={handleShare}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 text-foreground/70 hover:text-foreground"
            aria-label="Compartir"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        <div>
          <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider mb-0.5">
            {product.category}
          </p>
          <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-end justify-between gap-1 mt-auto">
          <div className="flex flex-col">
            <span className="font-bold text-primary leading-none">{fmt(product.price)}</span>
            {product.comparePrice && (
              <span className="text-[11px] text-muted-foreground line-through leading-tight">
                {fmt(product.comparePrice)}
              </span>
            )}
          </div>

          <Button
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg transition-all duration-200"
            onClick={handleAdd}
            disabled={!product.inStock}
            aria-label="Agregar al carrito"
          >
            {added ? (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            )}
          </Button>
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
