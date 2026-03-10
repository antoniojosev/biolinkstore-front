"use client"

import { useEffect } from "react"
import { getOrCreateFingerprint } from "@/lib/fingerprint"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export function LandingTracker() {
  useEffect(() => {
    const fingerprint = getOrCreateFingerprint()
    if (!fingerprint) return

    fetch(`${API_URL}/api/public/landing/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fingerprint,
        referrer: document.referrer || null,
        metadata: {
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    }).catch(() => {})
  }, [])

  return null
}
