'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2, MessageCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { trackEvent } from '@/lib/analytics'
import { CartVariantBadge } from '@/components/templates/shared/cart-variant-badge'

export function NoirCartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const { store, paymentProvider } = useStore()
  const [loading, setLoading] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  const handleCheckout = async () => {
    setLoading(true)
    trackEvent(store.slug, 'CHECKOUT_START')
    await paymentProvider.checkout({
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        variant: i.variant,
      })),
      total: totalPrice,
      currency: store.currency,
      storeSlug: store.slug,
    })
    setLoading(false)
    clearCart()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-[#111] border-[#222] p-0 text-[#F0EDE8]">
        <SheetTitle className="sr-only">Carrito</SheetTitle>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1E1E1E]">
          <h2 className="font-serif text-lg text-[#F0EDE8] tracking-wide">
            Selección
          </h2>
          {items.length > 0 && (
            <span className="ml-auto text-xs text-[#555] tracking-widest uppercase">
              {items.length} {items.length === 1 ? 'pieza' : 'piezas'}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5">
            <div className="text-5xl font-serif text-[#222] select-none">∅</div>
            <div>
              <p className="font-serif text-[#F0EDE8] text-lg">Selección vacía</p>
              <p className="text-xs text-[#555] mt-2 tracking-wider uppercase">
                Agrega piezas para comenzar
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="px-6 py-4 space-y-0 divide-y divide-[#1A1A1A]">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-5">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#1A1A1A]">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[#F0EDE8] text-sm leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      {item.variantDetails && item.variantDetails.length > 0 ? (
                        <div className="text-[#555] mt-0.5">
                          <CartVariantBadge details={item.variantDetails} />
                        </div>
                      ) : item.variant ? (
                        <p className="text-xs text-[#555] mt-0.5">{item.variant}</p>
                      ) : null}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-[#555]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="hover:text-[#C9A86C] transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-[#F0EDE8] text-xs w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="hover:text-[#C9A86C] transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#C9A86C] text-sm font-semibold">
                            {fmt(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#333] hover:text-[#555] transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-6 py-5 border-t border-[#1E1E1E] space-y-5">
              <div className="flex items-end justify-between">
                <span className="text-xs text-[#555] tracking-widest uppercase">Total</span>
                <span className="font-serif text-xl text-[#C9A86C]">{fmt(totalPrice)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 bg-[#C9A86C] text-[#0A0A0A] font-semibold text-sm flex items-center justify-center gap-2 rounded-sm hover:bg-[#D4B87A] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-all tracking-wide"
              >
                <MessageCircle className="h-4 w-4" />
                {loading ? 'Enviando...' : 'Enviar cotización por WhatsApp'}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
