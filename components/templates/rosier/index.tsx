'use client'

import { useState, useMemo } from 'react'
import { Menu, X, Search, Heart, ShoppingBag, ArrowRight, Instagram, MessageCircle, Star, Home, Grid3x3, User } from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { RosierProductCard } from './product-card'
import { RosierCartDrawer } from './cart-drawer'
import { WishlistDrawer } from '@/components/templates/shared/wishlist-drawer'

const SERIF = { fontFamily: 'var(--font-fraunces)' }

const MARQUEE_ITEMS = [
  'Envío a toda Venezuela',
  '3 cuotas sin interés',
  'Cambios en 30 días',
  'Atención por WhatsApp',
  'Pago en USD o Bs.',
  'Stock limitado por drop',
]

const TESTIMONIALS = [
  {
    quote: 'La calidad del satín es una locura. Lo recibí en 2 días y me quedó perfecto a la primera.',
    name: 'Camila R.',
    city: 'Caracas',
  },
  {
    quote: 'Me encanta que responden por WhatsApp al toque. Me aconsejaron la talla y acertaron.',
    name: 'Valentina M.',
    city: 'Valencia',
  },
  {
    quote: 'Tercera compra en dos meses. Las fotos no le hacen justicia al abrigo, es aún mejor en persona.',
    name: 'Isabela T.',
    city: 'Maracaibo',
  },
]

