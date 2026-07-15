"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { useInstagramImportStatus } from "@/lib/hooks/use-instagram-import-status"

const PLAN_POST_LIMIT: Record<"FREE" | "PRO" | "BUSINESS", number> = {
  FREE: 30,
  PRO: 100,
  BUSINESS: 200,
}

/**
 * Dispara el import real (Apify + Claude Haiku clasifica/extrae) y muestra
 * el progreso en vivo. Sin paso de "revisar candidatos": los productos se
 * crean ocultos directo, se revisan en la lista normal de productos.
 */
export function InstagramImportCard() {
  const { store, http, refreshStore } = useAuth()
  const storeId = store?.id
  const { status, isActive, refresh } = useInstagramImportStatus()
  const [handle, setHandle] = useState(store?.instagramHandle ?? "")
  const [starting, setStarting] = useState(false)

  if (!storeId) return null

  const plan = store?.subscription?.plan ?? "FREE"
  const postLimit = PLAN_POST_LIMIT[plan]

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    const cleanHandle = handle.trim().replace(/^@/, "")
    if (!storeId || !cleanHandle || starting || isActive) return
    setStarting(true)
    try {
      const repo = new StoreHttpRepository(http)
      await repo.update(storeId, { instagramHandle: cleanHandle, requestInstagramImport: true })
      await refreshStore()
      await refresh()
      toast.success("Import iniciado — vas a ver el progreso acá y en el dashboard")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo iniciar el import")
    } finally {
      setStarting(false)
    }
  }

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div>
          <h3 style={S.title}>
            Importar desde <em style={S.titleEm}>Instagram</em>
          </h3>
          <p style={S.subtitle}>
            Traemos tus últimos {postLimit} posts, la IA detecta cuáles son productos y crea el catálogo por
            vos — quedan ocultos para que los revises antes de publicar.
          </p>
        </div>
        <span style={S.aiBadge}>IA</span>
      </div>

      {!status || status.status === "DONE" || status.status === "FAILED" ? (
        <form onSubmit={handleStart} style={S.startForm}>
          <div style={S.inputGroup}>
            <span style={S.prefix}>@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="tu.tienda"
              style={S.input}
              disabled={starting}
              spellCheck={false}
              required
            />
          </div>
          <button type="submit" disabled={starting || !handle.trim()} style={S.btnPrimary}>
            {starting ? "Iniciando…" : "Importar catálogo"}
          </button>
        </form>
      ) : (
        <div style={S.statusBox}>
          <Spinner />
          <div>
            <div style={S.statusTitle}>
              {status.status === "RUNNING"
                ? "Leyendo tus publicaciones…"
                : `Analizando ${status.postsProcessed}/${status.postsFound || "?"} posts`}
            </div>
            <div style={S.statusHint}>{status.productsCreated} productos creados hasta ahora</div>
          </div>
        </div>
      )}

      {plan === "FREE" && (
        <p style={S.gateNote}>Plan FREE: traemos tus últimos 30 posts. Pasate a PRO para importar hasta 100.</p>
      )}

      {status?.status === "DONE" && (
        <div style={S.successBox}>
          <strong>¡Listo!</strong> Importamos {status.productsCreated} productos de @{status.handle}. Están en
          tu catálogo, ocultos hasta que los revises.
        </div>
      )}

      {status?.status === "FAILED" && (
        <div style={S.errorBox}>
          <strong>Hubo un problema.</strong> {status.error || "El import falló."}
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <span style={S.spinner} aria-label="Cargando">
      <style dangerouslySetInnerHTML={{ __html: "@keyframes bl-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }" }} />
      <span style={S.spinnerInner} />
    </span>
  )
}

const S: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    borderRadius: 14,
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  titleEm: { fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--brand)", fontWeight: 400 },
  subtitle: { margin: "4px 0 0", color: "var(--ink-2)", fontSize: 13, lineHeight: 1.5 },
  aiBadge: {
    fontSize: 10,
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: 999,
    background: "linear-gradient(135deg, var(--brand), var(--accent, #DC4A3D))",
    color: "#fff",
    letterSpacing: 0.06,
    textTransform: "uppercase",
    flexShrink: 0,
  },
  startForm: { display: "flex", gap: 8 },
  inputGroup: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--line)",
    borderRadius: 8,
    background: "var(--bg)",
    paddingLeft: 12,
  },
  prefix: { color: "var(--ink-3)", fontSize: 13 },
  input: {
    flex: 1,
    padding: "10px 10px 10px 4px",
    border: "none",
    background: "none",
    color: "var(--ink)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
  },
  btnPrimary: {
    padding: "10px 18px",
    border: "1px solid var(--brand)",
    background: "var(--brand)",
    borderRadius: 8,
    fontSize: 13,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  statusBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    background: "var(--bg-2)",
    borderRadius: 10,
  },
  statusTitle: { fontWeight: 600, fontSize: 13, color: "var(--ink)" },
  statusHint: { fontSize: 12, color: "var(--ink-3)", marginTop: 2 },
  spinner: { width: 22, height: 22, display: "inline-block", position: "relative", flexShrink: 0 },
  spinnerInner: {
    position: "absolute",
    inset: 0,
    borderWidth: 2.5,
    borderStyle: "solid",
    borderColor: "var(--line)",
    borderTopColor: "var(--brand)",
    borderRadius: "50%",
    animation: "bl-spin 0.8s linear infinite",
  },
  gateNote: { margin: 0, fontSize: 11.5, color: "var(--ink-3)" },
  successBox: {
    padding: 14,
    background: "rgba(14,105,64,0.08)",
    border: "1px solid rgba(14,105,64,0.2)",
    borderRadius: 10,
    fontSize: 13,
    color: "var(--ink)",
    lineHeight: 1.55,
  },
  errorBox: {
    padding: 14,
    background: "rgba(197,48,48,0.08)",
    border: "1px solid rgba(197,48,48,0.25)",
    borderRadius: 10,
    fontSize: 13,
    color: "var(--ink)",
    lineHeight: 1.55,
  },
}
