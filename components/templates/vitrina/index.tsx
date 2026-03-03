'use client'

import { useState, useMemo } from 'react'
import { Instagram, Search, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { VitrinaProductCard } from './product-card'
import { VitrinaCartDrawer } from './cart-drawer'

export function VitrinaTemplate() {
  const { store, products, categories } = useStore()
  const { totalItems, totalPrice, setIsOpen } = useCart()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

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
    <div className="min-h-screen max-w-lg mx-auto bg-background">
      {/* Store Header */}
      <header className="relative">
        {/* Cover image or gradient */}
        <div className="relative h-32 w-full overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={`${store.name} cover`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="h-full w-full gradient-background opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        {/* Profile */}
        <div className="relative px-4 pb-4 -mt-10 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-60 blur-sm" />
            <img
              src={avatar}
              alt={store.name}
              className="relative w-20 h-20 rounded-full border-2 border-background object-cover"
            />
          </div>

          <h1 className="text-xl font-bold text-foreground">{store.name}</h1>
          {store.username && (
            <p className="text-sm text-muted-foreground mt-0.5">{store.username}</p>
          )}
          {store.bio && (
            <p className="text-sm text-foreground/70 max-w-xs mt-2 leading-relaxed">{store.bio}</p>
          )}

          <div className="flex items-center gap-2 mt-3">
            {store.instagramUrl && (
              <Button variant="outline" size="sm" className="gap-1.5 bg-transparent h-8 text-xs" asChild>
                <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-3.5 w-3.5" />
                  Seguir
                </a>
              </Button>
            )}
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              {products.length} productos
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 pt-3 pb-2 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 bg-muted border-transparent h-9 text-sm"
          />
          {search && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch('')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories */}
        <ScrollArea className="w-full">
          <div className="flex gap-1.5 pb-1">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Product Grid */}
      <main className="px-4 py-4">
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
          <div className="grid grid-cols-2 gap-3 pb-28">
            {filtered.map((product) => (
              <VitrinaProductCard
                key={product.id}
                product={product}
                currency={store.currency}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sticky Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto p-4 bg-background/80 backdrop-blur-lg border-t border-border">
          <Button
            className="w-full h-13 text-base gap-3 shadow-lg shadow-primary/20"
            onClick={() => setIsOpen(true)}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            </div>
            <span className="flex-1 text-left">Ver carrito</span>
            <span className="font-bold">{fmt(totalPrice)}</span>
          </Button>
        </div>
      )}

      <VitrinaCartDrawer />
    </div>
  )
}
