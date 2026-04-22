'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Menu,
  X,
  MessageCircle,
  Search,
  ArrowRight,
  Instagram,
  Mail,
  Bookmark,
} from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { InmueblesPropertyCard } from './property-card'
import { InmueblesCartDrawer } from './cart-drawer'
import type { Product } from '@/lib/types'

type OperationFilter = 'todas' | 'comprar' | 'alquilar' | 'preventa'

const FILTERS: Array<{ id: OperationFilter; label: string }> = [
  { id: 'todas', label: 'Todas' },
  { id: 'comprar', label: 'Comprar' },
  { id: 'alquilar', label: 'Alquilar' },
  { id: 'preventa', label: 'Preventa' },
]

function detectOperation(product: Product): OperationFilter {
  const tags = (product.tags ?? []).map((t) => t.toLowerCase())
  const op = product.specs?.['Operación']?.toLowerCase()
  if (tags.includes('preventa') || op === 'preventa') return 'preventa'
  if (tags.includes('alquiler') || op === 'alquiler') return 'alquilar'
  return 'comprar'
}

function buildWaHref(
  phone: string | undefined,
  message: string,
): string {
  if (!phone) return '#'
  const clean = phone.replace(/\D/g, '')
  if (!clean) return '#'
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

export function InmueblesTemplate() {
  const { store, products } = useStore()
  const { totalItems, setIsOpen: openCart } = useCart()

  const [filter, setFilter] = useState<OperationFilter>('todas')
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [year, setYear] = useState<number | null>(null)

  const openBtnRef = useRef<HTMLButtonElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  useEffect(() => {
    if (!drawerOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const focusTimer = setTimeout(() => closeBtnRef.current?.focus(), 50)

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
      clearTimeout(focusTimer)
      previouslyFocused?.focus?.()
    }
  }, [drawerOpen])

  const waPhone = store.whatsappNumbers?.[0]
  const waMain = buildWaHref(
    waPhone,
    `Hola ${store.name}, te escribo desde tu sitio web.`,
  )
  const waCta = buildWaHref(
    waPhone,
    `Hola ${store.name}, quiero más información sobre tus propiedades.`,
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((p) => {
      if (filter !== 'todas' && detectOperation(p) !== filter) return false
      if (!query) return true
      return (
        p.name.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    })
  }, [products, filter, search])

  const featured = useMemo(
    () => products.find((p) => p.featured && p.inStock) ?? products[0],
    [products],
  )

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const logoLabel = store.name
  const shortBio =
    store.bio ??
    `Acompaño a comprar, alquilar o vender tu propiedad. Con calma, datos reales y acceso directo a los mejores proyectos.`

  const heroPoster = store.coverImage ?? '/cover.webp'

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
        className="sticky top-0 z-[60] bg-[#0a0a0a] text-white text-xs min-h-[42px] sm:min-h-[42px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 leading-[1.35] tracking-[.005em]"
        style={{
          paddingTop: 'max(10px, env(safe-area-inset-top))',
          paddingLeft: 'max(14px, env(safe-area-inset-left))',
          paddingRight: 'max(14px, env(safe-area-inset-right))',
        }}
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
          className="text-white underline underline-offset-[3px] font-medium whitespace-nowrap"
        >
          WhatsApp
        </a>
      </div>

      {/* Page frame (tab effect) */}
      <div
        className="bg-white rounded-t-[18px] relative z-0 min-h-[calc(100dvh-42px)]"
        inert={drawerOpen}
      >
        {/* Nav */}
        <nav
          aria-label="Principal"
          className="sticky top-[42px] z-[50] bg-white/92 backdrop-blur-[14px] [backdrop-filter:saturate(140%)_blur(14px)] border-b border-[#e5e3df] rounded-t-[18px]"
          style={{
            paddingLeft: 'max(16px, env(safe-area-inset-left))',
            paddingRight: 'max(16px, env(safe-area-inset-right))',
          }}
        >
          <div className="max-w-[1280px] mx-auto flex items-center gap-4 sm:gap-7 py-3.5">
            <a
              href="#main"
              translate="no"
              className="flex items-baseline gap-[1px] text-[#0a0a0a] no-underline font-bold text-[18px] sm:text-[20px] -tracking-[.02em] min-w-0 flex-1 lg:flex-none"
              aria-label={`${logoLabel} — inicio`}
            >
              <span className="truncate">{logoLabel}</span>
              <span className="text-[#1a3550] shrink-0">.</span>
            </a>
            <div className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-[#4a4a4a]">
              <a
                href="#destacados"
                className="no-underline text-inherit hover:text-[#0a0a0a] transition-colors"
              >
                Propiedades
              </a>
              <a
                href="#destacados"
                className="no-underline bg-[#f6f5f3] text-[#0a0a0a] px-3 py-[7px] rounded-[4px]"
              >
                En preventa
              </a>
              <a
                href="#sobre-mi"
                className="no-underline text-inherit hover:text-[#0a0a0a] transition-colors"
              >
                Sobre mí
              </a>
              <a
                href="#contacto"
                className="no-underline text-inherit hover:text-[#0a0a0a] transition-colors"
              >
                Contacto
              </a>
            </div>
            <div className="ml-auto flex items-center gap-2.5 shrink-0">
              {waPhone && (
                <a
                  href={waMain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#0a0a0a] text-white no-underline text-[13px] font-medium hover:bg-[#1a3550] hover:-translate-y-[1px] transition-[background-color,transform]"
                  aria-label="Escribir por WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Escribir</span>
                </a>
              )}
              <button
                ref={openBtnRef}
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

        <main id="main">
          {/* Hero */}
          <header className="relative isolate overflow-hidden text-white flex flex-col items-center justify-center px-4 sm:px-6 pt-14 sm:pt-20 pb-28 sm:pb-[140px] min-h-[clamp(520px,78dvh,780px)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-[2] bg-[#1a1a1a] overflow-hidden"
            >
              <img
                src={heroPoster}
                alt=""
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.45)_0%,rgba(0,0,0,.25)_35%,rgba(0,0,0,.6)_100%)]" />
            </div>

            <p className="inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[.22em] mb-5 sm:mb-6 opacity-90 before:content-[''] before:w-[22px] before:h-px before:bg-white/50 after:content-[''] after:w-[22px] after:h-px after:bg-white/50">
              {store.bio ? 'Asesor inmobiliario' : `Asesor inmobiliario · ${store.name}`}
            </p>
            <h1 className="text-[clamp(36px,7vw,82px)] font-semibold leading-[1.04] text-center max-w-[980px] -tracking-[.02em] text-balance">
              Tu próxima casa{' '}
              <span className="text-white/70">la encontramos juntos.</span>
            </h1>
            <p className="mt-5 text-sm sm:text-[14px] text-center opacity-85 max-w-[540px] leading-[1.6] text-pretty">
              {shortBio}
            </p>

            <form
              role="search"
              className="mt-8 sm:mt-9 w-full max-w-[680px] bg-white rounded-full pl-5 pr-1.5 py-1.5 flex items-center gap-2 shadow-[0_18px_40px_-16px_rgba(0,0,0,.35)]"
              onSubmit={(e) => {
                e.preventDefault()
                document
                  .getElementById('destacados')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <label htmlFor="heroSearch" className="sr-only">
                Buscar propiedades
              </label>
              <input
                id="heroSearch"
                type="search"
                autoComplete="off"
                spellCheck={false}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por zona, tipo o precio…"
                className="flex-1 bg-transparent border-0 outline-0 text-sm text-[#0a0a0a] py-3 min-w-0 placeholder:text-[#8a8a8a]"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="w-11 h-11 rounded-full bg-[#1a3550] hover:bg-[#2a4a6a] text-white grid place-items-center transition-colors active:scale-95 shrink-0"
              >
                <Search className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </form>

            {/* Quick filters — derived from top categories */}
            <nav
              aria-label="Filtros rápidos"
              className="mt-5 flex gap-2 flex-wrap justify-center list-none"
            >
              {products
                .slice(0, 4)
                .map((p) => p.category)
                .filter(
                  (c, i, arr): c is string =>
                    Boolean(c) && arr.indexOf(c) === i,
                )
                .slice(0, 4)
                .map((chip) => (
                  <a
                    key={chip}
                    href="#destacados"
                    onClick={() => setSearch(chip)}
                    className="px-3.5 py-[7px] border border-white/35 rounded-full text-white no-underline text-xs font-medium bg-white/10 backdrop-blur-[6px] hover:bg-white/[.18] hover:border-white transition-[background-color,border-color]"
                  >
                    {chip}
                  </a>
                ))}
            </nav>
          </header>

          {/* Featured peek */}
          {featured && (
            <section
              aria-label="Propiedad destacada"
              className="relative z-[5] -mt-20 sm:-mt-[90px] px-4 sm:px-6 max-w-[1280px] mx-auto"
            >
              <a
                href={
                  featured.slug
                    ? `/${store.slug}/${featured.slug}`
                    : '#destacados'
                }
                className="flex items-center gap-3 sm:gap-4 bg-white rounded-lg p-3.5 sm:p-[18px] max-w-[440px] text-[#0a0a0a] no-underline shadow-[0_30px_70px_-20px_rgba(0,0,0,.3)] hover:-translate-y-1 transition-transform duration-[250ms] [transition-timing-function:cubic-bezier(.2,.7,.3,1)]"
              >
                <div className="w-20 h-20 sm:w-[100px] sm:h-[100px] rounded overflow-hidden bg-[#ebe9e4] shrink-0">
                  <img
                    src={
                      featured.images?.[0] ??
                      featured.image ??
                      '/placeholder.svg'
                    }
                    alt={featured.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[10px] font-semibold tracking-[.14em] uppercase text-[#1a3550] mb-1.5">
                    Propiedad destacada
                  </span>
                  <h2 className="text-sm sm:text-base font-semibold leading-[1.2] mb-1 -tracking-[.01em] line-clamp-1">
                    {featured.name}
                  </h2>
                  <p className="text-xs text-[#8a8a8a] mb-2 line-clamp-1">
                    {featured.category}
                  </p>
                  <span className="text-[15px] font-semibold text-[#0a0a0a] tabular-nums">
                    {fmtPrice(featured.price)}
                  </span>
                </div>
              </a>
            </section>
          )}

          {/* Segments / properties grid */}
          <section
            id="destacados"
            aria-labelledby="seg-h"
            className="mt-16 sm:mt-[100px] px-4 sm:px-6 max-w-[1280px] mx-auto scroll-mt-[90px]"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#e5e3df] pb-6 mb-8">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[.22em] text-[#8a8a8a] mb-2.5">
                  Portafolio · {products.length} disponible
                  {products.length === 1 ? '' : 's'}
                </p>
                <h2
                  id="seg-h"
                  className="text-[clamp(28px,4vw,44px)] font-semibold leading-[1.05] -tracking-[.02em] text-balance"
                >
                  Mis propiedades
                </h2>
              </div>
              <div
                role="radiogroup"
                aria-label="Filtrar por operación"
                className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {FILTERS.map((f) => {
                  const active = filter === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setFilter(f.id)}
                      className={`shrink-0 px-4 py-2 border rounded-full text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                          : 'bg-transparent text-[#4a4a4a] border-[#e5e3df] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                      }`}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#8a8a8a]">
                No hay propiedades que coincidan con tu búsqueda.
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 list-none">
                {filtered.map((product) => (
                  <InmueblesPropertyCard key={product.id} product={product} />
                ))}
              </ul>
            )}
          </section>

          {/* About me */}
          <section
            id="sobre-mi"
            aria-labelledby="about-h"
            className="mt-20 sm:mt-[140px] px-4 sm:px-6 max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-20 items-center scroll-mt-[90px]"
          >
            <div className="aspect-[4/5] rounded-md overflow-hidden bg-[#ebe9e4] max-w-[400px] mx-auto lg:max-w-none lg:mx-0">
              <img
                src={store.avatar ?? '/placeholder.svg'}
                alt={`Retrato profesional de ${store.name}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="max-w-[500px] min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[.22em] text-[#8a8a8a] mb-4">
                Sobre mí
              </p>
              <h2
                id="about-h"
                className="text-[clamp(28px,4vw,48px)] font-semibold leading-[1.05] -tracking-[.02em] text-balance mb-6"
              >
                Años viendo cómo se mueve el mercado.
              </h2>
              <p className="text-[15px] text-[#4a4a4a] leading-[1.7] mb-3.5 text-pretty">
                {shortBio}
              </p>
              <p className="text-[15px] text-[#4a4a4a] leading-[1.7] mb-3.5 text-pretty">
                Mi forma de trabajar: pocas propiedades, conversación larga,
                recorridos con tiempo. Cero presión.
              </p>
              <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-9 border-t border-[#e5e3df] pt-7">
                <div>
                  <strong className="block text-[22px] sm:text-[28px] font-semibold -tracking-[.02em] leading-none mb-1.5 tabular-nums">
                    {products.length}+
                  </strong>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[.16em] text-[#8a8a8a] font-medium">
                    Propiedades
                  </span>
                </div>
                <div>
                  <strong className="block text-[22px] sm:text-[28px] font-semibold -tracking-[.02em] leading-none mb-1.5 tabular-nums">
                    12
                  </strong>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[.16em] text-[#8a8a8a] font-medium">
                    Años de carrera
                  </span>
                </div>
                <div>
                  <strong className="block text-[22px] sm:text-[28px] font-semibold -tracking-[.02em] leading-none mb-1.5 tabular-nums">
                    &lt;&nbsp;1h
                  </strong>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[.16em] text-[#8a8a8a] font-medium">
                    Respuesta
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Big CTA */}
          <section
            aria-labelledby="cta-h"
            className="mt-20 sm:mt-[140px] py-20 sm:py-[100px] px-4 sm:px-6 bg-[#f6f5f3] text-center"
          >
            <p className="text-[11px] uppercase tracking-[.22em] text-[#8a8a8a] mb-4 sm:mb-5 font-medium">
              ¿Quieres vender o buscas algo puntual?
            </p>
            <h2
              id="cta-h"
              className="text-[clamp(30px,5.5vw,60px)] font-semibold leading-[1.05] -tracking-[.02em] text-balance max-w-[820px] mx-auto mb-5 sm:mb-6"
            >
              Escríbeme. Respondo yo, no un call&nbsp;center.
            </h2>
            <p className="text-[#4a4a4a] text-[15px] max-w-[540px] mx-auto mb-8 leading-[1.6] text-pretty">
              Cuéntame qué buscas o qué quieres vender y te contacto el mismo
              día con opciones reales.
            </p>
            <a
              href={waCta}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-4 bg-[#0a0a0a] text-white no-underline rounded-full text-sm font-medium hover:bg-[#1a3550] hover:-translate-y-[1px] transition-[background-color,transform]"
            >
              Escribir por WhatsApp
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
            </a>
          </section>
        </main>

        {/* Footer */}
        <footer id="contacto" className="px-4 sm:px-6 pt-[70px] pb-8 bg-[#0a0a0a] text-white/75">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr] gap-8 sm:gap-10 mb-12">
            <div>
              <div
                translate="no"
                className="text-white text-[22px] font-bold -tracking-[.02em] mb-4"
              >
                {logoLabel}
                <span className="text-[#6f9bc7]">.</span>
              </div>
              <p className="text-[13px] leading-[1.7] max-w-[320px] mb-5 text-pretty">
                {shortBio}
              </p>
              <div className="flex flex-col gap-2 text-[13px]">
                {waPhone && (
                  <a
                    href={waMain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/85 hover:text-white no-underline inline-flex items-center gap-2.5 transition-colors"
                  >
                    <MessageCircle
                      className="w-3.5 h-3.5 opacity-70"
                      aria-hidden="true"
                    />
                    {waPhone}
                  </a>
                )}
                <a
                  href={`mailto:${store.slug}@ejemplo.com`}
                  className="text-white/85 hover:text-white no-underline inline-flex items-center gap-2.5 transition-colors"
                >
                  <Mail
                    className="w-3.5 h-3.5 opacity-70"
                    aria-hidden="true"
                    strokeWidth={1.6}
                  />
                  Escribir por email
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white text-[11px] font-semibold uppercase tracking-[.18em] mb-4">
                Propiedades
              </h3>
              <ul className="flex flex-col gap-2.5 list-none">
                {FILTERS.filter((f) => f.id !== 'todas').map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setFilter(f.id)
                        document
                          .getElementById('destacados')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="text-white/70 hover:text-white text-[13px] text-left transition-colors bg-transparent p-0 border-0 cursor-pointer"
                    >
                      {f.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white text-[11px] font-semibold uppercase tracking-[.18em] mb-4">
                Zonas
              </h3>
              <ul className="flex flex-col gap-2.5 list-none">
                {Array.from(
                  new Set(
                    products
                      .map((p) => p.category)
                      .filter((c): c is string => Boolean(c)),
                  ),
                )
                  .slice(0, 4)
                  .map((zone) => (
                    <li key={zone}>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch(zone)
                          document
                            .getElementById('destacados')
                            ?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="text-white/70 hover:text-white text-[13px] text-left transition-colors bg-transparent p-0 border-0 cursor-pointer"
                      >
                        {zone}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="max-w-[1280px] mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-xs text-white/50">
            <span>
              {year !== null && <>© {year} </>}
              <span translate="no">{logoLabel}</span> · Asesor inmobiliario
            </span>
            <div className="flex gap-2.5">
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-[34px] h-[34px] rounded-full border border-white/20 grid place-items-center text-white hover:bg-white/10 hover:border-white transition-[background-color,border-color]"
                >
                  <Instagram
                    className="w-3.5 h-3.5"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </a>
              )}
              {waPhone && (
                <a
                  href={waMain}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-[34px] h-[34px] rounded-full border border-white/20 grid place-items-center text-white hover:bg-white/10 hover:border-white transition-[background-color,border-color]"
                >
                  <MessageCircle
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  />
                </a>
              )}
            </div>
            <span>
              Creado con <span translate="no">ByLink</span>
            </span>
          </div>
        </footer>
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
        aria-labelledby="drawer-title"
        inert={!drawerOpen}
        className={`fixed top-0 right-0 bottom-0 w-[min(420px,92vw)] bg-white z-[100] flex flex-col overflow-y-auto [overscroll-behavior:contain] shadow-[-20px_0_50px_-20px_rgba(0,0,0,.3)] transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(.2,.7,.3,1)] ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          paddingTop: 'max(20px, env(safe-area-inset-top))',
          paddingRight: 'max(28px, env(safe-area-inset-right))',
          paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
          paddingLeft: '28px',
        }}
      >
        <div className="flex items-center justify-between mb-9">
          <span
            id="drawer-title"
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
            { href: '#destacados', label: 'Propiedades' },
            { href: '#destacados', label: 'En preventa' },
            { href: '#sobre-mi', label: 'Sobre mí' },
            { href: '#contacto', label: 'Contacto' },
          ].map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={closeDrawer}
                className="flex items-center justify-between py-[18px] text-[22px] font-medium text-[#0a0a0a] no-underline border-b border-[#e5e3df] -tracking-[.01em] hover:text-[#1a3550] group transition-colors"
              >
                {item.label}
                <ArrowRight
                  className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-[transform,opacity]"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </a>
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

      {/* Floating saved-properties button */}
      {totalItems > 0 && (
        <div
          className="fixed bottom-0 inset-x-0 z-30 p-4 bg-white/95 backdrop-blur-lg border-t border-[#e5e3df]"
          style={{
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          }}
        >
          <button
            type="button"
            onClick={() => openCart(true)}
            className="w-full max-w-[720px] mx-auto h-12 flex items-center justify-between px-5 rounded-full bg-[#0a0a0a] hover:bg-[#1a3550] text-white text-sm font-semibold transition-colors active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4" aria-hidden="true" />
              <span className="bg-white text-[#0a0a0a] text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                {totalItems}
              </span>
            </div>
            <span>Ver propiedades guardadas</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <InmueblesCartDrawer />
    </div>
  )
}
