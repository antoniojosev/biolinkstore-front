"use client"

import Image from "next/image"
import { Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useCart } from "./cart-context"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    if (!product.inStock) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card className="overflow-hidden bg-card border-border group">
      <div className="relative aspect-square">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary">Agotado</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <h3 className="font-medium text-sm text-foreground line-clamp-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          <Button size="sm" onClick={handleAddToCart} disabled={!product.inStock || added} className="h-8 w-8 p-0">
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="sr-only">Agregar al carrito</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
