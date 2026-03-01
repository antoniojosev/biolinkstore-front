'use client'

import { useMemo } from 'react'
import { CartProvider } from '@/lib/cart-context'
import { StoreProvider } from '@/lib/store-context'
import { TemplateRenderer } from '@/components/templates/renderer'
import { WhatsAppPaymentProvider } from '@/lib/payment-providers/whatsapp'
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

  return (
    <CartProvider>
      <StoreProvider
        store={data.store}
        products={data.products}
        categories={data.categories}
        paymentProvider={paymentProvider}
      >
        <TemplateRenderer template={data.store.template} />
      </StoreProvider>
    </CartProvider>
  )
}
