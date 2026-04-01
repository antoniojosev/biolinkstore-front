import { getOrCreateFingerprint } from './fingerprint'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const VISITOR_KEY = 'ig_visitor_id'

/**
 * Returns a stable visitor ID backed by FingerprintJS.
 * On first call initializes async; returns cached value on subsequent calls.
 */
export async function getOrCreateVisitorId(): Promise<string> {
  if (typeof window === 'undefined') return ''

  // Use fingerprint as the stable visitor ID
  const fp = await getOrCreateFingerprint()
  if (!fp) return ''

  // Keep the cookie in sync for server-side reads
  const current = localStorage.getItem(VISITOR_KEY)
  if (current !== fp) {
    localStorage.setItem(VISITOR_KEY, fp)
    document.cookie = `${VISITOR_KEY}=${fp}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`
  }

  return fp
}

type EventType =
  | 'PAGE_VIEW'
  | 'PRODUCT_VIEW'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'CHECKOUT_START'
  | 'CHECKOUT_COMPLETE'
  | 'SEARCH'
  | 'CATEGORY_VIEW'

export function trackEvent(
  slug: string,
  type: EventType,
  productId?: string,
  metadata?: Record<string, unknown>,
): void {
  try {
    getOrCreateVisitorId().then((visitorId) => {
      if (!visitorId) return

      const body: Record<string, unknown> = { type, visitorId }
      if (productId) body.productId = productId
      if (metadata) body.metadata = metadata

      // Fire-and-forget — silently fails
      fetch(`${API_URL}/api/public/${slug}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {})
    })
  } catch {
    // Never block the UI
  }
}
