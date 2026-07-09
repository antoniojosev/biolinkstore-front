"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import {
  InstagramImportHttpRepository,
  InstagramImportNotImplemented,
  type ImportCandidate,
  type ImportJob,
} from "@/lib/instagram-import-api"

type View = "idle" | "scraping" | "review" | "committing" | "done" | "unavailable" | "error"

const POLL_INTERVAL_MS = 2000

const STATUS_LABEL: Record<ImportJob["status"], string> = {
  QUEUED: "En cola",
  SCRAPING: "Descargando publicaciones de Instagram…",
  PROCESSING: "Procesando con IA…",
  READY: "Listo",
  FAILED: "Falló",
}

interface OverrideMap {
  [candidateId: string]: { name: string; description: string; priceUsd: string }
}

export function InstagramImportCard() {
  const { http, store } = useAuth()
  const storeId = store?.id
  const repo = useMemo(() => new InstagramImportHttpRepository(http), [http])

  const [view, setView] = useState<View>("idle")
  const [profileInput, setProfileInput] = useState("")
  const [job, setJob] = useState<ImportJob | null>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [overrides, setOverrides] = useState<OverrideMap>({})
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  useEffect(() => clearPollTimer, [clearPollTimer])

  function reset() {
    clearPollTimer()
    setView("idle")
    setJob(null)
    setPicked(new Set())
    setOverrides({})
    setErrorMsg(null)
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!storeId) return
    const profileUrl = profileInput.trim()
    if (!profileUrl) return
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const created = await repo.start(storeId, profileUrl)
      setJob(created)
      setView("scraping")
      schedulePoll(created.jobId)
    } catch (err) {
      if (err instanceof InstagramImportNotImplemented) {
        setView("unavailable")
      } else {
        const msg = err instanceof ApiError ? err.message : "No se pudo iniciar el escaneo"
        setErrorMsg(msg)
        setView("error")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const schedulePoll = useCallback(
    (jobId: string) => {
      if (!storeId) return
      clearPollTimer()
      pollTimerRef.current = setTimeout(async () => {
        try {
          const fresh = await repo.poll(storeId, jobId)
          setJob(fresh)
          if (fresh.status === "READY") {
            const ids = new Set<string>(fresh.candidates?.map((c) => c.id) ?? [])
            setPicked(ids)
            setOverrides(seedOverrides(fresh.candidates ?? []))
            setView("review")
          } else if (fresh.status === "FAILED") {
            setErrorMsg(fresh.error ?? "El escaneo falló")
            setView("error")
          } else {
            schedulePoll(jobId)
          }
        } catch (err) {
          if (err instanceof InstagramImportNotImplemented) {
            setView("unavailable")
          } else {
            const msg = err instanceof ApiError ? err.message : "Se perdió la conexión con el job"
            setErrorMsg(msg)
            setView("error")
          }
        }
      }, POLL_INTERVAL_MS)
    },
    [clearPollTimer, repo, storeId],
  )

  function togglePick(id: string) {
    setPicked((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function patchOverride(id: string, key: keyof OverrideMap[string], value: string) {
    setOverrides((o) => ({ ...o, [id]: { ...o[id], [key]: value } }))
  }

  async function handleCommit() {
    if (!storeId || !job || picked.size === 0) return
    setSubmitting(true)
    setView("committing")
    try {
      const payloadOverrides: Record<string, { name?: string; description?: string; priceUsd?: number }> = {}
      for (const id of picked) {
        const o = overrides[id]
        if (!o) continue
        const price = parseFloat(o.priceUsd)
        payloadOverrides[id] = {
          name: o.name,
          description: o.description,
          priceUsd: Number.isFinite(price) ? price : undefined,
        }
      }
      const result = await repo.commit(storeId, job.jobId, Array.from(picked), payloadOverrides)
      toast.success(`Se importaron ${result.createdProductIds.length} productos`)
      setView("done")
    } catch (err) {
      if (err instanceof InstagramImportNotImplemented) {
        setView("unavailable")
      } else {
        const msg = err instanceof ApiError ? err.message : "No se pudo importar"
        toast.error(msg)
        setErrorMsg(msg)
        setView("review")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!storeId) return null

  return (
    <div style={S.card}>
      <style>{`@keyframes bl-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={S.header}>
        <div>
          <h3 style={S.title}>
            Importar desde <em style={S.titleEm}>Instagram</em>
          </h3>
          <p style={S.subtitle}>
            Pega el link de tu perfil de Instagram. Nuestro sistema descarga tus posts, propone
            productos candidatos con título, descripción e imagen, y tú decides cuáles importar.
          </p>
        </div>
        <span style={S.aiBadge}>IA</span>
      </div>

      {view === "idle" && (
        <form onSubmit={handleStart} style={S.startForm}>
          <input
            type="url"
            value={profileInput}
            onChange={(e) => setProfileInput(e.target.value)}
            placeholder="https://www.instagram.com/tu-tienda"
            style={S.input}
            disabled={submitting}
            required
            spellCheck={false}
          />
          <button type="submit" disabled={submitting || !profileInput.trim()} style={S.btnPrimary}>
            {submitting ? "Iniciando…" : "Escanear perfil"}
          </button>
        </form>
      )}

      {view === "scraping" && job && (
        <ScrapingView job={job} onCancel={reset} />
      )}

      {view === "review" && job && (job.candidates ?? []).length > 0 && (
        <ReviewView
          candidates={job.candidates ?? []}
          picked={picked}
          overrides={overrides}
          onTogglePick={togglePick}
          onPatchOverride={patchOverride}
          onCommit={handleCommit}
          onCancel={reset}
          submitting={submitting}
        />
      )}

      {view === "review" && (job?.candidates ?? []).length === 0 && (
        <EmptyReview onReset={reset} />
      )}

      {view === "committing" && (
        <div style={S.statusBox}>
          <Spinner />
          <span>Importando productos…</span>
        </div>
      )}

      {view === "done" && (
        <div style={S.successBox}>
          <strong>¡Listo!</strong> Tus productos están en el catálogo. Podés editarlos desde la
          pestaña <strong>Productos</strong>.
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={reset} style={S.btnGhost}>
              Importar otro perfil
            </button>
          </div>
        </div>
      )}

      {view === "unavailable" && (
        <div style={S.warnBox}>
          <strong>En construcción.</strong> El escaneo automático de Instagram todavía no está
          disponible en este entorno. Mientras tanto, puedes crear los productos manualmente desde
          la pestaña <strong>Productos</strong>.
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={reset} style={S.btnGhost}>
              Volver
            </button>
          </div>
        </div>
      )}

      {view === "error" && (
        <div style={S.errorBox}>
          <strong>Hubo un problema.</strong> {errorMsg}
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={reset} style={S.btnGhost}>
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ScrapingView({ job, onCancel }: { job: ImportJob; onCancel: () => void }) {
  const pct = Math.min(100, Math.max(0, job.progress))
  return (
    <div style={S.scrapingBox}>
      <div style={S.scrapingHead}>
        <Spinner />
        <div>
          <div style={S.scrapingStatus}>{STATUS_LABEL[job.status]}</div>
          <div style={S.scrapingHint}>
            Esto puede tardar 1-2 minutos según la cantidad de publicaciones.
          </div>
        </div>
      </div>
      <div style={S.progressTrack}>
        <div style={{ ...S.progressFill, width: `${pct}%` }} />
      </div>
      <div style={S.scrapingFoot}>
        <span style={S.muted}>{pct}%</span>
        <button type="button" onClick={onCancel} style={S.btnGhost}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

function ReviewView({
  candidates,
  picked,
  overrides,
  onTogglePick,
  onPatchOverride,
  onCommit,
  onCancel,
  submitting,
}: {
  candidates: ImportCandidate[]
  picked: Set<string>
  overrides: OverrideMap
  onTogglePick: (id: string) => void
  onPatchOverride: (id: string, k: keyof OverrideMap[string], v: string) => void
  onCommit: () => void
  onCancel: () => void
  submitting: boolean
}) {
  return (
    <div style={S.reviewWrap}>
      <div style={S.reviewHead}>
        <div>
          <strong>{candidates.length} candidatos detectados.</strong> Seleccioná cuáles importar y
          ajustá lo que necesites.
        </div>
        <div style={S.reviewCount}>
          {picked.size} seleccionados
        </div>
      </div>

      <ul style={S.candidateList}>
        {candidates.map((c) => {
          const o = overrides[c.id]
          const isPicked = picked.has(c.id)
          return (
            <li key={c.id} style={{ ...S.candidate, ...(isPicked ? S.candidatePicked : null) }}>
              <label style={S.candidatePick}>
                <input
                  type="checkbox"
                  checked={isPicked}
                  onChange={() => onTogglePick(c.id)}
                  style={S.checkbox}
                />
              </label>
              <div style={S.candidateImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imageUrl} alt={c.name} style={S.candidateImageImg} />
              </div>
              <div style={S.candidateFields}>
                <input
                  type="text"
                  value={o?.name ?? c.name}
                  onChange={(e) => onPatchOverride(c.id, "name", e.target.value)}
                  placeholder="Nombre del producto"
                  style={S.input}
                  disabled={!isPicked}
                />
                <textarea
                  value={o?.description ?? c.description}
                  onChange={(e) => onPatchOverride(c.id, "description", e.target.value)}
                  placeholder="Descripción"
                  rows={2}
                  style={{ ...S.input, fontFamily: "inherit", resize: "vertical" }}
                  disabled={!isPicked}
                />
                <div style={S.candidatePriceRow}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={o?.priceUsd ?? (c.suggestedPriceUsd != null ? String(c.suggestedPriceUsd) : "")}
                    onChange={(e) => onPatchOverride(c.id, "priceUsd", e.target.value)}
                    placeholder="Precio USD"
                    style={{ ...S.input, width: 120 }}
                    disabled={!isPicked}
                  />
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={S.sourceLink}
                  >
                    Ver post original ↗
                  </a>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div style={S.reviewActions}>
        <button type="button" onClick={onCancel} disabled={submitting} style={S.btnGhost}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={onCommit}
          disabled={submitting || picked.size === 0}
          style={{ ...S.btnPrimary, opacity: picked.size === 0 ? 0.5 : 1 }}
        >
          {submitting ? "Importando…" : `Importar ${picked.size}`}
        </button>
      </div>
    </div>
  )
}

function EmptyReview({ onReset }: { onReset: () => void }) {
  return (
    <div style={S.warnBox}>
      <strong>No se detectaron productos.</strong> Puede que la cuenta sea privada o no tenga
      publicaciones recientes.
      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={onReset} style={S.btnGhost}>
          Intentar con otro perfil
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <span style={S.spinner} aria-label="Cargando">
      <span style={S.spinnerInner} />
    </span>
  )
}

function seedOverrides(candidates: ImportCandidate[]): OverrideMap {
  const out: OverrideMap = {}
  for (const c of candidates) {
    out[c.id] = {
      name: c.name,
      description: c.description,
      priceUsd: c.suggestedPriceUsd != null ? String(c.suggestedPriceUsd) : "",
    }
  }
  return out
}

const S: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    borderRadius: 14,
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 16,
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
  input: {
    padding: "10px 14px",
    border: "1px solid var(--line)",
    borderRadius: 8,
    background: "var(--bg)",
    color: "var(--ink)",
    fontSize: 13,
    fontFamily: "inherit",
    flex: 1,
    width: "100%",
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
  btnGhost: {
    padding: "9px 14px",
    border: "1px solid var(--line)",
    background: "transparent",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  scrapingBox: {
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: 18,
    background: "var(--bg-2)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  scrapingHead: { display: "flex", gap: 14, alignItems: "center" },
  scrapingStatus: { fontWeight: 600, fontSize: 14 },
  scrapingHint: { fontSize: 12, color: "var(--ink-3)", marginTop: 2 },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    background: "var(--line)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--brand), var(--accent, #DC4A3D))",
    transition: "width 0.3s ease",
  },
  scrapingFoot: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  muted: { color: "var(--ink-3)", fontSize: 12 },
  spinner: {
    width: 22,
    height: 22,
    display: "inline-block",
    position: "relative",
  },
  spinnerInner: {
    position: "absolute",
    inset: 0,
    border: "2.5px solid var(--line)",
    borderTopColor: "var(--brand)",
    borderRadius: "50%",
    animation: "bl-spin 0.8s linear infinite",
  },
  reviewWrap: { display: "flex", flexDirection: "column", gap: 14 },
  reviewHead: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 },
  reviewCount: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)" },
  candidateList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 },
  candidate: {
    display: "flex",
    gap: 14,
    padding: 14,
    background: "var(--bg)",
    border: "1px solid var(--line)",
    borderRadius: 10,
  },
  candidatePicked: { borderColor: "var(--brand)", boxShadow: "0 0 0 1px var(--brand)" },
  candidatePick: { display: "flex", alignItems: "flex-start" },
  checkbox: { width: 18, height: 18, cursor: "pointer", accentColor: "var(--brand)" },
  candidateImage: {
    width: 96,
    height: 96,
    flexShrink: 0,
    borderRadius: 8,
    overflow: "hidden",
    background: "var(--bg-2)",
  },
  candidateImageImg: { width: "100%", height: "100%", objectFit: "cover" },
  candidateFields: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  candidatePriceRow: { display: "flex", alignItems: "center", gap: 12 },
  sourceLink: { fontSize: 11, color: "var(--ink-3)", textDecoration: "none" },
  reviewActions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  statusBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    background: "var(--bg-2)",
    borderRadius: 10,
    fontSize: 14,
    color: "var(--ink-2)",
  },
  successBox: {
    padding: 14,
    background: "rgba(14,105,64,0.08)",
    border: "1px solid rgba(14,105,64,0.2)",
    borderRadius: 10,
    fontSize: 13,
    color: "var(--ink)",
    lineHeight: 1.55,
  },
  warnBox: {
    padding: 14,
    background: "rgba(236,162,0,0.08)",
    border: "1px solid rgba(236,162,0,0.25)",
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
