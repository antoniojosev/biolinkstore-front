'use client'

import { useMemo, useState } from 'react'
import { Search, ShoppingCart, Instagram, Facebook, ArrowRight } from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { PosterProductCard } from './product-card'
import { PosterCartDrawer } from './cart-drawer'

const ALL_CATEGORIES = 'Todo'

function Leaf({ className, variant = 'a' }: { className?: string; variant?: 'a' | 'b' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 10 C 80 25 90 60 60 90 C 30 75 20 40 50 10 Z"
        fill={variant === 'a' ? '#6cbf6a' : '#7dd47b'}
      />
      <path d="M50 10 L 60 90" stroke="#2f7a3a" strokeWidth="2" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.6 6.3a4.8 4.8 0 0 1-3.4-3.3h-3.4v13.4c0 1.5-1.2 2.6-2.6 2.6a2.6 2.6 0 1 1 .8-5.1V10.5a6 6 0 1 0 5.2 5.9V9.6a8.2 8.2 0 0 0 4.7 1.5V7.7a4.8 4.8 0 0 1-1.3-1.4z" />
    </svg>
  )
}

export function PosterTemplate() {
  const { store, products, categories } = useStore()
  const { totalItems, totalPrice, setIsOpen } = useCart()
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  const visibleProducts = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) return products
    return products.filter(
      (p) => p.category === activeCategory || p.categories?.includes(activeCategory),
    )
  }, [products, activeCategory])

  const topBadgeFor = (p: (typeof products)[number]): string | undefined => {
    if (p.featured) return 'Top'
    if (p.comparePrice && p.comparePrice > p.price) {
      const pct = Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
      return `-${pct}%`
    }
    return undefined
  }

  const instagramUrl = store.instagramUrl
  // NOTE: store.tiktokUrl and store.facebookUrl aren't in the StoreProfile yet;
  // fall back to nothing gracefully. If added, wire them here.
  const storeInitial = store.name.charAt(0).toUpperCase()
  const heroKicker = 'Bienvenido a'

  return (
    <div
      className="min-h-[100dvh] overflow-x-clip text-[#fff4e0]"
      style={{
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        background:
          'radial-gradient(1200px 600px at 10% -20%, #8a1e1e 0%, transparent 60%), radial-gradient(900px 500px at 110% 30%, #6a1414 0%, transparent 55%), linear-gradient(180deg, #4a0a0a 0%, #2c0505 100%)',
      }}
    >
      {/* Skip to content */}
      <a
        href="#menu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded-full focus:bg-[#fff4e0] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#4a0a0a]"
      >
        Saltar al menú
      </a>

      {/* Brand bar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 px-5 py-3.5 backdrop-blur-xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(30,3,3,.85), rgba(30,3,3,.4))',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-[42px] w-[42px] place-items-center overflow-hidden rounded-xl text-[#4a0a0a] shadow-[0_6px_18px_-6px_rgba(244,162,58,.6)]"
            style={{
              background: 'linear-gradient(135deg, #f4a23a 0%, #d97a1c 100%)',
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: 20,
            }}
          >
            {store.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.avatar}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span aria-hidden="true">{storeInitial}</span>
            )}
          </div>
          <div>
            <h1
              className="uppercase leading-none"
              style={{
                fontFamily: 'var(--font-anton), sans-serif',
                fontSize: 17,
                letterSpacing: '.04em',
              }}
            >
              {store.name}
            </h1>
            {store.bio && (
              <p className="mt-[3px] text-[11px] uppercase tracking-[.12em] opacity-65 line-clamp-1 max-w-[220px]">
                {store.bio}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[#fff4e0] transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a]"
          aria-label="Buscar"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
      </header>

      {/* Hero */}
      <section className="relative px-5 pb-4 pt-9 text-center">
        <Leaf
          className="pointer-events-none absolute -left-2 top-[6px] w-[70px] -rotate-[25deg] opacity-55"
          variant="a"
        />
        <Leaf
          className="pointer-events-none absolute -right-3 top-[30px] w-[60px] rotate-[40deg] opacity-55"
          variant="b"
        />
        <p
          className="translate-y-2 leading-none text-[#ffd07a]"
          style={{ fontFamily: 'var(--font-allura), cursive', fontSize: 36 }}
        >
          {heroKicker}
        </p>
        <h2
          className="uppercase text-transparent bg-clip-text"
          style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 'clamp(36px, 10vw, 64px)',
            lineHeight: 0.95,
            letterSpacing: '.01em',
            backgroundImage: 'linear-gradient(180deg, #fff 0%, #ffd9a3 100%)',
            textShadow: '0 2px 0 rgba(0,0,0,.15)',
            WebkitBackgroundClip: 'text',
          }}
        >
          {store.name}
        </h2>
        {store.bio && (
          <p className="mx-auto mt-3 max-w-[320px] text-sm opacity-80">{store.bio}</p>
        )}
      </section>

      {/* Category strip */}
      {categories.length > 0 && (
        <nav
          className="mx-auto flex max-w-[1280px] gap-2 overflow-x-auto px-5 pb-4 pt-2 sm:justify-center sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
          aria-label="Categorías"
          role="tablist"
        >
          <CategoryPill
            label={ALL_CATEGORIES}
            active={activeCategory === ALL_CATEGORIES}
            onClick={() => setActiveCategory(ALL_CATEGORIES)}
          />
          {categories.map((c) => (
            <CategoryPill
              key={c.id}
              label={c.name}
              active={activeCategory === c.name}
              onClick={() => setActiveCategory(c.name)}
            />
          ))}
        </nav>
      )}

      {/* Grid */}
      <main
        id="menu"
        className="mx-auto grid max-w-[1280px] grid-cols-1 gap-4 px-4 pb-[130px] sm:grid-cols-2 sm:gap-[18px] sm:px-5 sm:pb-[150px] lg:grid-cols-3 xl:grid-cols-4"
      >
        {visibleProducts.length === 0 ? (
          <p className="col-span-full py-16 text-center text-sm opacity-60">
            No hay platos en esta categoría.
          </p>
        ) : (
          visibleProducts.map((product) => (
            <PosterProductCard
              key={product.id}
              product={product}
              currency={store.currency}
              isCustomizable={product.customizable ?? false}
              topBadge={topBadgeFor(product)}
            />
          ))
        )}
      </main>

      {/* Social footer */}
      {instagramUrl && (
        <footer className="px-5 pb-[110px] pt-8 text-center">
          <h3
            className="mb-2.5 text-[#ffd07a]"
            style={{ fontFamily: 'var(--font-allura), cursive', fontSize: 28 }}
          >
            Síguenos
          </h3>
          <div className="flex justify-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-[#fff4e0] transition-all hover:-translate-y-0.5 hover:bg-[#f4a23a] hover:text-[#4a0a0a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a]"
            >
              <Instagram className="h-5 w-5" strokeWidth={2} />
            </a>
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[.1em] opacity-40">
            Creado con ByLink
          </p>
        </footer>
      )}

      {/* Cart bar */}
      {totalItems > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-[480px] items-center justify-between gap-3 rounded-full bg-[#fff4e0] px-5 py-3 pl-6 font-bold text-[#4a0a0a] shadow-[0_18px_40px_-8px_rgba(0,0,0,.5)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4a23a]"
          aria-label={`Ver pedido — ${totalItems} ítems, total ${fmt(totalPrice)}`}
        >
          <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
            <span className="rounded-full bg-[#4a0a0a] px-2.5 py-0.5 text-xs text-[#fff4e0]">
              {totalItems}
            </span>
            Tu pedido · {fmt(totalPrice)}
          </div>
          <div
            aria-hidden="true"
            className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#4a0a0a] text-[#fff4e0]"
          >
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
        </button>
      )}

      <PosterCartDrawer />
    </div>
  )
}

interface PillProps {
  label: string
  active: boolean
  onClick: () => void
}

function CategoryPill({ label, active, onClick }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`flex-shrink-0 rounded-full border px-4 py-2.5 text-xs font-medium uppercase tracking-[.08em] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a] ${
        active
          ? 'border-[#f4a23a] bg-[#f4a23a] font-bold text-[#4a0a0a] shadow-[0_6px_18px_-6px_rgba(244,162,58,.6)]'
          : 'border-white/5 bg-white/10 text-[#fff4e0] hover:bg-white/15'
      }`}
    >
      {label}
    </button>
  )
}
