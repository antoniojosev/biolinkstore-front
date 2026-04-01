'use client'

import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { MapPin, Clock, Search, X, ShoppingBag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { MenuProductCard } from './product-card'
import { MenuCartDrawer } from './cart-drawer'

export function MenuTemplate() {
  const { store, products, categories } = useStore()
  const { totalItems, totalPrice, setIsOpen } = useCart()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isScrollingTo = useRef(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  const categoryList = useMemo(() => categories.map((c) => c.name), [categories])

  const grouped = useMemo(() => {
    const map: Record<string, typeof products> = {}
    for (const cat of categoryList) {
      const items = products.filter((p) => {
        const matchCat = p.category === cat
        if (!search) return matchCat
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
      })
      if (items.length > 0) map[cat] = items
    }
    // Uncategorized
    const uncategorized = products.filter((p) => {
      const matchCat = !p.category || !categoryList.includes(p.category)
      if (!search) return matchCat
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
    if (uncategorized.length > 0) map['Otros'] = uncategorized
    return map
  }, [products, categories, categoryList, search])

  const visibleCategories = useMemo(() => Object.keys(grouped), [grouped])

  // Set initial active category
  useEffect(() => {
    if (!activeCategory && visibleCategories.length > 0) {
      setActiveCategory(visibleCategories[0])
    }
  }, [visibleCategories, activeCategory])

  // Intersection observer to update active category on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.getAttribute('data-category') ?? '')
          }
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 },
    )
    for (const el of Object.values(sectionRefs.current)) {
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [visibleCategories])

  const scrollToCategory = useCallback((cat: string) => {
    setActiveCategory(cat)
    const el = sectionRefs.current[cat]
    if (!el) return
    isScrollingTo.current = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { isScrollingTo.current = false }, 800)
  }, [])

  const avatar = store.avatar ?? '/placeholder.svg'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Restaurant header */}
      <header className="relative px-4 pt-6 pb-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt={store.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 shadow-sm"
              style={{ borderColor: '#E8DDD3' }}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{store.name}</h1>
              {store.bio && (
                <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{store.bio}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Delivery disponible
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Abierto ahora
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky search + category tabs */}
      <div
        className="sticky top-0 z-10 border-b px-4 pt-3 pb-0 sm:px-6"
        style={{ backgroundColor: '#FFF8F0', borderColor: '#E8DDD3' }}
      >
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en el menú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-10 text-sm rounded-xl border-gray-200 bg-white focus-visible:ring-amber-500/30"
            />
            {search && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearch('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <ScrollArea className="w-full">
            <div className="flex gap-1 pb-3">
              {visibleCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200'
                  }`}
                  style={
                    activeCategory === cat
                      ? { backgroundColor: '#B45309' }
                      : undefined
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Menu sections grouped by category */}
      <main className="px-4 sm:px-6 pb-32">
        <div className="max-w-2xl mx-auto">
          {visibleCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sin resultados</p>
                <p className="text-sm text-gray-500">Probá con otra búsqueda</p>
              </div>
            </div>
          ) : (
            visibleCategories.map((cat) => (
              <div
                key={cat}
                ref={(el) => { sectionRefs.current[cat] = el }}
                data-category={cat}
                className="pt-6"
                style={{ scrollMarginTop: '140px' }}
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3">{cat}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grouped[cat].map((product) => (
                    <MenuProductCard
                      key={product.id}
                      product={product}
                      currency={store.currency}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Sticky bottom order bar — always visible */}
      <div
        className="fixed bottom-0 inset-x-0 p-4 border-t backdrop-blur-lg z-20"
        style={{
          backgroundColor: 'rgba(255,248,240,0.85)',
          borderColor: '#E8DDD3',
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="w-full max-w-2xl mx-auto h-13 flex items-center justify-between px-5 rounded-2xl text-white text-base font-semibold shadow-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#B45309' }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="bg-white/20 text-sm font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <span>{totalItems > 0 ? 'Ver pedido' : 'Tu pedido'}</span>
          <span className="font-bold">{totalItems > 0 ? fmt(totalPrice) : '$0'}</span>
        </button>
      </div>

      <MenuCartDrawer />
    </div>
  )
}
