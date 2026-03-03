'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Share,
} from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { LuxoraCartDrawer } from './cart-drawer'
import type { ProductDetail, VariantDetail } from '@/lib/types'
import { ColorSwatch } from '@/components/templates/shared/color-swatch'

interface Props {
  product: ProductDetail
}

export function LuxoraProductDetail({ product }: Props) {
  const { store } = useStore()
  const { addItem, setIsOpen, totalItems } = useCart()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const backHref = `/${store.slug}${preview ? `?preview=${preview}` : ''}`

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [colorImages, setColorImages] = useState<string[] | null>(null)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  const baseImages = product.images.length > 0 ? product.images : ['/placeholder.svg']
  const images = colorImages ?? baseImages

  const selectedVariant = useMemo(() => {
    if (product.variants.length === 0) return null
    return (
      product.variants.find((v) =>
        Object.entries(selectedOptions).every(
          ([key, val]) => v.combination[key] === val,
        ),
      ) ?? null
    )
  }, [product.variants, selectedOptions])

  const finalPrice = product.price + (selectedVariant?.priceAdjustment ?? 0)
  const isOnSale = product.comparePrice != null && product.comparePrice > finalPrice

  const canAdd =
    product.inStock &&
    (product.attributes.length === 0 ||
      Object.keys(selectedOptions).length === product.attributes.length)

  const handleAdd = () => {
    if (!canAdd) return
    const hasSelections = Object.keys(selectedOptions).length > 0

    const variantLabel = hasSelections
      ? Object.entries(selectedOptions)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      : undefined

    const variantDetails: VariantDetail[] | undefined = hasSelections
      ? product.attributes
          .filter((attr) => selectedOptions[attr.name])
          .map((attr) => ({
            attribute: attr.name,
            value: selectedOptions[attr.name],
            type: attr.type ?? 'text',
            colorHex: attr.type === 'color'
              ? attr.optionsMeta?.[selectedOptions[attr.name]]?.hex
              : undefined,
          }))
      : undefined

    const optionsKey = hasSelections
      ? Object.entries(selectedOptions)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, v]) => v)
          .join('-')
      : ''

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: optionsKey ? `${product.id}-${optionsKey}` : product.id,
        productId: product.id,
        name: product.name,
        price: finalPrice,
        image: selectedVariant?.image ?? images[0],
        variant: variantLabel,
        variantDetails,
      })
    }
    setAdded(true)
    setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleSelectOption = (attrName: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [attrName]: option }))
    // If this is a color attribute with custom images, switch to those
    const attr = product.attributes.find((a) => a.name === attrName)
    if (attr?.type === 'color' && attr.optionsMeta?.[option]?.images?.length) {
      setColorImages(attr.optionsMeta[option].images!)
      setSelectedImage(0)
      return
    }
    const match = product.variants.find((v) =>
      Object.entries({ ...selectedOptions, [attrName]: option }).every(
        ([k, val]) => v.combination[k] === val,
      ),
    )
    if (match?.image) {
      const idx = images.indexOf(match.image)
      if (idx >= 0) setSelectedImage(idx)
    }
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-[#FAFAF8] text-[#1A1A1A]">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-[#FAFAF8]/95 backdrop-blur-md">
        <Link
          href={backHref}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#1A1A1A]" />
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors"
        >
          <ShoppingBag className="h-5 w-5 text-[#1A1A1A]" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#1A1A1A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Main Image */}
      <div className="px-5 pt-1">
        <div className="group relative rounded-2xl overflow-hidden bg-[#EFEFEB] aspect-square">
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-500"
          />

          {/* Like button */}
          <button
            onClick={() => setLiked(!liked)}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform active:scale-90"
          >
            <Heart
              className={`h-4.5 w-4.5 transition-colors ${
                liked ? 'fill-red-500 text-red-500' : 'text-[#999]'
              }`}
              strokeWidth={liked ? 0 : 1.5}
            />
          </button>

          {/* Sale badge */}
          {isOnSale && (
            <div className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
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

          {/* Arrow navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm text-[#1A1A1A] transition-colors hover:bg-white active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm text-[#1A1A1A] transition-colors hover:bg-white active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 py-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === selectedImage
                  ? 'w-5 h-2 bg-[#1A1A1A]'
                  : 'w-2 h-2 bg-[#DDD] hover:bg-[#BBB]'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-5 pt-2 pb-36 space-y-5">
        {/* Name & Price */}
        <div>
          <h1 className="text-2xl font-black text-[#1A1A1A] leading-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xl font-bold text-[#1A1A1A]">{fmt(finalPrice)}</span>
            {isOnSale && (
              <span className="text-sm text-[#999] line-through">
                {fmt(product.comparePrice!)}
              </span>
            )}
          </div>
          {product.category && (
            <p className="text-xs text-[#999] mt-1">{product.category}</p>
          )}
        </div>

        <div className="h-px bg-[#EBEBEB]" />

        {/* Variant Selectors */}
        {product.attributes
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((attr) => (
            <div key={attr.id} className="space-y-2.5">
              <p className="text-xs font-semibold text-[#999] uppercase tracking-wider">
                {attr.name}
                {selectedOptions[attr.name] && (
                  <span className="text-[#1A1A1A] ml-1 normal-case tracking-normal font-bold">
                    {selectedOptions[attr.name]}
                  </span>
                )}
              </p>
              {attr.type === 'color' && attr.optionsMeta ? (
                <div className="flex flex-wrap gap-2.5">
                  {attr.options.map((option) => {
                    const isSelected = selectedOptions[attr.name] === option
                    const isAvailable = product.variants.length === 0 || product.variants.some(
                      (v) => v.combination[attr.name] === option && v.isAvailable,
                    )
                    return (
                      <ColorSwatch
                        key={option}
                        hex={attr.optionsMeta![option]?.hex ?? '#ccc'}
                        label={option}
                        isSelected={isSelected}
                        isAvailable={isAvailable}
                        onClick={() => handleSelectOption(attr.name, option)}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {attr.options.map((option) => {
                    const isSelected = selectedOptions[attr.name] === option
                    const isAvailable = product.variants.length === 0 || product.variants.some(
                      (v) => v.combination[attr.name] === option && v.isAvailable,
                    )
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectOption(attr.name, option)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#1A1A1A] text-white'
                            : isAvailable
                              ? 'bg-[#F0F0EC] text-[#666] hover:text-[#1A1A1A] hover:bg-[#E5E5E0]'
                              : 'bg-[#F0F0EC]/50 text-[#CCC] line-through cursor-not-allowed'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

        {/* Quantity */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wider">
            Cantidad
          </p>
          <div className="inline-flex items-center border border-[#E5E5E0] rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-[#1A1A1A] hover:bg-[#F0F0EC] transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-[#1A1A1A]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-[#1A1A1A] hover:bg-[#F0F0EC] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <>
            <div className="h-px bg-[#EBEBEB]" />
            <div className="space-y-2">
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="flex items-center justify-between w-full"
              >
                <span className="text-sm font-bold text-[#1A1A1A]">Descripcion</span>
                {showFullDesc ? (
                  <ChevronUp className="h-4 w-4 text-[#999]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#999]" />
                )}
              </button>
              {showFullDesc && (
                <p className="text-sm text-[#666] leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto px-5 pb-6 pt-3 bg-[#FAFAF8]/90 backdrop-blur-md z-20">
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className={`w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-between px-6 shadow-xl shadow-black/5 transition-all active:scale-[0.99] ${
            added
              ? 'bg-[#22c55e] text-white'
              : canAdd
                ? 'bg-[#1A1A1A] text-white hover:bg-[#333]'
                : 'bg-[#E5E5E0] text-[#999] cursor-not-allowed'
          }`}
        >
          <span>{added ? 'Agregado' : 'Agregar al carrito'}</span>
          <span className="font-bold">{fmt(finalPrice * quantity)}</span>
        </button>
      </div>

      <LuxoraCartDrawer />
    </div>
  )
}
