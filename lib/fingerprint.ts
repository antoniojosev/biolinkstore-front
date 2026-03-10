const FINGERPRINT_KEY = 'igstore_fp'

export function getOrCreateFingerprint(): string {
  if (typeof window === 'undefined') return ''

  let fp = localStorage.getItem(FINGERPRINT_KEY)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(FINGERPRINT_KEY, fp)
  }
  return fp
}
