"use client"

import { Fragment, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import type { SectionNode } from "@/lib/page-builder-api"
import { googleFontsHref } from "@/lib/google-fonts"
import { useCartOptional } from "@/lib/cart-context"
import { resolveTokens } from "@/components/storefront-v2/template/tokens"
import {
  SectionRenderer,
  type PriceContext,
  type TemplateCategory,
  type TemplateProduct,
  type TemplateRendererProps,
  type TemplateStore,
} from "@/components/storefront-v2/template/template-renderer"
import { catalogFmt } from "./support"

/**
 * CatalogShell — esqueleto compartido de los temas **vitrina** y **luxora**
 * (specs docs/legacy-theme-specs/{vitrina,luxora}.md §2): ambos legacy
 * comparten byte-a-byte la MISMA estructura de página — sidebar sticky
 * desktop (w-72/xl:w-80) con perfil + search + categorías + botón de carrito,
 * header móvil con cover, toolbar sticky móvil, top bar desktop con contador,
 * grid 2/3/4 y barra inferior fija de carrito — pero difieren en cada detalle
 * visual. El shell aporta la estructura, el estado (search/filtro/carrito) y
 * el mapeo del árbol de secciones; cada tema inyecta un `CatalogSkin` con sus
 * estilos y slots de render (patrón profile-theme, parametrizado más fino
 * porque acá las diferencias son visuales, no de copy).
 *
 * Reglas del framework: tokens vía --bl-* (los hex que queden en los skins
 * son identidad documentada de cada spec), responsive SOLO por container
 * query sobre `{prefix}-root` (breakpoint de layout ≈1024px como el `lg` del
 * legacy; NUNCA @media), árbol de secciones respetado + editorWrap.
 *
 * Mapeo de secciones (specs §9):
 * - hero        → perfil del sidebar (ancho) + header móvil con cover.
 * - categories  → alimenta el filtro; si el árbol la trae oculta, se oculta
 *                 el filtro completo (regla vitrina §9).
 * - product_grid → toolbar + top bar + grid (layout/showPrice/filterByCategory).
 * - featured_products → slot opcional del skin (luxora); si el skin no lo
 *                 define, se delega al catálogo base.
 * - resto       → SectionRenderer base, en el orden del árbol.
 *
 * `rate` se acepta por contrato pero no hay toggle de moneda: los legacy no
 * lo tenían (misma decisión que profile-theme).
 */

export interface CatalogCtx {
  store: TemplateStore
  products: TemplateProduct[]
  filtered: TemplateProduct[]
  categories: TemplateCategory[]
  /** ["Todos", ...categorías] — single-select del legacy. */
  allCategories: string[]
  search: string
  setSearch: (v: string) => void
  selectedCategory: string
  setSelectedCategory: (v: string) => void
  fmt: (n: number) => string
  /** Ítems del carrito (cartCount del contrato como fallback sin provider). */
  totalItems: number
  totalPrice: number
  /** true si hay CartProvider montado (tienda/preview; false en editor). */
  hasCart: boolean
  openCart: () => void
  /** Nodo hero visible (props image/kicker/headline/subheadline) o undefined. */
  heroNode?: SectionNode
  /** true si el filtro por categoría debe mostrarse (sección + prop + data). */
  filterEnabled: boolean
  showPrice: boolean
  instagramUrl: string | null
  productHref?: (p: TemplateProduct) => string | null
  onOpenProduct?: (p: TemplateProduct) => void
}

export interface CatalogSkin {
  /** Prefijo de clases y del container ("bl-vitrina" / "bl-luxora"). */
  prefix: string
  /** CSS propio del tema (hovers, animaciones, overrides ≥1024). */
  css: string
  /** Fondo/color/tipografía del root (sobre los tokens ya aplicados). */
  root: CSSProperties
  /** aside sticky: padding, gap, borde derecho. */
  sidebar: CSSProperties
  /** Wrapper sticky del toolbar móvil. */
  toolbar: CSSProperties
  /** Barra de contador desktop. */
  topBar: CSSProperties
  /** <main> del grid (paddings base móvil). */
  gridWrap: CSSProperties
  /** Grid (gaps base; columnas las pone el CSS del shell). */
  grid: CSSProperties
  /** Wrapper fijo inferior móvil (solo se monta con items). */
  bottomBar: CSSProperties
  renderSidebarProfile(ctx: CatalogCtx): ReactNode
  renderSearch(ctx: CatalogCtx): ReactNode
  renderCategoryList(ctx: CatalogCtx): ReactNode
  /** Botones al fondo del sidebar (carrito). */
  renderSidebarFooter(ctx: CatalogCtx): ReactNode
  renderMobileHeader(ctx: CatalogCtx): ReactNode
  /** Contenido del toolbar sticky móvil (search/contador/pills según tema). */
  renderToolbar(ctx: CatalogCtx): ReactNode
  /** Texto del top bar desktop ("N productos" | "N {categoría}"). */
  renderCounter(ctx: CatalogCtx): ReactNode
  renderCard(p: TemplateProduct, ctx: CatalogCtx): ReactNode
  renderEmpty(ctx: CatalogCtx): ReactNode
  /** Contenido de la barra inferior fija (botón "Ver carrito · total"). */
  renderBottomBar(ctx: CatalogCtx): ReactNode
  /** Franja de destacados (luxora); sin definir → SectionRenderer base. */
  renderFeatured?(node: SectionNode, ctx: CatalogCtx): ReactNode
  /**
   * Footer temático compacto (redes + tagline + marca). El legacy de estos
   * temas NO tenía footer en móvil (las redes vivían en el sidebar), así que
   * las secciones socials/footer del árbol se funden acá en un solo bloque
   * en el lenguaje del tema en vez de dos bloques genéricos. `kind` distingue
   * qué sección disparó el render para respetar visibilidad por sección.
   * Sin definir → SectionRenderer base.
   */
  renderFooter?(ctx: CatalogCtx, footerNode?: SectionNode, socialsNode?: SectionNode): ReactNode
}

// ── helpers de props de sección (mismo contrato que el renderer base) ────────
export function sProp(section: SectionNode | undefined, key: string, fallback = ""): string {
  const v = section?.props?.[key]
  return typeof v === "string" ? v : fallback
}

export function boolProp(section: SectionNode | undefined, key: string, fallback = false): boolean {
  const v = section?.props?.[key]
  return typeof v === "boolean" ? v : fallback
}

export function CatalogShell({
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
  skin,
}: TemplateRendererProps & { skin: CatalogSkin }) {
  const p = skin.prefix
  const resolved = resolveTokens(theme.tokens)
  const rawSections = theme.tree?.sections ?? []
  const sections = rawSections.filter((s) => s.visible !== false)
  const cart = useCartOptional()

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const heroNode = sections.find((s) => s.type === "hero")
  const gridNode = sections.find((s) => s.type === "product_grid")
  // La sección categories puede existir y estar OCULTA → apaga el filtro
  // (vitrina §9). Si el árbol no la trae, el filtro es parte del diseño.
  const categoriesNode = rawSections.find((s) => s.type === "categories")
  const categoriesVisible = categoriesNode ? categoriesNode.visible !== false : true

  const allCategories = useMemo(
    () => ["Todos", ...categories.map((c) => c.name)],
    [categories],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((pr) => {
      const matchSearch =
        !q ||
        pr.name.toLowerCase().includes(q) ||
        (pr.description ?? "").toLowerCase().includes(q)
      const matchCat = selectedCategory === "Todos" || pr.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, search, selectedCategory])

  const fmt = useMemo(() => catalogFmt(store.currency), [store.currency])

  const filterEnabled =
    categoriesVisible && boolProp(gridNode, "filterByCategory", true) && categories.length > 0
  const showPrice = boolProp(gridNode, "showPrice", true)

  const instagramUrl =
    store.socials?.find((s) => /^ig$|insta/i.test(s.platform))?.url ?? null

  const ctx: CatalogCtx = {
    store,
    products,
    filtered,
    categories,
    allCategories,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    fmt,
    totalItems: cart?.totalItems ?? cartCount,
    totalPrice: cart?.totalPrice ?? 0,
    hasCart: cart != null,
    openCart: () => onOpenCart?.(),
    heroNode,
    filterEnabled,
    showPrice,
    instagramUrl,
    productHref,
    onOpenProduct,
  }

  // ── editor wrap: misma mecánica de selección que el renderer base ─────────
  function editorWrap(node: SectionNode | undefined, children: ReactNode, keySuffix = ""): ReactNode {
    if (!node) return children
    if (!onSectionClick) return <Fragment key={node.key + keySuffix}>{children}</Fragment>
    const isSelected = editorSelectedKey === node.key
    return (
      <div
        key={node.key + keySuffix}
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
        {isSelected && <div style={SHELL_S.editorTag}>{node.type.toUpperCase()}</div>}
        {children}
      </div>
    )
  }

  const priceCtx: PriceContext = {
    currency: store.currency ?? "USD",
    convert: (n) => n,
  }

  const delegate = (node: SectionNode) =>
    editorWrap(
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

  const grid = editorWrap(
    gridNode,
    <main className={`${p}-gridwrap`} style={skin.gridWrap}>
      {filtered.length === 0 ? (
        skin.renderEmpty(ctx)
      ) : (
        <div
          className={`${p}-grid`}
          data-cols={gridLayoutCols(sProp(gridNode, "layout", "grid-4"))}
          style={skin.grid}
        >
          {filtered.map((pr) => (
            <Fragment key={pr.id}>{skin.renderCard(pr, ctx)}</Fragment>
          ))}
        </div>
      )}
    </main>,
  )

  const rootStyle = {
    ...resolved.cssVars,
    minHeight: "100vh",
    fontFamily: "var(--bl-body-font)",
    containerType: "inline-size",
    containerName: `${p}-root`,
    ...skin.root,
  } as CSSProperties

  return (
    <div className={`${p}-root`} style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <style dangerouslySetInnerHTML={{ __html: shellCss(p) + skin.css }} />

      <div className={`${p}-frame`}>
        {/* ── Sidebar desktop (≥1024 del contenedor) ── */}
        <aside className={`${p}-sidebar`} style={skin.sidebar}>
          {editorWrap(heroNode, skin.renderSidebarProfile(ctx), "-sidebar")}
          {skin.renderSearch(ctx)}
          {filterEnabled &&
            editorWrap(categoriesNode?.visible !== false ? categoriesNode : undefined, skin.renderCategoryList(ctx), "-sidebar")}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {skin.renderSidebarFooter(ctx)}
          </div>
        </aside>

        {/* ── Columna principal ── */}
        <div className={`${p}-main`}>
          <div className={`${p}-mobile-only`} style={{ display: "block" }}>
            {editorWrap(heroNode, skin.renderMobileHeader(ctx), "-mobile")}
          </div>

          {/* Toolbar sticky móvil (search/contador + pills) */}
          <div className={`${p}-mobile-only`} style={{ ...skin.toolbar, position: "sticky", top: 0, zIndex: 10 }}>
            {categoriesNode && categoriesNode.visible !== false
              ? editorWrap(categoriesNode, skin.renderToolbar(ctx), "-toolbar")
              : skin.renderToolbar(ctx)}
          </div>

          {/* Top bar desktop */}
          <div className={`${p}-desktop-only`} style={skin.topBar}>
            {skin.renderCounter(ctx)}
          </div>

          {/* Secciones en orden de árbol: grid propia, featured del skin,
              hero/categories ya colocadas, socials+footer fundidas en el
              footer del tema, resto al catálogo base. */}
          {(() => {
            const socialsNode = sections.find((n) => n.type === "socials" && n.visible !== false)
            const footerNode = sections.find((n) => n.type === "footer" && n.visible !== false)
            // El footer del tema se dibuja una sola vez, en la posición de la
            // primera de las dos secciones (socials/footer) que aparezca.
            const footerAnchorKey =
              skin.renderFooter && (socialsNode || footerNode)
                ? sections.find((n) => n.type === "socials" || n.type === "footer")?.key
                : undefined

            return sections.map((node) => {
              switch (node.type) {
                case "hero":
                case "categories":
                  return null
                case "product_grid":
                  return <Fragment key={node.key}>{grid}</Fragment>
                case "featured_products":
                  return skin.renderFeatured ? (
                    <Fragment key={node.key}>{editorWrap(node, skin.renderFeatured(node, ctx))}</Fragment>
                  ) : (
                    <Fragment key={node.key}>{delegate(node)}</Fragment>
                  )
                case "socials":
                case "footer":
                  if (!skin.renderFooter) return <Fragment key={node.key}>{delegate(node)}</Fragment>
                  // Solo el ancla dibuja; la otra sección se absorbe.
                  return node.key === footerAnchorKey ? (
                    <Fragment key={node.key}>{skin.renderFooter(ctx, footerNode, socialsNode)}</Fragment>
                  ) : null
                default:
                  return <Fragment key={node.key}>{delegate(node)}</Fragment>
              }
            })
          })()}
        </div>
      </div>

      {/* ── Barra inferior fija móvil (solo con items) ── */}
      {ctx.totalItems > 0 && (
        <div className={`${p}-mobile-only`} style={{ ...skin.bottomBar, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30 }}>
          {skin.renderBottomBar(ctx)}
        </div>
      )}
      {/* rate aceptada por contrato; estos temas no exponen toggle de moneda */}
      {rate ? null : null}
    </div>
  )
}

/** layout de la sección → tope de columnas del grid (2 base del legacy). */
function gridLayoutCols(layout: string): number {
  if (layout === "grid-2") return 2
  if (layout === "grid-3") return 3
  return 4
}

/**
 * CSS estructural del shell. Breakpoint único de layout: 1024px del
 * CONTENEDOR (el `lg` del legacy) + 1280px (xl) para sidebar ancho y 4 cols.
 */
function shellCss(p: string): string {
  return `
.${p}-frame { display: block; }
.${p}-sidebar { display: none; }
.${p}-desktop-only { display: none !important; }
.${p}-main { flex: 1; min-width: 0; max-width: 512px; margin: 0 auto; width: 100%; }
.${p}-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.${p}-pills { display: flex; overflow-x: auto; scrollbar-width: none; }
.${p}-pills::-webkit-scrollbar { display: none; }
.${p}-thumbs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
/* Padding inferior para que el footer no quede tapado por el cart bar fijo
   (solo existe en móvil); en desktop el carrito vive en el sidebar. */
.${p}-footer { padding-bottom: 108px; }
@container ${p}-root (min-width: 1024px) {
  .${p}-footer { padding-bottom: 40px; }
  .${p}-frame { display: flex; max-width: 1280px; margin: 0 auto; }
  .${p}-sidebar {
    display: flex; flex-direction: column; flex-shrink: 0;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
    width: 288px;
  }
  .${p}-desktop-only { display: flex !important; }
  .${p}-mobile-only { display: none !important; }
  .${p}-main { max-width: none; margin: 0; }
  .${p}-grid[data-cols="3"], .${p}-grid[data-cols="4"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@container ${p}-root (min-width: 1280px) {
  .${p}-sidebar { width: 320px; }
  .${p}-grid[data-cols="4"] { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
`
}

const SHELL_S: Record<string, CSSProperties> = {
  editorTag: {
    position: "absolute", top: -1, left: 12, transform: "translateY(-100%)",
    background: "var(--brand, #1E3A8A)", color: "#fff", fontFamily: "monospace",
    fontSize: 9, padding: "2px 8px", borderRadius: "4px 4px 0 0",
    letterSpacing: "0.06em", zIndex: 5, pointerEvents: "none",
  },
}
