"use client"

import { useEffect, useMemo, useState } from "react"
import type { CreateProductDto, UpdateProductDto, ProductResponse, PriceCurrency, ProductAttributeDto } from "@/lib/products-api/types"
import type { CategoryResponse } from "@/lib/categories-api/types"
import { ProductHttpRepository } from "@/lib/products-api/product.http-repository"
import { ApiError } from "@/lib/http/types"
import { useAuth } from "@/contexts/auth-context"
import { UploadButton } from "./upload-button"
import { AttributesEditor } from "./attributes-editor"
import { VariantsEditor, type VariantDraft } from "./variants-editor"

interface ProductFormSheetProps {
  open: boolean
  storeId: string | undefined
  product: ProductResponse | null
  categories: CategoryResponse[]
  onClose(): void
  onCreate(dto: CreateProductDto): Promise<ProductResponse>
  onUpdate(id: string, dto: UpdateProductDto): Promise<ProductResponse>
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
  images: string[]
  newImageUrl: string
  isVisible: boolean
  isFeatured: boolean
  categoryIds: string[]
  attributes: ProductAttributeDto[]
  variants: VariantDraft[]
}

const EMPTY: FormState = {
  name: "", sku: "", description: "", basePrice: "", priceCurrency: "VES",
  compareAtPrice: "", stock: "", images: [], newImageUrl: "", isVisible: true, isFeatured: false, categoryIds: [],
  attributes: [], variants: [],
}

