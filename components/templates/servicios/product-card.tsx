'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MessageCircle, Clock, ChevronRight } from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { trackEvent } from '@/lib/analytics'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  currency?: string
  accent: string
}

export function ServiciosProductCard({ product, currency = 'USD', accent }: Props) {
  const { store, paymentProvider } = useStore()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const image = product.images?.[0] ?? product.image ?? '/placeholder.svg'

  const whatsappNumber = store.whatsappNumbers?.[0]

  const handleBook = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!whatsappNumber) return
    trackEvent(store.slug, 'CHECKOUT_START')
    await paymentProvider.checkout({
      items: [
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image,
        },
      ],
      total: product.price,
      currency: store.currency,
      storeSlug: store.slug,
    })
  }

  const card = (
    <div className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Service image */}
      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-0.5">
              {product.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold" style={{ color: accent }}>
            {fmt(product.price)}
          </span>
          <button
            onClick={handleBook}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle className="h-3 w-3" />
            Agendar
          </button>
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
