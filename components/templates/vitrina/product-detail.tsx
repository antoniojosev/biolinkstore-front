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
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useShare } from '@/components/templates/shared/use-share'
import { VitrinaCartDrawer } from './cart-drawer'
import { WishlistDrawer } from '@/components/templates/shared/wishlist-drawer'
import type { ProductDetail, VariantDetail } from '@/lib/types'
import { ColorSwatch } from '@/components/templates/shared/color-swatch'

interface Props {
  product: ProductDetail
}

export function VitrinaProductDetail({ product }: Props) {
  const { store } = useStore()
  const { addItem, setIsOpen, totalItems } = useCart()
  const { toggle: toggleWishlist, isWishlisted, setIsOpen: openWishlist } = useWishlist()
  const { share, copied: shareCopied } = useShare()
  const searchParams = useSearchParams()
  const wishlistEnabled = store.plan === 'PRO' || store.plan === 'BUSINESS'
  const wishlisted = isWishlisted(product.id)
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

  const selectedVariant = useMemo(() => {
    if (product.variants.length === 0) return null
    return product.variants.find((v) =>
      Object.entries(selectedOptions).every(([key, val]) => v.combination[key] === val),
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
      ? Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')
      : undefined
    const variantDetails: VariantDetail[] | undefined = hasSelections
      ? product.attributes
          .filter((attr) => selectedOptions[attr.name])
          .map((attr) => ({
            attribute: attr.name,
            value: selectedOptions[attr.name],
            type: attr.type ?? 'text',
            colorHex: attr.type === 'color' ? attr.optionsMeta?.[selectedOptions[attr.name]]?.hex : undefined,
          }))
      : undefined
    const optionsKey = hasSelections
      ? Object.entries(selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v).join('-')
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
    const attr = product.attributes.find((a) => a.name === attrName)
    if (attr?.type === 'color' && attr.optionsMeta?.[option]?.images?.length) {
      setColorImages(attr.optionsMeta[option].images!)
      setSelectedImage(0)
      return
    }
    const match = product.variants.find((v) =>
      Object.entries({ ...selectedOptions, [attrName]: option }).every(([k, val]) => v.combination[k] === val),
    )
    if (match?.image) {
      const idx = images.indexOf(match.image)
      if (idx >= 0) setSelectedImage(idx)
    }
  }

  const handleWishlist = () => {
    toggleWishlist(product)
    if (!wishlisted) openWishlist(true)
  }

  // Shared variant selectors block
  const variantSelectors = product.attributes.sort((a, b) => a.sortOrder - b.sortOrder).map((attr) => (
    <div key={attr.id} className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {attr.name}
        {selectedOptions[attr.name] && (
          <span className="text-foreground ml-1.5 normal-case tracking-normal">— {selectedOptions[attr.name]}</span>
        )}
      </p>
      {attr.type === 'color' && attr.optionsMeta ? (
        <div className="flex flex-wrap gap-2.5">
          {attr.options.map((option) => {
            const isSelected = selectedOptions[attr.name] === option
            const isAvailable = product.variants.length === 0 || product.variants.some((v) => v.combination[attr.name] === option && v.isAvailable)
            return (
              <ColorSwatch key={option} hex={attr.optionsMeta![option]?.hex ?? '#ccc'} label={option} isSelected={isSelected} isAvailable={isAvailable} onClick={() => handleSelectOption(attr.name, option)} />
            )
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {attr.options.map((option) => {
            const isSelected = selectedOptions[attr.name] === option
            const isAvailable = product.variants.length === 0 || product.variants.some((v) => v.combination[attr.name] === option && v.isAvailable)
            return (
              <button key={option} onClick={() => handleSelectOption(attr.name, option)} disabled={!isAvailable}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isSelected ? 'bg-primary text-primary-foreground shadow-sm'
                  : isAvailable ? 'bg-muted text-muted-foreground border border-border/50 hover:border-primary/40 hover:text-foreground'
                  : 'bg-muted/50 text-muted-foreground/40 line-through cursor-not-allowed'
                }`}
              >{option}</button>
            )
          })}
        </div>
      )}
    </div>
  ))

  return (
    <div className="min-h-screen bg-background">

      {/* ── Desktop top bar ── */}
      <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border/30 max-w-6xl mx-auto">
        <Link href={backHref} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>
        <div className="flex items-center gap-2">
          {wishlistEnabled && (
            <button onClick={handleWishlist} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors" aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
              <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} strokeWidth={wishlisted ? 0 : 1.5} />
            </button>
          )}
          <button onClick={() => share(window.location.href, product.name)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            {shareCopied ? <Check className="h-4 w-4 text-primary" strokeWidth={2.5} /> : <Share2 className="h-4 w-4" />}
          </button>
          <button onClick={() => setIsOpen(true)} className="relative flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <ShoppingBag className="h-4 w-4" />
            Carrito
            {totalItems > 0 && <span className="bg-white/20 text-xs font-bold px-1.5 rounded-full">{totalItems}</span>}
          </button>
        </div>
      </div>

      {/* ── Desktop two-column layout ── */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-10 lg:items-start">
        {/* Left: images */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-500" />
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Agotado</span>
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {discount && <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5">-{discount}%</Badge>}
              {product.featured && <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Destacado</Badge>}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${idx === selectedImage ? 'border-2 border-primary opacity-100' : 'border-2 border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="space-y-6 py-2">
          <div>
            {product.category && <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider mb-1">{product.category}</p>}
            <h1 className="text-3xl font-bold text-foreground leading-tight">{product.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-primary">{fmt(finalPrice)}</span>
            {product.comparePrice && product.comparePrice > finalPrice && (
              <span className="text-base text-muted-foreground line-through">{fmt(product.comparePrice)}</span>
            )}
          </div>
          {variantSelectors}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Cantidad</p>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Minus className="h-3.5 w-3.5" /></Button>
              <span className="w-10 text-center text-sm font-medium text-foreground">{quantity}</span>
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setQuantity((q) => q + 1)}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          {product.description && (
            <div className="space-y-2">
              <button onClick={() => setShowFullDesc(!showFullDesc)} className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground transition-colors">
                Descripción
                {showFullDesc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <p className={`text-sm text-foreground/70 leading-relaxed transition-all duration-300 ${showFullDesc ? '' : 'line-clamp-3'}`}>{product.description}</p>
            </div>
          )}
          <Button className="w-full h-12 text-base gap-3 shadow-lg shadow-primary/20" onClick={handleAdd} disabled={!canAdd}>
            {added ? <><Check className="h-5 w-5" />Agregado</> : <><ShoppingBag className="h-5 w-5" /><span className="flex-1 text-left">Agregar al carrito</span><span className="font-bold">{fmt(finalPrice * quantity)}</span></>}
          </Button>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden max-w-lg mx-auto">
        {/* Mobile sticky nav */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border/40">
          <Link href={backHref} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="flex items-center gap-1">
            {wishlistEnabled && (
              <button onClick={handleWishlist} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors" aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} strokeWidth={wishlisted ? 0 : 1.5} />
              </button>
            )}
            <button onClick={() => share(window.location.href, product.name)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground">
              {shareCopied ? <Check className="h-4 w-4 text-primary" strokeWidth={2.5} /> : <Share2 className="h-4 w-4" />}
            </button>
            <button onClick={() => setIsOpen(true)} className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{totalItems}</span>}
            </button>
          </div>
        </div>

        {/* Image gallery */}
        <div className="relative isolate px-4 pt-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted rounded-2xl">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-500" />
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Agotado</span>
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
              {discount && <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5">-{discount}%</Badge>}
              {product.featured && <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Destacado</Badge>}
            </div>
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImage(idx)}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 ${idx === selectedImage ? 'border-2 border-primary opacity-100' : 'border-2 border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="bg-card p-5 pb-36 space-y-5">
          <div>
            <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider mb-1">{product.category}</p>
            <h1 className="text-xl font-bold text-foreground leading-tight">{product.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-primary">{fmt(finalPrice)}</span>
            {product.comparePrice && product.comparePrice > finalPrice && <span className="text-sm text-muted-foreground line-through">{fmt(product.comparePrice)}</span>}
          </div>
          {variantSelectors}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Cantidad</p>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Minus className="h-3.5 w-3.5" /></Button>
              <span className="w-10 text-center text-sm font-medium text-foreground">{quantity}</span>
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setQuantity((q) => q + 1)}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          {product.description && (
            <div className="space-y-2">
              <button onClick={() => setShowFullDesc(!showFullDesc)} className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground transition-colors">
                Descripcion
                {showFullDesc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <p className={`text-sm text-foreground/70 leading-relaxed transition-all duration-300 ${showFullDesc ? '' : 'line-clamp-3'}`}>{product.description}</p>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto p-4 bg-background/80 backdrop-blur-lg border-t border-border z-20">
          <Button className="w-full h-13 text-base gap-3 shadow-lg shadow-primary/20" onClick={handleAdd} disabled={!canAdd}>
            {added ? <><Check className="h-5 w-5" />Agregado</> : <><ShoppingBag className="h-5 w-5" /><span className="flex-1 text-left">Agregar al carrito</span><span className="font-bold">{fmt(finalPrice * quantity)}</span></>}
          </Button>
        </div>
      </div>

      <VitrinaCartDrawer />
      <WishlistDrawer />
    </div>
  )
}
