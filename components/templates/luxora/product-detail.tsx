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
  Share2,
  Check,
} from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useShare } from '@/components/templates/shared/use-share'
import { LuxoraCartDrawer } from './cart-drawer'
import { WishlistDrawer } from '@/components/templates/shared/wishlist-drawer'
import type { ProductDetail, VariantDetail } from '@/lib/types'
import { ColorSwatch } from '@/components/templates/shared/color-swatch'

interface Props {
  product: ProductDetail
}

export function LuxoraProductDetail({ product }: Props) {
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
  const isOnSale = product.comparePrice != null && product.comparePrice > finalPrice

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

  // Shared variant selectors
  const variantSelectors = product.attributes.sort((a, b) => a.sortOrder - b.sortOrder).map((attr) => (
    <div key={attr.id} className="space-y-2.5">
      <p className="text-xs font-semibold text-[#999] uppercase tracking-wider">
        {attr.name}
        {selectedOptions[attr.name] && <span className="text-[#1A1A1A] ml-1 normal-case tracking-normal font-bold">{selectedOptions[attr.name]}</span>}
      </p>
      {attr.type === 'color' && attr.optionsMeta ? (
        <div className="flex flex-wrap gap-2.5">
          {attr.options.map((option) => {
            const isSelected = selectedOptions[attr.name] === option
            const isAvailable = product.variants.length === 0 || product.variants.some((v) => v.combination[attr.name] === option && v.isAvailable)
            return <ColorSwatch key={option} hex={attr.optionsMeta![option]?.hex ?? '#ccc'} label={option} isSelected={isSelected} isAvailable={isAvailable} onClick={() => handleSelectOption(attr.name, option)} />
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {attr.options.map((option) => {
            const isSelected = selectedOptions[attr.name] === option
            const isAvailable = product.variants.length === 0 || product.variants.some((v) => v.combination[attr.name] === option && v.isAvailable)
            return (
              <button key={option} onClick={() => handleSelectOption(attr.name, option)} disabled={!isAvailable}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isSelected ? 'bg-[#1A1A1A] text-white'
                  : isAvailable ? 'bg-[#F0F0EC] text-[#666] hover:text-[#1A1A1A] hover:bg-[#E5E5E0]'
                  : 'bg-[#F0F0EC]/50 text-[#CCC] line-through cursor-not-allowed'
                }`}
              >{option}</button>
            )
          })}
        </div>
      )}
    </div>
  ))

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">

      {/* ── Desktop top bar ── */}
      <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-[#EAEAE6] max-w-6xl mx-auto">
        <Link href={backHref} className="flex items-center gap-2 text-sm text-[#999] hover:text-[#1A1A1A] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>
        <div className="flex items-center gap-1">
          {wishlistEnabled && (
            <button onClick={() => { toggleWishlist(product); if (!wishlisted) openWishlist(true) }}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors"
              aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-[#999]'}`} strokeWidth={wishlisted ? 0 : 1.5} />
            </button>
          )}
          <button onClick={() => share(window.location.href, product.name)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors text-[#999] hover:text-[#1A1A1A]">
            {shareCopied ? <Check className="h-4 w-4 text-[#1A1A1A]" strokeWidth={2.5} /> : <Share2 className="h-4 w-4" />}
          </button>
          <button onClick={() => setIsOpen(true)} className="relative flex items-center gap-2 h-9 px-4 rounded-xl bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-[#333] transition-colors">
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
          <div className="relative rounded-2xl overflow-hidden bg-[#EFEFEB] aspect-square">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-500" />
            {isOnSale && (
              <div className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">SALE</div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <span className="text-xs font-semibold text-[#1A1A1A] tracking-widest uppercase">Agotado</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 ${idx === selectedImage ? 'border-2 border-[#1A1A1A] opacity-100' : 'border-2 border-transparent opacity-50 hover:opacity-80'}`}
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
            <h1 className="text-3xl font-black text-[#1A1A1A] leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-2xl font-bold text-[#1A1A1A]">{fmt(finalPrice)}</span>
              {isOnSale && <span className="text-base text-[#999] line-through">{fmt(product.comparePrice!)}</span>}
            </div>
            {product.category && <p className="text-xs text-[#999] mt-1">{product.category}</p>}
          </div>
          <div className="h-px bg-[#EBEBEB]" />
          {variantSelectors}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider">Cantidad</p>
            <div className="inline-flex items-center border border-[#E5E5E0] rounded-xl overflow-hidden">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-[#1A1A1A] hover:bg-[#F0F0EC] transition-colors"><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-10 text-center text-sm font-bold text-[#1A1A1A]">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-[#1A1A1A] hover:bg-[#F0F0EC] transition-colors"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          {product.description && (
            <>
              <div className="h-px bg-[#EBEBEB]" />
              <div className="space-y-2">
                <button onClick={() => setShowFullDesc(!showFullDesc)} className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-[#1A1A1A]">Descripción</span>
                  {showFullDesc ? <ChevronUp className="h-4 w-4 text-[#999]" /> : <ChevronDown className="h-4 w-4 text-[#999]" />}
                </button>
                {showFullDesc && <p className="text-sm text-[#666] leading-relaxed">{product.description}</p>}
              </div>
            </>
          )}
          <button onClick={handleAdd} disabled={!canAdd}
            className={`w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-between px-6 shadow-xl shadow-black/5 transition-all active:scale-[0.99] ${
              added ? 'bg-[#22c55e] text-white'
              : canAdd ? 'bg-[#1A1A1A] text-white hover:bg-[#333]'
              : 'bg-[#E5E5E0] text-[#999] cursor-not-allowed'
            }`}
          >
            <span>{added ? 'Agregado' : 'Agregar al carrito'}</span>
            <span className="font-bold">{fmt(finalPrice * quantity)}</span>
          </button>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden max-w-lg mx-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-[#FAFAF8]/95 backdrop-blur-md">
          <Link href={backHref} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors">
            <ArrowLeft className="h-5 w-5 text-[#1A1A1A]" />
          </Link>
          <div className="flex items-center gap-1">
            {wishlistEnabled && (
              <button onClick={() => { toggleWishlist(product); if (!wishlisted) openWishlist(true) }}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors"
                aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-[#999]'}`} strokeWidth={wishlisted ? 0 : 1.5} />
              </button>
            )}
            <button onClick={() => share(window.location.href, product.name)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors" aria-label="Compartir">
              {shareCopied ? <Check className="h-4 w-4 text-[#1A1A1A]" strokeWidth={2.5} /> : <Share2 className="h-4 w-4 text-[#1A1A1A]" />}
            </button>
            <button onClick={() => setIsOpen(true)} className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors">
              <ShoppingBag className="h-5 w-5 text-[#1A1A1A]" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-[#1A1A1A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{totalItems}</span>}
            </button>
          </div>
        </div>

        {/* Main Image */}
        <div className="px-5 pt-1">
          <div className="group relative rounded-2xl overflow-hidden bg-[#EFEFEB] aspect-square">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-500" />
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-0">
                <span className="text-xs font-semibold text-[#1A1A1A] tracking-widest uppercase">Agotado</span>
              </div>
            )}
            {isOnSale && <div className="absolute top-3 left-3 z-10 bg-[#1A1A1A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">SALE</div>}
            {wishlistEnabled && (
              <button onClick={() => { toggleWishlist(product); if (!wishlisted) openWishlist(true) }}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform active:scale-90"
                aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-[#999]'}`} strokeWidth={wishlisted ? 0 : 1.5} />
              </button>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setSelectedImage((i) => (i === 0 ? images.length - 1 : i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm text-[#1A1A1A] transition-colors hover:bg-white active:scale-95">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setSelectedImage((i) => (i === images.length - 1 ? 0 : i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm text-[#1A1A1A] transition-colors hover:bg-white active:scale-95">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 py-3">
            {images.map((_, idx) => (
              <button key={idx} onClick={() => setSelectedImage(idx)}
                className={`rounded-full transition-all duration-300 ${idx === selectedImage ? 'w-5 h-2 bg-[#1A1A1A]' : 'w-2 h-2 bg-[#DDD] hover:bg-[#BBB]'}`}
              />
            ))}
          </div>
        )}

        <div className="px-5 pt-2 pb-36 space-y-5">
          <div>
            <h1 className="text-2xl font-black text-[#1A1A1A] leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xl font-bold text-[#1A1A1A]">{fmt(finalPrice)}</span>
              {isOnSale && <span className="text-sm text-[#999] line-through">{fmt(product.comparePrice!)}</span>}
            </div>
            {product.category && <p className="text-xs text-[#999] mt-1">{product.category}</p>}
          </div>
          <div className="h-px bg-[#EBEBEB]" />
          {variantSelectors}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider">Cantidad</p>
            <div className="inline-flex items-center border border-[#E5E5E0] rounded-xl overflow-hidden">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-[#1A1A1A] hover:bg-[#F0F0EC] transition-colors"><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-10 text-center text-sm font-bold text-[#1A1A1A]">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-[#1A1A1A] hover:bg-[#F0F0EC] transition-colors"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          {product.description && (
            <>
              <div className="h-px bg-[#EBEBEB]" />
              <div className="space-y-2">
                <button onClick={() => setShowFullDesc(!showFullDesc)} className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-[#1A1A1A]">Descripcion</span>
                  {showFullDesc ? <ChevronUp className="h-4 w-4 text-[#999]" /> : <ChevronDown className="h-4 w-4 text-[#999]" />}
                </button>
                {showFullDesc && <p className="text-sm text-[#666] leading-relaxed">{product.description}</p>}
              </div>
            </>
          )}
        </div>

        <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto px-5 pb-6 pt-3 bg-[#FAFAF8]/90 backdrop-blur-md z-20">
          <button onClick={handleAdd} disabled={!canAdd}
            className={`w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-between px-6 shadow-xl shadow-black/5 transition-all active:scale-[0.99] ${
              added ? 'bg-[#22c55e] text-white'
              : canAdd ? 'bg-[#1A1A1A] text-white hover:bg-[#333]'
              : 'bg-[#E5E5E0] text-[#999] cursor-not-allowed'
            }`}
          >
            <span>{added ? 'Agregado' : 'Agregar al carrito'}</span>
            <span className="font-bold">{fmt(finalPrice * quantity)}</span>
          </button>
        </div>
      </div>

      <LuxoraCartDrawer />
      <WishlistDrawer accent="#1A1A1A" bgClass="bg-[#FAFAF8]" textClass="text-[#1A1A1A]" mutedClass="text-[#999]" borderClass="border-[#EAEAE6]" itemBgClass="bg-[#F4F4F0]" cartBtnClass="bg-[#1A1A1A] text-white hover:bg-[#333]" />
    </div>
  )
}
