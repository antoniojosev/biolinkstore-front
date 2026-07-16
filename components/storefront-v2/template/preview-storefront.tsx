"use client"

import { useMemo, useState } from "react"
import { CartProvider, useCart } from "@/lib/cart-context"
import { WhatsAppPaymentProvider } from "@/lib/payment-providers/whatsapp"
import { ThemeRenderer, getThemeOverlays } from "@/components/storefront-v2/themes/registry"
import { resolveTokens } from "./tokens"
import type { TemplateProduct, TemplateRendererProps } from "./template-renderer"
import { CartSheet } from "./cart-sheet"
import { PreviewProductSheet } from "./preview-product-sheet"

// Tienda de muestra COMPLETA para los previews (modal de Temas y probador
// "Mi tienda"): mismos flujos que prod — click en producto abre el detalle,
// agregar al carrito, sheet de carrito y checkout por WhatsApp (al número
// demo). La diferencia con StorefrontClient es la vista de detalle: acá los
// productos no tienen página propia, así que se abre un sheet themeado.
type Props = Omit<TemplateRendererProps, "onOpenProduct" | "productHref" | "cartCount" | "onOpenCart">

export function PreviewStorefront(props: Props) {
  return (
    <CartProvider storeSlug={`preview-${props.store.slug}`}>
      <PreviewInner {...props} />
    </CartProvider>
  )
}

function PreviewInner(props: Props) {
  const { store, theme } = props
  const { totalItems, setIsOpen } = useCart()
  const [detail, setDetail] = useState<TemplateProduct | null>(null)

  const paymentProvider = useMemo(
    () => new WhatsAppPaymentProvider(store.whatsappNumber ?? "", store.currency ?? "USD"),
    [store.whatsappNumber, store.currency],
  )
  // Los sheets (detalle y carrito) son overlays fixed FUERA del root del
  // renderer — este wrapper les provee las variables --bl-* del tema.
  const resolved = useMemo(() => resolveTokens(theme.tokens), [theme.tokens])

  // Overlays PROPIOS del tema (cart-drawer / product-detail del diseño
  // original) cuando el registry los define; genéricos como fallback.
  const overlays = getThemeOverlays(theme.template)
  const ProductSheet = overlays.ProductSheet ?? PreviewProductSheet
  const ThemeCart = overlays.CartSheet ?? CartSheet

  return (
    <div style={resolved.cssVars as React.CSSProperties}>
      <ThemeRenderer
        {...props}
        onOpenProduct={setDetail}
        cartCount={totalItems}
        onOpenCart={() => setIsOpen(true)}
      />
      <ProductSheet product={detail} store={store} onClose={() => setDetail(null)} />
      <ThemeCart store={store} paymentProvider={paymentProvider} />
    </div>
  )
}
