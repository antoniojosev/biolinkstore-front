'use client'

import Image from 'next/image'
import { useState, useMemo } from 'react'
import { Instagram, Search, SlidersHorizontal, ShoppingBag, X } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { LuxoraProductCard } from './product-card'
import { LuxoraCartDrawer } from './cart-drawer'

export function LuxoraTemplate() {
  const { store, products, categories } = useStore()
  const { totalItems, totalPrice, setIsOpen } = useCart()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [showSearch, setShowSearch] = useState(false)

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

  const newCount = filtered.length
  const avatar = store.avatar ?? '/placeholder.svg'
  const cover = store.coverImage

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-[#FAFAF8] text-[#1A1A1A]">

      {/* Hero Header */}
      <header className="relative">
        {cover ? (
          <div className="relative h-64 w-full overflow-hidden">
            <Image src={cover} alt={store.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#FAFAF8]" />
            {/* Store name overlaid */}
            <div className="absolute bottom-6 left-5 right-5">
              <h1 className="text-4xl font-black text-white leading-none tracking-tight drop-shadow-md">
                {store.name}
              </h1>
              {store.username && (
                <p className="text-white/80 text-sm mt-1">{store.username}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#FAFAF8] pt-10 px-5 pb-4">
            <div className="flex items-center gap-3">
              <Image
                src={avatar}
                alt={store.name}
                width={48}
                height={48}
                className="rounded-full border border-[#E5E5E0] object-cover"
              />
              <div>
                <h1 className="text-2xl font-black text-[#1A1A1A] leading-tight">{store.name}</h1>
                {store.username && (
                  <p className="text-xs text-[#999]">{store.username}</p>
                )}
              </div>
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto"
                >
                  <Instagram className="h-5 w-5 text-[#999] hover:text-[#1A1A1A] transition-colors" />
                </a>
              )}
            </div>
            {store.bio && (
              <p className="text-sm text-[#666] mt-3 leading-relaxed">{store.bio}</p>
            )}
          </div>
        )}
      </header>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#EBEBEB] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          {showSearch ? (
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999]" />
                <input
                  autoFocus
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 bg-[#F0F0EC] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#999] outline-none border-none"
                />
              </div>
              <button
                onClick={() => { setShowSearch(false); setSearch('') }}
                className="text-[#999] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <p className="text-lg font-black text-[#1A1A1A] leading-none">
                  {newCount}{' '}
                  <span className="font-medium text-[#999]">
                    {selectedCategory === 'Todos' ? 'productos' : selectedCategory.toLowerCase()}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors"
                >
                  <Search className="h-4 w-4 text-[#999]" />
                </button>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F0EC] transition-colors"
                  onClick={() => setIsOpen(true)}
                >
                  <div className="relative">
                    <ShoppingBag className="h-4 w-4 text-[#1A1A1A]" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#1A1A1A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Category Filter */}
        <ScrollArea className="w-full mt-2">
          <div className="flex gap-1.5 pb-0.5">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F0F0EC] text-[#666] hover:text-[#1A1A1A]'
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
      <main className="px-5 py-5">
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-28">
            {filtered.map((product) => (
              <LuxoraProductCard
                key={product.id}
                product={product}
                currency={store.currency}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sticky checkout bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto px-5 pb-6 pt-3 bg-[#FAFAF8]/90 backdrop-blur-md">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full h-14 bg-[#1A1A1A] text-white rounded-2xl font-semibold flex items-center px-5 gap-3 shadow-xl shadow-black/10 hover:bg-[#333] active:scale-[0.99] transition-all"
          >
            <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItems}
            </span>
            <span className="flex-1 text-left text-sm">Ver carrito</span>
            <span className="font-bold text-sm">{fmt(totalPrice)}</span>
          </button>
        </div>
      )}

      <LuxoraCartDrawer />
    </div>
  )
}
