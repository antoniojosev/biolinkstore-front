'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store-context'
import { trackEvent } from '@/lib/analytics'
import { ServiciosCartDrawer } from './cart-drawer'
import type { ProductDetail } from '@/lib/types'

interface Props {
  product: ProductDetail
}

export function ServiciosProductDetail({ product }: Props) {
  const { store, paymentProvider } = useStore()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const backHref = `/${store.slug}${preview ? `?preview=${preview}` : ''}`

  const [selectedImage, setSelectedImage] = useState(0)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [loading, setLoading] = useState(false)

  const accent = store.primaryColor || '#2D2D2D'

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const images =
    product.images.length > 0 ? product.images : ['/placeholder.svg']
  const avatar = store.avatar ?? '/placeholder.svg'

  const handleBook = async () => {
    setLoading(true)
    trackEvent(store.slug, 'CHECKOUT_START')
    await paymentProvider.checkout({
      items: [
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: images[0],
        },
      ],
      total: product.price,
      currency: store.currency,
      storeSlug: store.slug,
    })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky nav */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Image gallery */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                  idx === selectedImage
                    ? 'opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                style={
                  idx === selectedImage
                    ? { borderColor: accent }
                    : undefined
                }
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Service info */}
        <div className="px-4 py-5 pb-36 space-y-5">
          {/* Category */}
          {product.category && (
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: accent }}
            >
              {product.category}
            </p>
          )}

          {/* Title + Price */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p
              className="text-2xl font-bold mt-2"
              style={{ color: accent }}
            >
              {fmt(product.price)}
            </p>
          </div>

          {/* Specs (role='spec') */}
          {product.attributes.filter((a) => a.role === 'spec').length > 0 && (
            <div className="space-y-2">
              {product.attributes
                .filter((a) => a.role === 'spec')
                .map((attr) => (
                  <div key={attr.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{attr.name}</span>
                    <span className="font-medium text-gray-900">{attr.options[0]}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Tags (role='tag') */}
          {product.attributes.filter((a) => a.role === 'tag').length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.attributes
                .filter((a) => a.role === 'tag')
                .flatMap((a) => a.options)
                .map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ backgroundColor: `${accent}10`, color: accent }}
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 font-medium hover:text-gray-900 transition-colors"
              >
                Descripción
                {showFullDesc ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              <p
                className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line transition-all duration-300 ${showFullDesc ? '' : 'line-clamp-4'}`}
              >
                {product.description}
              </p>
            </div>
          )}

          {/* Professional card */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt={store.name}
                className="w-11 h-11 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">
                  {store.name}
                </p>
                {store.bio && (
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {store.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky bottom CTA */}
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-20">
          <Button
            className="w-full max-w-lg mx-auto h-13 text-base gap-2 rounded-xl text-white shadow-lg flex"
            style={{ backgroundColor: '#25D366' }}
            onClick={handleBook}
            disabled={loading}
          >
            <MessageCircle className="h-5 w-5" />
            {loading ? 'Abriendo WhatsApp...' : 'Agendar por WhatsApp'}
          </Button>
        </div>
      </div>

      <ServiciosCartDrawer />
    </div>
  )
}
