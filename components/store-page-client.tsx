'use client'

import { useMemo, useEffect } from 'react'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { StoreProvider } from '@/lib/store-context'
import { TemplateRenderer } from '@/components/templates/renderer'
import { WhatsAppPaymentProvider } from '@/lib/payment-providers/whatsapp'
import { trackEvent } from '@/lib/analytics'
import type { StorePageData } from '@/lib/api'

/**
 * Client boundary for the storefront.
 * Instantiates the PaymentProvider here (class instances can't cross the
 * server→client boundary as serialized props in Next.js App Router).
 *
 * To swap payment providers (Stripe, Binance, etc.) change the instantiation
 * below — StoreProvider and all templates receive the same interface.
 */
export function StorePageClient({ data }: { data: StorePageData }) {
  const paymentProvider = useMemo(
    () =>
      new WhatsAppPaymentProvider(
        data.store.whatsappNumbers[0],
        data.store.currency,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.store.whatsappNumbers[0], data.store.currency],
  )

  useEffect(() => {
    trackEvent(data.store.slug, 'PAGE_VIEW')
  }, [data.store.slug])

  const wishlistEnabled = data.store.plan === 'PRO' || data.store.plan === 'BUSINESS'

  return (
    <CartProvider storeSlug={data.store.slug}>
      <WishlistProvider storeSlug={wishlistEnabled ? data.store.slug : undefined}>
        <StoreProvider
          store={data.store}
          products={data.products}
          categories={data.categories}
          paymentProvider={paymentProvider}
        >
          <TemplateRenderer template={data.store.template} />
        </StoreProvider>
      </WishlistProvider>
    </CartProvider>
  )
}
