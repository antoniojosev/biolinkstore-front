'use client'

import { useMemo, useEffect } from 'react'
import Link from 'next/link'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { StoreProvider } from '@/lib/store-context'
import { TemplateRenderer } from '@/components/templates/renderer'
import { WhatsAppPaymentProvider } from '@/lib/payment-providers/whatsapp'
import { trackEvent } from '@/lib/analytics'
import type { StorePageData } from '@/lib/api'
import type { TemplateId } from '@/lib/types'

/**
 * Terminal background color for each template — matches the bottom of each
 * template's gradient/wrapper. Used by the outer storefront wrapper so the
 * body's off-white `--background` never bleeds through (e.g. behind the
 * PoweredByBadge or on mobile overscroll bounce).
 */
const TEMPLATE_BG: Record<TemplateId, string> = {
  vitrina: '#FAFAF7',
  luxora: '#FAFAF8',
  noir: '#0A0A0A',
  menu: '#FFF8F0',
  estate: '#F8F9FA',
  persona: '#FFFFFF',
  poster: '#2c0505',
  atelier: '#e2dccf',
  inmuebles: '#0a0a0a',
  rosier: '#fdfaf6',
}

/** Templates with a dark terminal color — badge keeps its dark-glass style. */
const DARK_TEMPLATES = new Set<TemplateId>(['noir', 'poster', 'inmuebles'])

function PoweredByBadge({ template }: { template: TemplateId }) {
  const isDark = DARK_TEMPLATES.has(template)
  const badgeClass = isDark
    ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-white/40 hover:text-white/70 border border-white/8 hover:border-white/20 bg-black/20 backdrop-blur-sm transition-all'
    : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-black/40 hover:text-black/70 border border-black/8 hover:border-black/20 bg-white/40 backdrop-blur-sm transition-all'
  const brandClass = isDark ? 'text-white/60 font-semibold' : 'text-black/70 font-semibold'
  return (
    <div className="flex justify-center py-4 bg-transparent">
      <Link
        href="https://bylink.app"
        target="_blank"
        rel="noopener noreferrer"
        className={badgeClass}
      >
        <svg viewBox="0 0 64 64" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="44" height="38" x="10" y="20" fill="url(#badge-a)" rx="8"/>
          <ellipse cx="18" cy="18" fill="#1a3a4a" rx="8" ry="5"/>
          <ellipse cx="32" cy="18" fill="#1f5c5a" rx="8" ry="5"/>
          <ellipse cx="46" cy="18" fill="#2a7d6e" rx="8" ry="5"/>
          <path stroke="#0d2b3e" strokeLinecap="round" strokeWidth="3" d="M24 16v-4a8 8 0 0 1 16 0v4"/>
          <g strokeWidth="2.5">
            <path stroke="#5bbf9a" d="M25 36a6 6 0 1 1 0 8 6 6 0 0 1 0-8z"/>
            <path stroke="#7de8b8" d="M33 36a6 6 0 1 1 0 8 6 6 0 0 1 0-8z"/>
          </g>
          <defs>
            <linearGradient id="badge-a" x1="10" x2="54" y1="20" y2="58" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0d2b3e"/>
              <stop offset="1" stopColor="#1a5c52"/>
            </linearGradient>
          </defs>
        </svg>
        Creado con <span className={brandClass}>ByLink</span>
      </Link>
    </div>
  )
}

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
  const terminalBg = TEMPLATE_BG[data.store.template] ?? '#FAFAF7'

  // Paint <html> with the template's terminal bg so iOS/Android overscroll
  // bounce never reveals the body's off-white `--background` token. Restored
  // on unmount so dashboard/landing routes keep their original styling.
  useEffect(() => {
    const html = document.documentElement
    const prevBg = html.style.backgroundColor
    html.style.backgroundColor = terminalBg
    return () => {
      html.style.backgroundColor = prevBg
    }
  }, [terminalBg])

  return (
    <CartProvider storeSlug={data.store.slug}>
      <WishlistProvider storeSlug={wishlistEnabled ? data.store.slug : undefined}>
        <StoreProvider
          store={data.store}
          products={data.products}
          categories={data.categories}
          paymentProvider={paymentProvider}
        >
          <div className="min-h-[100dvh]" style={{ backgroundColor: terminalBg }}>
            <TemplateRenderer template={data.store.template} />
            <PoweredByBadge template={data.store.template} />
          </div>
        </StoreProvider>
      </WishlistProvider>
    </CartProvider>
  )
}
