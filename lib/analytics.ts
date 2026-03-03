const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const VISITOR_KEY = 'ig_visitor_id'

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let visitorId = localStorage.getItem(VISITOR_KEY)
  if (visitorId) return visitorId

  visitorId = crypto.randomUUID()
  localStorage.setItem(VISITOR_KEY, visitorId)

  // Also set as cookie for server-side access
  document.cookie = `${VISITOR_KEY}=${visitorId}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`

  return visitorId
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
  metadata?: Record<string, any>,
): void {
  try {
    const visitorId = getOrCreateVisitorId()
    if (!visitorId) return

    const body: Record<string, any> = { type, visitorId }
    if (productId) body.productId = productId
    if (metadata) body.metadata = metadata

    // Fire-and-forget — silently fails
    fetch(`${API_URL}/api/public/${slug}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Never block the UI
  }
}
