'use client'

import { useState, useMemo } from 'react'
import { MapPin, Search, X, Building2, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { InmueblesProductCard } from './product-card'
import { InmueblesCartDrawer } from './cart-drawer'

export function InmueblesTemplate() {
  const { store, products, categories } = useStore()
  const { totalItems, setIsOpen } = useCart()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

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
      const matchCat =
        selectedCategory === 'Todos' || p.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, search, selectedCategory])

  const avatar = store.avatar ?? '/placeholder.svg'

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Agent header */}
      <header className="bg-[#1A3A52] text-white px-4 py-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <img
            src={avatar}
            alt={store.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]/40 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{store.name}</h1>
            {store.bio && (
              <p className="text-sm text-white/70 line-clamp-1 mt-0.5">
                {store.bio}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {products.length} propiedades
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Asesor inmobiliario
              </span>
            </div>
          </div>
          {store.whatsappNumbers?.[0] && (
            <a
              href={`https://wa.me/${store.whatsappNumbers[0].replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Contactar"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      </header>

      {/* Sticky search + filters */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 pt-3 pb-0 sm:px-6 shadow-sm">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por ubicación, tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-10 text-sm rounded-xl border-gray-200 bg-gray-50 focus-visible:ring-[#1A3A52]/20"
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

          <ScrollArea className="w-full">
            <div className="flex gap-1.5 pb-3">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-[#1A3A52] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-1">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'propiedad' : 'propiedades'}
          {selectedCategory !== 'Todos' && (
            <span> en {selectedCategory}</span>
          )}
        </p>
      </div>

      {/* Property grid */}
      <main className="px-4 sm:px-6 pb-28">
        <div className="max-w-3xl mx-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sin resultados</p>
                <p className="text-sm text-gray-500">
                  Probá con otra búsqueda o categoría
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {filtered.map((product) => (
                <InmueblesProductCard
                  key={product.id}
                  product={product}
                  currency={store.currency}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating indicator for saved properties */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-20">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full max-w-3xl mx-auto h-13 flex items-center justify-between px-5 rounded-2xl text-white text-base font-semibold shadow-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98] bg-[#1A3A52]"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="h-5 w-5" />
              <span className="bg-[#D4AF37] text-[#1A3A52] text-sm font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            </div>
            <span>Ver propiedades guardadas</span>
            <span className="text-[#D4AF37]">&rarr;</span>
          </button>
        </div>
      )}

      <InmueblesCartDrawer />
    </div>
  )
}