function comboKey(combo: Record<string, string>): string {
  return Object.entries(combo).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join("|")
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
    images: [...(p.images ?? [])],
    newImageUrl: "",
    isVisible: p.isVisible,
    isFeatured: p.isFeatured,
    categoryIds: [...(p.categoryIds ?? [])],
    attributes: (p.attributes ?? []).map((a) => ({ name: a.name, type: a.type, role: a.role, options: [...a.options], optionsMeta: a.optionsMeta, sortOrder: a.sortOrder })),
    variants: (p.variants ?? []).map((v) => ({ combination: v.combination, priceAdjustment: v.priceAdjustment, stock: v.stock != null ? String(v.stock) : "" })),
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
  const { http } = useAuth()
  const productRepo = useMemo(() => new ProductHttpRepository(http), [http])
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
  function addImageUrl() {
    const url = form.newImageUrl.trim()
    if (!url) return
    setForm((f) => ({ ...f, images: [...f.images, url], newImageUrl: "" }))
    setError(null)
  }
  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
    setError(null)
  }
  function moveImage(idx: number, dir: -1 | 1) {
    setForm((f) => {
      const arr = [...f.images]
      const j = idx + dir
      if (j < 0 || j >= arr.length) return f
      ;[arr[idx], arr[j]] = [arr[j], arr[idx]]
      return { ...f, images: arr }
    })
    setError(null)
  }

  async function reconcileVariants(productId: string) {
    if (!storeId) return
    const existing = product?.variants ?? []
    const existingByKey = new Map(existing.map((v) => [comboKey(v.combination), v]))
    const currentKeys = new Set(form.variants.map((v) => comboKey(v.combination)))

    for (const draft of form.variants) {
      const key = comboKey(draft.combination)
      const prev = existingByKey.get(key)
      const stockN = draft.stock.trim() ? parseInt(draft.stock, 10) : undefined
      if (!prev) {
        await productRepo.createVariant(storeId, productId, {
          combination: draft.combination,
          priceAdjustment: draft.priceAdjustment,
          stock: stockN,
        })
      } else if (prev.priceAdjustment !== draft.priceAdjustment || (prev.stock ?? undefined) !== stockN) {
        await productRepo.updateVariant(storeId, productId, prev.id, {
          priceAdjustment: draft.priceAdjustment,
          stock: stockN,
        })
      }
    }
    for (const prev of existing) {
      if (!currentKeys.has(comboKey(prev.combination))) {
        await productRepo.deleteVariant(storeId, productId, prev.id)
      }
    }
  }

  async function save() {
    if (!form.name.trim() || !form.basePrice) { setError("Nombre y precio base son obligatorios"); return }
    setSaving(true); setError(null)
    const price = parseFloat(form.basePrice)
    const compare = form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined
    const stockN = form.stock ? parseInt(form.stock, 10) : undefined
    const validAttributes = form.attributes.filter((a) => a.name.trim() && a.options.length > 0)
    const baseDto: CreateProductDto & UpdateProductDto = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      basePrice: price,
      priceCurrency: form.priceCurrency,
      compareAtPrice: compare,
      stock: stockN,
      sku: form.sku.trim() || undefined,
      isVisible: form.isVisible,
      isFeatured: form.isFeatured,
      images: form.images.length > 0 ? form.images : undefined,
      categoryIds: form.categoryIds.length > 0 ? form.categoryIds : undefined,
      attributes: validAttributes,
    }
    try {
      const saved = editing && product
        ? await onUpdate(product.id, baseDto)
        : await onCreate(baseDto as CreateProductDto)
      await reconcileVariants(saved.id)
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

          <div style={{ marginBottom: 16 }}>
            <label className="label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Imágenes {form.images.length > 0 && <span className="mono" style={{ color: "var(--ink-3)", fontWeight: 500 }}>· {form.images.length}</span>}</span>
              <span className="body-sm muted" style={{ fontWeight: 500 }}>1ª es la portada</span>
            </label>
            {form.images.length === 0 ? (
              <div style={{ aspectRatio: "3/1", borderRadius: 12, background: "var(--bg-2)", border: "1.5px dashed var(--line-2)", display: "grid", placeItems: "center", color: "var(--ink-3)", fontSize: 13 }}>
                Sin imágenes — agrega la primera abajo · primera letra: <strong style={{ marginLeft: 4, color: "var(--ink-2)" }}>{initial}</strong>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
                {form.images.map((url, i) => (
                  <div key={`${url}-${i}`} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, background: `#fff url(${url}) center/cover no-repeat`, border: i === 0 ? "2px solid var(--brand)" : "1px solid var(--line)", overflow: "hidden" }}>
                    {i === 0 && <span className="mono" style={{ position: "absolute", left: 4, top: 4, background: "var(--brand)", color: "#fff", fontSize: 9, padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>PORTADA</span>}
                    <button type="button" onClick={() => removeImage(i)} aria-label="Quitar" style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, lineHeight: 1, display: "grid", placeItems: "center" }}>×</button>
                    <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, display: "flex", justifyContent: "space-between" }}>
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Mover izquierda" style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.95)", color: "var(--ink)", border: "none", cursor: i === 0 ? "not-allowed" : "pointer", fontSize: 12, lineHeight: 1, opacity: i === 0 ? 0.3 : 1 }}>‹</button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label="Mover derecha" style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.95)", color: "var(--ink)", border: "none", cursor: i === form.images.length - 1 ? "not-allowed" : "pointer", fontSize: 12, lineHeight: 1, opacity: i === form.images.length - 1 ? 0.3 : 1 }}>›</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input className="input" value={form.newImageUrl} onChange={(e) => patch({ newImageUrl: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl() } }} placeholder="Pega una URL y Enter…" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addImageUrl} disabled={!form.newImageUrl.trim()}>+ URL</button>
            </div>
            <div style={{ marginTop: 8 }}>
              <UploadButton storeId={storeId} onUploaded={(urls) => setForm((f) => ({ ...f, images: [...f.images, ...urls] }))} multiple label="Subir imágenes" />
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

            <div>
              <label className="label" style={{ marginBottom: 8, display: "block" }}>Atributos (talla, color…)</label>
              <AttributesEditor attributes={form.attributes} onChange={(attributes) => patch({ attributes })} />
            </div>

            <VariantsEditor
              basePrice={parseFloat(form.basePrice) || 0}
              attributes={form.attributes}
              variants={form.variants}
              onChange={(variants) => patch({ variants })}
            />
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
