'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Minus, Plus, Trash2, ArrowRight, X, ShoppingBag } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'

type Step = 'cart' | 'checkout'

export function LuxoraCartDrawer() {
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
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-white border-[#E5E5E0] p-0 text-[#1A1A1A]">
        <SheetHeader className="px-6 py-4 border-b border-[#E5E5E0]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[#1A1A1A] font-bold flex items-center gap-2">
              {step === 'checkout' && (
                <button onClick={() => setStep('cart')} className="mr-1">
                  <X className="h-4 w-4 text-[#999]" />
                </button>
              )}
              {step === 'cart' ? 'Mi carrito' : 'Datos de envío'}
            </SheetTitle>
            {step === 'cart' && items.length > 0 && (
              <span className="text-xs text-[#999] bg-[#F5F5F0] px-2 py-1 rounded-full">
                {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
              </span>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F0] flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-[#999]" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A]">Tu carrito está vacío</p>
              <p className="text-sm text-[#999] mt-1">Agrega productos para continuar</p>
            </div>
          </div>
        ) : step === 'cart' ? (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="divide-y divide-[#F0F0EC]">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-4">
                    <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-[#F5F5F0]">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-1">
                          {item.name}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#CCC] hover:text-[#999] shrink-0 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {item.variant && (
                        <p className="text-xs text-[#999]">{item.variant}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#E5E5E0] rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#999] hover:text-[#1A1A1A] transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#999] hover:text-[#1A1A1A] transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-[#1A1A1A]">
                          {fmt(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-6 py-5 border-t border-[#E5E5E0] space-y-4">
              <div className="flex justify-between text-base font-bold text-[#1A1A1A]">
                <span>Total</span>
                <span>{fmt(totalPrice)}</span>
              </div>
              <button
                onClick={() => setStep('checkout')}
                className="w-full h-12 bg-[#1A1A1A] text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#333] active:scale-98 transition-all"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
              <p className="text-sm text-[#999]">
                Completa tus datos y te contactamos para confirmar tu pedido.
              </p>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Nombre
                </Label>
                <Input
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-[#E5E5E0] bg-[#FAFAF8] rounded-xl h-11 text-[#1A1A1A] placeholder:text-[#BBB]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  WhatsApp
                </Label>
                <Input
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-[#E5E5E0] bg-[#FAFAF8] rounded-xl h-11 text-[#1A1A1A] placeholder:text-[#BBB]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Nota (opcional)
                </Label>
                <Textarea
                  placeholder="Talla, color, dirección..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-[#E5E5E0] bg-[#FAFAF8] rounded-xl text-[#1A1A1A] placeholder:text-[#BBB] resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-[#F5F5F0] rounded-2xl p-4 flex justify-between text-sm font-semibold text-[#1A1A1A]">
                <span>{items.reduce((s, i) => s + i.quantity, 0)} artículos</span>
                <span>{fmt(totalPrice)}</span>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-[#E5E5E0]">
              <button
                onClick={handleCheckout}
                disabled={!name.trim() || !phone.trim() || loading}
                className="w-full h-12 bg-[#1A1A1A] text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Enviando...' : 'Enviar pedido por WhatsApp'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
