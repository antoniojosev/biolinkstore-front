'use client'

import { useState } from 'react'

export function useShare() {
  const [copied, setCopied] = useState(false)

  const share = (url: string, title?: string) => {
    if (typeof navigator === 'undefined') return
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return { share, copied }
}
