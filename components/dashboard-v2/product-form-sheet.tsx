"use client"

import { useEffect, useState } from "react"
import type { CreateProductDto, UpdateProductDto, ProductResponse, PriceCurrency } from "@/lib/products-api/types"
import type { CategoryResponse } from "@/lib/categories-api/types"
import { ApiError } from "@/lib/http/types"
import { UploadButton } from "./upload-button"

interface ProductFormSheetProps {
  open: boolean
  storeId: string | undefined
  product: ProductResponse | null
  categories: CategoryResponse[]
  onClose(): void
  onCreate(dto: CreateProductDto): Promise<void>
  onUpdate(id: string, dto: UpdateProductDto): Promise<void>
  onDelete(id: string): Promise<void>
}

interface FormState {
  name: string
  sku: string
  description: string
  basePrice: string
  priceCurrency: PriceCurrency
  compareAtPrice: string
  stock: string
  imageUrl: string
  isVisible: boolean
  isFeatured: boolean
  categoryIds: string[]
}

const EMPTY: FormState = {
  name: "", sku: "", description: "", basePrice: "", priceCurrency: "VES",
  compareAtPrice: "", stock: "", imageUrl: "", isVisible: true, isFeatured: false, categoryIds: [],
}

function fromProduct(p: ProductResponse): FormState {
  return {
    name: p.name,
    sku: p.sku ?? "",
    description: p.description ?? "",
    basePrice: String(p.basePrice ?? ""),
    priceCurrency: (p.priceCurrency ?? "VES") as PriceCurrency,
    compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
    stock: p.stock != null ? String(p.stock) : "",
    imageUrl: p.images[0] ?? "",
    isVisible: p.isVisible,
    isFeatured: p.isFeatured,
    categoryIds: [...(p.categoryIds ?? [])],
  }
}

const SHEET_STYLES = `
@keyframes pfsBackdrop { from { opacity: 0; } to { opacity: 1; } }
@keyframes pfsSlideR { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes pfsSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.pfs-backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(15,23,42,0.4); backdrop-filter: blur(4px); animation: pfsBackdrop .2s ease; }
.pfs-sheet { position: fixed; top: 0; right: 0; bottom: 0; width: 460px; max-width: 100vw; background: var(--bg-elev); z-index: 81; border-left: 1px solid var(--line); box-shadow: -16px 0 40px -12px rgba(15,23,42,0.18); display: flex; flex-direction: column; animation: pfsSlideR .28s cubic-bezier(.2,.7,.3,1); }
@media (max-width: 640px) { .pfs-sheet { top: auto; left: 0; width: 100%; max-height: 92vh; border-left: none; border-top-left-radius: 18px; border-top-right-radius: 18px; animation: pfsSlideUp .28s cubic-bezier(.2,.7,.3,1); } }
`

