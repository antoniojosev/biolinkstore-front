'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Menu,
  X,
  MessageCircle,
  Phone,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Check,
  ChevronRight,
  ArrowRight,
  Bookmark,
  Grid3x3,
} from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { trackEvent } from '@/lib/analytics'
import { InmueblesCartDrawer } from './cart-drawer'
import { InmueblesPropertyCard } from './property-card'
import type { ProductDetail, Product } from '@/lib/types'

interface Props {
  product: ProductDetail
}

function buildWaHref(phone: string | undefined, message: string): string {
  if (!phone) return '#'
  const clean = phone.replace(/\D/g, '')
  if (!clean) return '#'
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

export function InmueblesProductDetail({ product }: Props) {
  const { store, products, paymentProvider } = useStore()
  const { items, addItem, removeItem, totalItems, setIsOpen: openCart } =
    useCart()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')

  const backHref = `/${store.slug}${preview ? `?preview=${preview}` : ''}`

  const [selectedImage, setSelectedImage] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inquiryLoading, setInquiryLoading] = useState(false)

  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!drawerOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => closeBtnRef.current?.focus(), 50)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false)
        return
      }
      if (e.key !== 'Tab' || !drawerRef.current) return
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      clearTimeout(t)
      previouslyFocused?.focus?.()
    }
  }, [drawerOpen])

  const images = product.images.length > 0 ? product.images : ['/placeholder.svg']
  const mainImage = images[selectedImage] ?? images[0]
  const thumbs = images.slice(0, 4)
  const extraImagesCount = images.length - thumbs.length

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const specAttrs = product.attributes.filter((a) => a.role === 'spec')
  const specMap: Record<string, string> = {}
  for (const a of specAttrs) if (a.options[0]) specMap[a.name] = a.options[0]

  const tagAttrs = product.attributes.filter((a) => a.role === 'tag')
  const tagList: string[] = []
  for (const a of tagAttrs) for (const opt of a.options) tagList.push(opt)

  const hab = specMap['Habitaciones'] ?? specMap['Hab']
  const bath = specMap['Baños'] ?? specMap['Banos']
  const m2 = specMap['m²'] ?? specMap['m2']
  const parking = specMap['Estacionamientos'] ?? specMap['Parking']
  const operation = specMap['Operación']?.toLowerCase()
  const isRental = operation === 'alquiler'
  const operationLabel = isRental
    ? 'Alquiler'
    : operation === 'preventa'
      ? 'Preventa'
      : 'Venta'

  const isSaved = items.some((i) => i.productId === product.id)
  const toggleSave = () => {
    if (isSaved) {
      const cartItem = items.find((i) => i.productId === product.id)
      if (cartItem) removeItem(cartItem.id)
    } else {
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
      })
    }
  }

  const waPhone = store.whatsappNumbers?.[0]
  const waVisit = buildWaHref(
    waPhone,
    `Hola ${store.name}, me interesa ${product.name} (${fmt(product.price)} ${store.currency}). ¿Cuándo podemos coordinar una visita?`,
  )
  const waMain = buildWaHref(
    waPhone,
    `Hola ${store.name}, te escribo desde tu sitio web.`,
  )
  const telHref = waPhone ? `tel:${waPhone.replace(/\s+/g, '')}` : undefined

  const similar = useMemo<Product[]>(() => {
    return products
      .filter((p) => p.id !== product.id)
      .slice(0, 3)
  }, [products, product.id])

  const logoLabel = store.name

  const handleInquiry = async () => {
    setInquiryLoading(true)
    trackEvent(store.slug, 'CHECKOUT_START')
    await paymentProvider.checkout({
      items: [
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: mainImage,
        },
      ],
      total: product.price,
      currency: store.currency,
      storeSlug: store.slug,
    })
    setInquiryLoading(false)
  }

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[200] focus:bg-[#0a0a0a] focus:text-white focus:px-3 focus:py-2 focus:text-xs focus:rounded"
      >
        Saltar al contenido
      </a>

      {/* Top banner */}
      <div
        role="region"
        aria-label="Disponibilidad"
        className="sticky top-0 z-[60] bg-[#0a0a0a] text-white text-xs min-h-[42px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 leading-[1.35] tracking-[.005em]"
      >
        <span
          aria-hidden="true"
          className="w-[7px] h-[7px] rounded-full bg-[#5cb85c] shadow-[0_0_0_3px_rgba(92,184,92,.25)] shrink-0"
        />
        <span className="hidden sm:inline">
          Disponible esta semana · respondo en menos de 1&nbsp;h por&nbsp;
        </span>
        <span className="sm:hidden">Online ahora ·&nbsp;</span>
        <a
          href={waMain}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline underline-offset-[3px] font-medium"
        >
          WhatsApp
        </a>
      </div>

      {/* Page frame */}
      <div
        className="bg-white rounded-t-[18px] relative z-0 min-h-[calc(100dvh-42px)]"
        inert={drawerOpen}
      >
        {/* Nav */}
        <nav
          aria-label="Principal"
          className="sticky top-[42px] z-[50] bg-white/92 backdrop-blur-[14px] [backdrop-filter:saturate(140%)_blur(14px)] border-b border-[#e5e3df] rounded-t-[18px] px-4 sm:px-6"
        >
          <div className="max-w-[1280px] mx-auto flex items-center gap-4 sm:gap-7 py-3.5">
            <Link
              href={backHref}
              translate="no"
              aria-label={`${logoLabel} — inicio`}
              className="flex items-baseline gap-[1px] text-[#0a0a0a] no-underline font-bold text-[18px] sm:text-[20px] -tracking-[.02em] min-w-0 flex-1 lg:flex-none"
            >
              <span className="truncate">{logoLabel}</span>
              <span className="text-[#1a3550] shrink-0">.</span>
            </Link>
            <div className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-[#4a4a4a]">
              <Link href={`${backHref}#destacados`} className="hover:text-[#0a0a0a] transition-colors">
                Propiedades
              </Link>
              <Link href={`${backHref}#sobre-mi`} className="hover:text-[#0a0a0a] transition-colors">
                Sobre mí
              </Link>
              <Link href={`${backHref}#contacto`} className="hover:text-[#0a0a0a] transition-colors">
                Contacto
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-2.5 shrink-0">
              {waPhone && (
                <a
                  href={waVisit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#0a0a0a] text-white no-underline text-[13px] font-medium hover:bg-[#1a3550] hover:-translate-y-[1px] transition-[background-color,transform]"
                  aria-label={`Escribir por WhatsApp sobre ${product.name}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Escribir</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={drawerOpen}
                aria-controls="inmuebles-drawer"
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 border border-[#e5e3df] rounded-full bg-transparent text-[#0a0a0a] text-[13px] font-medium hover:bg-[#f6f5f3] transition-colors"
              >
                <Menu className="w-4 h-4" strokeWidth={1.6} aria-hidden="true" />
                <span className="hidden sm:inline">Menú</span>
              </button>
            </div>
          </div>
        </nav>

        <main id="main" className="pb-28 lg:pb-0">
          {/* Breadcrumb */}
          <nav
            aria-label="Migas de pan"
            className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-4 sm:pt-4 text-xs text-[#8a8a8a]"
          >
            <ol className="flex flex-wrap gap-2 items-center list-none">
              <li>
                <Link href={backHref} className="text-[#8a8a8a] hover:text-[#0a0a0a] transition-colors">
                  Inicio
                </Link>
                <span className="ml-2 opacity-50">/</span>
              </li>
              <li>
                <Link href={`${backHref}#destacados`} className="text-[#8a8a8a] hover:text-[#0a0a0a] transition-colors">
                  Propiedades
                </Link>
                <span className="ml-2 opacity-50">/</span>
              </li>
              <li aria-current="page" className="text-[#0a0a0a] font-medium">
                {product.name}
              </li>
            </ol>
          </nav>

          {/* Gallery */}
          <section
            aria-label="Galería de la propiedad"
            className="max-w-[1280px] mx-auto mt-4 sm:mt-[18px] px-4 sm:px-6 grid gap-2 lg:gap-3 lg:[grid-template-columns:1.5fr_1fr] lg:[height:clamp(380px,60vh,580px)]"
          >
            <button
              type="button"
              onClick={() => setSelectedImage(0)}
              className="relative rounded-md overflow-hidden bg-[#ebe9e4] h-[260px] sm:h-[320px] lg:h-full lg:row-span-2 focus-visible:outline-offset-[3px]"
              aria-label="Ver imagen principal"
            >
              <img
                src={mainImage}
                alt={product.name}
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 bg-white/95 text-[#0a0a0a] px-4 py-2 rounded-full text-xs font-medium shadow-[0_6px_18px_-8px_rgba(0,0,0,.4)] backdrop-blur-[8px]">
                  <Grid3x3 className="w-3 h-3" aria-hidden="true" />
                  Ver las {images.length} fotos
                </span>
              )}
            </button>
            {thumbs.length > 1 && (
              <div className="flex lg:grid lg:grid-cols-2 lg:grid-rows-2 gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-1 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {thumbs.map((img, idx) => {
                  const isActive = selectedImage === idx
                  return (
                    <button
                      key={img + idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      aria-current={isActive ? 'true' : undefined}
                      aria-label={`Ver imagen ${idx + 1}${isActive ? ' (seleccionada)' : ''}`}
                      className={`relative rounded-md overflow-hidden bg-[#ebe9e4] w-[140px] lg:w-auto h-[90px] lg:h-full snap-start group shrink-0 transition-[outline,opacity] ${
                        isActive
                          ? 'outline outline-2 outline-[#1a3550] outline-offset-2'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] [transition-timing-function:cubic-bezier(.2,.7,.3,1)]"
                      />
                      {idx === thumbs.length - 1 && extraImagesCount > 0 && (
                        <span className="absolute inset-0 bg-black/55 text-white text-xs font-semibold grid place-items-center">
                          +{extraImagesCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Listing */}
          <article className="max-w-[1280px] mx-auto px-4 sm:px-6 py-9 sm:py-[50px] grid gap-8 lg:gap-[60px] lg:[grid-template-columns:1.45fr_1fr] items-start">
            <div>
              <header>
                {product.featured && (
                  <span className="inline-block text-[10px] font-semibold tracking-[.14em] uppercase text-[#1a3550] bg-[#f6f5f3] px-2.5 py-1.5 rounded-[3px] mb-4">
                    Destacada
                  </span>
                )}
                <h1 className="text-[clamp(28px,4.4vw,48px)] font-semibold leading-[1.05] -tracking-[.02em] text-balance mb-3">
                  {product.name}
                </h1>
                {product.category && (
                  <p className="flex items-center gap-1.5 text-sm text-[#4a4a4a] mb-7">
                    <MapPin
                      className="w-3.5 h-3.5 opacity-70"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    {product.category}
                  </p>
                )}

                {(hab || bath || m2 || parking) && (
                  <ul className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-4 border-y border-[#e5e3df] py-5 mb-9 list-none">
                    {hab && (
                      <li className="flex flex-col gap-1">
                        <Bed className="w-[18px] h-[18px] opacity-55 mb-1.5" strokeWidth={1.6} aria-hidden="true" />
                        <strong className="text-[18px] font-semibold tabular-nums -tracking-[.01em]">
                          {hab}
                        </strong>
                        <span className="text-[11px] text-[#8a8a8a] uppercase tracking-[.12em]">
                          Habitaciones
                        </span>
                      </li>
                    )}
                    {bath && (
                      <li className="flex flex-col gap-1">
                        <Bath className="w-[18px] h-[18px] opacity-55 mb-1.5" strokeWidth={1.6} aria-hidden="true" />
                        <strong className="text-[18px] font-semibold tabular-nums -tracking-[.01em]">
                          {bath}
                        </strong>
                        <span className="text-[11px] text-[#8a8a8a] uppercase tracking-[.12em]">
                          Baños
                        </span>
                      </li>
                    )}
                    {m2 && (
                      <li className="flex flex-col gap-1">
                        <Square className="w-[18px] h-[18px] opacity-55 mb-1.5" strokeWidth={1.6} aria-hidden="true" />
                        <strong className="text-[18px] font-semibold tabular-nums -tracking-[.01em]">
                          {m2}&nbsp;m²
                        </strong>
                        <span className="text-[11px] text-[#8a8a8a] uppercase tracking-[.12em]">
                          Construcción
                        </span>
                      </li>
                    )}
                    {parking && (
                      <li className="flex flex-col gap-1">
                        <Car className="w-[18px] h-[18px] opacity-55 mb-1.5" strokeWidth={1.6} aria-hidden="true" />
                        <strong className="text-[18px] font-semibold tabular-nums -tracking-[.01em]">
                          {parking}
                        </strong>
                        <span className="text-[11px] text-[#8a8a8a] uppercase tracking-[.12em]">
                          Estacionamientos
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </header>

              {product.description && (
                <section aria-labelledby="desc-h" className="mb-12">
                  <h2
                    id="desc-h"
                    className="text-[18px] font-semibold uppercase tracking-[.14em] text-[#8a8a8a] mb-5 pb-3.5 border-b border-[#e5e3df]"
                  >
                    Descripción
                  </h2>
                  {product.description.split(/\n{2,}/).map((para, i) => (
                    <p
                      key={i}
                      className="text-[15px] text-[#4a4a4a] leading-[1.75] mb-3.5 last:mb-0 max-w-[64ch] text-pretty"
                    >
                      {para}
                    </p>
                  ))}
                </section>
              )}

              {tagList.length > 0 && (
                <section aria-labelledby="feat-h" className="mb-12">
                  <h2
                    id="feat-h"
                    className="text-[18px] font-semibold uppercase tracking-[.14em] text-[#8a8a8a] mb-5 pb-3.5 border-b border-[#e5e3df]"
                  >
                    Características
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-7 list-none">
                    {tagList.map((t) => (
                      <li
                        key={t}
                        className="flex items-center gap-3 py-2.5 text-sm text-[#0a0a0a] border-b border-dashed border-[#e5e3df]"
                      >
                        <Check
                          className="w-4 h-4 text-[#1a3550] shrink-0"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Sticky aside */}
            <aside
              aria-label="Precio y contacto"
              className="lg:sticky lg:top-[110px] flex flex-col gap-4"
            >
              <div className="bg-white border border-[#e5e3df] rounded-xl p-6 shadow-[0_8px_30px_-20px_rgba(0,0,0,.25)]">
                <p className="text-[11px] uppercase tracking-[.18em] text-[#8a8a8a] font-medium mb-2">
                  Precio {isRental ? 'de alquiler' : 'de venta'}
                </p>
                <p className="text-[clamp(28px,4.4vw,40px)] font-semibold tabular-nums -tracking-[.02em] leading-none mb-1">
                  {fmt(product.price)}
                  {isRental && (
                    <span className="text-sm text-[#8a8a8a] font-medium ml-1">
                      /mes
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#8a8a8a] mb-6">
                  {store.currency} · {operationLabel}
                </p>

                <div className="flex flex-col gap-2.5">
                  {waPhone ? (
                    <a
                      href={waVisit}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#0a0a0a] text-white no-underline text-sm font-medium hover:bg-[#1a3550] transition-colors active:scale-[0.99]"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      Contactar por WhatsApp
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleInquiry}
                      disabled={inquiryLoading}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a3550] transition-colors disabled:opacity-50 active:scale-[0.99]"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      {inquiryLoading ? 'Enviando…' : 'Consultar disponibilidad'}
                    </button>
                  )}
                  {telHref && (
                    <a
                      href={telHref}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-transparent text-[#0a0a0a] no-underline text-sm font-medium border border-[#e5e3df] hover:bg-[#f6f5f3] hover:border-[#0a0a0a] transition-[background-color,border-color]"
                    >
                      <Phone className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
                      Llamar por teléfono
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={toggleSave}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium border transition-colors ${
                      isSaved
                        ? 'bg-[#1a3550] text-white border-[#1a3550]'
                        : 'bg-transparent text-[#4a4a4a] border-[#e5e3df] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                    }`}
                  >
                    <Bookmark
                      className="w-4 h-4"
                      fill={isSaved ? 'currentColor' : 'none'}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    {isSaved ? 'Guardada' : 'Guardar'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[#e5e3df]">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[.14em] text-[#8a8a8a] mb-1">
                      Referencia
                    </span>
                    <strong className="block text-sm font-semibold text-[#0a0a0a] tabular-nums">
                      {product.id.slice(0, 10).toUpperCase()}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[.14em] text-[#8a8a8a] mb-1">
                      Estado
                    </span>
                    <strong className="block text-sm font-semibold text-[#0a0a0a]">
                      {product.inStock ? 'Disponible' : 'No disponible'}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[.14em] text-[#8a8a8a] mb-1">
                      Operación
                    </span>
                    <strong className="block text-sm font-semibold text-[#0a0a0a]">
                      {operationLabel}
                    </strong>
                  </div>
                  {product.category && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-[.14em] text-[#8a8a8a] mb-1">
                        Zona
                      </span>
                      <strong className="block text-sm font-semibold text-[#0a0a0a] line-clamp-1">
                        {product.category}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent card */}
              <div className="bg-white border border-[#e5e3df] rounded-xl p-4 flex items-center gap-3.5">
                <img
                  src={store.avatar ?? '/placeholder.svg'}
                  alt={store.name}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="w-14 h-14 rounded-full object-cover bg-[#ebe9e4]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-[.14em] text-[#8a8a8a] font-medium">
                    Asesor
                  </p>
                  <strong
                    translate="no"
                    className="block text-sm font-semibold text-[#0a0a0a] -tracking-[.01em] truncate"
                  >
                    {store.name}
                  </strong>
                  <small className="block text-xs text-[#8a8a8a]">
                    Responde en menos de 1&nbsp;h
                  </small>
                </div>
              </div>
            </aside>
          </article>

          {/* Similar */}
          {similar.length > 0 && (
            <section
              aria-labelledby="sim-h"
              className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-20 sm:pb-[100px]"
            >
              <div className="flex items-end justify-between gap-4 border-b border-[#e5e3df] pb-5 mb-8">
                <h2
                  id="sim-h"
                  className="text-[clamp(22px,3vw,32px)] font-semibold -tracking-[.02em] text-balance"
                >
                  Propiedades similares
                </h2>
                <Link
                  href={`${backHref}#destacados`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4a4a4a] hover:text-[#0a0a0a] transition-colors whitespace-nowrap"
                >
                  Ver todo
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 list-none">
                {similar.map((p) => (
                  <InmueblesPropertyCard key={p.id} product={p} />
                ))}
              </ul>
            </section>
          )}
        </main>

        {/* Mobile sticky CTA */}
        <div
          role="region"
          aria-label="Acciones rápidas"
          className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-lg border-t border-[#e5e3df] px-4 py-3 flex items-center gap-3"
          style={{
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
        >
          <div className="flex-1 min-w-0">
            <strong className="block text-sm font-semibold text-[#0a0a0a] tabular-nums truncate">
              {fmt(product.price)}
              {isRental && (
                <span className="text-xs text-[#8a8a8a] font-medium"> /mes</span>
              )}
            </strong>
            <span className="block text-[11px] text-[#8a8a8a] truncate">
              {store.currency} · {operationLabel}
            </span>
          </div>
          {waPhone ? (
            <a
              href={waVisit}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#0a0a0a] text-white no-underline text-sm font-medium active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Contactar
            </a>
          ) : (
            <button
              type="button"
              onClick={handleInquiry}
              disabled={inquiryLoading}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#0a0a0a] text-white text-sm font-medium disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              {inquiryLoading ? 'Enviando…' : 'Consultar'}
            </button>
          )}
        </div>
      </div>

      {/* Drawer backdrop */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[90] transition-opacity duration-[250ms] ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        id="inmuebles-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title-pd"
        aria-hidden={!drawerOpen}
        className={`fixed top-0 right-0 bottom-0 w-[min(420px,92vw)] bg-white z-[100] flex flex-col overflow-y-auto [overscroll-behavior:contain] shadow-[-20px_0_50px_-20px_rgba(0,0,0,.3)] transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(.2,.7,.3,1)] px-7 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          paddingTop: 'max(20px, env(safe-area-inset-top))',
          paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center justify-between mb-9">
          <span
            id="drawer-title-pd"
            translate="no"
            className="font-bold text-[18px] -tracking-[.02em] text-[#0a0a0a]"
          >
            {logoLabel}
            <span className="text-[#1a3550]">.</span>
          </span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar menú"
            className="w-[38px] h-[38px] rounded-full border border-[#e5e3df] bg-transparent grid place-items-center text-[#0a0a0a] hover:bg-[#f6f5f3] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <ul className="list-none flex flex-col gap-1 mb-9">
          {[
            { href: `${backHref}#destacados`, label: 'Propiedades' },
            { href: `${backHref}#sobre-mi`, label: 'Sobre mí' },
            { href: `${backHref}#contacto`, label: 'Contacto' },
          ].map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={closeDrawer}
                className="flex items-center justify-between py-[18px] text-[22px] font-medium text-[#0a0a0a] no-underline border-b border-[#e5e3df] -tracking-[.01em] hover:text-[#1a3550] group transition-colors"
              >
                {item.label}
                <ChevronRight
                  className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-[transform,opacity]"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6 border-t border-[#e5e3df]">
          <p className="text-[11px] uppercase tracking-[.18em] text-[#8a8a8a] font-medium mb-3.5">
            ¿Buscas algo puntual?
          </p>
          {waPhone && (
            <a
              href={waMain}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeDrawer}
              className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-[#0a0a0a] text-white rounded-full no-underline text-sm font-medium hover:bg-[#1a3550] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              Escribir por WhatsApp
            </a>
          )}
        </div>
      </aside>

      {/* Saved-properties floating button (hidden on mobile because bottom CTA is there) */}
      {totalItems > 0 && (
        <button
          type="button"
          onClick={() => openCart(true)}
          className="hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-5 h-12 rounded-full bg-[#0a0a0a] hover:bg-[#1a3550] text-white text-sm font-semibold shadow-lg transition-colors active:scale-[0.99]"
        >
          <Bookmark className="w-4 h-4" aria-hidden="true" />
          <span className="bg-white text-[#0a0a0a] text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums">
            {totalItems}
          </span>
          Guardadas
        </button>
      )}

      <InmueblesCartDrawer />
    </div>
  )
}
