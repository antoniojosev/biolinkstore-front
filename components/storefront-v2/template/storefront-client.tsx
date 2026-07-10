"use client"

import { useMemo, useState } from "react"
import { CartProvider, useCart } from "@/lib/cart-context"
import { WhatsAppPaymentProvider } from "@/lib/payment-providers/whatsapp"
import { trackEvent as trackLegacyEvent } from "@/lib/analytics"
import { trackEvent as trackStoreEvent } from "@/lib/storefront-tracking"
import { TemplateRenderer, type TemplateProduct, type TemplateRendererProps } from "./template-renderer"
import { ProductDetailSheet } from "./product-detail-sheet"
import { CartSheet } from "./cart-sheet"

type Props = Omit<TemplateRendererProps, "onOpenProduct" | "cartCount" | "onOpenCart">

export function StorefrontClient(props: Props) {
  return (
    <CartProvider storeSlug={props.store.slug}>
      <StorefrontInner {...props} />
    </CartProvider>
  )
}

function StorefrontInner(props: Props) {
  const { store } = props
  const { totalItems, setIsOpen } = useCart()
  const [selectedProduct, setSelectedProduct] = useState<TemplateProduct | null>(null)

  const paymentProvider = useMemo(
    () => new WhatsAppPaymentProvider(store.whatsappNumber ?? "", store.currency ?? "USD"),
    [store.whatsappNumber, store.currency],
  )

  function handleOpenProduct(p: TemplateProduct) {
    setSelectedProduct(p)
    trackLegacyEvent(store.slug, "PRODUCT_VIEW", p.id)
    trackStoreEvent(store.slug, "PRODUCT_VIEW", p.id)
  }

  return (
    <>
      <TemplateRenderer
        {...props}
        onOpenProduct={handleOpenProduct}
        cartCount={totalItems}
        onOpenCart={() => setIsOpen(true)}
      />
      <ProductDetailSheet product={selectedProduct} store={store} onClose={() => setSelectedProduct(null)} />
      <CartSheet store={store} paymentProvider={paymentProvider} />
    </>
  )
}
