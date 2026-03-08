'use client'

/**
 * Preview-scoped wrappers around the real cart / wishlist providers.
 * Using a dedicated slug `__design-preview__` isolates localStorage state
 * from any real store, so preview interactions don't pollute the user's cart.
 */

import type { ReactNode } from 'react'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import type { PaymentProvider, CheckoutPayload, CheckoutResult } from '@/lib/payment-providers/types'

const PREVIEW_SLUG = '__design-preview__'

export function MockCartProvider({ children }: { children: ReactNode }) {
  return <CartProvider storeSlug={PREVIEW_SLUG}>{children}</CartProvider>
}

export function MockWishlistProvider({ children }: { children: ReactNode }) {
  return <WishlistProvider storeSlug={PREVIEW_SLUG}>{children}</WishlistProvider>
}

export class MockPaymentProvider implements PaymentProvider {
  readonly id = 'mock'
  readonly label = 'Preview'

  async checkout(_payload: CheckoutPayload): Promise<CheckoutResult> {
    return { success: true, message: 'Preview mode' }
  }
}
