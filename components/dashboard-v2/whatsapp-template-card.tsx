"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import {
  WhatsappTemplateHttpRepository,
  type WhatsappPreviewResponse,
  type WhatsappTemplateResponse,
} from "@/lib/whatsapp-template-api"

const PREVIEW_DEBOUNCE_MS = 350

type Plan = "FREE" | "PRO" | "BUSINESS"

const PRIMARY_VARS: Array<{ token: string; label: string }> = [
  { token: "{{store.name}}", label: "Nombre tienda" },
  { token: "{{customer.name}}", label: "Cliente" },
  { token: "{{order.total}}", label: "Total" },
  { token: "{{order.currency}}", label: "Moneda" },
  { token: "{{payment.label}}", label: "Método pago" },
]

const ITEMS_BLOCK = `{#items}
- {{quantity}}x {{productName}} — {{unitPrice}}
{/items}`

export function WhatsappTemplateCard() {
  const { http, store } = useAuth()
  const storeId = store?.id
  const storePlan = (store?.subscription?.plan ?? "FREE") as Plan
  const repo = useMemo(() => new WhatsappTemplateHttpRepository(http), [http])

  const [data, setData] = useState<WhatsappTemplateResponse | null>(null)
  const [template, setTemplate] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState<WhatsappPreviewResponse | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isGated = storePlan === "FREE"
  const canEdit = (data?.canEdit ?? false) && !isGated

  const load = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    try {
      const d = await repo.get(storeId)
      setData(d)
      setTemplate(d.template)
      setDirty(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo cargar el template")
    } finally {
      setLoading(false)
    }
  }, [repo, storeId])

  useEffect(() => {
    void load()
  }, [load])

  const runPreview = useCallback(
    async (value: string) => {
      if (!storeId || !value.trim()) return
      setPreviewing(true)
      try {
        const result = await repo.preview(storeId, value)
        setPreview(result)
      } catch (err) {
        setPreview({
          rendered: "",
          errors: [err instanceof ApiError ? err.message : "Error al renderizar"],
        })
      } finally {
        setPreviewing(false)
      }
    },
    [repo, storeId],
  )

  // Debounced preview whenever the template changes
  useEffect(() => {
    if (!template.trim()) {
      setPreview(null)
      return
    }
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
    previewTimerRef.current = setTimeout(() => {
      void runPreview(template)
    }, PREVIEW_DEBOUNCE_MS)
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
    }
  }, [template, runPreview])

  function insertToken(token: string) {
    if (!canEdit) return
    const ta = textareaRef.current
    if (!ta) {
      setTemplate((t) => t + token)
      setDirty(true)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const next = template.slice(0, start) + token + template.slice(end)
    setTemplate(next)
    setDirty(true)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + token.length, start + token.length)
    })
  }

  async function handleSave() {
    if (!storeId || saving) return
    setSaving(true)
    try {
      const updated = await repo.update(storeId, template)
      setData(updated)
      setTemplate(updated.template)
      setDirty(false)
      toast.success("Template guardado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!storeId || saving) return
    if (!confirm("¿Restaurar el template por defecto?")) return
    setSaving(true)
    try {
      const updated = await repo.update(storeId, null)
      setData(updated)
      setTemplate(updated.template)
      setDirty(false)
      toast.success("Restaurado al default")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar")
    } finally {
      setSaving(false)
    }
  }

  if (!storeId) return null

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div>
          <h3 style={S.title}>Mensaje de WhatsApp</h3>
          <p style={S.subtitle}>
            Plantilla del mensaje que el cliente envía al hacer checkout. Usá las variables{" "}
            <code style={S.code}>{`{{...}}`}</code> y el bloque <code style={S.code}>{`{#items}…{/items}`}</code>{" "}
            para listar los productos.
          </p>
        </div>
        <div style={S.headerRight}>
          {data?.isDefault && <span style={S.defaultBadge}>Default</span>}
          {isGated && <span style={S.lockBadge}>Plan PRO o superior</span>}
        </div>
      </div>

      {loading ? (
        <div style={S.muted}>Cargando template…</div>
      ) : (
        <>
          <div style={S.editorRow}>
            <div style={S.editorCol}>
              <label style={S.label}>Plantilla</label>
              <textarea
                ref={textareaRef}
                value={template}
                onChange={(e) => {
                  setTemplate(e.target.value)
                  setDirty(true)
                }}
                disabled={!canEdit}
                rows={14}
                style={{
                  ...S.textarea,
                  background: canEdit ? "var(--bg)" : "var(--bg-2)",
                  cursor: canEdit ? "text" : "not-allowed",
                }}
                spellCheck={false}
              />

              <div style={S.varsRow}>
                {PRIMARY_VARS.map((v) => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => insertToken(v.token)}
                    disabled={!canEdit}
                    style={S.varChip}
                    title={`Insertar ${v.token}`}
                  >
                    {v.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => insertToken(ITEMS_BLOCK)}
                  disabled={!canEdit}
                  style={{ ...S.varChip, background: "var(--brand-soft, rgba(30,58,138,0.08))", color: "var(--brand)" }}
                  title="Insertar bloque de items"
                >
                  + Bloque de items
                </button>
              </div>

              <details style={S.varsDetails}>
                <summary style={S.varsDetailsSummary}>Todas las variables ({(data?.supportedVariables.root.length ?? 0) + (data?.supportedVariables.item.length ?? 0)})</summary>
                <div style={S.varsGrid}>
                  <div>
                    <div style={S.varsGroupTitle}>Globales</div>
                    <div style={S.varsList}>
                      {data?.supportedVariables.root.map((v) => (
                        <code
                          key={v}
                          onClick={() => insertToken(`{{${v}}}`)}
                          style={S.varsItem}
                          title="Click para insertar"
                        >
                          {`{{${v}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={S.varsGroupTitle}>Dentro de {`{#items}`}</div>
                    <div style={S.varsList}>
                      {data?.supportedVariables.item.map((v) => (
                        <code key={v} style={S.varsItem}>
                          {`{{${v}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div style={S.previewCol}>
              <label style={S.label}>Vista previa</label>
              <div style={S.previewBubbleWrap}>
                <div style={S.previewBubble}>
                  {previewing && !preview ? (
                    <span style={S.muted}>Renderizando…</span>
                  ) : preview?.errors.length ? (
                    <div style={S.errorBox}>
                      {preview.errors.map((e, i) => (
                        <div key={i}>⚠️ {e}</div>
                      ))}
                    </div>
                  ) : preview?.rendered ? (
                    <div style={S.bubbleText}>{preview.rendered}</div>
                  ) : (
                    <span style={S.muted}>Escribí algo para ver la vista previa.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {canEdit && (
            <div style={S.actions}>
              {!data?.isDefault && (
                <button type="button" onClick={handleReset} disabled={saving} style={S.btnGhost}>
                  Restaurar default
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty}
                style={{ ...S.btnPrimary, opacity: !dirty ? 0.5 : 1 }}
              >
                {saving ? "Guardando…" : dirty ? "Guardar cambios" : "Guardado"}
              </button>
            </div>
          )}

          {isGated && (
            <div style={S.gatedBox}>
              Personalizar este mensaje requiere el plan <strong>PRO</strong> o <strong>BUSINESS</strong>. El template
              por defecto sigue activo para todas las tiendas.
            </div>
          )}
        </>
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  subtitle: { margin: "4px 0 0", color: "var(--ink-2)", fontSize: 13, lineHeight: 1.5 },
  headerRight: { display: "flex", gap: 6, flexShrink: 0 },
  code: {
    fontFamily: "var(--font-mono)",
    fontSize: 11.5,
    padding: "1px 5px",
    borderRadius: 4,
    background: "var(--bg-2)",
  },
  defaultBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 999,
    background: "var(--bg-2)",
    color: "var(--ink-2)",
    letterSpacing: 0.04,
    textTransform: "uppercase",
  },
  lockBadge: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(15,23,42,0.08)",
    color: "var(--ink-2)",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  muted: { color: "var(--ink-3)", fontSize: 13 },
  editorRow: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18 },
  editorCol: { display: "flex", flexDirection: "column", gap: 10, minWidth: 0 },
  previewCol: { display: "flex", flexDirection: "column", gap: 10, minWidth: 0 },
  label: { fontSize: 11, color: "var(--ink-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.06 },
  textarea: {
    width: "100%",
    padding: 14,
    border: "1px solid var(--line)",
    borderRadius: 10,
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--ink)",
    resize: "vertical",
    minHeight: 260,
  },
  varsRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  varChip: {
    padding: "5px 10px",
    border: "1px solid var(--line)",
    background: "var(--bg)",
    borderRadius: 999,
    fontSize: 11,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  varsDetails: { fontSize: 12 },
  varsDetailsSummary: { cursor: "pointer", color: "var(--ink-2)" },
  varsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 10 },
  varsGroupTitle: { fontSize: 10, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 6 },
  varsList: { display: "flex", flexWrap: "wrap", gap: 4 },
  varsItem: {
    fontFamily: "var(--font-mono)",
    fontSize: 10.5,
    padding: "3px 7px",
    background: "var(--bg-2)",
    border: "1px solid var(--line)",
    borderRadius: 5,
    cursor: "pointer",
    color: "var(--ink-2)",
  },
  previewBubbleWrap: {
    background: "#0E6940",
    backgroundImage:
      "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)",
    borderRadius: 12,
    padding: 22,
    minHeight: 280,
    display: "flex",
    alignItems: "flex-start",
  },
  previewBubble: {
    background: "#FFF",
    borderRadius: 12,
    padding: "12px 14px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.18)",
    maxWidth: "85%",
    minWidth: 220,
    fontSize: 13,
    fontFamily: "var(--font-sans)",
    color: "#0F172A",
    position: "relative",
  },
  bubbleText: { whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, lineHeight: 1.5 },
  errorBox: {
    fontFamily: "var(--font-mono)",
    color: "#C53030",
    fontSize: 11,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  btnPrimary: {
    padding: "9px 16px",
    border: "1px solid var(--brand)",
    background: "var(--brand)",
    borderRadius: 8,
    fontSize: 13,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
  },
  btnGhost: {
    padding: "9px 14px",
    border: "1px solid var(--line)",
    background: "transparent",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  gatedBox: {
    padding: 14,
    background: "var(--bg-2)",
    borderRadius: 10,
    color: "var(--ink-2)",
    fontSize: 13,
    lineHeight: 1.55,
  },
}
