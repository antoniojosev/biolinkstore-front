'use client'

import Link from 'next/link'
import { Heart, X, ShoppingBag } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { useSearchParams } from 'next/navigation'

interface Props {
  /** Accent color for buttons and icons */
  accent?: string
  /** Background color class for the drawer */
  bgClass?: string
  /** Text color class */
  textClass?: string
  /** Secondary text color class */
  mutedClass?: string
  /** Border color class */
  borderClass?: string
  /** Item bg class */
  itemBgClass?: string
  /** Add to cart button class */
  cartBtnClass?: string
}

export function WishlistDrawer({
  accent = '#33b380',
  bgClass = 'bg-background',
  textClass = 'text-foreground',
  mutedClass = 'text-muted-foreground',
  borderClass = 'border-border',
  itemBgClass = 'bg-card',
  cartBtnClass = 'bg-primary text-primary-foreground hover:bg-primary/90',
}: Props) {
  const { items, removeItem, isOpen, setIsOpen, totalItems } = useWishlist()
  const { addItem, setIsOpen: openCart } = useCart()
  const { store } = useStore()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  const handleAddToCart = (item: typeof items[number]) => {
    addItem({
      id: item.productId,
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
    })
    openCart(true)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className={`w-full max-w-sm p-0 flex flex-col ${bgClass} border-l ${borderClass}`}>
        <SheetHeader className={`px-5 py-4 border-b ${borderClass} shrink-0`}>
          <SheetTitle className={`flex items-center gap-2 text-base font-semibold ${textClass}`}>
            <Heart className="h-4 w-4" style={{ color: accent }} />
            Favoritos
            {totalItems > 0 && (
              <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: `${accent}20`, color: accent }}>
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${accent}15` }}>
              <Heart className="h-6 w-6" style={{ color: accent }} strokeWidth={1.5} />
            </div>
            <p className={`text-sm font-medium ${textClass}`}>Sin favoritos aún</p>
            <p className={`text-xs ${mutedClass}`}>Guardá productos que te gusten para verlos después</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className={`flex gap-3 p-2.5 rounded-xl ${itemBgClass}`}>
                  <Link
                    href={`/${store.slug}/${item.slug}${preview ? `?preview=${preview}` : ''}`}
                    className="shrink-0"
                    onClick={() => setIsOpen(false)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        href={`/${store.slug}/${item.slug}${preview ? `?preview=${preview}` : ''}`}
                        onClick={() => setIsOpen(false)}
                        className={`text-sm font-medium line-clamp-2 leading-snug ${textClass}`}
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className={`shrink-0 p-0.5 rounded-md ${mutedClass} hover:opacity-70 transition-opacity`}
                        aria-label="Quitar"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: accent }}>
                        {fmt(item.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${cartBtnClass}`}
                      >
                        <ShoppingBag className="h-3 w-3" />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}
