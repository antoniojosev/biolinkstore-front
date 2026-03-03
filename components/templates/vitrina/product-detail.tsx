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
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { VitrinaCartDrawer } from './cart-drawer'
import type { ProductDetail, VariantDetail } from '@/lib/types'
import { ColorSwatch } from '@/components/templates/shared/color-swatch'

interface Props {
  product: ProductDetail
}

export function VitrinaProductDetail({ product }: Props) {
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
  const [colorImages, setColorImages] = useState<string[] | null>(null)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  const baseImages = product.images.length > 0 ? product.images : ['/placeholder.svg']
  const images = colorImages ?? baseImages

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (product.variants.length === 0) return null
    return product.variants.find((v) =>
      Object.entries(selectedOptions).every(
        ([key, val]) => v.combination[key] === val,
      ),
    ) ?? null
  }, [product.variants, selectedOptions])

  const finalPrice = product.price + (selectedVariant?.priceAdjustment ?? 0)
  const discount =
    product.comparePrice && product.comparePrice > finalPrice
      ? Math.round(((product.comparePrice - finalPrice) / product.comparePrice) * 100)
      : null

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
    // If this is a color attribute with custom images, switch to those
    const attr = product.attributes.find((a) => a.name === attrName)
    if (attr?.type === 'color' && attr.optionsMeta?.[option]?.images?.length) {
      setColorImages(attr.optionsMeta[option].images!)
      setSelectedImage(0)
      return
    }
    // If variant has an image, switch to it
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background">
      {/* Hero Image */}
      <div className="relative">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Top navigation */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 z-10">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 bg-background/60 backdrop-blur-md rounded-full px-3 py-1.5 text-xs text-foreground/80 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-8 h-8 flex items-center justify-center bg-background/60 backdrop-blur-md rounded-full text-foreground/80 hover:text-foreground transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="relative w-8 h-8 flex items-center justify-center bg-background/60 backdrop-blur-md rounded-full text-foreground/80 hover:text-foreground transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-14 left-4 flex flex-col gap-1 z-10">
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

        {!product.inStock && (
          <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 -mt-8 relative z-20 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 ${
                idx === selectedImage
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-card rounded-t-3xl -mt-4 relative z-10 p-5 pb-36 space-y-5">
        {/* Header */}
        <div>
          <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {product.name}
          </h1>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-primary">{fmt(finalPrice)}</span>
          {product.comparePrice && product.comparePrice > finalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {fmt(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Variant Selectors */}
        {product.attributes
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((attr) => (
            <div key={attr.id} className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {attr.name}
                {selectedOptions[attr.name] && (
                  <span className="text-foreground ml-1.5 normal-case tracking-normal">
                    — {selectedOptions[attr.name]}
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : isAvailable
                              ? 'bg-muted text-muted-foreground border border-border/50 hover:border-primary/40 hover:text-foreground'
                              : 'bg-muted/50 text-muted-foreground/40 line-through cursor-not-allowed'
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
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
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
            <span className="w-10 text-center text-sm font-medium text-foreground">
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

        {/* Description */}
        {product.description && (
          <div className="space-y-2">
            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              Descripcion
              {showFullDesc ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            <p
              className={`text-sm text-foreground/70 leading-relaxed transition-all duration-300 ${
                showFullDesc ? '' : 'line-clamp-3'
              }`}
            >
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto p-4 bg-background/80 backdrop-blur-lg border-t border-border z-20">
        <Button
          className="w-full h-13 text-base gap-3 shadow-lg shadow-primary/20"
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
              <span className="flex-1 text-left">Agregar al carrito</span>
              <span className="font-bold">{fmt(finalPrice * quantity)}</span>
            </>
          )}
        </Button>
      </div>

      <VitrinaCartDrawer />
    </div>
  )
}
