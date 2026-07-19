"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { CategoryHttpRepository } from "@/lib/categories-api/category.http-repository"
import type { CategoryResponse } from "@/lib/categories-api/types"
import { ApiError } from "@/lib/http/types"

interface CategoryManagerSheetProps {
  open: boolean
  onClose(): void
  onChanged?(): void
}

const SHEET_STYLES = `
@keyframes cmsBackdrop { from { opacity: 0; } to { opacity: 1; } }
@keyframes cmsSlideR { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes cmsSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
/* Sobre el top-dock del panel (z-index 100) para no quedar debajo del nav. */
.cms-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(15,23,42,0.4); backdrop-filter: blur(4px); animation: cmsBackdrop .2s ease; }
.cms-sheet { position: fixed; top: 0; right: 0; bottom: 0; width: 460px; max-width: 100vw; background: var(--bg-elev); z-index: 201; border-left: 1px solid var(--line); box-shadow: -16px 0 40px -12px rgba(15,23,42,0.18); display: flex; flex-direction: column; animation: cmsSlideR .28s cubic-bezier(.2,.7,.3,1); }
@media (max-width: 640px) { .cms-sheet { top: auto; left: 0; width: 100%; max-height: 92vh; border-left: none; border-top-left-radius: 18px; border-top-right-radius: 18px; animation: cmsSlideUp .28s cubic-bezier(.2,.7,.3,1); } }
.cms-row { display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px dashed var(--line); }
.cms-row:last-child { border-bottom: none; }
.cms-row.dirty { background: rgba(30,58,138,0.04); padding-left: 8px; padding-right: 8px; border-radius: 8px; }
`

export function CategoryManagerSheet({ open, onClose, onChanged }: CategoryManagerSheetProps) {
  const { http, store } = useAuth()
  const storeId = store?.id
  const repo = new CategoryHttpRepository(http)

  const [items, setItems] = useState<CategoryResponse[]>([])
  const [drafts, setDrafts] = useState<Record<string, { name: string; isVisible: boolean }>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function refresh() {
    if (!storeId) return
    setLoading(true); setError(null)
    try {
      const res = await repo.findAll(storeId)
      setItems(res.data); setDrafts({})
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (open) refresh() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open, storeId])

  if (!open) return null

  const draftFor = (c: CategoryResponse) => drafts[c.id] ?? { name: c.name, isVisible: c.isVisible }
  const isDirty = (c: CategoryResponse) => {
    const d = drafts[c.id]; return d != null && (d.name !== c.name || d.isVisible !== c.isVisible)
  }

  function patch(id: string, p: Partial<{ name: string; isVisible: boolean }>) {
    setDrafts((prev) => {
      const cur = prev[id] ?? { name: items.find((x) => x.id === id)?.name ?? "", isVisible: items.find((x) => x.id === id)?.isVisible ?? true }
      return { ...prev, [id]: { ...cur, ...p } }
    })
    setError(null)
  }

  async function create() {
    if (!storeId || !newName.trim() || creating) return
    setCreating(true); setError(null)
    try {
      await repo.create(storeId, { name: newName.trim() })
      setNewName("")
      await refresh()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear")
    } finally {
      setCreating(false)
    }
  }

  async function save(c: CategoryResponse) {
    if (!storeId || !isDirty(c) || savingId) return
    const d = drafts[c.id]
    setSavingId(c.id); setError(null)
    try {
      await repo.update(storeId, c.id, { name: d.name.trim(), isVisible: d.isVisible })
      await refresh()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar")
    } finally {
      setSavingId(null)
    }
  }

  async function doDelete(c: CategoryResponse) {
    if (!storeId) return
    setSavingId(c.id); setError(null)
    try {
      await repo.remove(storeId, c.id)
      setConfirmDelete(null)
      await refresh()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHEET_STYLES }} />
      <div className="cms-backdrop" onClick={onClose} />
      <div className="cms-sheet" role="dialog" aria-modal="true" aria-label="Gestionar categorías">
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div>
            <div className="eyebrow">Categorías</div>
            <h3 className="h-4" style={{ marginTop: 2 }}>{items.length} en total</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-2)", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
          {error && <div role="alert" style={{ padding: "10px 12px", background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 10, color: "#991B1B", fontSize: 13, marginBottom: 14 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") create() }} placeholder="Nueva categoría (Enter para crear)" disabled={creating || !storeId} />
            <button type="button" className="btn btn-primary btn-sm" onClick={create} disabled={!newName.trim() || creating || !storeId}>{creating ? "…" : "+ Crear"}</button>
          </div>

          {loading && items.length === 0 ? (
            <div className="muted body-sm" style={{ padding: 14, textAlign: "center" }}>Cargando…</div>
          ) : items.length === 0 ? (
            <div className="muted body-sm" style={{ padding: 14, textAlign: "center" }}>Sin categorías todavía. Crea la primera arriba.</div>
          ) : (
            <div>
              {items.map((c) => {
                const d = draftFor(c)
                const dirty = isDirty(c)
                const isSaving = savingId === c.id
                const wantsDelete = confirmDelete === c.id
                return (
                  <div key={c.id} className={`cms-row${dirty ? " dirty" : ""}`}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <input className="input" value={d.name} onChange={(e) => patch(c.id, { name: e.target.value })} disabled={isSaving} />
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-2)", cursor: "pointer" }}>
                        <input type="checkbox" checked={d.isVisible} onChange={(e) => patch(c.id, { isVisible: e.target.checked })} disabled={isSaving} style={{ width: 14, height: 14, accentColor: "var(--brand)" }} />
                        Visible{typeof c.productCount === "number" && <span className="mono" style={{ color: "var(--ink-3)", marginLeft: 6 }}>· {c.productCount} prod.</span>}
                      </label>
                    </div>
                    {wantsDelete ? (
                      <>
                        <button type="button" onClick={() => doDelete(c)} disabled={isSaving} className="btn btn-danger btn-sm">{isSaving ? "…" : "Sí, eliminar"}</button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="btn btn-ghost btn-sm">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => save(c)} disabled={!dirty || isSaving} className="btn btn-primary btn-sm">{isSaving ? "…" : "Guardar"}</button>
                        <button type="button" onClick={() => setConfirmDelete(c.id)} disabled={isSaving} className="btn btn-ghost btn-sm" aria-label="Eliminar" title="Eliminar" style={{ color: "var(--danger)" }}>×</button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