export function ProductFormSheet({ open, storeId, product, categories, onClose, onCreate, onUpdate, onDelete }: ProductFormSheetProps) {
  const editing = product != null
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm(product ? fromProduct(product) : EMPTY)
    setError(null)
    setConfirmDelete(false)
  }, [open, product])

  if (!open) return null

  function patch(p: Partial<FormState>) {
    setForm((f) => ({ ...f, ...p })); setError(null)
  }
  function toggleCat(id: string) {
    setForm((f) => ({ ...f, categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter((x) => x !== id) : [...f.categoryIds, id] }))
  }

  async function save() {
    if (!form.name.trim() || !form.basePrice) { setError("Nombre y precio base son obligatorios"); return }
    setSaving(true); setError(null)
    const price = parseFloat(form.basePrice)
    const compare = form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined
    const stockN = form.stock ? parseInt(form.stock, 10) : undefined
    // priceCurrency intentionally omitted: backend main doesn't accept it yet
    // (lands with BE-117). Field stays in the UI so we wire it without churn.
    const baseDto: CreateProductDto & UpdateProductDto = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      basePrice: price,
      compareAtPrice: compare,
      stock: stockN,
      sku: form.sku.trim() || undefined,
      isVisible: form.isVisible,
      isFeatured: form.isFeatured,
      images: form.imageUrl.trim() ? [form.imageUrl.trim()] : undefined,
      categoryIds: form.categoryIds.length > 0 ? form.categoryIds : undefined,
    }
    try {
      if (editing && product) await onUpdate(product.id, baseDto)
      else await onCreate(baseDto as CreateProductDto)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  async function doDelete() {
    if (!product) return
    setDeleting(true); setError(null)
    try {
      await onDelete(product.id)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar")
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  const initial = (form.name[0] || "?").toUpperCase()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHEET_STYLES }} />
      <div className="pfs-backdrop" onClick={onClose} />
      <div className="pfs-sheet" role="dialog" aria-modal="true" aria-label={editing ? "Editar producto" : "Nuevo producto"}>
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div>
            <div className="eyebrow">{editing ? "Editar producto" : "Nuevo producto"}</div>
            <h3 className="h-4" style={{ marginTop: 2 }}>{editing ? product?.name : "Crear producto"}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-2)", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
          {error && <div role="alert" style={{ padding: "10px 12px", background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 10, color: "#991B1B", fontSize: 13, marginBottom: 14 }}>{error}</div>}

          <div style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: form.imageUrl ? `#fff url(${form.imageUrl}) center/cover no-repeat` : "linear-gradient(135deg, var(--brand), var(--brand-2))", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
              {form.imageUrl ? "" : initial}
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Imagen</label>
              <input className="input" value={form.imageUrl} onChange={(e) => patch({ imageUrl: e.target.value })} placeholder="https://… o subí un archivo" />
              <div style={{ marginTop: 6 }}>
                <UploadButton storeId={storeId} onUploaded={(url) => patch({ imageUrl: url })} label="Subir imagen" />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label className="label">Nombre <span style={{ color: "var(--accent)" }}>*</span></label>
              <input className="input" value={form.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Remera Oversize Premium" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">SKU</label>
                <input className="input" value={form.sku} onChange={(e) => patch({ sku: e.target.value })} placeholder="SKU-001" />
              </div>
              <div>
                <label className="label">Stock</label>
                <input className="input" type="number" min="0" value={form.stock} onChange={(e) => patch({ stock: e.target.value })} placeholder="—" />
              </div>
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea className="textarea" value={form.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Algodón peinado 24/1, corte relajado…" rows={3} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12 }}>
              <div>
                <label className="label">Precio base <span style={{ color: "var(--accent)" }}>*</span></label>
                <input className="input" type="number" min="0" step="0.01" value={form.basePrice} onChange={(e) => patch({ basePrice: e.target.value })} placeholder="18500" required />
              </div>
              <div>
                <label className="label">Moneda</label>
                <select className="select" value={form.priceCurrency} onChange={(e) => patch({ priceCurrency: e.target.value as PriceCurrency })}>
                  <option value="VES">Bs.</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="label">Precio antes (opcional)</label>
                <input className="input" type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={(e) => patch({ compareAtPrice: e.target.value })} placeholder="24000" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 18, paddingTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--ink-2)" }}>
                <input type="checkbox" checked={form.isVisible} onChange={(e) => patch({ isVisible: e.target.checked })} style={{ width: 16, height: 16, accentColor: "var(--brand)" }} />
                Publicado
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--ink-2)" }}>
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => patch({ isFeatured: e.target.checked })} style={{ width: 16, height: 16, accentColor: "var(--brand)" }} />
                Destacado
              </label>
            </div>

            {categories.length > 0 && (
              <div>
                <label className="label">Categorías</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {categories.map((c) => {
                    const on = form.categoryIds.includes(c.id)
                    return (
                      <button key={c.id} type="button" onClick={() => toggleCat(c.id)} className="chip" style={on ? { background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" } : {}}>{c.name}</button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "14px 24px 20px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, background: "var(--bg-elev)" }}>
          {editing ? (
            confirmDelete ? (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span className="body-sm" style={{ color: "var(--accent)" }}>¿Confirmar?</span>
                <button type="button" onClick={doDelete} disabled={deleting} className="btn btn-danger btn-sm">{deleting ? "Eliminando…" : "Sí, eliminar"}</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="btn btn-ghost btn-sm">Cancelar</button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }}>Eliminar</button>
            )
          ) : <span />}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} disabled={saving || deleting} className="btn btn-ghost">Cancelar</button>
            <button type="button" onClick={save} disabled={saving || deleting} className="btn btn-primary">{saving ? "Guardando…" : (editing ? "Guardar cambios" : "Crear producto")}</button>
          </div>
        </div>
      </div>
    </>
  )
}
