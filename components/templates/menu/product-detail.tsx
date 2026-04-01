'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { MenuCartDrawer } from './cart-drawer'
import type { ProductDetail, VariantDetail } from '@/lib/types'

interface Props {
  product: ProductDetail
}

export function MenuProductDetail({ product }: Props) {
  const { store } = useStore()
  const { addItem, setIsOpen, totalItems } = useCart()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const backHref = `/${store.slug}${preview ? `?preview=${preview}` : ''}`

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  const images = product.images.length > 0 ? product.images : ['/placeholder.svg']

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

  const variantAttrs = product.attributes.filter((a) => a.role === 'variant')

  const canAdd =
    product.inStock &&
    (variantAttrs.length === 0 ||
      Object.keys(selectedOptions).length === variantAttrs.length)

  const handleAdd = () => {
    if (!canAdd) return
    const hasSelections = Object.keys(selectedOptions).length > 0
    const variantLabel = hasSelections
      ? Object.entries(selectedOptions)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      : undefined
    const variantDetails: VariantDetail[] | undefined = hasSelections
      ? variantAttrs
          .filter((attr) => selectedOptions[attr.name])
          .map((attr) => ({
            attribute: attr.name,
            value: selectedOptions[attr.name],
            type: attr.type ?? 'text',
            colorHex:
              attr.type === 'color'
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
    addItem({
      id: optionsKey ? `${product.id}-${optionsKey}` : product.id,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: selectedVariant?.image ?? images[0],
      variant: variantLabel,
      variantDetails,
    })
    setAdded(true)
    setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleSelectOption = (attrName: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [attrName]: option }))
  }

  // Variant selectors (e.g. size: personal, mediana, familiar)
  const variantSelectors = variantAttrs
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((attr) => (
      <div key={attr.id} className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
          {attr.name}
          {selectedOptions[attr.name] && (
            <span className="text-gray-900 ml-1.5 normal-case tracking-normal">
              — {selectedOptions[attr.name]}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {attr.options.map((option) => {
            const isSelected = selectedOptions[attr.name] === option
            const isAvailable =
              product.variants.length === 0 ||
              product.variants.some(
                (v) => v.combination[attr.name] === option && v.isAvailable,
              )
            return (
              <button
                key={option}
                onClick={() => handleSelectOption(attr.name, option)}
                disabled={!isAvailable}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : isAvailable
                      ? 'bg-white text-gray-600 border border-gray-200 hover:border-amber-400 hover:text-gray-900'
                      : 'bg-gray-100 text-gray-300 line-through cursor-not-allowed'
                }`}
                style={isSelected ? { backgroundColor: '#B45309' } : undefined}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    ))

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Sticky nav */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(255,248,240,0.95)',
          borderColor: '#E8DDD3',
        }}
      >
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Menú
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/80 transition-colors text-gray-500"
        >
          <ShoppingBag className="h-4 w-4" />
          {totalItems > 0 && (
            <span
              className="absolute -top-1 -right-1 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#B45309' }}
            >
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Hero image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                No disponible
              </span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                  idx === selectedImage
                    ? 'opacity-100 border-amber-700'
                    : 'opacity-60 hover:opacity-100 border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="px-4 py-5 pb-36 space-y-5">
          <div>
            {product.category && (
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                {product.category}
              </p>
            )}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
          </div>

          <span className="text-2xl font-bold" style={{ color: '#B45309' }}>
            {fmt(finalPrice)}
          </span>

          {variantSelectors}

          {/* Quantity */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Cantidad
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-10 text-center text-sm font-medium text-gray-900">
                {quantity}
              </span>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

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
                className={`text-sm text-gray-600 leading-relaxed transition-all duration-300 ${showFullDesc ? '' : 'line-clamp-3'}`}
              >
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Fixed bottom add button */}
        <div
          className="fixed bottom-0 inset-x-0 p-4 border-t backdrop-blur-lg z-20"
          style={{
            backgroundColor: 'rgba(255,248,240,0.85)',
            borderColor: '#E8DDD3',
          }}
        >
          <Button
            className="w-full max-w-2xl mx-auto h-13 text-base gap-3 text-white rounded-xl flex shadow-lg"
            style={{ backgroundColor: '#B45309' }}
            onClick={handleAdd}
            disabled={!canAdd}
          >
            {added ? (
              <>
                <Check className="h-5 w-5" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                <span className="flex-1 text-left">Agregar al pedido</span>
                <span className="font-bold">{fmt(finalPrice * quantity)}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <MenuCartDrawer />
    </div>
  )
}
