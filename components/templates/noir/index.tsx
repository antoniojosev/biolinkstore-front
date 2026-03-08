'use client'

import { useState, useMemo } from 'react'
import { Source_Serif_4 } from 'next/font/google'
import { Instagram, Search, X, ShoppingBag, ChevronRight, Heart } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
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
  const { totalItems: wishlistCount, setIsOpen: openWishlist } = useWishlist()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchOpen, setSearchOpen] = useState(false)
  const wishlistEnabled = store.plan === 'PRO' || store.plan === 'BUSINESS'

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

  const avatar = store.avatar ?? '/placeholder.svg'
  const cover = store.coverImage

  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${serif.className}`}>
      <div className="lg:flex lg:max-w-7xl lg:mx-auto">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-[#1A1A1A] lg:p-7 lg:gap-6">
          {/* Cover or Avatar */}
          {cover ? (
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <img src={cover} alt={store.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h1 className={`text-xl font-light italic text-[#F0EDE8] leading-tight ${serif.className}`}>{store.name}</h1>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {store.avatar && (
                <div className="w-16 h-16 rounded-full overflow-hidden border border-[#C9A86C]/30">
                  <img src={avatar} alt={store.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h1 className={`text-xl font-light italic text-[#F0EDE8] leading-tight ${serif.className}`}>{store.name}</h1>
                {store.username && <p className="text-[11px] text-[#C9A86C] tracking-[0.2em] uppercase mt-1">{store.username}</p>}
              </div>
            </div>
          )}

          {store.bio && <p className="text-sm text-[#666] leading-relaxed font-sans font-light -mt-2">{store.bio}</p>}

          {store.instagramUrl && (
            <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#555] hover:text-[#888] transition-colors -mt-2 font-sans"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 -mt-2">
            <span className="text-xs text-[#555] tracking-wide font-sans">
              <span className="text-[#F0EDE8] font-light">{products.length}</span> piezas
            </span>
            <span className="w-px h-3 bg-[#333]" />
            <span className="text-xs text-[#555] tracking-wide font-sans">
              <span className="text-[#F0EDE8] font-light">{categories.length}</span>{' '}
              {categories.length === 1 ? 'categoría' : 'categorías'}
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#555]" />
            <input
              placeholder="Buscar piezas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-[#111] border border-[#1A1A1A] rounded-lg text-sm text-[#F0EDE8] placeholder:text-[#333] outline-none font-sans font-light"
            />
            {search && (
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888]" onClick={() => setSearch('')}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-0">
            <p className="text-[10px] font-semibold text-[#333] uppercase tracking-[0.2em] mb-2 font-sans">Categorías</p>
            {allCategories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`text-left px-3 py-2 text-xs tracking-[0.12em] uppercase transition-all duration-200 border-b border-[#111] font-sans ${
                  selectedCategory === cat ? 'text-[#C9A86C] border-[#C9A86C]/30' : 'text-[#555] hover:text-[#888]'
                }`}
              >{cat}</button>
            ))}
          </div>

          {/* Cart + Wishlist */}
          <div className="mt-auto flex flex-col gap-2">
            {wishlistEnabled && (
              <button onClick={() => openWishlist(true)}
                className="relative w-full h-10 border border-[#1A1A1A] rounded-sm font-sans font-semibold text-xs tracking-wide text-[#888] hover:text-[#F0EDE8] hover:border-[#333] transition-colors flex items-center justify-center gap-2"
              >
                <Heart className="h-3.5 w-3.5" />
                Favoritos
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C9A86C] text-[#0A0A0A] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>
                )}
              </button>
            )}
            <button onClick={() => setIsOpen(true)}
              className="relative w-full h-12 bg-[#C9A86C] text-[#0A0A0A] rounded-sm font-semibold text-sm flex items-center justify-between px-5 hover:bg-[#D4B87A] active:scale-[0.99] transition-all font-sans tracking-wide"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                {totalItems > 0 ? (
                  <span className="text-[#0A0A0A]/60 text-xs">{totalItems} {totalItems === 1 ? 'pieza' : 'piezas'}</span>
                ) : (
                  <span className="text-xs text-[#0A0A0A]/60">Carrito vacío</span>
                )}
              </div>
              {totalItems > 0 && (
                <div className="flex items-center gap-1">
                  <span>{fmt(totalPrice)}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 lg:max-w-none max-w-lg mx-auto">

          {/* ── Mobile Cinematic Header ── */}
          <header className="relative h-[65vh] w-full overflow-hidden bg-[#111] lg:hidden">
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

              <div className="flex items-center gap-4">
                {wishlistEnabled && (
                  <button onClick={() => openWishlist(true)} className="relative text-[#F0EDE8]/80 hover:text-[#F0EDE8] transition-colors" aria-label="Favoritos">
                    <Heart className={`h-5 w-5 transition-colors ${wishlistCount > 0 ? 'fill-red-400 text-red-400' : ''}`} strokeWidth={wishlistCount > 0 ? 0 : 1.5} />
                    {wishlistCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#C9A86C] text-[#0A0A0A] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>}
                  </button>
                )}
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

          {/* ── Sticky toolbar ── */}
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="text-[#555] hover:text-[#888] transition-colors lg:hidden"
                    >
                      <Search className="h-3.5 w-3.5" />
                    </button>
                    {wishlistEnabled && (
                      <button
                        onClick={() => openWishlist(true)}
                        className="relative text-[#555] hover:text-[#888] transition-colors lg:hidden"
                      >
                        <Heart className="h-3.5 w-3.5" />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#C9A86C] text-[#0A0A0A] text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{wishlistCount}</span>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="hidden lg:block text-[#555] hover:text-[#888] transition-colors"
                    >
                      <Search className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Product Grid ── */}
          <main className="pb-32 lg:pb-8">
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
                        row.products.length === 2 ? 'grid-cols-2 lg:grid-cols-2' : 'grid-cols-1'
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
        </div>
      </div>

      {/* ── Mobile Sticky Cart Bar ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto px-5 pb-safe-bottom pb-6 pt-3 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#1A1A1A] lg:hidden">
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
