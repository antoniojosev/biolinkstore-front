"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { useInstagramImportStatus } from "@/lib/hooks/use-instagram-import-status"

function dismissKey(storeId: string, importId: string) {
  return `bylink-ig-import-dismissed-${storeId}-${importId}`
}

/** Banner del dashboard mostrando el progreso real del import de Instagram (Apify + IA). */
export function InstagramImportBanner() {
  const { store, http, refreshStore } = useAuth()
  const { status, refresh } = useInstagramImportStatus()
  const [dismissed, setDismissed] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (!store?.id || !status) return
    setDismissed(localStorage.getItem(dismissKey(store.id, status.id)) === "1")
  }, [store?.id, status])

  if (!status || dismissed) return null

  function dismiss() {
    if (store?.id && status) localStorage.setItem(dismissKey(store.id, status.id), "1")
    setDismissed(true)
  }

  async function retry() {
    if (!store?.id || !store.instagramHandle || retrying) return
    setRetrying(true)
    try {
      const repo = new StoreHttpRepository(http)
      await repo.update(store.id, { requestInstagramImport: true })
      await refreshStore()
      await refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo reintentar el import")
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div style={S.wrap}>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes igImportPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(30,58,138,0.35); } 50% { box-shadow: 0 0 0 5px rgba(30,58,138,0); } }" }} />

      {(status.status === "RUNNING" || status.status === "PROCESSING") && (
        <>
          <span style={S.dot} />
          <div style={S.body}>
            <div style={S.title}>Importando tu catálogo de @{status.handle}</div>
            <div style={S.progress}>
              {status.status === "RUNNING"
                ? "Leyendo tus publicaciones…"
                : `Analizando publicaciones… ${status.postsProcessed}/${status.postsFound || "?"} · ${status.productsCreated} producto${status.productsCreated === 1 ? "" : "s"} creado${status.productsCreated === 1 ? "" : "s"}`}
            </div>
            <a href="/dashboard?view=catalog" style={S.link}>
              Mientras tanto, agregá productos a mano →
            </a>
          </div>
        </>
      )}

      {status.status === "DONE" && (
        <>
          <span style={{ ...S.dot, background: "#0E6940", animation: "none" }} />
          <div style={S.body}>
            <div style={S.title}>
              ✓ Importamos {status.productsCreated} producto{status.productsCreated === 1 ? "" : "s"} de @{status.handle}
            </div>
            <div style={S.progress}>Quedaron ocultos para que los revises antes de publicarlos.</div>
            <a href="/dashboard?view=catalog" style={S.link}>
              Revisar productos importados →
            </a>
          </div>
        </>
      )}

      {status.status === "FAILED" && (
        <>
          <span style={{ ...S.dot, background: "var(--accent)", animation: "none" }} />
          <div style={S.body}>
            <div style={S.title}>No pudimos importar tu catálogo de @{status.handle}</div>
            <div style={S.progress}>{status.error || "Algo falló durante el import."}</div>
            <button type="button" onClick={retry} disabled={retrying} style={S.retryBtn}>
              {retrying ? "Reintentando…" : "Reintentar"}
            </button>
          </div>
        </>
      )}

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
  progress: { fontSize: 12, color: "var(--ink-2)", marginTop: 2 },
  link: { fontSize: 12, color: "var(--ink-3)", textDecoration: "none", display: "inline-block", marginTop: 4 },
  retryBtn: {
    marginTop: 6,
    padding: "5px 12px",
    border: "1px solid var(--line)",
    background: "var(--bg)",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    color: "var(--ink)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  closeBtn: { background: "none", border: "none", color: "var(--ink-3)", cursor: "pointer", fontSize: 13, padding: 2, flexShrink: 0 },
}
