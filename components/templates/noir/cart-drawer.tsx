'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Minus, Plus, Trash2, ArrowRight, ChevronLeft } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'

type Step = 'cart' | 'checkout'

export function NoirCartDrawer() {
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
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-[#111] border-[#222] p-0 text-[#F0EDE8]">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1E1E1E]">
          {step === 'checkout' && (
            <button
              onClick={() => setStep('cart')}
              className="text-[#555] hover:text-[#F0EDE8] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="font-serif text-lg text-[#F0EDE8] tracking-wide">
            {step === 'cart' ? 'Selección' : 'Contacto'}
          </h2>
          {step === 'cart' && items.length > 0 && (
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
        ) : step === 'cart' ? (
          <>
            <ScrollArea className="flex-1">
              <div className="px-6 py-4 space-y-0 divide-y divide-[#1A1A1A]">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-5">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#1A1A1A]">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[#F0EDE8] text-sm leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-[#555] mt-0.5">{item.variant}</p>
                      )}
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
                onClick={() => setStep('checkout')}
                className="w-full h-12 bg-[#C9A86C] text-[#0A0A0A] font-semibold text-sm flex items-center justify-center gap-2 rounded-sm hover:bg-[#D4B87A] active:scale-[0.99] transition-all tracking-wide"
              >
                Continuar
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
              <p className="text-xs text-[#555] leading-relaxed tracking-wide">
                Completa tus datos. Te contactaremos por WhatsApp para confirmar tu pedido.
              </p>

              {[
                { id: 'noir-name', label: 'Nombre', type: 'text', placeholder: 'Tu nombre', value: name, onChange: setName },
                { id: 'noir-phone', label: 'WhatsApp', type: 'tel', placeholder: '+54 9 11 1234-5678', value: phone, onChange: setPhone },
              ].map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label
                    htmlFor={field.id}
                    className="text-[10px] tracking-[0.2em] uppercase text-[#555]"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full h-11 bg-transparent border-b border-[#222] text-[#F0EDE8] text-sm placeholder:text-[#333] outline-none focus:border-[#C9A86C] transition-colors"
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <label
                  htmlFor="noir-notes"
                  className="text-[10px] tracking-[0.2em] uppercase text-[#555]"
                >
                  Nota <span className="normal-case">(opcional)</span>
                </label>
                <textarea
                  id="noir-notes"
                  placeholder="Talla, color, dirección..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border-b border-[#222] text-[#F0EDE8] text-sm placeholder:text-[#333] outline-none focus:border-[#C9A86C] transition-colors resize-none py-2"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#1E1E1E]">
                <span className="text-xs text-[#555] tracking-wide">
                  {items.reduce((s, i) => s + i.quantity, 0)} piezas
                </span>
                <span className="font-serif text-[#C9A86C] text-lg">{fmt(totalPrice)}</span>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-[#1E1E1E]">
              <button
                onClick={handleCheckout}
                disabled={!name.trim() || !phone.trim() || loading}
                className="w-full h-12 bg-[#C9A86C] text-[#0A0A0A] font-semibold text-sm flex items-center justify-center gap-2 rounded-sm hover:bg-[#D4B87A] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-all tracking-wide"
              >
                {loading ? 'Enviando...' : 'Enviar pedido por WhatsApp'}
                {!loading && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
