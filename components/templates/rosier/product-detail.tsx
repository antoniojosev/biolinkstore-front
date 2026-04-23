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
  Star,
  Truck,
  Shield,
  RefreshCcw,
} from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useShare } from '@/components/templates/shared/use-share'
import { RosierCartDrawer } from './cart-drawer'
import { WishlistDrawer } from '@/components/templates/shared/wishlist-drawer'
import type { ProductDetail, VariantDetail } from '@/lib/types'
import { ColorSwatch } from '@/components/templates/shared/color-swatch'

interface Props {
  product: ProductDetail
}

const SERIF = { fontFamily: 'var(--font-fraunces)' }

export function RosierProductDetail({ product }: Props) {
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
  const [openSection, setOpenSection] = useState<string | null>('details')
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [colorImages, setColorImages] = useState<string[] | null>(null)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
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
        Object.entries(selectedOptions).every(([key, val]) => v.combination[key] === val),
      ) ?? null
    )
  }, [product.variants, selectedOptions])

  const finalPrice = product.price + (selectedVariant?.priceAdjustment ?? 0)
  const isOnSale = product.comparePrice != null && product.comparePrice > finalPrice
  const variantAttrs = product.attributes.filter((a) => a.role === 'variant')

  const canAdd =
    product.inStock &&
    (variantAttrs.length === 0 ||
      Object.keys(selectedOptions).length === variantAttrs.length)

  const handleAdd = () => {
    if (!canAdd) return
    const hasSelections = Object.keys(selectedOptions).length > 0
    const variantLabel = hasSelections
      ? Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')
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
    setTimeout(() => setAdded(false), 1600)
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
      Object.entries({ ...selectedOptions, [attrName]: option }).every(
        ([k, val]) => v.combination[k] === val,
      ),
    )
    if (match?.image) {
      const idx = images.indexOf(match.image)
      if (idx >= 0) setSelectedImage(idx)
    }
  }

  const toggleSection = (key: string) =>
    setOpenSection((cur) => (cur === key ? null : key))

  const variantSelectors = variantAttrs
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((attr) => (
      <div key={attr.id} className="space-y-2.5">
        <p className="text-[11px] font-semibold text-[#78685f] uppercase tracking-[0.18em]">
          {attr.name}
          {selectedOptions[attr.name] && (
            <span
              className="text-[#1a1413] ml-1.5 normal-case tracking-normal italic font-medium"
              style={SERIF}
            >
              {selectedOptions[attr.name]}
            </span>
          )}
        </p>
        {attr.type === 'color' && attr.optionsMeta ? (
          <div className="flex flex-wrap gap-2.5">
            {attr.options.map((option) => {
              const isSelected = selectedOptions[attr.name] === option
              const isAvailable =
                product.variants.length === 0 ||
                product.variants.some(
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
              const isAvailable =
                product.variants.length === 0 ||
                product.variants.some(
                  (v) => v.combination[attr.name] === option && v.isAvailable,
                )
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption(attr.name, option)}
                  disabled={!isAvailable}
                  className={`min-w-[44px] px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[#1a1413] text-white border border-[#1a1413]'
                      : isAvailable
                        ? 'bg-transparent text-[#1a1413] border border-[#e8dfd8] hover:border-[#1a1413]'
                        : 'bg-[#f5ece2]/50 text-[#c0b5ac] line-through cursor-not-allowed border border-[#e8dfd8]'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )}
      </div>
    ))

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-[#1a1413]">

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-30 bg-[rgba(253,250,246,0.92)] backdrop-blur-[14px] backdrop-saturate-150 border-b border-[#e8dfd8]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-[#5a4b48] hover:text-[#c8334c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver a la tienda</span>
          </Link>
          <div className="flex items-center gap-1">
            {wishlistEnabled && (
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product)
                  if (!wishlisted) openWishlist(true)
                }}
                aria-label={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                className="w-9 h-9 grid place-items-center rounded-full hover:bg-[#f5ece2] transition-colors"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${wishlisted ? 'text-[#c8334c]' : 'text-[#5a4b48]'}`}
                  fill={wishlisted ? 'currentColor' : 'none'}
                  strokeWidth={1.6}
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => share(window.location.href, product.name)}
              aria-label="Compartir"
              className="w-9 h-9 grid place-items-center rounded-full hover:bg-[#f5ece2] transition-colors text-[#5a4b48]"
            >
              {shareCopied ? <Check className="w-4 h-4 text-[#c8334c]" strokeWidth={2.2} /> : <Share2 className="w-4 h-4" strokeWidth={1.6} />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label={`Abrir carrito${totalItems > 0 ? ` (${totalItems})` : ''}`}
              className="relative w-9 h-9 grid place-items-center rounded-full hover:bg-[#f5ece2] transition-colors"
            >
              <ShoppingBag className="w-[18px] h-[18px] text-[#1a1413]" strokeWidth={1.6} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#c8334c] text-white text-[10px] font-semibold grid place-items-center tabular-nums leading-none">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

        {/* ── Images ── */}
        <div className="space-y-3">
          <div className="relative rounded-md overflow-hidden bg-[#f5ece2] aspect-[3/4]">
            <img
              src={images[selectedImage]}
              alt={product.name}
              width={1200}
              height={1600}
              className="w-full h-full object-cover"
            />
            {isOnSale && (
              <span className="absolute top-3 left-3 bg-[#c8334c] text-white text-[10px] font-bold px-2 py-1 rounded-[3px] tracking-wide">
                −{Math.round(((product.comparePrice! - finalPrice) / product.comparePrice!) * 100)}%
              </span>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-[#fdfaf6]/70 backdrop-blur-sm flex items-center justify-center">
                <span className="text-xs font-semibold text-[#1a1413] tracking-widest uppercase">
                  Agotado
                </span>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                  aria-label="Imagen anterior"
                  className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm grid place-items-center shadow-sm text-[#1a1413] hover:bg-white active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                  aria-label="Imagen siguiente"
                  className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm grid place-items-center shadow-sm text-[#1a1413] hover:bg-white active:scale-95 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`Ver imagen ${idx + 1}`}
                  aria-pressed={idx === selectedImage}
                  className={`shrink-0 w-16 h-20 lg:w-20 lg:h-24 rounded overflow-hidden transition-all ${
                    idx === selectedImage
                      ? 'ring-2 ring-[#1a1413] opacity-100'
                      : 'opacity-60 hover:opacity-90'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="space-y-6 lg:sticky lg:top-24 pb-28 lg:pb-0">
          <div>
            {product.category && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8334c] mb-2">
                {product.category}
              </p>
            )}
            <h1
              className="text-[clamp(28px,4.5vw,44px)] leading-[1.05] tracking-[-0.02em] font-medium"
              style={SERIF}
            >
              {product.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-3 text-[12px] text-[#78685f]">
              <Star className="w-[13px] h-[13px] text-[#c8334c]" fill="currentColor" strokeWidth={0} />
              <span className="text-[#1a1413] font-medium">4.8</span>
              <span>· 127 reseñas</span>
            </div>
            <div className="flex items-baseline gap-2.5 mt-4 tabular-nums">
              <span
                className={`text-[28px] font-medium tracking-tight ${isOnSale ? 'text-[#c8334c]' : 'text-[#1a1413]'}`}
                style={SERIF}
              >
                {fmt(finalPrice)}
              </span>
              {isOnSale && (
                <span className="text-base text-[#78685f] line-through">
                  {fmt(product.comparePrice!)}
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-[#e8dfd8]" />

          {variantSelectors}

          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-[#78685f] uppercase tracking-[0.18em]">
              Cantidad
            </p>
            <div className="inline-flex items-center border border-[#e8dfd8] rounded-full">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Reducir cantidad"
                className="w-10 h-10 grid place-items-center text-[#5a4b48] hover:text-[#c8334c] transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar cantidad"
                className="w-10 h-10 grid place-items-center text-[#5a4b48] hover:text-[#c8334c] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className={`w-full h-[54px] rounded-full text-sm font-semibold hidden lg:flex items-center justify-between px-6 transition-all active:scale-[0.99] ${
              added
                ? 'bg-[#c8334c] text-white'
                : canAdd
                  ? 'bg-[#1a1413] text-white hover:bg-[#c8334c]'
                  : 'bg-[#ead9c6] text-[#78685f] cursor-not-allowed'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {added ? <Check className="w-4 h-4" strokeWidth={2.2} /> : <Plus className="w-4 h-4" strokeWidth={1.8} />}
              {added ? 'Añadido a la bolsa' : canAdd ? 'Añadir a la bolsa' : variantAttrs.length > 0 ? 'Elige opciones' : 'Agotado'}
            </span>
            {canAdd && !added && (
              <span className="font-semibold tabular-nums">{fmt(finalPrice * quantity)}</span>
            )}
          </button>

          {/* Trust signals */}
          <ul className="grid grid-cols-1 gap-3 pt-4 text-[13px] text-[#5a4b48]">
            <li className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-[#c8334c] shrink-0" strokeWidth={1.6} />
              Envío gratis sobre {fmt(50)}
            </li>
            <li className="flex items-center gap-3">
              <RefreshCcw className="w-4 h-4 text-[#c8334c] shrink-0" strokeWidth={1.6} />
              30 días para devolver
            </li>
            <li className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-[#c8334c] shrink-0" strokeWidth={1.6} />
              Pago en 3 cuotas sin interés
            </li>
          </ul>

          {/* Accordions */}
          <div className="border-t border-[#e8dfd8]">
            {product.description && (
              <div className="border-b border-[#e8dfd8]">
                <button
                  type="button"
                  onClick={() => toggleSection('details')}
                  aria-expanded={openSection === 'details'}
                  className="flex items-center justify-between w-full py-4 text-[14px] font-medium text-[#1a1413]"
                >
                  <span>Detalles del producto</span>
                  {openSection === 'details' ? <ChevronUp className="w-4 h-4 text-[#78685f]" /> : <ChevronDown className="w-4 h-4 text-[#78685f]" />}
                </button>
                {openSection === 'details' && (
                  <p className="text-[13.5px] text-[#5a4b48] leading-[1.7] pb-5 whitespace-pre-wrap">
                    {product.description}
                  </p>
                )}
              </div>
            )}
            <div className="border-b border-[#e8dfd8]">
              <button
                type="button"
                onClick={() => toggleSection('shipping')}
                aria-expanded={openSection === 'shipping'}
                className="flex items-center justify-between w-full py-4 text-[14px] font-medium text-[#1a1413]"
              >
                <span>Envíos y devoluciones</span>
                {openSection === 'shipping' ? <ChevronUp className="w-4 h-4 text-[#78685f]" /> : <ChevronDown className="w-4 h-4 text-[#78685f]" />}
              </button>
              {openSection === 'shipping' && (
                <div className="text-[13.5px] text-[#5a4b48] leading-[1.7] pb-5 space-y-2">
                  <p>Envío a toda Venezuela en 2 a 5 días hábiles. Gratis sobre {fmt(50)}.</p>
                  <p>Tienes 30 días desde la entrega para cambio o devolución. La prenda debe estar sin uso y con sus etiquetas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[rgba(253,250,246,0.96)] backdrop-blur-[14px] border-t border-[#e8dfd8] px-4 pt-3 pb-[max(14px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className={`w-full h-[52px] rounded-full text-sm font-semibold flex items-center justify-between px-5 transition-all active:scale-[0.99] ${
            added
              ? 'bg-[#c8334c] text-white'
              : canAdd
                ? 'bg-[#1a1413] text-white hover:bg-[#c8334c]'
                : 'bg-[#ead9c6] text-[#78685f] cursor-not-allowed'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {added ? <Check className="w-4 h-4" strokeWidth={2.2} /> : <ShoppingBag className="w-4 h-4" strokeWidth={1.6} />}
            {added ? 'Añadido' : canAdd ? 'Añadir a la bolsa' : variantAttrs.length > 0 ? 'Elige opciones' : 'Agotado'}
          </span>
          {canAdd && !added && (
            <span className="font-semibold tabular-nums">{fmt(finalPrice * quantity)}</span>
          )}
        </button>
      </div>

      <RosierCartDrawer />
      <WishlistDrawer
        accent="#c8334c"
        bgClass="bg-[#fdfaf6]"
        textClass="text-[#1a1413]"
        mutedClass="text-[#78685f]"
        borderClass="border-[#e8dfd8]"
        itemBgClass="bg-[#f5ece2]"
        cartBtnClass="bg-[#c8334c] text-white hover:bg-[#9b2237]"
      />
    </div>
  )
}
