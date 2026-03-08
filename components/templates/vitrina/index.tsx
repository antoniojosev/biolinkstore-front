'use client'

import { useState, useMemo } from 'react'
import { Instagram, Search, X, ShoppingBag, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { VitrinaProductCard } from './product-card'
import { VitrinaCartDrawer } from './cart-drawer'
import { WishlistDrawer } from '@/components/templates/shared/wishlist-drawer'

export function VitrinaTemplate() {
  const { store, products, categories } = useStore()
  const { totalItems, totalPrice, setIsOpen } = useCart()
  const { totalItems: wishlistCount, setIsOpen: openWishlist } = useWishlist()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
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
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, search, selectedCategory])

  const avatar = store.avatar ?? '/placeholder.svg'
  const cover = store.coverImage

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:flex lg:max-w-7xl lg:mx-auto">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-border/50 lg:p-6 lg:gap-6">
          {/* Avatar + profile */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-60 blur-sm" />
              <img src={avatar} alt={store.name} className="relative w-20 h-20 rounded-full border-2 border-background object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{store.name}</h1>
              {store.username && <p className="text-xs text-muted-foreground mt-0.5">{store.username}</p>}
              {store.bio && <p className="text-xs text-foreground/60 mt-2 leading-relaxed">{store.bio}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {store.instagramUrl && (
                <Button variant="outline" size="sm" className="gap-1.5 bg-transparent h-8 text-xs" asChild>
                  <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-3.5 w-3.5" />Seguir
                  </a>
                </Button>
              )}
              <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">{products.length} productos</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-9 bg-muted border-transparent h-9 text-sm" />
            {search && (
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearch('')}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Categories vertical */}
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1">Categorías</p>
            {allCategories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cart + Wishlist buttons */}
          <div className="mt-auto flex flex-col gap-2">
            {wishlistEnabled && (
              <Button variant="outline" className="w-full gap-2 relative" onClick={() => openWishlist(true)}>
                <Heart className="h-4 w-4" />
                Favoritos
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            )}
            <Button className="w-full gap-2 shadow-lg shadow-primary/20 relative" onClick={() => setIsOpen(true)}>
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 ? `Ver carrito · ${fmt(totalPrice)}` : 'Carrito vacío'}
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 lg:max-w-none max-w-lg mx-auto">
          {/* Mobile Header */}
          <header className="relative lg:hidden">
            <div className="relative h-32 w-full overflow-hidden">
              {cover ? (
                <img src={cover} alt={`${store.name} cover`} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full gradient-background opacity-80" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
            </div>
            <div className="relative px-4 pb-4 -mt-10 flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-60 blur-sm" />
                <img src={avatar} alt={store.name} className="relative w-20 h-20 rounded-full border-2 border-background object-cover" />
              </div>
              <h1 className="text-xl font-bold text-foreground">{store.name}</h1>
              {store.username && <p className="text-sm text-muted-foreground mt-0.5">{store.username}</p>}
              {store.bio && <p className="text-sm text-foreground/70 max-w-xs mt-2 leading-relaxed">{store.bio}</p>}
              <div className="flex items-center gap-2 mt-3">
                {store.instagramUrl && (
                  <Button variant="outline" size="sm" className="gap-1.5 bg-transparent h-8 text-xs" asChild>
                    <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-3.5 w-3.5" />Seguir
                    </a>
                  </Button>
                )}
                <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">{products.length} productos</div>
              </div>
            </div>
          </header>

          {/* Mobile Filters */}
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 pt-3 pb-2 space-y-2 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-9 bg-muted border-transparent h-9 text-sm" />
                {search && (
                  <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearch('')}>
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {wishlistEnabled && (
                <button onClick={() => openWishlist(true)} className="relative shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors" aria-label="Favoritos">
                  <Heart className={`h-4 w-4 transition-colors ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} strokeWidth={wishlistCount > 0 ? 0 : 2} />
                  {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>}
                </button>
              )}
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-1.5 pb-1">
                {allCategories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                      selectedCategory === cat ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >{cat}</button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Desktop top bar */}
          <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border/30">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> {selectedCategory === 'Todos' ? 'productos' : selectedCategory.toLowerCase()}
            </p>
          </div>

          {/* Product Grid */}
          <main className="px-4 py-4 lg:px-8 lg:py-6">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Sin resultados</p>
                  <p className="text-sm text-muted-foreground">Probá con otra búsqueda o categoría</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5 pb-28 lg:pb-8">
                {filtered.map((product) => (
                  <VitrinaProductCard key={product.id} product={product} currency={store.currency} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile sticky cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden">
          <Button className="w-full h-13 text-base gap-3 shadow-lg shadow-primary/20 max-w-lg mx-auto flex" onClick={() => setIsOpen(true)}>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
            </div>
            <span className="flex-1 text-left">Ver carrito</span>
            <span className="font-bold">{fmt(totalPrice)}</span>
          </Button>
        </div>
      )}

      <VitrinaCartDrawer />
      <WishlistDrawer />
    </div>
  )
}
