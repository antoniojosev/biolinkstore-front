'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { trackEvent } from '@/lib/analytics'
import { CartVariantBadge } from '@/components/templates/shared/cart-variant-badge'

export function PosterCartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const { store, paymentProvider } = useStore()
  const [loading, setLoading] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-VE', {
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
      <SheetContent
        className="flex w-full flex-col border-white/10 p-0 text-[#fff4e0] sm:max-w-md"
        style={{
          background:
            'linear-gradient(180deg, #2e0606 0%, #1f0404 100%)',
        }}
      >
        <SheetHeader className="border-b border-white/10 px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-[#fff4e0]">
            <ShoppingBag className="h-5 w-5 text-[#f4a23a]" />
            Tu pedido
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <ShoppingBag className="h-7 w-7 text-[#fff4e0]/40" />
            </div>
            <div>
              <p className="font-medium text-[#fff4e0]">Tu pedido está vacío</p>
              <p className="mt-1 text-sm text-[#fff4e0]/60">
                Agrega platos del menú para hacer tu pedido
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-[#fff4e0]">
                        {item.name}
                      </p>
                      {item.variantDetails && item.variantDetails.length > 0 ? (
                        <div className="text-[#fff4e0]/70">
                          <CartVariantBadge details={item.variantDetails} />
                        </div>
                      ) : item.variant ? (
                        <p className="text-xs text-[#fff4e0]/60">{item.variant}</p>
                      ) : null}
                      <p
                        className="mt-0.5 text-sm font-bold text-[#f4a23a]"
                        style={{ fontFamily: 'var(--font-anton), sans-serif' }}
                      >
                        {fmt(item.price)}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md border border-white/10 bg-white/5 text-[#fff4e0] hover:bg-white/10"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Quitar uno"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-5 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md border border-white/10 bg-white/5 text-[#fff4e0] hover:bg-white/10"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Agregar uno"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-6 w-6 text-[#fff4e0]/50 hover:text-red-400"
                          onClick={() => removeItem(item.id)}
                          aria-label="Quitar del pedido"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-3 border-t border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#fff4e0]/70">Total</span>
                <span
                  className="text-2xl text-[#f4a23a]"
                  style={{ fontFamily: 'var(--font-anton), sans-serif' }}
                >
                  {fmt(totalPrice)}
                </span>
              </div>
              <Button
                className="h-12 w-full gap-2 rounded-xl bg-[#fff4e0] text-base font-bold uppercase tracking-wider text-[#4a0a0a] hover:bg-[#ffd07a]"
                onClick={handleCheckout}
                disabled={loading}
              >
                <MessageCircle className="h-5 w-5" />
                {loading ? 'Enviando...' : 'Pedir por WhatsApp'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
