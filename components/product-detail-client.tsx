'use client'

import { useMemo, useEffect } from 'react'
import { CartProvider } from '@/lib/cart-context'
import { StoreProvider } from '@/lib/store-context'
import { ProductDetailRenderer } from '@/components/templates/product-detail-renderer'
import { WhatsAppPaymentProvider } from '@/lib/payment-providers/whatsapp'
import { trackEvent } from '@/lib/analytics'
import type { StorePageData } from '@/lib/api'
import type { ProductDetail } from '@/lib/types'

interface Props {
  storeData: StorePageData
  product: ProductDetail
}

export function ProductDetailClient({ storeData, product }: Props) {
  const paymentProvider = useMemo(
    () =>
      new WhatsAppPaymentProvider(
        storeData.store.whatsappNumbers[0],
        storeData.store.currency,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeData.store.whatsappNumbers[0], storeData.store.currency],
  )

  useEffect(() => {
    trackEvent(storeData.store.slug, 'PRODUCT_VIEW', product.id)
  }, [storeData.store.slug, product.id])

  return (
    <CartProvider storeSlug={storeData.store.slug}>
      <StoreProvider
        store={storeData.store}
        products={storeData.products}
        categories={storeData.categories}
        paymentProvider={paymentProvider}
      >
        <ProductDetailRenderer
          template={storeData.store.template}
          product={product}
        />
      </StoreProvider>
    </CartProvider>
  )
}
