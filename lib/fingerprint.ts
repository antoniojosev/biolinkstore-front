import FingerprintJS from '@fingerprintjs/fingerprintjs'

const FINGERPRINT_KEY = 'igstore_fp'

let cachedFingerprint: string | null = null
let loadPromise: Promise<string> | null = null

async function computeFingerprint(): Promise<string> {
  // Return in-memory cache first
  if (cachedFingerprint) return cachedFingerprint

  // Return stored value if available (skips recomputation on reload)
  const stored = localStorage.getItem(FINGERPRINT_KEY)
  if (stored) {
    cachedFingerprint = stored
    return stored
  }

  // Compute with FingerprintJS (canvas, WebGL, fonts, etc.)
  const fp = await FingerprintJS.load()
  const result = await fp.get()
  const visitorId = result.visitorId

  localStorage.setItem(FINGERPRINT_KEY, visitorId)
  cachedFingerprint = visitorId
  return visitorId
}

/**
 * Returns a stable browser fingerprint based on hardware/software signals.
 * Survives cookie/localStorage clears only if the same browser+device is used.
 * Async — call once at app init or await lazily.
 */
export function getOrCreateFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return Promise.resolve('')

  // Deduplicate concurrent calls
  if (!loadPromise) {
    loadPromise = computeFingerprint().catch(() => {
      // Fallback to UUID if FingerprintJS fails
      loadPromise = null
      const fallback = crypto.randomUUID()
      localStorage.setItem(FINGERPRINT_KEY, fallback)
      cachedFingerprint = fallback
      return fallback
    })
  }
  return loadPromise
}
