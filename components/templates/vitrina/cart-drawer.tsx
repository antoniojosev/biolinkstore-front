'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Minus, Plus, Trash2, MessageCircle, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'

type Step = 'cart' | 'checkout'

export function VitrinaCartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const { store, paymentProvider } = useStore()
  const [step, setStep] = useState<Step>('cart')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  const handleCheckout = async () => {
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    await paymentProvider.checkout({
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        variant: i.variant,
      })),
      customer: { name, phone, notes: notes || undefined },
      total: totalPrice,
      currency: store.currency,
      storeSlug: store.slug,
    })
    setLoading(false)
    clearCart()
    setIsOpen(false)
    setStep('cart')
    setName('')
    setPhone('')
    setNotes('')
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-card border-border p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {step === 'cart' ? 'Tu carrito' : 'Datos de contacto'}
            </SheetTitle>
            {step === 'checkout' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setStep('cart')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground mt-1">
                Agrega productos para hacer tu pedido
              </p>
            </div>
          </div>
        ) : step === 'cart' ? (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-18 w-18 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">{item.variant}</p>
                      )}
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
              <Button className="w-full h-12 text-base gap-2" onClick={() => setStep('checkout')}>
                Continuar pedido
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                Completá tus datos y te contactamos por WhatsApp para confirmar el pedido.
              </p>

              <div className="space-y-2">
                <Label htmlFor="checkout-name">Nombre *</Label>
                <Input
                  id="checkout-name"
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-phone">Teléfono / WhatsApp *</Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-notes">Notas (opcional)</Label>
                <Textarea
                  id="checkout-notes"
                  placeholder="Talla, color, dirección de entrega..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-muted border-border resize-none"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{items.length} productos</span>
                <span className="font-bold text-foreground">{fmt(totalPrice)}</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border">
              <Button
                className="w-full h-12 text-base gap-2"
                onClick={handleCheckout}
                disabled={!name.trim() || !phone.trim() || loading}
              >
                <MessageCircle className="h-5 w-5" />
                {loading ? 'Procesando...' : 'Enviar pedido por WhatsApp'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
