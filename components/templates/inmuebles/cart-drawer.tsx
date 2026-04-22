'use client'

import { useState } from 'react'
import { Trash2, MessageCircle, Building2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { trackEvent } from '@/lib/analytics'

export function InmueblesCartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, totalPrice, clearCart } = useCart()
  const { store, paymentProvider } = useStore()
  const [loading, setLoading] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const handleInquiry = async () => {
    setLoading(true)
    trackEvent(store.slug, 'CHECKOUT_START')
    await paymentProvider.checkout({
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        name: i.name,
        price: i.price,
        quantity: 1,
        image: i.image,
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
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 bg-white border-[#e5e3df]">
        <SheetHeader className="px-6 py-4 border-b border-[#e5e3df]">
          <SheetTitle className="text-[#0a0a0a] flex items-center gap-2 text-base font-semibold tracking-tight">
            <Building2 className="h-4 w-4 text-[#1a3550]" />
            Propiedades de interés
            {items.length > 0 && (
              <span className="ml-auto bg-[#1a3550] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums">
                {items.length}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f6f5f3] flex items-center justify-center">
              <Building2 className="h-7 w-7 text-[#8a8a8a]" />
            </div>
            <div>
              <p className="font-medium text-[#0a0a0a]">
                Aún no guardaste propiedades
              </p>
              <p className="text-sm text-[#8a8a8a] mt-1">
                Guarda las que te interesen y consulta por todas en un mensaje.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 bg-white rounded-lg p-3 border border-[#e5e3df]"
                  >
                    <div className="relative h-20 w-28 shrink-0 rounded overflow-hidden bg-[#ebe9e4]">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0a0a0a] line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <p className="text-sm font-semibold text-[#1a3550] mt-1 tabular-nums">
                        {fmt(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Quitar ${item.name} de propiedades guardadas`}
                      className="shrink-0 w-8 h-8 grid place-items-center rounded-full text-[#8a8a8a] hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-[#e5e3df] bg-[#f6f5f3] space-y-3">
              <p className="text-xs text-[#8a8a8a] text-center">
                Se enviará una consulta con{' '}
                {items.length === 1
                  ? 'esta propiedad'
                  : `estas ${items.length} propiedades`}
                .
              </p>
              <button
                type="button"
                onClick={handleInquiry}
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#0a0a0a] hover:bg-[#1a3550] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                <MessageCircle className="h-4 w-4" />
                {loading ? 'Enviando…' : 'Consultar por WhatsApp'}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
