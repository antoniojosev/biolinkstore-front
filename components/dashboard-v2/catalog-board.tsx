"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProductHttpRepository } from "@/lib/products-api/product.http-repository"
import { CategoryHttpRepository } from "@/lib/categories-api/category.http-repository"
import type { CreateProductDto, ProductResponse, UpdateProductDto } from "@/lib/products-api/types"
import type { CategoryResponse } from "@/lib/categories-api/types"
import { ProductFormSheet } from "./product-form-sheet"
import { CategoryManagerSheet } from "./category-manager-sheet"
import { InstagramImportCard } from "./instagram-import-card"

function I({ id }: { id: string }) {
  return <svg><use href={`#ic-${id}`} /></svg>
}

interface DisplayProduct {
  id: string
  name: string
  sku: string
  price: string
  stock: number | null
  status: "ok" | "low" | "zero"
  cat: string
  badge: "low" | "draft" | null
  img: string
  isImage: boolean
}

const FALLBACK_GRADS = [
  "linear-gradient(135deg,#C63E2A,#7A1F10)", "linear-gradient(135deg,#E8C07A,#B8860B)",
  "linear-gradient(135deg,#8A6B4C,#5A3D1D)", "linear-gradient(135deg,#2A3B5C,#0A1F4D)",
  "linear-gradient(135deg,#D4AF37,#8B7500)", "linear-gradient(135deg,#DC4A3D,#F97066)",
  "linear-gradient(135deg,#C4B5A0,#8B7355)", "linear-gradient(135deg,#A8DADC,#457B9D)",
]
function gradFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return FALLBACK_GRADS[Math.abs(h) % FALLBACK_GRADS.length]
}

function fmtPrice(amount: number, currency = "VES") {
  if (currency === "USD") return `$${amount.toLocaleString("es", { maximumFractionDigits: 2 })}`
  if (currency === "EUR") return `€${amount.toLocaleString("es", { maximumFractionDigits: 2 })}`
  return `Bs. ${amount.toLocaleString("es-VE", { maximumFractionDigits: 0 })}`
}

function statusFor(stock: number | null): "ok" | "low" | "zero" {
  if (stock == null) return "ok"
  if (stock === 0) return "zero"
  if (stock <= 5) return "low"
  return "ok"
}

