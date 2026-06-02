/**
 * Storefront event tracking — fire-and-forget POST to /public/:slug/event.
 * No auth, no UI. Backend throttles 60/min and gates persistence by plan.
 *
 * SessionId is stable per browser session (sessionStorage). Used for unique-visit
 * dedup at the backend level (StoreEvent.sessionId). Cleared on tab close.
 */

const SESSION_KEY = 'bylink-session-id'
const SENT_DEDUP = new Set<string>() // in-memory throttle within tab session

export type StoreEventType =
  | 'PRODUCT_VIEW'
  | 'ADD_TO_CART'
  | 'WHATSAPP_CLICK'
  | 'SOCIAL_CLICK'
  | 'CATEGORY_CLICK'
  | 'SECTION_VIEW'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

interface TrackOptions {
  /** Dedupe key — same key within tab session sends only once. Default: type+targetId. */
  dedupeKey?: string
  /** Skip dedupe entirely (e.g. for ADD_TO_CART that can fire repeatedly). */
  noDedupe?: boolean
}

export function trackEvent(
  slug: string,
  type: StoreEventType,
  targetId?: string,
  options: TrackOptions = {},
): void {
  if (typeof window === 'undefined' || !slug) return

  const dedupeKey = options.dedupeKey ?? `${type}:${targetId ?? ''}`
  if (!options.noDedupe && SENT_DEDUP.has(dedupeKey)) return
  if (!options.noDedupe) SENT_DEDUP.add(dedupeKey)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const sessionId = getSessionId()

  // Fire-and-forget. Use sendBeacon when available for reliability on unload.
  const body = JSON.stringify({
    type,
    targetId: targetId ?? null,
    sessionId,
  })

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(`${apiUrl}/public/${slug}/event`, blob)
      return
    }
  } catch {
    /* fall through */
  }

  fetch(`${apiUrl}/public/${slug}/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}