export function RosierTemplate() {
  const { store, products, categories } = useStore()
  const { totalItems, setIsOpen } = useCart()
  const { totalItems: wishCount, setIsOpen: openWishlist } = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const wishlistEnabled = store.plan === 'PRO' || store.plan === 'BUSINESS'

  const whatsapp = store.whatsappNumbers?.[0]
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${store.name}, quiero más información.`)}`
    : '#'

  const categoryPool = useMemo(() => categories.slice(0, 6), [categories])
  const featured = useMemo(
    () => products.filter((p) => p.inStock).slice(0, 8),
    [products],
  )

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-[#1a1413] font-sans pb-[68px] lg:pb-0">

      {/* ───── NAV ───── */}
      <nav
        aria-label="Principal"
        className="sticky top-0 z-40 bg-[rgba(253,250,246,0.92)] backdrop-blur-[14px] backdrop-saturate-150 border-b border-[#e8dfd8] flex items-center gap-2 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 lg:px-8 lg:py-4 lg:gap-6"
      >
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          className="w-10 h-10 rounded-full grid place-items-center hover:bg-[#f5ece2] transition-colors"
        >
          <Menu className="w-5 h-5" strokeWidth={1.8} />
        </button>

        <a
          href="#"
          translate="no"
          aria-label={store.name}
          className="text-[#c8334c] text-[22px] lg:text-[26px] font-semibold italic tracking-tight mx-auto lg:mx-0"
          style={SERIF}
        >
          {store.name}
          <span className="text-[#1a1413] not-italic ml-0.5">.</span>
        </a>

        <div className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-[#5a4b48] ml-1">
          {categoryPool.slice(0, 3).map((cat) => (
            <a key={cat.id} href="#destacados" className="hover:text-[#c8334c] transition-colors">
              {cat.name}
            </a>
          ))}
          <a href="#sale" className="text-[#c8334c] font-semibold">Sale −30%</a>
        </div>

        <div className="flex items-center gap-0.5 ml-auto">
          {wishlistEnabled && (
            <button
              type="button"
              onClick={() => openWishlist(true)}
              aria-label={`Favoritos${wishCount > 0 ? ` (${wishCount})` : ''}`}
              className="relative w-10 h-10 rounded-full grid place-items-center hover:bg-[#f5ece2] transition-colors"
            >
              <Heart className="w-[19px] h-[19px]" strokeWidth={1.6} />
              {wishCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#c8334c] text-white text-[10px] font-semibold grid place-items-center tabular-nums leading-none">
                  {wishCount}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label={`Abrir carrito${totalItems > 0 ? ` (${totalItems} artículos)` : ''}`}
            className="relative w-10 h-10 rounded-full grid place-items-center hover:bg-[#f5ece2] transition-colors"
          >
            <ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.6} />
            {totalItems > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#c8334c] text-white text-[10px] font-semibold grid place-items-center tabular-nums leading-none">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ───── DRAWER MENU ───── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[90] bg-[rgba(26,20,19,0.55)] backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        className={`fixed top-0 left-0 bottom-0 z-[100] w-[min(380px,88vw)] bg-[#fdfaf6] shadow-[20px_0_50px_-20px_rgba(0,0,0,0.3)] transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(.2,.7,.3,1)] flex flex-col px-6 pt-[max(18px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-7">
          <span translate="no" className="text-[20px] font-semibold italic text-[#c8334c] tracking-tight" style={SERIF}>
            {store.name}<span className="text-[#1a1413] not-italic ml-0.5">.</span>
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="w-9 h-9 rounded-full border border-[#e8dfd8] grid place-items-center hover:bg-[#f5ece2] transition-colors"
          >
            <X className="w-[15px] h-[15px]" strokeWidth={2} />
          </button>
        </div>

        <ul className="flex flex-col mb-8">
          {categoryPool.map((cat) => (
            <li key={cat.id}>
              <a
                href="#destacados"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between py-3.5 text-[22px] font-medium text-[#1a1413] border-b border-[#e8dfd8] tracking-tight"
                style={SERIF}
              >
                {cat.name}
                <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            </li>
          ))}
          <li>
            <a
              href="#sale"
              onClick={() => setMenuOpen(false)}
              className="group flex items-center justify-between py-3.5 text-[22px] font-medium italic text-[#c8334c] border-b border-[#e8dfd8] tracking-tight"
              style={SERIF}
            >
              Sale −30%
              <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>
          </li>
        </ul>

        <div className="mt-auto pt-5 border-t border-[#e8dfd8] text-[12.5px] text-[#78685f] leading-[1.7]">
          <p className="text-[#1a1413] font-medium mb-0.5">Atención al cliente</p>
          {store.bio && <p className="text-[#78685f]">{store.bio}</p>}
          {whatsapp && <p>{whatsapp}</p>}
        </div>
      </aside>

      <main>

        {/* ───── HERO ───── */}
        <header
          className="relative text-white grid grid-rows-[minmax(420px,58dvh)_minmax(340px,48dvh)] lg:grid-rows-none lg:grid-cols-2 lg:min-h-[82dvh]"
        >
          {/* Hero Block */}
          <div className="relative bg-[#c8334c] px-5 py-9 lg:px-16 lg:py-24 flex flex-col justify-center overflow-hidden isolate">
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background:
                  'radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,.08) 0%, transparent 55%), radial-gradient(140% 100% at 0% 100%, rgba(26,20,19,.18) 0%, transparent 60%)',
              }}
              aria-hidden="true"
            />
            <div className="relative z-[2] max-w-[520px] lg:max-w-[620px]">
              <p className="inline-flex items-center gap-2.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-white mb-4">
                <span className="w-[22px] h-[1.5px] bg-white" aria-hidden="true" />
                Colección · Nueva entrega
              </p>
              <h1
                className="text-[clamp(40px,10.5vw,84px)] lg:text-[clamp(52px,6vw,84px)] font-medium leading-[1.02] tracking-[-0.03em] text-white mb-4"
                style={SERIF}
              >
                Elegancia que no <em className="italic font-normal opacity-90">pasa desapercibida.</em>
              </h1>
              <p className="text-sm leading-[1.55] text-white/90 max-w-[420px] mb-6">
                {store.bio ?? 'Cápsulas semanales en terciopelo, lana y seda. Piezas pensadas para usarse, no para guardarse.'}
              </p>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href="#destacados"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white text-[#c8334c] text-[13.5px] font-semibold hover:bg-[#1a1413] hover:text-white transition-colors"
                >
                  Ver colección
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </a>
                <a
                  href="#sale"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-white/60 text-white text-[13.5px] font-semibold hover:bg-white/10 hover:border-white transition-colors"
                >
                  Ver ofertas
                </a>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute right-[-14px] bottom-[-28px] lg:right-[-28px] lg:bottom-[-40px] font-medium italic text-white/[0.09] pointer-events-none select-none z-[1] leading-[0.8] tracking-[-0.04em] text-[clamp(220px,42vw,380px)] lg:text-[clamp(260px,28vw,440px)]"
              style={SERIF}
            >
              <span className="text-[0.32em] align-super mr-[0.03em] tracking-normal not-italic font-normal">N°</span>
              14
            </div>
          </div>

          {/* Hero Media */}
          <div className="relative overflow-hidden bg-[#1a1413]">
            <img
              src={store.coverImage ?? '/templates/rosier/hero.jpg'}
              alt={`${store.name} — colección destacada`}
              width={1842}
              height={2124}
              fetchPriority="high"
              className="w-full h-full object-cover"
              style={{ objectPosition: '40% 18%' }}
            />
            <div
              aria-hidden="true"
              className="absolute left-5 bottom-5 lg:left-auto lg:right-8 lg:bottom-8 flex gap-5 lg:gap-6 text-xs text-white/90 px-4 py-3 lg:px-5 lg:py-4 bg-[rgba(26,20,19,0.4)] backdrop-blur-[12px] backdrop-saturate-150 rounded-full"
            >
              <div>
                <strong className="block text-[20px] lg:text-[24px] font-medium text-white leading-none mb-0.5" style={SERIF}>
                  2.4k
                </strong>
                <span className="opacity-75 text-[9.5px] uppercase tracking-[0.1em]">Pedidos /mes</span>
              </div>
              <div>
                <strong className="block text-[20px] lg:text-[24px] font-medium text-white leading-none mb-0.5" style={SERIF}>
                  4.9★
                </strong>
                <span className="opacity-75 text-[9.5px] uppercase tracking-[0.1em]">1.2k reviews</span>
              </div>
            </div>
          </div>
        </header>

        {/* ───── BRAND STRIP ───── */}
        <div
          className="bg-[#1a1413] text-white/60 py-4 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="flex items-center gap-11 whitespace-nowrap pl-11 italic text-lg font-medium rosier-marquee"
            style={{ ...SERIF, animation: 'rosier-marquee 28s linear infinite' }}
          >
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-11">
                <span className="opacity-70">{item}</span>
                <span className="w-[5px] h-[5px] rounded-full bg-[#c8334c]/80 shrink-0" />
              </span>
            ))}
          </div>
          <style jsx>{`
            @keyframes rosier-marquee {
              to { transform: translateX(-50%); }
            }
            @media (prefers-reduced-motion: reduce) {
              .rosier-marquee { animation: none !important; }
            }
          `}</style>
        </div>

        {/* ───── CATEGORIAS ───── */}
        {categoryPool.length > 0 && (
          <section
            id="categorias"
            aria-labelledby="rosier-cat-h"
            className="max-w-[1440px] mx-auto px-5 py-14 lg:px-14 lg:py-[88px]"
          >
            <div className="flex items-end justify-between gap-4 mb-7 flex-wrap">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c8334c] mb-2">
                  Explora
                </p>
                <h2
                  id="rosier-cat-h"
                  className="text-[clamp(32px,6vw,54px)] leading-[1.02] tracking-[-0.02em] font-medium"
                  style={SERIF}
                >
                  Compra por <em className="italic text-[#c8334c] font-normal">categoría</em>
                </h2>
              </div>
              <a
                href="#destacados"
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#1a1413] pb-0.5 border-b border-[#1a1413] hover:text-[#c8334c] hover:border-[#c8334c] hover:gap-2.5 transition-all"
              >
                Ver todas
                <ArrowRight className="w-[13px] h-[13px]" strokeWidth={1.6} />
              </a>
            </div>

            <ul className="flex gap-3.5 -mx-5 px-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-6 lg:gap-3.5 lg:mx-0 lg:px-0 lg:overflow-visible">
              {categoryPool.map((cat) => (
                <li key={cat.id} className="shrink-0 w-[150px] lg:w-auto snap-start">
                  <a
                    href="#destacados"
                    className="group block relative aspect-[3/4] rounded bg-[#f5ece2] overflow-hidden transition-transform hover:-translate-y-1"
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        width={500}
                        height={650}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#ead9c6] to-[#f5ece2]" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 pt-14 pb-3.5 px-3.5 text-white bg-gradient-to-t from-[rgba(26,20,19,0.85)] to-transparent">
                      <strong className="block text-[17px] font-medium italic tracking-tight" style={SERIF}>
                        {cat.name}
                      </strong>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ───── PRODUCTOS ───── */}
        <section
          id="destacados"
          aria-labelledby="rosier-prod-h"
          className="max-w-[1440px] mx-auto px-5 pb-14 lg:px-14 lg:pb-[88px]"
        >
          <div className="flex items-end justify-between gap-4 mb-7 flex-wrap">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c8334c] mb-2">
                Nuevo esta semana
              </p>
              <h2
                id="rosier-prod-h"
                className="text-[clamp(32px,6vw,54px)] leading-[1.02] tracking-[-0.02em] font-medium"
                style={SERIF}
              >
                Recién <em className="italic text-[#c8334c] font-normal">llegados</em>
              </h2>
            </div>
          </div>

          {featured.length === 0 ? (
            <p className="text-[#78685f] text-sm">Aún no hay productos disponibles.</p>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3.5 gap-y-5 md:gap-x-5 md:gap-y-8 xl:gap-x-6 xl:gap-y-10">
              {featured.map((product) => (
                <RosierProductCard key={product.id} product={product} currency={store.currency} />
              ))}
            </ul>
          )}
        </section>

        {/* ───── SALE BANNER ───── */}
        <section
          id="sale"
          aria-labelledby="rosier-sale-h"
          className="relative overflow-hidden text-white px-6 py-24 lg:py-28 min-h-[clamp(380px,50dvh,560px)] flex flex-col items-center justify-center text-center isolate"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                'linear-gradient(135deg, rgba(200,51,76,0.92) 0%, rgba(155,34,55,0.82) 100%), url("/templates/rosier/hero.jpg") center/cover',
            }}
          />
          <h2 id="rosier-sale-h" className="text-[clamp(20px,4vw,32px)] font-medium mb-2.5 tracking-tight" style={SERIF}>
            Últimas piezas
          </h2>
          <div
            aria-hidden="true"
            className="text-[clamp(72px,24vw,200px)] italic font-medium leading-[0.9] tracking-[-0.04em] mb-3"
            style={SERIF}
          >
            −30
            <small className="text-[0.22em] not-italic font-semibold tracking-[0.1em] inline-block align-top mt-3 -mr-3.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              %
            </small>
          </div>
          <p className="text-sm text-white/90 max-w-[460px] mb-7 leading-[1.6]">
            Hasta 30% de descuento en prendas seleccionadas de la temporada anterior. Stock limitado, por orden de llegada.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white text-[#c8334c] text-[13.5px] font-semibold hover:bg-[#1a1413] hover:text-white transition-colors"
          >
            Consultar disponibilidad
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </a>
        </section>

        {/* ───── TESTIMONIOS ───── */}
        <section
          aria-labelledby="rosier-test-h"
          className="max-w-[1440px] mx-auto px-5 py-14 lg:px-14 lg:py-[88px]"
        >
          <div className="flex items-end justify-between gap-4 mb-7 flex-wrap">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c8334c] mb-2">
                Reseñas verificadas
              </p>
              <h2
                id="rosier-test-h"
                className="text-[clamp(32px,6vw,54px)] leading-[1.02] tracking-[-0.02em] font-medium"
                style={SERIF}
              >
                Lo que dicen <em className="italic text-[#c8334c] font-normal">nuestras clientas</em>
              </h2>
            </div>
          </div>
          <ul className="flex gap-4 -mx-5 px-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:mx-0 lg:px-0 lg:overflow-visible">
            {TESTIMONIALS.map((t, i) => (
              <li
                key={i}
                className="shrink-0 w-[82%] lg:w-auto snap-start bg-[#f5ece2] rounded-md px-5 py-6 flex flex-col gap-3.5"
              >
                <div className="flex gap-0.5 text-[#c8334c]" aria-label="5 estrellas">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="w-[13px] h-[13px]" fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="text-[18px] font-medium text-[#1a1413] leading-[1.4] tracking-tight flex-1" style={SERIF}>
                  <span className="text-[#c8334c] text-[40px] leading-none align-[-0.2em] mr-1" aria-hidden="true" style={SERIF}>
                    &ldquo;
                  </span>
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-3 pt-3.5 border-t border-[#e8dfd8]">
                  <div className="w-9 h-9 rounded-full bg-[#ead9c6] grid place-items-center text-[#5a4b48] font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <strong className="block text-[13px] font-medium text-[#1a1413]">{t.name}</strong>
                    <span className="block text-[11px] text-[#78685f] tracking-wide">
                      {t.city} · Compra verificada
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* ───── FOOTER ───── */}
      <footer className="bg-[#1a1413] text-white/75 px-6 py-16 lg:px-14 lg:pt-20 lg:pb-10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-8 lg:gap-10 mb-10">
          <div>
            <div translate="no" className="text-white text-[22px] font-semibold italic tracking-tight mb-4" style={SERIF}>
              {store.name}<span className="text-[#c8334c] not-italic ml-0.5">.</span>
            </div>
            {store.bio && (
              <p className="text-[13px] leading-[1.7] max-w-[320px] mb-5">{store.bio}</p>
            )}
            <div className="flex flex-col gap-2 text-[13px] text-white/80">
              {whatsapp && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 opacity-70" />
                  {whatsapp}
                </a>
              )}
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 opacity-70" />
                  Instagram
                </a>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-white text-[11px] font-semibold uppercase tracking-[0.18em] mb-4">Comprar</h3>
            <ul className="flex flex-col gap-2.5 text-[13px]">
              {categoryPool.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <a href="#destacados" className="text-white/70 hover:text-white transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white text-[11px] font-semibold uppercase tracking-[0.18em] mb-4">Ayuda</h3>
            <ul className="flex flex-col gap-2.5 text-[13px]">
              <li><a href={waLink} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">Envíos</a></li>
              <li><a href={waLink} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">Devoluciones</a></li>
              <li><a href={waLink} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">Guía de tallas</a></li>
              <li><a href={waLink} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto pt-5 border-t border-white/10 text-xs text-white/50 flex items-center justify-between gap-4 flex-wrap pb-[env(safe-area-inset-bottom)]">
          <span>© {new Date().getFullYear()} <span translate="no">{store.name}</span> · Creado con <span translate="no">ByLink</span></span>
        </div>
      </footer>

      {/* ───── MOBILE BOTTOM NAV ───── */}
      <nav
        aria-label="Navegación móvil"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[rgba(253,250,246,0.95)] backdrop-blur-[14px] border-t border-[#e8dfd8] grid grid-cols-4 h-[64px] pb-[env(safe-area-inset-bottom)] text-[10px] text-[#5a4b48]"
      >
        <a href="#" aria-current="page" className="flex flex-col items-center justify-center gap-1 text-[#c8334c]">
          <Home className="w-[18px] h-[18px]" strokeWidth={1.6} />
          Inicio
        </a>
        <a href="#categorias" className="flex flex-col items-center justify-center gap-1 hover:text-[#c8334c] transition-colors">
          <Grid3x3 className="w-[18px] h-[18px]" strokeWidth={1.6} />
          Tienda
        </a>
        {wishlistEnabled ? (
          <button
            type="button"
            onClick={() => openWishlist(true)}
            className="relative flex flex-col items-center justify-center gap-1 hover:text-[#c8334c] transition-colors"
          >
            <Heart className="w-[18px] h-[18px]" strokeWidth={1.6} />
            Favoritos
            {wishCount > 0 && (
              <span className="absolute top-2 right-[calc(50%-18px)] min-w-[16px] h-4 px-1 rounded-full bg-[#c8334c] text-white text-[10px] font-semibold grid place-items-center tabular-nums leading-none">
                {wishCount}
              </span>
            )}
          </button>
        ) : (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 hover:text-[#c8334c] transition-colors">
            <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.6} />
            Contacto
          </a>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex flex-col items-center justify-center gap-1 hover:text-[#c8334c] transition-colors"
        >
          <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.6} />
          Bolsa
          {totalItems > 0 && (
            <span className="absolute top-2 right-[calc(50%-18px)] min-w-[16px] h-4 px-1 rounded-full bg-[#c8334c] text-white text-[10px] font-semibold grid place-items-center tabular-nums leading-none">
              {totalItems}
            </span>
          )}
        </button>
      </nav>

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
