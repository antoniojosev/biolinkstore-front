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

export function VitrinaCartDrawer() {
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
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-card border-border p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="text-foreground flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Tu carrito
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground mt-1">
                Agrega productos para hacer tu cotización
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-18 w-18 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      {item.variantDetails && item.variantDetails.length > 0 ? (
                        <div className="text-muted-foreground">
                          <CartVariantBadge details={item.variantDetails} />
                        </div>
                      ) : item.variant ? (
                        <p className="text-xs text-muted-foreground">{item.variant}</p>
                      ) : null}
                      <p className="text-sm font-bold text-primary mt-0.5">{fmt(item.price)}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6 rounded-md"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-5 text-center">{item.quantity}</span>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6 rounded-md"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Total</span>
                <span className="font-bold text-lg text-foreground">{fmt(totalPrice)}</span>
              </div>
              <Button
                className="w-full h-12 text-base gap-2"
                onClick={handleCheckout}
                disabled={loading}
              >
                <MessageCircle className="h-5 w-5" />
                {loading ? 'Enviando...' : 'Enviar cotización por WhatsApp'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
