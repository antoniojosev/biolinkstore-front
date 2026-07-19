"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import {
  StoreSocialLinksHttpRepository,
  type SocialPlatform,
  type StoreSocialLinkResponse,
} from "@/lib/store-social-links-api"

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  IG: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  TWITTER: "X / Twitter",
  YOUTUBE: "YouTube",
  THREADS: "Threads",
  WHATSAPP: "WhatsApp",
}

const PLATFORMS = Object.keys(PLATFORM_LABEL) as SocialPlatform[]

export function SocialLinksCard({ compact = false }: { compact?: boolean } = {}) {
  const { http, store } = useAuth()
  const storeId = store?.id
  const repo = useMemo(() => new StoreSocialLinksHttpRepository(http), [http])

  const [links, setLinks] = useState<StoreSocialLinkResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>("IG")
  const [newUrl, setNewUrl] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    try {
      const data = await repo.list(storeId)
      setLinks(data.slice().sort((a, b) => a.sortOrder - b.sortOrder))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar tus redes")
    } finally {
      setLoading(false)
    }
  }, [repo, storeId])

  useEffect(() => {
    void load()
  }, [load])

  // Avisa a los previews (editor/tienda) que las redes cambiaron, para que
  // refresquen store.socials en vivo. Se salta el primer render (carga inicial).
  const firstLinksRef = useRef(true)
  useEffect(() => {
    if (firstLinksRef.current) {
      firstLinksRef.current = false
      return
    }
    window.dispatchEvent(new Event("bl:socials-changed"))
  }, [links])

  async function handleAdd() {
    if (!storeId || !newUrl.trim()) return
    setAdding(true)
    try {
      const created = await repo.create(storeId, { platform: newPlatform, url: newUrl.trim() })
      setLinks((prev) => [...prev, created])
      setNewUrl("")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo agregar la red. Revisá que la URL sea válida (con https://).")
    } finally {
      setAdding(false)
    }
  }

  async function handleUrlChange(link: StoreSocialLinkResponse, url: string) {
    setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, url } : l)))
  }

  async function handleUrlBlur(link: StoreSocialLinkResponse) {
    if (!storeId) return
    const current = links.find((l) => l.id === link.id)
    if (!current || current.url === link.url || !current.url.trim()) return
    setBusyId(link.id)
    try {
      const updated = await repo.update(storeId, link.id, { url: current.url.trim() })
      setLinks((prev) => prev.map((l) => (l.id === link.id ? updated : l)))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "URL inválida — revisá que empiece con https://")
      void load()
    } finally {
      setBusyId(null)
    }
  }

  async function handleToggleVisible(link: StoreSocialLinkResponse) {
    if (!storeId) return
    setBusyId(link.id)
    try {
      const updated = await repo.update(storeId, link.id, { visible: !link.visible })
      setLinks((prev) => prev.map((l) => (l.id === link.id ? updated : l)))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar")
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(link: StoreSocialLinkResponse) {
    if (!storeId) return
    if (!confirm(`¿Quitar ${PLATFORM_LABEL[link.platform]} de tu tienda?`)) return
    setBusyId(link.id)
    try {
      await repo.remove(storeId, link.id)
      setLinks((prev) => prev.filter((l) => l.id !== link.id))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo quitar")
    } finally {
      setBusyId(null)
    }
  }

  async function handleMove(link: StoreSocialLinkResponse, dir: -1 | 1) {
    if (!storeId) return
    const idx = links.findIndex((l) => l.id === link.id)
    const targetIdx = idx + dir
    if (idx === -1 || targetIdx < 0 || targetIdx >= links.length) return
    const next = links.slice()
    ;[next[idx], next[targetIdx]] = [next[targetIdx], next[idx]]
    setLinks(next)
    try {
      await repo.reorder(storeId, next.map((l, i) => ({ id: l.id, sortOrder: i })))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo reordenar")
      void load()
    }
  }

  if (!storeId) return null

  // compact: embebido en el inspector de Diseño (panel angosto) — sin chrome
  // de card ni header propio (el inspector ya pone el suyo), y las filas
  // apilan el input en su propia línea para no desbordar.
  return (
    <div style={compact ? S.cardBare : S.card}>
      {!compact && (
        <div style={S.header}>
          <div>
            <h3 style={S.title}>Redes sociales</h3>
            <p style={S.subtitle}>
              Se usan en la sección de redes de cualquier tema que elijas — no hace falta reconfigurarlas si cambiás de
              tema.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div style={S.muted}>Cargando…</div>
      ) : (
        <div style={S.list}>
          {links.map((link, i) => (
            <div key={link.id} style={{ ...S.row, ...(compact ? S.rowCompact : null), opacity: busyId === link.id ? 0.6 : 1 }}>
              <div style={S.reorderCol}>
                <button type="button" onClick={() => handleMove(link, -1)} disabled={i === 0} style={S.miniBtn}>
                  ↑
                </button>
                <button type="button" onClick={() => handleMove(link, 1)} disabled={i === links.length - 1} style={S.miniBtn}>
                  ↓
                </button>
              </div>
              <span style={S.platformBadge}>{PLATFORM_LABEL[link.platform]}</span>
              <input
                value={link.url}
                onChange={(e) => handleUrlChange(link, e.target.value)}
                onBlur={() => handleUrlBlur(link)}
                placeholder="https://…"
                style={compact ? { ...S.input, ...S.inputCompact } : S.input}
                disabled={busyId === link.id}
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => handleToggleVisible(link)}
                disabled={busyId === link.id}
                style={{ ...S.switch, background: link.visible ? "var(--brand)" : "var(--line-2)" }}
                aria-label="Mostrar/ocultar"
                title={link.visible ? "Visible en tu tienda" : "Oculta en tu tienda"}
              >
                <span style={{ ...S.knob, transform: link.visible ? "translateX(15px)" : "translateX(0)" }} />
              </button>
              <button type="button" onClick={() => handleDelete(link)} disabled={busyId === link.id} style={S.delBtn}>
                ✕
              </button>
            </div>
          ))}

          {links.length === 0 && <div style={S.empty}>Todavía no agregaste ninguna red social.</div>}

          <div style={compact ? { ...S.addRow, ...S.rowCompact } : S.addRow}>
            <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)} style={compact ? { ...S.select, ...S.inputCompact } : S.select}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </select>
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://instagram.com/tu.tienda"
              style={compact ? { ...S.input, ...S.inputCompact } : S.input}
              spellCheck={false}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newUrl.trim() || adding}
              style={{ ...S.btnPrimary, opacity: !newUrl.trim() || adding ? 0.5 : 1 }}
            >
              {adding ? "Agregando…" : "+ Agregar"}
            </button>
          </div>
        </div>
      )}
    </div>
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
    gap: 16,
  },
  // Embebido en el inspector angosto: sin borde/fondo/padding propios.
  cardBare: { display: "flex", flexDirection: "column", gap: 12 },
  // Fila que envuelve: el input cae a su propia línea a ancho completo.
  rowCompact: { flexWrap: "wrap" },
  inputCompact: { flexBasis: "100%", minWidth: 0, width: "100%" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  subtitle: { margin: "4px 0 0", color: "var(--ink-2)", fontSize: 13, lineHeight: 1.5 },
  muted: { color: "var(--ink-3)", fontSize: 13, padding: "8px 0" },
  empty: { color: "var(--ink-3)", fontSize: 13, padding: "8px 0" },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  row: { display: "flex", alignItems: "center", gap: 8 },
  reorderCol: { display: "flex", flexDirection: "column", gap: 2 },
  miniBtn: {
    width: 20, height: 16, border: "1px solid var(--line)", background: "var(--bg)", borderRadius: 4,
    fontSize: 9, color: "var(--ink-2)", cursor: "pointer", padding: 0, lineHeight: 1,
  },
  platformBadge: {
    fontSize: 12, fontWeight: 600, color: "var(--ink-2)", background: "var(--bg-2)",
    padding: "8px 10px", borderRadius: 8, flexShrink: 0, width: 92, textAlign: "center",
  },
  input: {
    flex: 1, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8,
    fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--ink)", background: "var(--bg)",
  },
  select: {
    padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5,
    fontFamily: "inherit", color: "var(--ink)", background: "var(--bg)", width: 130, flexShrink: 0,
  },
  switch: { width: 34, height: 19, borderRadius: 999, position: "relative", border: "none", cursor: "pointer", flexShrink: 0, padding: 0 },
  knob: { position: "absolute", top: 2, left: 2, width: 15, height: 15, borderRadius: "50%", background: "#fff", transition: "transform .15s ease" },
  delBtn: {
    width: 30, height: 30, border: "1px solid rgba(220,74,61,0.3)", background: "rgba(220,74,61,0.06)",
    borderRadius: 8, fontSize: 12, color: "var(--accent)", cursor: "pointer", flexShrink: 0,
  },
  addRow: { display: "flex", gap: 8, marginTop: 4 },
  btnPrimary: {
    padding: "8px 14px", border: "1px solid var(--brand)", background: "var(--brand)", borderRadius: 8,
    fontSize: 12.5, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap",
  },
}
