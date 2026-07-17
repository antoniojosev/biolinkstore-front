"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react"
import { Check, Clock, MapPin, Plus, Search, ShoppingBag, X } from "lucide-react"
import type { SectionNode } from "@/lib/page-builder-api"
import { googleFontsHref } from "@/lib/google-fonts"
import { useCartOptional } from "@/lib/cart-context"
import { resolveTokens } from "@/components/storefront-v2/template/tokens"
import {
  SectionRenderer,
  type TemplateProduct,
  type TemplateRendererProps,
} from "@/components/storefront-v2/template/template-renderer"
import {
  BG_BLUR_85,
  BORDER_SOFT,
  GRAY_400,
  SURFACE_75,
  SURFACE_DIM,
  fmtMenuPrice,
  productInStock,
} from "./format"

/**
 * MenuRenderer — port fiel del tema legacy `menu` (carta de restaurante,
 * rama rebrand/bylink-domain-swap) al framework storefront-v2:
 *
 * - Carta pura: header restaurante → sticky search + tabs de categoría con
 *   scroll-spy (IntersectionObserver) → secciones por categoría con cards
 *   horizontales + quick-add flotante → barra de pedido persistente.
 * - Colores SIEMPRE por tokens (--bl-*): el seed de `menu` ya replica la
 *   paleta legacy (#B45309/#FFF8F0/#E8DDD3/#16a34a), así el preset
 *   "menu-nocturno" funciona gratis.
 * - Respeta el árbol de secciones: hero → header restaurante · product_grid
 *   → carta (search/tabs/grupos) · hours/contact/footer → SectionRenderer.
 * - Responsive por container query (nunca @media): grid 2-col y foto 112px
 *   a partir de 640px de ancho del contenedor bl-menu.
 * - Carrito: quick-add y total en vivo via useCartOptional (el editor monta
 *   el renderer sin CartProvider → degrada a no-op); el trigger del drawer
 *   respeta onOpenCart/cartCount del contrato.
 */