export function CatalogBoard() {
  const { http, store } = useAuth()
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [query, setQuery] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [catManagerOpen, setCatManagerOpen] = useState(false)
  const [igImportOpen, setIgImportOpen] = useState(false)
  const [catFilter, setCatFilter] = useState("")
  const [stockFilter, setStockFilter] = useState<"" | "ok" | "low" | "zero">("")
  const [statusFilter, setStatusFilter] = useState<"" | "published" | "draft">("")

  const productRepo = useMemo(() => new ProductHttpRepository(http), [http])
  const categoryRepo = useMemo(() => new CategoryHttpRepository(http), [http])
  const storeId = store?.id

  useEffect(() => {
    if (!storeId) return
    let cancelled = false
    setLoading(true); setError(null)
    Promise.all([
      productRepo.findAll(storeId, { limit: 100 }),
      categoryRepo.findAll(storeId).catch(() => ({ data: [] as CategoryResponse[] })),
    ])
      .then(([p, c]) => { if (!cancelled) { setProducts(p.data); setCategories(c.data) } })
      .catch(() => { if (!cancelled) setError("No se pudieron cargar los productos") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [productRepo, categoryRepo, storeId, refreshTick])

  const openCreate = () => { setEditingProduct(null); setSheetOpen(true) }
  const openEdit = (id: string) => {
    const real = products.find((p) => p.id === id) ?? null
    setEditingProduct(real)
    setSheetOpen(true)
  }
  async function handleCreate(dto: CreateProductDto) {
    if (!storeId) throw new Error("Sin tienda activa")
    await productRepo.create(storeId, dto)
    setRefreshTick((n) => n + 1)
  }
  async function handleUpdate(id: string, dto: UpdateProductDto) {
    if (!storeId) throw new Error("Sin tienda activa")
    await productRepo.update(storeId, id, dto)
    setRefreshTick((n) => n + 1)
  }
  async function handleDelete(id: string) {
    if (!storeId) throw new Error("Sin tienda activa")
    await productRepo.remove(storeId, id)
    setRefreshTick((n) => n + 1)
  }
  async function handleDuplicate(id: string) {
    if (!storeId) return
    await productRepo.duplicate(storeId, id).catch(() => {})
    setRefreshTick((n) => n + 1)
  }
  const canCrud = Boolean(storeId)

  const catNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of categories) m.set(c.id, c.name)
    return m
  }, [categories])

  const display: DisplayProduct[] = useMemo(() => {
    return products.map((p) => {
      const img = p.images[0]
      const catName = (p.categoryIds[0] && catNameById.get(p.categoryIds[0])) || "Sin categoría"
      const status = statusFor(p.stock)
      const badge: "low" | "draft" | null = !p.isVisible ? "draft" : status === "low" ? "low" : null
      return {
        id: p.id,
        name: p.name,
        sku: p.sku ?? "—",
        price: fmtPrice(p.basePrice, p.priceCurrency ?? "VES"),
        stock: p.stock,
        status,
        cat: catName,
        badge,
        img: img || gradFor(p.id),
        isImage: Boolean(img),
      }
    })
  }, [products, catNameById])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return display.filter((p) => {
      if (q && !(p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q))) return false
      if (catFilter && p.cat !== catFilter) return false
      if (stockFilter && p.status !== stockFilter) return false
      if (statusFilter === "draft" && p.badge !== "draft") return false
      if (statusFilter === "published" && p.badge === "draft") return false
      return true
    })
  }, [display, query, catFilter, stockFilter, statusFilter])

  const total = display.length
  const published = products.filter((p) => p.isVisible).length
  const draft = products.filter((p) => !p.isVisible).length
  const noStock = display.filter((p) => p.status === "zero").length

  return (
    <div className="cat-wrap">
      <div className="cat-header">
        <div>
          <h1><em>{total}</em> productos</h1>
          <div className="meta">{published} publicados · {draft} borrador · {noStock} sin stock</div>
        </div>
        <div className="h-actions">
          <button type="button" className="h-btn ghost" onClick={() => setIgImportOpen((v) => !v)} disabled={!canCrud}><I id="image" />Importar de Instagram</button>
          <button type="button" className="h-btn ghost" onClick={() => setCatManagerOpen(true)} disabled={!canCrud}><I id="tag" />Categorías</button>
          <button type="button" className="h-btn" onClick={openCreate} disabled={!canCrud}><I id="plus" />Nuevo producto</button>
        </div>
      </div>

      {igImportOpen && (
        <div style={{ marginBottom: 16 }}>
          <InstagramImportCard />
        </div>
      )}

      <div className="cat-toolbar">
        <div className="search-box">
          <I id="search" />
          <input placeholder="Buscar por nombre, SKU o categoría…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="filter-chip" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {Array.from(new Set(display.map((p) => p.cat))).sort().map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="filter-chip" value={stockFilter} onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)} aria-label="Filtrar por stock">
          <option value="">Todo el stock</option>
          <option value="ok">Con stock</option>
          <option value="low">Stock bajo</option>
          <option value="zero">Sin stock</option>
        </select>
        <select className="filter-chip" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
        </select>
        <div className="view-toggle" style={{ marginLeft: "auto" }}>
          <button type="button" className={view === "grid" ? "active" : ""} title="Galería" onClick={() => setView("grid")}><I id="grid" /></button>
          <button type="button" className={view === "list" ? "active" : ""} title="Lista" onClick={() => setView("list")}><I id="list" /></button>
        </div>
      </div>

      {error && <div role="alert" style={{ padding: 14, background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 10, color: "#991B1B", marginBottom: 12 }}>{error}</div>}

      {loading && products.length === 0 && (
        <div className="muted" style={{ padding: 24, textAlign: "center" }}>Cargando productos…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="muted" style={{ padding: 24, textAlign: "center" }}>
          {query ? `Sin resultados para "${query}".` : "Aún no tienes productos. Crea el primero arriba."}
        </div>
      )}

      {!loading && filtered.length > 0 && view === "grid" && (
        <div className="gallery-grid">
          {filtered.map((p) => (
            <div className="product-card" key={p.id} onClick={() => canCrud && openEdit(p.id)} style={{ cursor: canCrud ? "pointer" : "default" }}>
              <div className="pc-img" style={{ background: p.isImage ? `#fff url(${p.img}) center/cover no-repeat` : p.img }}>
                {p.badge === "low" && <span className="pc-badge low">Stock bajo</span>}
                {p.badge === "draft" && <span className="pc-badge draft">Borrador</span>}
                {canCrud && (
                  <div className="pc-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" title="Editar" onClick={() => openEdit(p.id)}><I id="edit" /></button>
                    <button type="button" title="Duplicar" onClick={() => handleDuplicate(p.id)}><I id="copy" /></button>
                  </div>
                )}
              </div>
              <div className="pc-info">
                <div className="pc-name">{p.name}</div>
                <div className="pc-meta"><span className="pc-price">{p.price}</span><span className="pc-stock">{p.stock ?? "—"} stock</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && view === "list" && (
        <div className="list-table">
          <div className="lt-head"><div /><div /><div>Producto</div><div>Precio</div><div>Stock</div><div>Categoría</div><div /></div>
          {filtered.map((p) => (
            <div className="lt-row" key={p.id} onClick={() => canCrud && openEdit(p.id)} style={{ cursor: canCrud ? "pointer" : "default" }}>
              <div className="lt-checkbox" onClick={(e) => e.stopPropagation()} />
              <div className="lt-thumb" style={{ background: p.isImage ? `#fff url(${p.img}) center/cover no-repeat` : p.img }} />
              <div><div className="lt-name">{p.name}</div><div className="lt-sku">{p.sku}</div></div>
              <div className="lt-price">{p.price}</div>
              <div><span className={`lt-stock-pill ${p.status}`}>{p.status === "zero" ? "Sin stock" : `${p.stock ?? "—"} unid.`}</span></div>
              <div className="lt-cat">{p.cat}</div>
              <div className="lt-more">⋯</div>
            </div>
          ))}
        </div>
      )}

      <ProductFormSheet
        open={sheetOpen}
        storeId={storeId}
        product={editingProduct}
        categories={categories}
        onClose={() => setSheetOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <CategoryManagerSheet
        open={catManagerOpen}
        onClose={() => setCatManagerOpen(false)}
        onChanged={() => setRefreshTick((n) => n + 1)}
      />
    </div>
  )
}
