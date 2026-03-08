'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Source_Serif_4 } from 'next/font/google'
import {
  ArrowLeft,
  ShoppingBag,
  Minus,
  Plus,
  ChevronRight,
  Share2,
  Check,
  Heart,
} from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useShare } from '@/components/templates/shared/use-share'
import { NoirCartDrawer } from './cart-drawer'
import { WishlistDrawer } from '@/components/templates/shared/wishlist-drawer'
import type { ProductDetail, VariantDetail } from '@/lib/types'
import { ColorSwatch } from '@/components/templates/shared/color-swatch'

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
})

interface Props {
  product: ProductDetail
}

export function NoirProductDetail({ product }: Props) {
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
    <div key={attr.id} className="space-y-3">
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] font-sans">
        {attr.name}
        {selectedOptions[attr.name] && <span className="text-[#F0EDE8] ml-2 tracking-normal normal-case">{selectedOptions[attr.name]}</span>}
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
                className={`px-4 py-2 text-sm font-sans transition-all duration-300 ${
                  isSelected ? 'border border-[#C9A86C] text-[#C9A86C] bg-[#C9A86C]/10'
                  : isAvailable ? 'border border-[#333] text-[#888] hover:border-[#555] hover:text-[#F0EDE8]'
                  : 'border border-[#1A1A1A] text-[#333] line-through cursor-not-allowed'
                }`}
              >{option}</button>
            )
          })}
        </div>
      )}
    </div>
  ))

  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${serif.className}`}>

      {/* ── Desktop top bar ── */}
      <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-[#1A1A1A] max-w-6xl mx-auto">
        <Link href={backHref} className="flex items-center gap-2 text-sm text-[#555] hover:text-[#F0EDE8] transition-colors font-sans">
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>
        <div className="flex items-center gap-4">
          {wishlistEnabled && (
            <button onClick={() => { toggleWishlist(product); if (!wishlisted) openWishlist(true) }}
              className="text-[#555] hover:text-[#F0EDE8] transition-colors"
              aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-400 text-red-400' : ''}`} strokeWidth={wishlisted ? 0 : 1.5} />
            </button>
          )}
          <button onClick={() => share(window.location.href, product.name)} className="text-[#555] hover:text-[#F0EDE8] transition-colors" aria-label="Compartir">
            {shareCopied ? <Check className="h-4 w-4 text-[#C9A86C]" strokeWidth={2} /> : <Share2 className="h-4 w-4" strokeWidth={1.5} />}
          </button>
          <button onClick={() => setIsOpen(true)} className="relative flex items-center gap-2 h-9 px-5 bg-[#C9A86C] text-[#0A0A0A] text-sm font-semibold font-sans hover:bg-[#D4B87A] transition-colors rounded-sm">
            <ShoppingBag className="h-4 w-4" />
            Carrito
            {totalItems > 0 && <span className="text-[#0A0A0A]/60 text-xs">{totalItems}</span>}
          </button>
        </div>
      </div>

      {/* ── Desktop two-column layout ── */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-10 lg:items-start">
        {/* Left: images */}
        <div className="space-y-px">
          <div className="relative overflow-hidden aspect-[3/4]">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/20 via-transparent to-[#0A0A0A]/40" />
            {!product.inStock && (
              <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-[1px] flex items-center justify-center">
                <span className="text-[11px] font-light tracking-[0.3em] uppercase text-[#888] font-sans">Agotado</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {discount && <span className="text-[10px] font-bold tracking-wider bg-[#C9A86C] text-[#0A0A0A] px-2 py-0.5 rounded-sm font-sans">-{discount}%</span>}
              {product.featured && <span className="text-[10px] tracking-[0.15em] uppercase text-[#C9A86C] font-light">✦ Destacado</span>}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-px">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 flex-1 h-20 overflow-hidden transition-all duration-300 ${idx === selectedImage ? 'border-b-2 border-[#C9A86C]' : 'opacity-40 hover:opacity-70'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="space-y-6 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-[#C9A86C]/40 to-transparent" />
          <div>
            {product.category && <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A86C] font-sans mb-2">{product.category}</p>}
            <h1 className={`text-3xl font-light italic text-[#F0EDE8] tracking-wide leading-tight ${serif.className}`}>{product.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#C9A86C] text-xl font-semibold">{fmt(finalPrice)}</span>
            {product.comparePrice && product.comparePrice > finalPrice && (
              <span className="text-[#555] text-sm line-through">{fmt(product.comparePrice)}</span>
            )}
          </div>
          <div className="h-px bg-gradient-to-r from-[#C9A86C]/20 via-[#C9A86C]/10 to-transparent" />
          {variantSelectors}
          <div className="space-y-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] font-sans">Cantidad</p>
            <div className="inline-flex items-center">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center border border-[#333] text-[#888] hover:text-[#C9A86C] hover:border-[#C9A86C] transition-colors"><Minus className="h-3 w-3" /></button>
              <span className="w-12 h-10 flex items-center justify-center border-y border-[#333] text-[#F0EDE8] text-sm font-sans">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 flex items-center justify-center border border-[#333] text-[#888] hover:text-[#C9A86C] hover:border-[#C9A86C] transition-colors"><Plus className="h-3 w-3" /></button>
            </div>
          </div>
          {product.description && (
            <>
              <div className="h-px bg-gradient-to-r from-[#C9A86C]/20 via-[#C9A86C]/10 to-transparent" />
              <div className="space-y-3">
                <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-[10px] tracking-[0.2em] uppercase text-[#555] font-sans hover:text-[#C9A86C] transition-colors">
                  {showFullDesc ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
                {showFullDesc && <p className="text-sm text-[#888] font-sans font-light leading-relaxed">{product.description}</p>}
              </div>
            </>
          )}
          <button onClick={handleAdd} disabled={!canAdd}
            className={`w-full h-12 font-semibold text-sm flex items-center justify-between px-5 transition-all active:scale-[0.99] font-sans tracking-wide rounded-sm ${
              added ? 'bg-[#C9A86C] text-[#0A0A0A]'
              : canAdd ? 'bg-[#C9A86C] text-[#0A0A0A] hover:bg-[#D4B87A]'
              : 'bg-[#1A1A1A] text-[#555] cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4" />
              <span>{added ? 'Agregado' : 'Agregar'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{fmt(finalPrice * quantity)}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden max-w-lg mx-auto">
        {/* Cinematic Hero */}
        <div className="relative h-[70vh] w-full overflow-hidden">
          <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-700" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-transparent to-[#0A0A0A]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/40 via-transparent to-transparent" />

          {/* Top nav */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 pt-10 z-10">
            <Link href={backHref} className="text-[#F0EDE8]/80 hover:text-[#F0EDE8] transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-4">
              {wishlistEnabled && (
                <button onClick={() => { toggleWishlist(product); if (!wishlisted) openWishlist(true) }}
                  className="text-[#F0EDE8]/80 hover:text-[#F0EDE8] transition-colors"
                  aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart className={`h-4.5 w-4.5 transition-colors ${wishlisted ? 'fill-red-400 text-red-400' : ''}`} strokeWidth={wishlisted ? 0 : 1.5} />
                </button>
              )}
              <button onClick={() => share(window.location.href, product.name)} className="text-[#F0EDE8]/80 hover:text-[#F0EDE8] transition-colors" aria-label="Compartir">
                {shareCopied ? <Check className="h-4.5 w-4.5 text-[#C9A86C]" strokeWidth={2} /> : <Share2 className="h-4.5 w-4.5" strokeWidth={1.5} />}
              </button>
              <button onClick={() => setIsOpen(true)} className="relative text-[#F0EDE8]/80 hover:text-[#F0EDE8] transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C9A86C] text-[#0A0A0A] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{totalItems}</span>
                )}
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-20 left-5 flex flex-col gap-1.5 z-10">
            {discount && <span className="text-[10px] font-bold tracking-wider bg-[#C9A86C] text-[#0A0A0A] px-2 py-0.5 rounded-sm font-sans">-{discount}%</span>}
            {product.featured && <span className="text-[10px] tracking-[0.15em] uppercase text-[#C9A86C] font-light">✦ Destacado</span>}
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-[1px] flex items-center justify-center z-0">
              <span className="text-[11px] font-light tracking-[0.3em] uppercase text-[#888] font-sans">Agotado</span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-px overflow-x-auto pl-4">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImage(idx)}
                className={`shrink-0 w-16 h-16 overflow-hidden transition-all duration-300 relative z-10 ${idx === selectedImage ? 'border-b-2 border-[#C9A86C]' : 'opacity-50 hover:opacity-80'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="px-5 pt-6 pb-32 space-y-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#C9A86C]/40 to-transparent" />
          <div>
            {product.category && <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A86C] font-sans mb-2">{product.category}</p>}
            <h1 className={`text-2xl font-light italic text-[#F0EDE8] tracking-wide leading-tight ${serif.className}`}>{product.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#C9A86C] text-lg font-semibold">{fmt(finalPrice)}</span>
            {product.comparePrice && product.comparePrice > finalPrice && (
              <span className="text-[#555] text-sm line-through">{fmt(product.comparePrice)}</span>
            )}
          </div>
          <div className="h-px bg-gradient-to-r from-[#C9A86C]/20 via-[#C9A86C]/10 to-transparent" />
          {variantSelectors}
          <div className="space-y-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] font-sans">Cantidad</p>
            <div className="inline-flex items-center">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center border border-[#333] text-[#888] hover:text-[#C9A86C] hover:border-[#C9A86C] transition-colors"><Minus className="h-3 w-3" /></button>
              <span className="w-12 h-10 flex items-center justify-center border-y border-[#333] text-[#F0EDE8] text-sm font-sans">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 flex items-center justify-center border border-[#333] text-[#888] hover:text-[#C9A86C] hover:border-[#C9A86C] transition-colors"><Plus className="h-3 w-3" /></button>
            </div>
          </div>
          {product.description && (
            <>
              <div className="h-px bg-gradient-to-r from-[#C9A86C]/20 via-[#C9A86C]/10 to-transparent" />
              <div className="space-y-3">
                <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-[10px] tracking-[0.2em] uppercase text-[#555] font-sans hover:text-[#C9A86C] transition-colors">
                  {showFullDesc ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
                {showFullDesc && <p className="text-sm text-[#888] font-sans font-light leading-relaxed">{product.description}</p>}
              </div>
            </>
          )}
        </div>

        <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto px-5 pb-6 pt-3 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#1A1A1A] z-20">
          <button onClick={handleAdd} disabled={!canAdd}
            className={`w-full h-12 font-semibold text-sm flex items-center justify-between px-5 transition-all active:scale-[0.99] font-sans tracking-wide rounded-sm ${
              added ? 'bg-[#C9A86C] text-[#0A0A0A]'
              : canAdd ? 'bg-[#C9A86C] text-[#0A0A0A] hover:bg-[#D4B87A]'
              : 'bg-[#1A1A1A] text-[#555] cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4" />
              <span>{added ? 'Agregado' : 'Agregar'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{fmt(finalPrice * quantity)}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>

      <NoirCartDrawer />
      <WishlistDrawer accent="#C9A86C" bgClass="bg-[#0A0A0A]" textClass="text-[#F0EDE8]" mutedClass="text-[#666]" borderClass="border-[#1A1A1A]" itemBgClass="bg-[#111]" cartBtnClass="bg-[#C9A86C] text-[#0A0A0A] hover:bg-[#b8966a]" />
    </div>
  )
}
