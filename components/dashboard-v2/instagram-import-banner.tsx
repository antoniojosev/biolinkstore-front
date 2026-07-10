"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

function dismissKey(storeId: string) {
  return `bylink-ig-import-dismissed-${storeId}`
}

/**
 * Shown when the owner picked "importar de Instagram" during onboarding.
 * There's no real scraping backend yet, so this can never resolve itself —
 * it stays until the owner dismisses it (per store, via localStorage).
 */
export function InstagramImportBanner() {
  const { store } = useAuth()
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (!store?.id) return
    setDismissed(localStorage.getItem(dismissKey(store.id)) === "1")
  }, [store?.id])

  if (!store?.instagramImportRequestedAt || dismissed) return null

  function dismiss() {
    if (store?.id) localStorage.setItem(dismissKey(store.id), "1")
    setDismissed(true)
  }

  return (
    <div style={S.wrap}>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes igImportPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(30,58,138,0.35); } 50% { box-shadow: 0 0 0 5px rgba(30,58,138,0); } }" }} />
      <span style={S.dot} />
      <div style={S.body}>
        <div style={S.title}>Importando tu catálogo de @{store.instagramHandle}</div>
        <a href="/dashboard?view=catalog" style={S.link}>
          Mientras tanto, agregá productos a mano →
        </a>
      </div>
      <button type="button" onClick={dismiss} style={S.closeBtn} aria-label="Cerrar">
        ✕
      </button>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 14px",
    background: "var(--bg-2)",
    border: "1px solid var(--line)",
    borderRadius: 12,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--brand)",
    marginTop: 5,
    flexShrink: 0,
    animation: "igImportPulse 1.8s ease-in-out infinite",
  },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, fontWeight: 600, color: "var(--ink)" },
  link: { fontSize: 12, color: "var(--ink-3)", textDecoration: "none", display: "inline-block", marginTop: 2 },
  closeBtn: { background: "none", border: "none", color: "var(--ink-3)", cursor: "pointer", fontSize: 13, padding: 2, flexShrink: 0 },
}
