'use client'

import { useState, useMemo } from 'react'
import { Instagram, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store-context'
import { ServiciosProductCard } from './product-card'
import { ServiciosGalleryItem } from './gallery-item'

export function ServiciosTemplate() {
  const { store, products, categories } = useStore()
  const [activeTab, setActiveTab] = useState<'servicios' | 'portfolio'>('servicios')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const allCategories = useMemo(
    () => ['Todos', ...categories.map((c) => c.name)],
    [categories],
  )

  const filtered = useMemo(() => {
    if (selectedCategory === 'Todos') return products
    return products.filter((p) => p.category === selectedCategory)
  }, [products, selectedCategory])

  const galleryImages = useMemo(() => {
    return filtered.flatMap((p) =>
      (p.images?.length ? p.images : [p.image ?? '/placeholder.svg']).map(
        (img) => ({ src: img, product: p }),
      ),
    )
  }, [filtered])

  const avatar = store.avatar ?? '/placeholder.svg'
  const cover = store.coverImage
  const accent = store.primaryColor || '#2D2D2D'

  const whatsappLink = store.whatsappNumbers?.[0]
    ? `https://wa.me/${store.whatsappNumbers[0].replace(/\D/g, '')}`
    : null

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="relative">
        {/* Cover */}
        <div className="h-36 sm:h-44 bg-gray-100 overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full opacity-10"
              style={{ backgroundColor: accent }}
            />
          )}
        </div>

        {/* Profile */}
        <div className="relative max-w-lg mx-auto px-4 -mt-14 pb-4">
          <div className="flex flex-col items-center text-center">
            <img
              src={avatar}
              alt={store.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <h1 className="text-xl font-bold text-gray-900 mt-3">
              {store.name}
            </h1>
            {store.bio && (
              <p className="text-sm text-gray-500 mt-1.5 max-w-xs leading-relaxed">
                {store.bio}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-4">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button
                    className="gap-2 rounded-full text-white text-sm h-9 px-5"
                    style={{ backgroundColor: accent }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              )}
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="gap-2 rounded-full text-sm h-9 px-5"
                  >
                    <Instagram className="h-4 w-4" />
                    Seguir
                  </Button>
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {galleryImages.length}
                </p>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                  Trabajos
                </p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {products.length}
                </p>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                  Servicios
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab switcher */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto flex">
          <button
            onClick={() => setActiveTab('servicios')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'servicios'
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Servicios
            {activeTab === 'servicios' && (
              <div
                className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'portfolio'
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Portfolio
            {activeTab === 'portfolio' && (
              <div
                className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="bg-white px-4 pt-3 pb-0">
          <ScrollArea className="w-full max-w-lg mx-auto">
            <div className="flex gap-1.5 pb-3">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 bg-gray-100'
                  }`}
                  style={
                    selectedCategory === cat
                      ? { backgroundColor: accent }
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
      )}

      {/* Content */}
      <main className="max-w-lg mx-auto pb-24">
        {activeTab === 'servicios' ? (
          /* Services list */
          <div className="px-4 pt-4 space-y-3">
            {filtered.map((product) => (
              <ServiciosProductCard
                key={product.id}
                product={product}
                currency={store.currency}
                accent={accent}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No hay servicios en esta categoría
              </div>
            )}
          </div>
        ) : (
          /* Portfolio grid */
          <div className="grid grid-cols-3 gap-0.5">
            {galleryImages.map((item, idx) => (
              <ServiciosGalleryItem
                key={`${item.product.id}-${idx}`}
                src={item.src}
                product={item.product}
                storeSlug={store.slug}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp button */}
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-20"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </div>
  )
}
