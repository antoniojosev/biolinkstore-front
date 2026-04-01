'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Bed,
  Bath,
  Ruler,
  MapPin,
  Building2,
  Bookmark,
  Check,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { trackEvent } from '@/lib/analytics'
import { InmueblesCartDrawer } from './cart-drawer'
import type { ProductDetail } from '@/lib/types'

interface Props {
  product: ProductDetail
}

export function InmueblesProductDetail({ product }: Props) {
  const { store, paymentProvider } = useStore()
  const { addItem, items, removeItem, totalItems, setIsOpen } = useCart()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const backHref = `/${store.slug}${preview ? `?preview=${preview}` : ''}`

  const [selectedImage, setSelectedImage] = useState(0)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [inquiryLoading, setInquiryLoading] = useState(false)

  const isSaved = items.some((i) => i.productId === product.id)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const images =
    product.images.length > 0 ? product.images : ['/placeholder.svg']
  const image = images[0] ?? '/placeholder.svg'

  // Read specs from attributes (role='spec')
  const specAttrs = product.attributes.filter((a) => a.role === 'spec')
  const specMap: Record<string, string> = {}
  for (const a of specAttrs) {
    if (a.options[0]) specMap[a.name] = a.options[0]
  }
  const specs = {
    hab: specMap['Habitaciones'],
    bath: specMap['Baños'],
    m2: specMap['m²'],
    year: specMap['Año'],
    parking: specMap['Estacionamiento'],
  }

  // Read tags from attributes (role='tag')
  const tagAttrs = product.attributes.filter((a) => a.role === 'tag')
  const tags = tagAttrs.flatMap((a) => a.options)

  const handleSave = () => {
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

  const handleDirectInquiry = async () => {
    setInquiryLoading(true)
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
    setInquiryLoading(false)
  }

  const avatar = store.avatar ?? '/placeholder.svg'

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Sticky nav */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A3A52] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Propiedades
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              isSaved
                ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
            aria-label={
              isSaved ? 'Quitar de guardados' : 'Guardar propiedad'
            }
          >
            {isSaved ? (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
          {totalItems > 0 && (
            <button
              onClick={() => setIsOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
            >
              <Building2 className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#1A3A52] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Hero image gallery */}
        <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                No disponible
              </span>
            </div>
          )}
          {/* Status badge */}
          {product.inStock && (
            <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide">
              Disponible
            </div>
          )}
          {/* Photo count */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm">
              {selectedImage + 1}/{images.length} fotos
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                  idx === selectedImage
                    ? 'border-[#D4AF37] opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
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

        {/* Property info */}
        <div className="px-4 py-5 pb-40 space-y-5">
          {/* Price */}
          <div>
            <span className="text-3xl font-bold text-[#1A3A52]">
              {fmt(product.price)}
            </span>
            {product.comparePrice &&
              product.comparePrice > product.price && (
                <span className="text-base text-gray-400 line-through ml-3">
                  {fmt(product.comparePrice)}
                </span>
              )}
          </div>

          {/* Title + category */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            {product.category && (
              <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {product.category}
              </p>
            )}
          </div>

          {/* Specs grid */}
          {(specs.hab || specs.bath || specs.m2 || specs.year || specs.parking) && (
            <div className="grid grid-cols-3 gap-3">
              {specs.hab && (
                <div className="flex flex-col items-center gap-1 bg-white rounded-xl p-3 border border-gray-100">
                  <Bed className="h-5 w-5 text-[#1A3A52]/60" />
                  <span className="text-lg font-bold text-[#1A3A52]">
                    {specs.hab}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Habitaciones
                  </span>
                </div>
              )}
              {specs.bath && (
                <div className="flex flex-col items-center gap-1 bg-white rounded-xl p-3 border border-gray-100">
                  <Bath className="h-5 w-5 text-[#1A3A52]/60" />
                  <span className="text-lg font-bold text-[#1A3A52]">
                    {specs.bath}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Baños
                  </span>
                </div>
              )}
              {specs.m2 && (
                <div className="flex flex-col items-center gap-1 bg-white rounded-xl p-3 border border-gray-100">
                  <Ruler className="h-5 w-5 text-[#1A3A52]/60" />
                  <span className="text-lg font-bold text-[#1A3A52]">
                    {specs.m2}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                    m²
                  </span>
                </div>
              )}
              {specs.year && (
                <div className="flex flex-col items-center gap-1 bg-white rounded-xl p-3 border border-gray-100">
                  <Calendar className="h-5 w-5 text-[#1A3A52]/60" />
                  <span className="text-lg font-bold text-[#1A3A52]">
                    {specs.year}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Año
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-[#1A3A52]/5 text-[#1A3A52] px-2.5 py-1 rounded-full font-medium"
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
                className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 font-medium hover:text-[#1A3A52] transition-colors"
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

          {/* Agent section */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt={store.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]/30"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1A3A52]">
                  {store.name}
                </p>
                <p className="text-xs text-gray-500">Asesor inmobiliario</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky bottom CTA */}
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-20">
          <div className="max-w-3xl mx-auto flex gap-2">
            <button
              onClick={handleSave}
              className={`shrink-0 h-13 w-13 rounded-xl flex items-center justify-center border-2 transition-all duration-200 ${
                isSaved
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]'
                  : 'border-gray-200 text-gray-500 hover:border-[#1A3A52] hover:text-[#1A3A52]'
              }`}
              aria-label={
                isSaved ? 'Quitar de guardados' : 'Guardar propiedad'
              }
            >
              <Bookmark
                className={`h-5 w-5 ${isSaved ? 'fill-[#D4AF37]' : ''}`}
              />
            </button>
            <Button
              className="flex-1 h-13 text-base gap-2 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg"
              onClick={handleDirectInquiry}
              disabled={inquiryLoading}
            >
              <MessageCircle className="h-5 w-5" />
              {inquiryLoading
                ? 'Abriendo WhatsApp...'
                : 'Consultar por WhatsApp'}
            </Button>
          </div>
        </div>
      </div>

      <InmueblesCartDrawer />
    </div>
  )
}
