"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { InstagramImportHttpRepository, type InstagramImportStatusResponse } from "@/lib/instagram-import-api"

const POLL_INTERVAL_MS = 2500

/**
 * Polling simple mientras el componente este montado (barato: un GET
 * autenticado). Sigue corriendo despues de DONE/FAILED por si el vendedor
 * pide un reintento — evita tener que reiniciar el loop a mano.
 */
export function useInstagramImportStatus() {
  const { http, store } = useAuth()
  const storeId = store?.id
  const repo = useMemo(() => new InstagramImportHttpRepository(http), [http])
  const [status, setStatus] = useState<InstagramImportStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const poll = useCallback(async (): Promise<InstagramImportStatusResponse | null> => {
    if (!storeId) return null
    try {
      const latest = await repo.getLatest(storeId)
      setStatus(latest)
      return latest
    } finally {
      setIsLoading(false)
    }
  }, [repo, storeId])

  useEffect(() => {
    if (!storeId) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    setIsLoading(true)

    async function tick() {
      if (cancelled) return
      await poll()
      if (cancelled) return
      timerRef.current = setTimeout(tick, POLL_INTERVAL_MS)
    }
    void tick()

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [storeId, poll])

  const isActive = status?.status === "RUNNING" || status?.status === "PROCESSING"

  return { status, isLoading, isActive, refresh: poll }
}
