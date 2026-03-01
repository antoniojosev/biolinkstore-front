"use client"

import Image from "next/image"
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useCart } from "./cart-context"
import { storeProfile } from "@/lib/store-data"

export function CartSheet() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const generateWhatsAppMessage = () => {
    const itemsList = items
      .map((item) => `• ${item.name} (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}`)
      .join("\n")

    const message = `¡Hola! 👋 Me gustaría hacer un pedido:\n\n${itemsList}\n\n*Total: ${formatPrice(totalPrice)}*\n\n¿Está disponible?`

    return encodeURIComponent(message)
  }

  const handleCheckout = () => {
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${storeProfile.whatsappNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-background border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">Tu carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground mt-1">Agrega productos para hacer tu pedido</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-1">{item.name}</h4>
                      <p className="text-primary font-semibold text-sm">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center text-foreground">{item.quantity}</span>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4">
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-lg text-foreground">{formatPrice(totalPrice)}</span>
              </div>
              <Button className="w-full gap-2" size="lg" onClick={handleCheckout}>
                <MessageCircle className="h-5 w-5" />
                Pedir por WhatsApp
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={clearCart}>
                Vaciar carrito
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
