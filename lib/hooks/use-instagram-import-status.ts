"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { InstagramImportHttpRepository, type InstagramImportStatusResponse } from "@/lib/instagram-import-api"

// Cadencia adaptativa: rápido solo mientras hay un import corriendo (es lo
// que alimenta el progreso en vivo); lento cuando no hay nada que mirar
// (sin import, DONE o FAILED) — antes martillaba un 404 cada 2.5s de por
// vida. El loop sigue vivo en idle para que un retry/import nuevo se
// detecte solo; además refresh() (que llaman banner y card al disparar el
// import) flipa isActive y el efecto rearma el loop rápido al instante.
const POLL_ACTIVE_MS = 2500
const POLL_IDLE_MS = 30000

export function useInstagramImportStatus() {
  const { http, store } = useAuth()
  const storeId = store?.id
  const repo = useMemo(() => new InstagramImportHttpRepository(http), [http])
  const [status, setStatus] = useState<InstagramImportStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasLoadedRef = useRef(false)

  const poll = useCallback(async (): Promise<InstagramImportStatusResponse | null> => {
    if (!storeId) return null
    try {
      const latest = await repo.getLatest(storeId)
      setStatus(latest)
      return latest
    } finally {
      hasLoadedRef.current = true
      setIsLoading(false)
    }
  }, [repo, storeId])

  const isActive = status?.status === "RUNNING" || status?.status === "PROCESSING"

  useEffect(() => {
    if (!storeId) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    if (!hasLoadedRef.current) setIsLoading(true)
    const interval = isActive ? POLL_ACTIVE_MS : POLL_IDLE_MS

    async function tick() {
      if (cancelled) return
      await poll()
      if (cancelled) return
      timerRef.current = setTimeout(tick, interval)
    }
    void tick()

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [storeId, poll, isActive])

  return { status, isLoading, isActive, refresh: poll }
}
