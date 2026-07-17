"use client"

import { Fragment, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import { Building2, MapPin, Phone, Search, X } from "lucide-react"
import type { SectionNode } from "@/lib/page-builder-api"
import { googleFontsHref } from "@/lib/google-fonts"
import { useCartOptional } from "@/lib/cart-context"
import { resolveTokens } from "@/components/storefront-v2/template/tokens"
import {
  SectionRenderer,
  type PriceContext,
  type TemplateProduct,
  type TemplateRendererProps,
} from "@/components/storefront-v2/template/template-renderer"
import { EstatePropertyCard } from "./product-card"
import { ESTATE, ESTATE_STYLES, GRAY, RADIUS, gold, makeFmt, waNumberOf } from "./shared"

// Overlays propios del tema — para registrar junto al renderer en el registry.
export { EstateProductSheet } from "./product-sheet"
export { EstateCartSheet } from "./cart-sheet"

const ALL = "Todos"

/**
 * EstateRenderer — port fiel del tema legacy estate (inmobiliario app-like
 * navy + dorado; spec docs/legacy-theme-specs/estate.md — sin HTML aprobado,
 * manda el React legacy). Renderer custom nivel 2 (patrón persona/poster):
 *
 * - Paleta/tipografías por tokens --bl-* (el seed estate ya es navy/dorado);
 *   hex literales solo los semánticos (WhatsApp, emerald/red de estado).
 * - Árbol de secciones respetado: hero → header navy del asesor ·
 *   categories → sticky search + pills · product_grid → contador + grid de
 *   property cards · resto delegado al catálogo base (SectionRenderer).
 * - Guardadas (bookmarks, NO carrito): save overlay en cards + barra
 *   flotante navy/dorada que abre el EstateCartSheet vía onOpenCart.
 * - Responsive SOLO por container queries (containerName bl-estate).
 */
export function EstateRenderer({
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
  const [selectedCategory, setSelectedCategory] = useState(ALL)

  // Toggle de moneda del comprador (mecánica del renderer base — spec §9.7).
  const canToggleCurrency = rate != null && (store.currency ?? "USD") !== "VES"
  const [showBs, setShowBs] = useState(false)
  const priceCtx: PriceContext =
    canToggleCurrency && showBs
      ? { currency: "VES", convert: (usd) => usd * rate!.valueVes }
      : { currency: store.currency ?? "USD", convert: (n) => n }
  const fmt = useMemo(
    () => makeFmt(priceCtx.currency, priceCtx.convert),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [priceCtx.currency, rate?.valueVes, showBs],
  )

  // Búsqueda por name|description AND filtro por categoría (spec §2/§6).
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
      const matchCat = selectedCategory === ALL || p.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, search, selectedCategory])

  const totalItems = cart?.totalItems ?? cartCount
  const waNumber = waNumberOf(store)

  // ── editor wrap: misma mecánica de selección que el renderer base ────────
  // Sin editor NO se envuelve en div extra: el bloque search+pills es sticky
  // y necesita que su containing block sea el <main>.
  function editorWrap(node: SectionNode, children: ReactNode): ReactNode {
    if (!onSectionClick) return <Fragment key={node.key}>{children}</Fragment>
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

  // ── hero → header navy del asesor (spec §2.1) ────────────────────────────
  function renderHero(node: SectionNode) {
    const name = s(node, "headline") || store.name
    const bio = s(node, "subheadline") || store.bio || ""
    const kicker = s(node, "kicker") || "Asesor inmobiliario"
    const avatar = s(node, "image") || store.avatar || "/placeholder.svg"
    return editorWrap(
      node,
      <header className="bl-estate-pad" style={S.header}>
        <div style={S.headerInner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt={name} style={S.avatar} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={S.storeName}>{name}</h1>
            {bio && <p style={S.storeBio}>{bio}</p>}
            <div style={S.metaRow}>
              <span style={S.metaItem}>
                <Building2 style={S.metaIcon} aria-hidden="true" />
                {products.length} propiedades
              </span>
              <span style={S.metaItem}>
                <MapPin style={S.metaIcon} aria-hidden="true" />
                {kicker}
              </span>
            </div>
          </div>
          {canToggleCurrency && (
            <button
              type="button"
              className="bl-estate-phonebtn"
              onClick={(e) => {
                e.stopPropagation()
                setShowBs((v) => !v)
              }}
              aria-label="Cambiar moneda"
              style={{ ...S.phoneBtn, width: "auto", padding: "0 14px", fontSize: 11, fontWeight: 700, letterSpacing: ".06em" }}
            >
              {showBs ? "Bs" : store.currency ?? "USD"}
            </button>
          )}
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bl-estate-phonebtn"
              aria-label="Contactar"
              style={S.phoneBtn}
              onClick={(e) => e.stopPropagation()}
            >
              <Phone style={{ width: 16, height: 16 }} />
            </a>
          )}
        </div>
      </header>,
    )
  }

  // ── categories → sticky search + pills (spec §2.2) ───────────────────────
  function renderCategories(node: SectionNode) {
    return editorWrap(
      node,
      <div className="bl-estate-pad" style={S.stickyBar}>
        <div style={S.stickyInner}>
          <div style={{ position: "relative" }}>
            <Search style={S.searchIcon} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Buscar por ubicación, tipo..."
              aria-label="Buscar propiedades"
              style={S.searchInput}
            />
            {search && (
              <button
                type="button"
                className="bl-estate-clearbtn"
                onClick={(e) => {
                  e.stopPropagation()
                  setSearch("")
                }}
                aria-label="Limpiar búsqueda"
                style={S.clearBtn}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>

          <div className="bl-estate-hscroll" style={S.pills} role="tablist" aria-label="Categorías">
            {[ALL, ...categories.map((c) => c.name)].map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`bl-estate-pill${active ? " is-active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCategory(cat)
                  }}
                  style={{
                    ...S.pill,
                    ...(active
                      ? { background: ESTATE.navy, color: "#fff", border: "1px solid transparent", boxShadow: "0 1px 2px rgba(0,0,0,.05)" }
                      : { background: GRAY.chip100, color: GRAY.g600, border: `1px solid ${GRAY.border200}` }),
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>,
    )
  }

  // ── product_grid → contador + grid de property cards (spec §2.3/§2.4) ────
  function renderGrid(node: SectionNode) {
    const showPrice = bool(node, "showPrice", true)
    const layout = s(node, "layout", "grid-2")
    const title = s(node, "title")
    const gridClass =
      layout === "list" ? "bl-estate-grid is-list" : layout === "grid-3" ? "bl-estate-grid is-3" : "bl-estate-grid"

    return editorWrap(
      node,
      <>
        {/* Contador de resultados */}
        <div className="bl-estate-pad" style={S.countWrap}>
          <p style={S.count}>
            {title && <span style={{ ...S.countStrong, marginRight: 6 }}>{title} ·</span>}
            <span style={S.countStrong}>{filtered.length}</span>{" "}
            {filtered.length === 1 ? "propiedad" : "propiedades"}
            {selectedCategory !== ALL && <span> en {selectedCategory}</span>}
          </p>
        </div>

        {/* Grid */}
        <section className="bl-estate-pad" style={S.gridSection}>
          <div style={S.maxW}>
            {filtered.length === 0 ? (
              <div style={S.empty}>
                <div style={S.emptyCircle}>
                  <Search style={{ width: 24, height: 24, color: GRAY.g400 }} aria-hidden="true" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 500, color: GRAY.strong }}>Sin resultados</p>
                  <p style={{ margin: "2px 0 0", fontSize: 14, color: GRAY.g500 }}>
                    Probá con otra búsqueda o categoría
                  </p>
                </div>
              </div>
            ) : (
              <div className={gridClass} style={S.grid}>
                {filtered.map((p: TemplateProduct) => (
                  <EstatePropertyCard
                    key={p.id}
                    product={p}
                    fmt={fmt}
                    href={productHref?.(p) ?? null}
                    onOpen={onOpenProduct}
                    showPrice={showPrice}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </>,
    )
  }

  const rootStyle = {
    ...resolved.cssVars,
    background: ESTATE.bg,
    color: ESTATE.text,
    fontFamily: ESTATE.body,
    minHeight: "100dvh",
    overflowX: "clip",
    containerType: "inline-size",
    containerName: "bl-estate",
  } as CSSProperties

  return (
    <main className="bl-estate-root" style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <style dangerouslySetInnerHTML={{ __html: ESTATE_STYLES }} />

      {sections.map((node) => {
        switch (node.type) {
          case "hero":
            return renderHero(node)
          case "categories":
            return renderCategories(node)
          case "product_grid":
            return renderGrid(node)
          default:
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
                priceCtx={priceCtx}
              />,
            )
        }
      })}

      {/* Barra flotante de guardadas (spec §2.5) — trigger del drawer propio */}
      {onOpenCart && totalItems > 0 && (
        <div style={S.floatWrap}>
          <button
            type="button"
            className="bl-estate-floatbar"
            onClick={onOpenCart}
            aria-label={`Ver propiedades guardadas — ${totalItems}`}
            style={S.floatBar}
          >
            <span style={S.floatLeft}>
              <Building2 style={{ width: 20, height: 20 }} aria-hidden="true" />
              <span style={S.floatCount}>{totalItems}</span>
            </span>
            <span>Ver propiedades guardadas</span>
            <span aria-hidden="true" style={{ color: ESTATE.gold }}>
              &rarr;
            </span>
          </button>
        </div>
      )}
    </main>
  )
}

// ── helpers de props de sección (mismo contrato que el renderer base) ───────
function s(section: SectionNode, key: string, fallback = ""): string {
  const v = section.props?.[key]
  return typeof v === "string" ? v : fallback
}

function bool(section: SectionNode, key: string, fallback = false): boolean {
  const v = section.props?.[key]
  return typeof v === "boolean" ? v : fallback
}

const MAXW = 768 // max-w-3xl del legacy

const S: Record<string, CSSProperties> = {
  editorTag: {
    position: "absolute", top: -1, left: 12, transform: "translateY(-100%)",
    background: "var(--brand, #1E3A8A)", color: "#fff", fontFamily: "monospace",
    fontSize: 9, padding: "2px 8px", borderRadius: "4px 4px 0 0",
    letterSpacing: "0.06em", zIndex: 55, pointerEvents: "none",
  },
  // Header navy del asesor
  header: { background: ESTATE.navy, color: "#fff", padding: "16px" },
  headerInner: { maxWidth: MAXW, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 },
  avatar: {
    width: 56, height: 56, borderRadius: 999, objectFit: "cover", flexShrink: 0,
    border: `2px solid ${gold(40)}`,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)",
  },
  storeName: {
    margin: 0, fontSize: 18, fontWeight: 700, fontFamily: ESTATE.heading,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  storeBio: {
    margin: "2px 0 0", fontSize: 14, color: "rgba(255,255,255,.7)",
    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  metaRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontSize: 12, color: "rgba(255,255,255,.5)" },
  metaItem: { display: "inline-flex", alignItems: "center", gap: 4 },
  metaIcon: { width: 12, height: 12, flexShrink: 0 },
  phoneBtn: {
    display: "grid", placeItems: "center", flexShrink: 0,
    width: 40, height: 40, borderRadius: 999, border: "none",
    background: "rgba(255,255,255,.1)", color: "#fff",
    cursor: "pointer", textDecoration: "none", fontFamily: "inherit",
  },
  // Sticky search + pills
  stickyBar: {
    position: "sticky", top: 0, zIndex: 10,
    background: ESTATE.surface,
    borderBottom: `1px solid ${GRAY.border200}`,
    boxShadow: "0 1px 2px rgba(0,0,0,.05)",
    padding: "12px 16px 0",
  },
  stickyInner: { maxWidth: MAXW, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 },
  searchIcon: {
    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
    width: 16, height: 16, color: GRAY.g400, pointerEvents: "none",
  },
  searchInput: {
    width: "100%", height: 40, padding: "0 36px",
    fontSize: 14, fontFamily: "inherit", color: GRAY.strong,
    borderRadius: RADIUS.xl, border: `1px solid ${GRAY.border200}`,
    background: GRAY.input50, outline: "none",
    WebkitAppearance: "none", appearance: "none",
  },
  clearBtn: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    display: "grid", placeItems: "center", padding: 0,
    border: "none", background: "none", color: GRAY.g400, cursor: "pointer",
  },
  pills: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12 },
  pill: {
    flexShrink: 0, padding: "8px 16px", borderRadius: 999,
    fontSize: 14, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
  },
  // Contador
  countWrap: { maxWidth: MAXW, margin: "0 auto", padding: "16px 16px 4px", width: "100%" },
  count: { margin: 0, fontSize: 14, color: GRAY.g500 },
  countStrong: { fontWeight: 600, color: GRAY.strong },
  // Grid
  gridSection: { padding: "0 16px 112px" },
  maxW: { maxWidth: MAXW, margin: "0 auto" },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 16, paddingTop: 8 },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 12, padding: "64px 0", textAlign: "center",
  },
  emptyCircle: {
    display: "grid", placeItems: "center", width: 56, height: 56,
    borderRadius: 999, background: ESTATE.surface, boxShadow: "0 1px 2px rgba(0,0,0,.05)",
  },
  // Barra flotante de guardadas
  floatWrap: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20,
    padding: 16,
    background: "color-mix(in srgb, var(--bl-surface) 90%, transparent)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    borderTop: `1px solid ${GRAY.border200}`,
  },
  floatBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", maxWidth: MAXW, margin: "0 auto", height: 52,
    padding: "0 20px", borderRadius: RADIUS.xxl, border: "none",
    background: ESTATE.navy, color: "#fff",
    fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,.2)",
  },
  floatLeft: { display: "inline-flex", alignItems: "center", gap: 10 },
  floatCount: {
    background: ESTATE.gold, color: ESTATE.navy,
    fontSize: 14, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
  },
}
