'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { trackEvent } from '@/lib/analytics'
import { CartVariantBadge } from '@/components/templates/shared/cart-variant-badge'

const SERIF = { fontFamily: 'var(--font-fraunces)' }

export function RosierCartDrawer() {
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
        productId: i.productId,
        variantId: i.variantId,
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
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-[#fdfaf6] border-[#e8dfd8] p-0 text-[#1a1413]">
        <SheetHeader className="px-6 py-4 border-b border-[#e8dfd8]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[#1a1413] text-[22px] font-medium tracking-tight" style={SERIF}>
              Tu bolsa{' '}
              {items.length > 0 && (
                <span className="text-xs text-[#78685f] ml-1.5 font-normal">({items.length})</span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f5ece2] flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-[#78685f]" />
            </div>
            <div>
              <p className="font-medium text-[#1a1413]" style={SERIF}>Tu bolsa está vacía</p>
              <p className="text-sm text-[#78685f] mt-1">Explora la nueva colección</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <ul className="flex flex-col gap-[18px]">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3.5">
                    <div className="relative w-[78px] h-[96px] shrink-0 rounded overflow-hidden bg-[#f5ece2]">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium text-[#1a1413] line-clamp-1">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label="Quitar de la bolsa"
                            className="text-[#78685f]/60 hover:text-[#c8334c] shrink-0 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {item.variantDetails && item.variantDetails.length > 0 ? (
                          <div className="text-[#78685f] text-xs mt-0.5">
                            <CartVariantBadge details={item.variantDetails} />
                          </div>
                        ) : item.variant ? (
                          <p className="text-xs text-[#78685f] mt-0.5">{item.variant}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center border border-[#e8dfd8] rounded-full text-xs">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Reducir cantidad"
                            className="w-[26px] h-[26px] grid place-items-center text-[#5a4b48] hover:text-[#c8334c] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="min-w-[20px] text-center font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Aumentar cantidad"
                            className="w-[26px] h-[26px] grid place-items-center text-[#5a4b48] hover:text-[#c8334c] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                          {fmt(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="px-6 py-5 border-t border-[#e8dfd8] space-y-2">
              <div className="flex justify-between text-[13px] text-[#5a4b48]">
                <span>Subtotal</span>
                <span className="tabular-nums">{fmt(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#5a4b48]">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 text-[#1a1413] font-semibold">
                <span className="text-base">Total</span>
                <span className="text-[22px] tabular-nums" style={SERIF}>
                  {fmt(totalPrice)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-[50px] bg-[#c8334c] text-white rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#9b2237] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition-all mt-2"
              >
                <MessageCircle className="h-4 w-4" />
                {loading ? 'Enviando…' : 'Finalizar por WhatsApp'}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
