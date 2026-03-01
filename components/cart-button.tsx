"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "./cart-context"

export function CartButton() {
  const { totalItems, setIsOpen, totalPrice } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border">
      <Button className="w-full gap-3 h-14 text-base" size="lg" onClick={() => setIsOpen(true)}>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-full text-sm">{totalItems}</span>
        </div>
        <span className="flex-1">Ver carrito</span>
        <span className="font-bold">{formatPrice(totalPrice)}</span>
      </Button>
    </div>
  )
}
