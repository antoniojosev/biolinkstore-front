'use client'

import { useState, useMemo } from 'react'
import { Source_Serif_4 } from 'next/font/google'
import { Instagram, Search, X, ShoppingBag, ChevronRight } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { NoirProductCard } from './product-card'
import { NoirCartDrawer } from './cart-drawer'
import { WishlistDrawer } from '@/components/templates/shared/wishlist-drawer'

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
})

export function NoirTemplate() {
  const { store, products, categories } = useStore()
  const { totalItems, totalPrice, setIsOpen } = useCart()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchOpen, setSearchOpen] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  const allCategories = useMemo(
    () => ['Todos', ...categories.map((c) => c.name)],
    [categories],
  )

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, search, selectedCategory])

  const featuredProducts = filtered.filter((p) => p.featured)
  const regularProducts = filtered.filter((p) => !p.featured)

  const avatar = store.avatar ?? '/placeholder.svg'
  const cover = store.coverImage

  // Build grid rows: featured cards are full-width, rest in 2-col pairs
  type GridItem = { type: 'featured'; product: (typeof filtered)[0] } | { type: 'pair'; products: [(typeof filtered)[0], (typeof filtered)[0]] | [(typeof filtered)[0]] }

  const gridItems: GridItem[] = useMemo(() => {
    const result: GridItem[] = []
    const remaining = [...filtered]
    let i = 0
    while (i < remaining.length) {
      const product = remaining[i]
      if (product.featured) {
        result.push({ type: 'featured', product })
        i++
      } else {
        const next = remaining[i + 1]
        if (next && !next.featured) {
          result.push({ type: 'pair', products: [product, next] })
          i += 2
        } else {
          result.push({ type: 'pair', products: [product] })
          i++
        }
      }
    }
    return result
  }, [filtered])

  return (
    <div className={`min-h-screen max-w-lg mx-auto bg-[#0A0A0A] ${serif.className}`}>

      {/* ── Cinematic Header ─────────────────────────────────────── */}
      <header className="relative h-[65vh] w-full overflow-hidden bg-[#111]">
        {cover ? (
          <img
            src={cover}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 40%, #0F0F0F 100%)`,
            }}
          />
        )}

        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/30 via-transparent to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/50 via-transparent to-transparent" />

        {/* Nav bar */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 pt-safe-top pt-10">
          <button
            onClick={() => setIsOpen(true)}
            className="relative text-[#F0EDE8]/80 hover:text-[#F0EDE8] transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#C9A86C] text-[#0A0A0A] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {store.instagramUrl && (
            <a
              href={store.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F0EDE8]/60 hover:text-[#F0EDE8] transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
        </div>

        {/* Store identity — bottom of header */}
        <div className="absolute bottom-0 inset-x-0 px-5 pb-8">
          {store.avatar && (
            <div className="mb-4 w-18 h-18 rounded-full overflow-hidden border border-[#C9A86C]/30">
              <img
                src={avatar}
                alt={store.name}
                className="w-18 h-18 object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-light italic text-[#F0EDE8] tracking-wide leading-tight">
            {store.name}
          </h1>

          {store.username && (
            <p className="text-[11px] text-[#C9A86C] tracking-[0.2em] uppercase mt-2">
              {store.username}
            </p>
          )}

          {store.bio && (
            <p className="text-sm text-[#888] mt-3 leading-relaxed max-w-xs font-sans font-light">
              {store.bio}
            </p>
          )}

          {/* Stats strip */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-xs text-[#555] tracking-wide font-sans">
              <span className="text-[#F0EDE8] font-light">{products.length}</span> piezas
            </span>
            <span className="w-px h-3 bg-[#333]" />
            <span className="text-xs text-[#555] tracking-wide font-sans">
              <span className="text-[#F0EDE8] font-light">{categories.length}</span>{' '}
              {categories.length === 1 ? 'categoría' : 'categorías'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Sticky toolbar ──────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        {/* Category scroll */}
        <ScrollArea className="w-full border-b border-[#141414]">
          <div className="flex gap-0 py-0">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-5 py-3.5 text-xs tracking-[0.15em] uppercase transition-all duration-200 border-b-2 font-sans ${
                  selectedCategory === cat
                    ? 'border-[#C9A86C] text-[#C9A86C]'
                    : 'border-transparent text-[#555] hover:text-[#888]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-0" />
        </ScrollArea>

        {/* Search / count row */}
        <div className="flex items-center justify-between px-5 py-3">
          {searchOpen ? (
            <div className="flex-1 flex items-center gap-3">
              <Search className="h-3.5 w-3.5 text-[#555] shrink-0" />
              <input
                autoFocus
                placeholder="Buscar piezas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-[#F0EDE8] text-sm placeholder:text-[#333] outline-none font-sans font-light"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearch('') }}
                className="text-[#555] hover:text-[#888] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#555] tracking-widest uppercase font-sans">
                {filtered.length} {filtered.length === 1 ? 'pieza' : 'piezas'}
              </p>
              <button
                onClick={() => setSearchOpen(true)}
                className="text-[#555] hover:text-[#888] transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Product Grid ─────────────────────────────────────────── */}
      <main className="pb-32">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="text-5xl text-[#1A1A1A] select-none font-light italic">∅</div>
            <div>
              <p className="font-serif text-[#F0EDE8] text-lg font-light italic">Sin resultados</p>
              <p className="text-xs text-[#444] mt-2 tracking-widest uppercase font-sans">
                Intenta otra búsqueda
              </p>
            </div>
          </div>
        ) : (
          <div>
            {gridItems.map((row, idx) =>
              row.type === 'featured' ? (
                <div key={`featured-${row.product.id}`} className="border-b border-[#141414]">
                  <NoirProductCard
                    product={row.product}
                    currency={store.currency}
                    featured
                  />
                  <div className="h-px bg-gradient-to-r from-transparent via-[#C9A86C]/20 to-transparent" />
                </div>
              ) : (
                <div
                  key={`pair-${idx}`}
                  className={`grid border-b border-[#141414] ${
                    row.products.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {row.products.map((product, pIdx) => (
                    <div
                      key={product.id}
                      className={`${pIdx === 0 && row.products.length === 2 ? 'border-r border-[#141414]' : ''}`}
                    >
                      <NoirProductCard
                        product={product}
                        currency={store.currency}
                      />
                    </div>
                  ))}
                </div>
              ),
            )}
          </div>
        )}
      </main>

      {/* ── Sticky Cart Bar ──────────────────────────────────────── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto px-5 pb-safe-bottom pb-6 pt-3 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#1A1A1A]">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full h-12 bg-[#C9A86C] text-[#0A0A0A] rounded-sm font-semibold text-sm flex items-center justify-between px-5 hover:bg-[#D4B87A] active:scale-[0.99] transition-all font-sans tracking-wide"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-[#0A0A0A]/60 text-xs">
                {totalItems} {totalItems === 1 ? 'pieza' : 'piezas'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>{fmt(totalPrice)}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      <NoirCartDrawer />
      <WishlistDrawer accent="#C9A86C" bgClass="bg-[#0A0A0A]" textClass="text-[#F0EDE8]" mutedClass="text-[#666]" borderClass="border-[#1A1A1A]" itemBgClass="bg-[#111]" cartBtnClass="bg-[#C9A86C] text-[#0A0A0A] hover:bg-[#b8966a]" />
    </div>
  )
}
