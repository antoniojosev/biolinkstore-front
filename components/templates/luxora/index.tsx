'use client'

import { useState, useMemo } from 'react'
import { Instagram, Search, ShoppingBag, X, Heart } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { LuxoraProductCard } from './product-card'
import { LuxoraCartDrawer } from './cart-drawer'
import { WishlistDrawer } from '@/components/templates/shared/wishlist-drawer'

export function LuxoraTemplate() {
  const { store, products, categories } = useStore()
  const { totalItems, totalPrice, setIsOpen } = useCart()
  const { totalItems: wishlistCount, setIsOpen: openWishlist } = useWishlist()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [showSearch, setShowSearch] = useState(false)
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
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, search, selectedCategory])

  const avatar = store.avatar ?? '/placeholder.svg'
  const cover = store.coverImage

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">
      <div className="lg:flex lg:max-w-7xl lg:mx-auto">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-[#EAEAE6] lg:p-7 lg:gap-6">
          {cover ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video">
              <img src={cover} alt={store.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h1 className="text-xl font-black text-white leading-tight">{store.name}</h1>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img src={avatar} alt={store.name} className="w-12 h-12 rounded-full border border-[#E5E5E0] object-cover" />
              <div>
                <h1 className="text-xl font-black text-[#1A1A1A] leading-tight">{store.name}</h1>
                {store.username && <p className="text-xs text-[#999]">{store.username}</p>}
              </div>
            </div>
          )}

          {store.bio && <p className="text-sm text-[#666] leading-relaxed -mt-2">{store.bio}</p>}

          {store.instagramUrl && (
            <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#999] hover:text-[#1A1A1A] transition-colors -mt-2"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999]" />
            <input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-[#F0F0EC] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#999] outline-none"
            />
            {search && (
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1A1A1A]" onClick={() => setSearch('')}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-wider mb-1">Categorías</p>
            {allCategories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === cat ? 'bg-[#1A1A1A] text-white' : 'text-[#666] hover:text-[#1A1A1A] hover:bg-[#F0F0EC]'
                }`}
              >{cat}</button>
            ))}
          </div>

          {/* Cart + Wishlist */}
          <div className="mt-auto flex flex-col gap-2">
            {wishlistEnabled && (
              <button onClick={() => openWishlist(true)}
                className="relative w-full h-10 border border-[#EAEAE6] rounded-xl font-semibold text-sm text-[#1A1A1A] hover:bg-[#F0F0EC] transition-colors flex items-center justify-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Favoritos
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>
                )}
              </button>
            )}
            <button onClick={() => setIsOpen(true)}
              className="relative w-full h-12 bg-[#1A1A1A] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#333] transition-colors shadow-xl shadow-black/10"
            >
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 ? `Ver carrito · ${fmt(totalPrice)}` : 'Carrito vacío'}
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#1A1A1A] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{totalItems}</span>
              )}
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 lg:max-w-none max-w-lg mx-auto">
          {/* Mobile Header */}
          <header className="relative lg:hidden">
            {cover ? (
              <div className="relative h-64 w-full overflow-hidden">
                <img src={cover} alt={store.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {store.instagramUrl && (
                  <div className="absolute top-4 right-4">
                    <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
                      <Instagram className="h-4 w-4 text-white" />
                    </a>
                  </div>
                )}
                <div className="absolute bottom-5 left-5 right-5">
                  <h1 className="text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">{store.name}</h1>
                  {store.bio && <p className="text-white/80 text-sm mt-1 line-clamp-2 drop-shadow-sm">{store.bio}</p>}
                </div>
              </div>
            ) : (
              <div className="bg-[#FAFAF8] pt-10 px-5 pb-4">
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={store.name} className="w-12 h-12 rounded-full border border-[#E5E5E0] object-cover" />
                  <div>
                    <h1 className="text-2xl font-black text-[#1A1A1A] leading-tight">{store.name}</h1>
                    {store.username && <p className="text-xs text-[#999]">{store.username}</p>}
                  </div>
                  {store.instagramUrl && (
                    <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="ml-auto">
                      <Instagram className="h-5 w-5 text-[#999] hover:text-[#1A1A1A] transition-colors" />
                    </a>
                  )}
                </div>
                {store.bio && <p className="text-sm text-[#666] mt-3 leading-relaxed">{store.bio}</p>}
              </div>
            )}
          </header>

          {/* Mobile Toolbar */}
          <div className="sticky top-0 z-10 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#EBEBEB] px-5 py-3 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              {showSearch ? (
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999]" />
                    <input autoFocus placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-8 pr-3 bg-[#F0F0EC] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#999] outline-none border-none" />
                  </div>
                  <button onClick={() => { setShowSearch(false); setSearch('') }} className="text-[#999] hover:text-[#1A1A1A] transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-lg font-black text-[#1A1A1A] leading-none flex-1">
                    {filtered.length} <span className="font-medium text-[#999]">{selectedCategory === 'Todos' ? 'productos' : selectedCategory.toLowerCase()}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {wishlistEnabled && (
                      <button onClick={() => openWishlist(true)} className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors" aria-label="Favoritos">
                        <Heart className={`h-4 w-4 transition-colors ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-[#999]'}`} strokeWidth={wishlistCount > 0 ? 0 : 1.5} />
                        {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>}
                      </button>
                    )}
                    <button onClick={() => setShowSearch(true)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors">
                      <Search className="h-4 w-4 text-[#999]" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors relative" onClick={() => setIsOpen(true)}>
                      <ShoppingBag className="h-4 w-4 text-[#1A1A1A]" />
                      {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#1A1A1A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{totalItems}</span>}
                    </button>
                  </div>
                </>
              )}
            </div>
            <ScrollArea className="w-full mt-2">
              <div className="flex gap-1.5 pb-0.5">
                {allCategories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${selectedCategory === cat ? 'bg-[#1A1A1A] text-white' : 'bg-[#F0F0EC] text-[#666] hover:text-[#1A1A1A]'}`}
                  >{cat}</button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Desktop top bar */}
          <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-[#EAEAE6]">
            <p className="text-sm text-[#999]">
              <span className="font-bold text-[#1A1A1A]">{filtered.length}</span> {selectedCategory === 'Todos' ? 'productos' : selectedCategory.toLowerCase()}
            </p>
          </div>

          {/* Product Grid */}
          <main className="px-5 py-5 lg:px-8 lg:py-6">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#F0F0EC] flex items-center justify-center">
                  <Search className="h-6 w-6 text-[#BBB]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">Sin resultados</p>
                  <p className="text-sm text-[#999]">Probá otra búsqueda</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 pb-28 lg:pb-8">
                {filtered.map((product) => (
                  <LuxoraProductCard key={product.id} product={product} currency={store.currency} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile sticky cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 px-5 pb-6 pt-3 bg-[#FAFAF8]/90 backdrop-blur-md lg:hidden">
          <button onClick={() => setIsOpen(true)}
            className="w-full h-14 bg-[#1A1A1A] text-white rounded-2xl font-semibold flex items-center px-5 gap-3 shadow-xl shadow-black/10 hover:bg-[#333] active:scale-[0.99] transition-all max-w-lg mx-auto"
          >
            <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
            <span className="flex-1 text-left text-sm">Ver carrito</span>
            <span className="font-bold text-sm">{fmt(totalPrice)}</span>
          </button>
        </div>
      )}

      <LuxoraCartDrawer />
      <WishlistDrawer accent="#1A1A1A" bgClass="bg-[#FAFAF8]" textClass="text-[#1A1A1A]" mutedClass="text-[#999]" borderClass="border-[#EAEAE6]" itemBgClass="bg-[#F4F4F0]" cartBtnClass="bg-[#1A1A1A] text-white hover:bg-[#333]" />
    </div>
  )
}
