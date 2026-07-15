"use client"

import { useMemo } from "react"
import { CartProvider, useCart } from "@/lib/cart-context"
import { WhatsAppPaymentProvider } from "@/lib/payment-providers/whatsapp"
import { TemplateRenderer, type TemplateProduct, type TemplateRendererProps } from "./template-renderer"
import { CartSheet } from "./cart-sheet"

type Props = Omit<TemplateRendererProps, "onOpenProduct" | "productHref" | "cartCount" | "onOpenCart">

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

  const paymentProvider = useMemo(
    () => new WhatsAppPaymentProvider(store.whatsappNumber ?? "", store.currency ?? "USD"),
    [store.whatsappNumber, store.currency],
  )

  // Cada producto navega a su página propia (/{tienda}/{producto}) — la vista
  // de detalle vive ahí (con OG para WhatsApp), no en un sheet. El
  // PRODUCT_VIEW se trackea al montar la página de destino. Productos sin
  // slug (ej. draft preview) quedan como cards inertes.
  function productHref(p: TemplateProduct): string | null {
    return p.slug ? `/${store.slug}/${p.slug}` : null
  }

  return (
    <>
      <TemplateRenderer
        {...props}
        productHref={productHref}
        cartCount={totalItems}
        onOpenCart={() => setIsOpen(true)}
      />
      <CartSheet store={store} paymentProvider={paymentProvider} />
    </>
  )
}
