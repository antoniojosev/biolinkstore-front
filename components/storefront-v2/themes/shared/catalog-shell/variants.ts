"use client"

import { useMemo, useState } from "react"
import type { CartItem } from "@/lib/types"
import type {
  TemplateAttribute,
  TemplateProduct,
  TemplateVariant,
} from "@/components/storefront-v2/template/template-renderer"

/**
 * Lógica de variantes compartida por los detalles de producto de vitrina y
 * luxora (specs §4.2 — idéntica en ambos): selectedVariant por combination,
 * finalPrice = price + priceAdjustment, canAdd exige todos los ejes elegidos,
 * disponibilidad por variantes, id de carrito = {productId}-{optionsKey}.
 *
 * Diferencias vs legacy (contrato nuevo):
 * - `optionsMeta` solo expone hex/priceDelta (sin `images`), así que el swap
 *   de galería por color usa la imagen de la VARIANTE matcheada si está en la
 *   galería (el legacy además reemplazaba la galería completa con
 *   optionsMeta.images — dato que la API v2 no publica).
 * - Sin `sortOrder` en TemplateAttribute: se respeta el orden del array.
 * - Cantidad: SIEMPRE agrega las N unidades (comportamiento luxora; el bug
 *   legacy de vitrina —CTA muestra precio×qty pero agrega 1— queda corregido).
 */

export function variantAttrsOf(product: TemplateProduct): TemplateAttribute[] {
  return (product.attributes ?? []).filter((a) => !a.role || a.role === "variant")
}

export function productInStock(product: TemplateProduct): boolean {
  return product.stock == null || product.stock > 0
}

export function optionAvailable(
  product: TemplateProduct,
  attrName: string,
  option: string,
): boolean {
  const variants = product.variants ?? []
  if (variants.length === 0) return true
  return variants.some((v) => v.combination[attrName] === option && v.isAvailable)
}

export interface ProductSelection {
  images: string[]
  selectedImage: number
  setSelectedImage: (i: number) => void
  quantity: number
  setQuantity: (fn: (q: number) => number) => void
  selectedOptions: Record<string, string>
  selectOption: (attrName: string, option: string) => void
  selectedVariant: TemplateVariant | null
  variantAttrs: TemplateAttribute[]
  finalPrice: number
  inStock: boolean
  canAdd: boolean
}

export function useProductSelection(product: TemplateProduct): ProductSelection {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const images = useMemo(() => {
    const list = product.images?.length ? product.images : product.image ? [product.image] : []
    return list.length > 0 ? list : ["/placeholder.svg"]
  }, [product.images, product.image])

  const variantAttrs = useMemo(() => variantAttrsOf(product), [product])

  const selectedVariant = useMemo(() => {
    const variants = product.variants ?? []
    if (variants.length === 0) return null
    return (
      variants.find((v) =>
        Object.entries(selectedOptions).every(([key, val]) => v.combination[key] === val),
      ) ?? null
    )
  }, [product.variants, selectedOptions])

  const finalPrice = product.price + (selectedVariant?.priceAdjustment ?? 0)
  const inStock = productInStock(product)
  const canAdd =
    inStock &&
    (variantAttrs.length === 0 || Object.keys(selectedOptions).length === variantAttrs.length)

  function selectOption(attrName: string, option: string) {
    const next = { ...selectedOptions, [attrName]: option }
    setSelectedOptions(next)
    // Legacy §4.2: si la variante matcheada tiene imagen presente en la
    // galería, seleccionar ese índice (el swap por optionsMeta.images no
    // aplica: la API v2 no lo expone).
    const match = (product.variants ?? []).find((v) =>
      Object.entries(next).every(([k, val]) => v.combination[k] === val),
    )
    if (match?.image) {
      const idx = images.indexOf(match.image)
      if (idx >= 0) setSelectedImage(idx)
    }
  }

  return {
    images,
    selectedImage,
    setSelectedImage,
    quantity,
    setQuantity,
    selectedOptions,
    selectOption,
    selectedVariant,
    variantAttrs,
    finalPrice,
    inStock,
    canAdd,
  }
}

interface CartLike {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  updateQuantity: (id: string, quantity: number) => void
}

/**
 * Agrega N unidades de la selección (id firmado por opciones — combinaciones
 * distintas son líneas distintas). Corrige el quirk vitrina: agrega la
 * cantidad elegida completa, como hacía luxora.
 */
export function addSelectionToCart(
  cart: CartLike,
  product: TemplateProduct,
  sel: ProductSelection,
): void {
  const hasSelections = Object.keys(sel.selectedOptions).length > 0
  const variantLabel = hasSelections
    ? Object.entries(sel.selectedOptions)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    : undefined
  const optionsKey = hasSelections
    ? Object.entries(sel.selectedOptions)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => v)
        .join("-")
    : ""
  const id = optionsKey ? `${product.id}-${optionsKey}` : product.id
  const existing = cart.items.find((i) => i.id === id)
  cart.addItem({
    id,
    productId: product.id,
    variantId: sel.selectedVariant?.id,
    name: product.name,
    price: sel.finalPrice,
    image: sel.selectedVariant?.image ?? sel.images[0] ?? "/placeholder.svg",
    variant: variantLabel,
  })
  if (sel.quantity > 1) {
    const baseQty = existing ? existing.quantity : 0
    cart.updateQuantity(id, baseQty + sel.quantity)
  }
}