export function MenuRenderer({
  store,
  products,
  categories,
  theme,
  onOpenProduct,
  productHref,
  cartCount = 0,
  onOpenCart,
  rate,
  editorSelectedKey,
  onSectionClick,
}: TemplateRendererProps) {
  const resolved = resolveTokens(theme.tokens)
  const sections = (theme.tree?.sections ?? []).filter((s) => s.visible !== false)
  const cart = useCartOptional()

  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isScrollingTo = useRef(false)

  const currency = store.currency ?? "USD"
  const fmt = useCallback((n: number) => fmtMenuPrice(n, currency), [currency])

  const gridSection = sections.find((sec) => sec.type === "product_grid")
  const groupByCategory = s(gridSection, "groupBy", "category") !== "none"
  const showPrice = bool(gridSection, "showPrice", true)
  const showImage = bool(gridSection, "showImage", true)
  const searchEnabled = bool(gridSection, "searchEnabled", true)

  const categoryList = useMemo(() => categories.map((c) => c.name), [categories])

  // Agrupación del legacy: categorías en orden + grupo extra "Otros" para
  // productos sin categoría (o con categoría desconocida). La búsqueda
  // filtra por name/description y oculta categorías sin resultados.
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matches = (p: TemplateProduct) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q)

    const map: Record<string, TemplateProduct[]> = {}
    if (!groupByCategory) {
      const all = products.filter(matches)
      if (all.length > 0) map[s(gridSection, "title") || "Menú"] = all
      return map
    }
    for (const cat of categoryList) {
      const items = products.filter((p) => p.category === cat && matches(p))
      if (items.length > 0) map[cat] = items
    }
    const uncategorized = products.filter(
      (p) => (!p.category || !categoryList.includes(p.category)) && matches(p),
    )
    if (uncategorized.length > 0) map["Otros"] = uncategorized
    return map
  }, [products, categoryList, search, groupByCategory, gridSection])

  const visibleCategories = useMemo(() => Object.keys(grouped), [grouped])

  // Categoría activa inicial = primera visible.
  useEffect(() => {
    if (!activeCategory && visibleCategories.length > 0) {
      setActiveCategory(visibleCategories[0])
    }
  }, [visibleCategories, activeCategory])

  // Scroll-spy — el sello del tema. rootMargin exacto del legacy.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.getAttribute("data-category") ?? "")
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    )
    for (const el of Object.values(sectionRefs.current)) {
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [visibleCategories])

  const scrollToCategory = useCallback((cat: string) => {
    setActiveCategory(cat)
    const el = sectionRefs.current[cat]
    if (!el) return
    isScrollingTo.current = true
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    setTimeout(() => {
      isScrollingTo.current = false
    }, 800)
  }, [])

  // Mismo patrón de selección del editor que persona/base.
  function editorWrap(node: SectionNode, children: ReactNode): ReactNode {
    if (!onSectionClick) return children
    const isSelected = editorSelectedKey === node.key
    return (
      <div
        key={node.key}
        data-section-key={node.key}
        onClick={(e) => {
          e.stopPropagation()
          onSectionClick(node.key)
        }}
        style={{
          position: "relative",
          cursor: "pointer",
          outline: isSelected ? "2px solid var(--brand, #1E3A8A)" : "2px solid transparent",
          outlineOffset: -2,
        }}
      >
        {isSelected && <div style={S.editorTag}>{node.type.toUpperCase()}</div>}
        {children}
      </div>
    )
  }

  const totalItems = cart?.totalItems ?? cartCount
  const totalPrice = cart?.totalPrice ?? 0

  function openCart() {
    if (onOpenCart) onOpenCart()
    else cart?.setIsOpen(true)
  }

  const rootStyle = {
    ...resolved.cssVars,
    background: "var(--bl-background)",
    color: "var(--bl-text)",
    fontFamily: "var(--bl-body-font)",
    minHeight: "100vh",
    containerType: "inline-size",
    containerName: "bl-menu",
  } as CSSProperties

  function renderHero(node: SectionNode): ReactNode {
    const bio = s(node, "subheadline") || store.bio || ""
    return (
      <header key={node.key} className="bl-menu-pad" style={S.header}>
        <div style={S.maxW}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={store.avatar || s(node, "image") || "/placeholder.svg"}
              alt={store.name}
              style={S.avatar}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={S.storeName}>{s(node, "headline") || store.name}</h1>
              {bio && <p style={S.storeBio}>{bio}</p>}
              <div style={S.metaRow}>
                <span style={S.metaItem}>
                  <MapPin size={12} aria-hidden="true" />
                  {s(node, "deliveryLabel") || "Delivery disponible"}
                </span>
                <span style={S.metaItem}>
                  <Clock size={12} aria-hidden="true" />
                  {s(node, "openLabel") || "Abierto ahora"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  function renderCarta(node: SectionNode): ReactNode {
    const showTabs = groupByCategory && visibleCategories.length > 0
    return (
      <div key={node.key}>
        {/* Sticky search + tabs de categoría */}
        <div className="bl-menu-pad" style={S.stickyBar}>
          <div style={{ ...S.maxW, display: "flex", flexDirection: "column", gap: 12 }}>
            {searchEnabled && (
              <div style={{ position: "relative" }}>
                <Search size={16} style={S.searchIcon} aria-hidden="true" />
                <input
                  className="bl-menu-search"
                  type="search"
                  placeholder="Buscar en el menú..."
                  aria-label="Buscar en el menú"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={S.searchInput}
                />
                {search && (
                  <button
                    type="button"
                    className="bl-menu-clear"
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda"
                    style={S.searchClear}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
            {showTabs ? (
              <div className="bl-menu-tabs" style={S.tabsRow}>
                {visibleCategories.map((cat) => {
                  const active = activeCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => scrollToCategory(cat)}
                      style={{
                        ...S.tab,
                        ...(active
                          ? { background: "var(--bl-primary)", color: "#fff", borderColor: "transparent", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
                          : { background: "var(--bl-surface)", color: "var(--bl-text-muted)", borderColor: "var(--bl-border)" }),
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div style={{ paddingBottom: searchEnabled ? 12 : 0 }} />
            )}
          </div>
        </div>

        {/* Carta agrupada por categoría */}
        <main className="bl-menu-pad" style={S.main}>
          <div style={S.maxW}>
            {visibleCategories.length === 0 ? (
              <div style={S.emptyWrap}>
                <div style={S.emptyCircle}>
                  <Search size={24} style={{ color: GRAY_400 }} aria-hidden="true" />
                </div>
                <div>
                  <p style={{ fontWeight: 500, color: "var(--bl-text)", margin: 0 }}>Sin resultados</p>
                  <p style={{ fontSize: 14, color: "var(--bl-text-muted)", margin: "2px 0 0" }}>
                    Probá con otra búsqueda
                  </p>
                </div>
              </div>
            ) : (
              visibleCategories.map((cat) => (
                <div
                  key={cat}
                  ref={(el) => {
                    sectionRefs.current[cat] = el
                  }}
                  data-category={cat}
                  style={{ paddingTop: 24, scrollMarginTop: "140px" }}
                >
                  {groupByCategory && <h2 style={S.catTitle}>{cat}</h2>}
                  <div className="bl-menu-grid" style={S.grid}>
                    {grouped[cat].map((p) => (
                      <MenuProductCard
                        key={p.id}
                        product={p}
                        fmt={fmt}
                        showPrice={showPrice}
                        showImage={showImage}
                        href={productHref?.(p) ?? null}
                        onOpen={onOpenProduct}
                        cart={cart}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <style dangerouslySetInnerHTML={{ __html: MENU_STYLES }} />

      {sections.map((node) => {
        if (node.type === "hero") return editorWrap(node, renderHero(node))
        if (node.type === "product_grid") return editorWrap(node, renderCarta(node))
        // Secciones commodity (hours/contact/footer/…) delegadas al catálogo base.
        return editorWrap(
          node,
          <SectionRenderer
            key={node.key}
            section={node}
            store={store}
            products={products}
            categories={categories}
            resolved={resolved}
            onOpenProduct={onOpenProduct}
            productHref={productHref}
            priceCtx={{ currency, convert: (n) => n }}
          />,
        )
      })}

      {/* Barra de pedido persistente — el trigger del carrito, siempre visible */}
      <div style={S.orderBarWrap}>
        <button type="button" className="bl-menu-orderbar" onClick={openCart} style={S.orderBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingBag size={20} aria-hidden="true" />
            {totalItems > 0 && <span style={S.orderBadge}>{totalItems}</span>}
          </div>
          <span>{totalItems > 0 ? "Ver pedido" : "Tu pedido"}</span>
          <span style={{ fontWeight: 700 }}>{totalItems > 0 ? fmt(totalPrice) : "$0"}</span>
        </button>
      </div>
      {/* rate aceptada por contrato; menu mantiene el formato es-AR del legacy */}
      {rate ? null : null}
    </div>
  )
}

// ─── Product card — horizontal info/foto + quick-add flotante ────────────────

function MenuProductCard({
  product,
  fmt,
  showPrice,
  showImage,
  href,
  onOpen,
  cart,
}: {
  product: TemplateProduct
  fmt: (n: number) => string
  showPrice: boolean
  showImage: boolean
  href: string | null
  onOpen?: (p: TemplateProduct) => void
  cart: ReturnType<typeof useCartOptional>
}) {
  const [added, setAdded] = useState(false)
  const inStock = productInStock(product)
  const image = product.images?.[0] ?? product.image ?? "/placeholder.svg"

  function handleAdd(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock || !cart) return
    cart.addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image,
    })
    setAdded(true)
    cart.setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const card = (
    <div className="bl-menu-card" style={S.card}>
      {/* Info — izquierda */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "2px 0" }}>
        <div>
          <h3 style={S.cardName}>{product.name}</h3>
          {product.description && <p style={S.cardDesc}>{product.description}</p>}
        </div>
        {showPrice && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{ fontWeight: 700, color: "var(--bl-text)" }}>{fmt(product.price)}</span>
          </div>
        )}
      </div>

      {/* Foto + quick-add — derecha */}
      {showImage && (
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div className="bl-menu-thumb" style={S.thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={product.name} className="bl-menu-photo" style={S.thumbImg} />
            {!inStock && (
              <div style={S.soldOutOverlay}>
                <span style={S.soldOutText}>Agotado</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="bl-menu-add"
            onClick={handleAdd}
            disabled={!inStock}
            aria-label="Agregar al pedido"
            style={{
              ...S.addBtn,
              background: added ? "var(--bl-secondary)" : "var(--bl-primary)",
              opacity: inStock ? 1 : 0.5,
              cursor: inStock ? "pointer" : "not-allowed",
            }}
          >
            {added ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
          </button>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <a href={href} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
        {card}
      </a>
    )
  }
  if (onOpen) {
    return (
      <div role="button" tabIndex={0} onClick={() => onOpen(product)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(product) }} style={{ cursor: "pointer" }}>
        {card}
      </div>
    )
  }
  return card
}

// ─── helpers de props de sección (mismo contrato que persona/base) ───────────

function s(section: SectionNode | undefined, key: string, fallback = ""): string {
  const v = section?.props?.[key]
  return typeof v === "string" ? v : fallback
}

function bool(section: SectionNode | undefined, key: string, fallback = false): boolean {
  const v = section?.props?.[key]
  return typeof v === "boolean" ? v : fallback
}

// Responsive por container query — grid 2-col + foto 112px + px-6 desde 640px
// (sm: del legacy), midiendo el contenedor bl-menu (nunca el viewport).
const MENU_STYLES = `
@container bl-menu (min-width: 640px) {
  .bl-menu-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .bl-menu-thumb { width: 112px !important; height: 112px !important; }
  .bl-menu-pad { padding-left: 24px !important; padding-right: 24px !important; }
}
.bl-menu-card { transition: box-shadow .2s ease; }
.bl-menu-card:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.08); }
.bl-menu-photo { transition: transform .3s ease; }
.bl-menu-card:hover .bl-menu-photo { transform: scale(1.05); }
.bl-menu-add { transition: transform .2s ease, background-color .2s ease; }
.bl-menu-add:hover:not(:disabled) { transform: scale(1.1); }
.bl-menu-add:active:not(:disabled) { transform: scale(0.95); }
.bl-menu-orderbar { transition: opacity .2s ease, transform .2s ease; }
.bl-menu-orderbar:hover { opacity: .9; }
.bl-menu-orderbar:active { transform: scale(0.98); }
.bl-menu-tabs { scrollbar-width: none; }
.bl-menu-tabs::-webkit-scrollbar { display: none; }
.bl-menu-search::placeholder { color: ${GRAY_400}; }
.bl-menu-search::-webkit-search-cancel-button { display: none; }
.bl-menu-search:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--bl-primary) 30%, transparent); }
.bl-menu-clear { color: ${GRAY_400}; }
.bl-menu-clear:hover { color: var(--bl-text-muted); }
`

const S: Record<string, CSSProperties> = {
  editorTag: {
    position: "absolute", top: -1, left: 12, transform: "translateY(-100%)",
    background: "var(--brand, #1E3A8A)", color: "#fff", fontFamily: "monospace",
    fontSize: 9, padding: "2px 8px", borderRadius: "4px 4px 0 0",
    letterSpacing: "0.06em", zIndex: 5, pointerEvents: "none",
  },
  maxW: { maxWidth: 672, margin: "0 auto" },

  // Header restaurante
  header: { position: "relative", padding: "24px 16px 16px" },
  avatar: {
    width: 64, height: 64, borderRadius: 16, objectFit: "cover",
    borderWidth: 2, borderStyle: "solid", borderColor: "var(--bl-border)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)", flexShrink: 0,
  },
  storeName: {
    fontSize: 20, fontWeight: 700, color: "var(--bl-text)",
    fontFamily: "var(--bl-heading-font)", margin: 0,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  storeBio: {
    fontSize: 14, color: "var(--bl-text-muted)", margin: "2px 0 0",
    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  metaRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 6, fontSize: 12, color: "var(--bl-text-muted)" },
  metaItem: { display: "flex", alignItems: "center", gap: 4 },

  // Sticky search + tabs
  stickyBar: {
    position: "sticky", top: 0, zIndex: 10,
    borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "var(--bl-border)",
    padding: "12px 16px 0",
    background: "var(--bl-background)",
  },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: GRAY_400, pointerEvents: "none" },
  searchInput: {
    width: "100%", height: 40, padding: "0 36px", borderRadius: 12,
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--bl-border)",
    background: "var(--bl-surface)", fontSize: 14, color: "var(--bl-text)",
    fontFamily: "inherit",
  },
  searchClear: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", padding: 2,
    display: "flex", alignItems: "center",
  },
  tabsRow: { display: "flex", gap: 4, overflowX: "auto", paddingBottom: 12 },
  tab: {
    flexShrink: 0, padding: "8px 16px", borderRadius: 999,
    fontSize: 14, fontWeight: 500, fontFamily: "inherit",
    borderWidth: 1, borderStyle: "solid", cursor: "pointer",
    transition: "all .2s ease", whiteSpace: "nowrap",
  },

  // Carta
  main: { padding: "0 16px 128px" },
  catTitle: { fontSize: 18, fontWeight: 700, color: "var(--bl-text)", fontFamily: "var(--bl-heading-font)", margin: "0 0 12px" },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 12 },
  emptyWrap: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "64px 0", textAlign: "center", gap: 12,
  },
  emptyCircle: {
    width: 56, height: 56, borderRadius: "50%", background: "var(--bl-surface)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  // Card
  card: {
    display: "flex", gap: 12, background: "var(--bl-surface)",
    borderRadius: 16, padding: 12,
    borderWidth: 1, borderStyle: "solid", borderColor: BORDER_SOFT,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  cardName: {
    fontSize: 14, fontWeight: 600, color: "var(--bl-text)", lineHeight: 1.375, margin: 0,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  cardDesc: {
    fontSize: 12, color: "var(--bl-text-muted)", lineHeight: 1.625, margin: "4px 0 0",
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  thumb: {
    position: "relative", width: 96, height: 96, borderRadius: 12,
    overflow: "hidden", background: SURFACE_DIM,
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  soldOutOverlay: {
    position: "absolute", inset: 0, background: SURFACE_75,
    display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12,
  },
  soldOutText: {
    fontSize: 10, fontWeight: 500, color: "var(--bl-text-muted)",
    textTransform: "uppercase", letterSpacing: "0.05em",
  },
  addBtn: {
    position: "absolute", bottom: -8, right: -8, width: 32, height: 32,
    borderRadius: "50%", border: "none", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.15)",
  },

  // Barra de pedido persistente
  orderBarWrap: {
    position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, zIndex: 20,
    borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--bl-border)",
    background: BG_BLUR_85,
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
  },
  orderBar: {
    width: "100%", maxWidth: 672, margin: "0 auto", height: 52,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", borderRadius: 16, border: "none",
    background: "var(--bl-primary)", color: "#fff",
    fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.15)",
  },
  orderBadge: {
    background: "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 700,
    padding: "2px 8px", borderRadius: 999,
  },
}
