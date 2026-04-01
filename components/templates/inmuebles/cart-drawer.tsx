'use client'

import { useState } from 'react'
import { Trash2, MessageCircle, Building2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    new Intl.NumberFormat('es-VE', {
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
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 bg-[#F8F9FA]">
        <SheetHeader className="px-6 py-4 border-b border-gray-200 bg-white">
          <SheetTitle className="text-[#1A3A52] flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#D4AF37]" />
            Propiedades de interés
            {items.length > 0 && (
              <span className="bg-[#1A3A52] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                {items.length}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Building2 className="h-7 w-7 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                No tienes propiedades guardadas
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Guarda las propiedades que te interesen para consultar por todas a la vez
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
                    className="flex gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
                  >
                    <div className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A3A52] line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-sm font-bold text-[#D4AF37] mt-1">
                        {fmt(item.price)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-gray-200 bg-white space-y-3">
              <p className="text-xs text-gray-500 text-center">
                Se enviará una consulta por WhatsApp con{' '}
                {items.length === 1
                  ? 'esta propiedad'
                  : `estas ${items.length} propiedades`}
              </p>
              <Button
                className="w-full h-12 text-base gap-2 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white"
                onClick={handleInquiry}
                disabled={loading}
              >
                <MessageCircle className="h-5 w-5" />
                {loading
                  ? 'Enviando...'
                  : `Consultar por WhatsApp`}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
