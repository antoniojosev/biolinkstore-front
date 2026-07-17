"use client"

import {
  Fragment,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react"
import { Check, ChevronRight, Instagram, Plus, Search, Share2, ShoppingBag, X } from "lucide-react"
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
  Hairline,
  NOIR,
  NOIR_STYLES,
  bgA,
  fmtNoirPrice,
  goldA,
  ink,
  noirDiscount,
  noirInStock,
  noirSerifHref,
  textA,
  useNoirShare,
} from "./shared"

// Overlays propios del tema — para registrar junto al renderer en el registry.
export { NoirProductSheet } from "./product-sheet"
export { NoirCartSheet } from "./cart-sheet"

/**
 * NoirRenderer — port fiel del tema legacy noir (boutique editorial nocturna,
 * spec docs/legacy-theme-specs/noir.md; sin HTML de referencia — el legacy
 * React es la única fuente). Renderer custom nivel 2 (patrón persona/poster):
 *
 * - Paleta por tokens --bl-* (seed noir = #0A0A0A/#C9A86C); grises legacy
 *   derivados con color-mix (shared.tsx) para que los presets funcionen.
 * - Layout dual: sidebar sticky desktop ⇄ header cinemático 65vh mobile,
 *   por container query (bl-noir, breakpoint 1024px) — nunca @media.
 * - Grid editorial: featured full-width 4/3 · pares 3/4 sin gap, bordes
 *   #141414 y hairlines doradas. featured_main (productIds) suma productos
 *   al flag featured.
 * - Árbol respetado: hero → sidebar/header · product_grid → toolbar sticky +
 *   grid · stats → strip · socials/footer → SectionRenderer (commodity).
 * - Wishlist legacy OMITIDA (no existe en storefront-v2).
 */
export function NoirRenderer({
  store,
  products,
  categories,
  theme,
  onOpenProduct,
  productHref,
  cartCount = 0,
  onOpenCart,
  editorSelectedKey,
  onSectionClick,
}: TemplateRendererProps) {
  const resolved = resolveTokens(theme.tokens)
  const sections = (theme.tree?.sections ?? []).filter((s) => s.visible !== false)
  const cart = useCartOptional()

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchOpen, setSearchOpen] = useState(false)

  const currency = store.currency ?? "USD"
  const fmt = (n: number) => fmtNoirPrice(n, currency)

  const heroNode = sections.find((s) => s.type === "hero")
  const gridNode = sections.find((s) => s.type === "product_grid")
  const featuredNode = sections.find((s) => s.type === "featured_products")
  const showPrice = bool(gridNode, "showPrice", true)

  // featured_main define qué productos van full-width además del flag featured.
  const featuredIds = useMemo(() => {
    const set = new Set<string>()
    const items = featuredNode?.props?.productIds
    if (Array.isArray(items)) {
      for (const it of items) {
        if (typeof it === "string") set.add(it)
        else if (it && typeof it === "object" && typeof (it as { id?: unknown }).id === "string") {
          set.add((it as { id: string }).id)
        }
      }
    }
    return set
  }, [featuredNode])

  const isFeatured = (p: TemplateProduct) => Boolean(p.featured) || featuredIds.has(p.id)

  const allCategories = useMemo(() => ["Todos", ...categories.map((c) => c.name)], [categories])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
      const matchCat = selectedCategory === "Todos" || p.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, search, selectedCategory])

  // Algoritmo del feed legacy (index.tsx L52-76): featured → fila full-width;
  // no-featured → pares de a 2 (o suelto a 1 col).
  type GridRow = { type: "featured"; product: TemplateProduct } | { type: "pair"; products: TemplateProduct[] }
  const gridRows: GridRow[] = useMemo(() => {
    const result: GridRow[] = []
    let i = 0
    while (i < filtered.length) {
      const product = filtered[i]
      if (isFeatured(product)) {
        result.push({ type: "featured", product })
        i++
      } else {
        const next = filtered[i + 1]
        if (next && !isFeatured(next)) {
          result.push({ type: "pair", products: [product, next] })
          i += 2
        } else {
          result.push({ type: "pair", products: [product] })
          i++
        }
      }
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, featuredIds])

  const totalItems = cart?.totalItems ?? cartCount
  const totalPrice = cart?.totalPrice ?? 0

  function openCart() {
    if (onOpenCart) onOpenCart()
    else cart?.setIsOpen(true)
  }

  const instagramUrl = store.socials?.find((s) => /^ig$|insta/i.test(s.platform))?.url ?? null
  const avatar = store.avatar ?? "/placeholder.svg"
  const cover = heroNode ? s(heroNode, "image") : ""
  const kicker = heroNode ? s(heroNode, "kicker") : ""
  const headline = (heroNode && s(heroNode, "headline")) || store.name
  const bio = (heroNode && s(heroNode, "subheadline")) || store.bio || ""

  // Mismo patrón de selección del editor que poster: sin editor NO se
  // envuelve (Fragment) — el toolbar sticky necesita al feed como containing
  // block para no des-pegarse.
  function editorWrap(node: SectionNode, children: ReactNode, keySuffix = ""): ReactNode {
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
        {isSelected && <div style={S.editorTag}>{node.type.toUpperCase()}</div>}
        {children}
      </div>
    )
  }

  // ── bloques compartidos ────────────────────────────────────────────────────

  const statsStrip = (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span style={S.statText}>
        <span style={{ color: NOIR.text, fontWeight: 300 }}>{products.length}</span> piezas
      </span>
      <span aria-hidden="true" style={{ width: 1, height: 12, background: ink(19) }} />
      <span style={S.statText}>
        <span style={{ color: NOIR.text, fontWeight: 300 }}>{categories.length}</span>{" "}
        {categories.length === 1 ? "categoría" : "categorías"}
      </span>
    </div>
  )

  const goldCartButton = (
    <button type="button" className="bl-noir-goldbtn" onClick={openCart} style={S.goldCartBtn}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ShoppingBag size={16} aria-hidden="true" />
        <span style={{ color: bgA(60), fontSize: 12 }}>
          {totalItems > 0 ? `${totalItems} ${totalItems === 1 ? "pieza" : "piezas"}` : "Carrito vacío"}
        </span>
      </span>
      {totalItems > 0 && (
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span>{fmt(totalPrice)}</span>
          <ChevronRight size={16} aria-hidden="true" />
        </span>
      )}
    </button>
  )

  // ── Sidebar desktop (spec §2.1) ────────────────────────────────────────────
  function renderSidebar(node: SectionNode) {
    const content = (
      <div style={S.sidebarInner}>
        {cover ? (
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "16/9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={store.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${bgA(70)}, transparent)` }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
              <h1 style={{ ...S.storeName, fontSize: 20 }}>{headline}</h1>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {store.avatar && (
              <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: `1px solid ${goldA(30)}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={store.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div>
              <h1 style={{ ...S.storeName, fontSize: 20 }}>{headline}</h1>
              {store.username && <p style={S.username}>{store.username}</p>}
            </div>
          </div>
        )}

        {bio && <p style={S.sidebarBio}>{bio}</p>}

        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bl-noir-mutedbtn"
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: ink(33), textDecoration: "none", fontFamily: NOIR.sans }}
          >
            <Instagram size={16} aria-hidden="true" />
            Instagram
          </a>
        )}

        {statsStrip}

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={14} style={S.searchIcon} aria-hidden="true" />
          <input
            className="bl-noir-search"
            placeholder="Buscar piezas..."
            aria-label="Buscar piezas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={S.sidebarSearch}
          />
          {search && (
            <button
              type="button"
              className="bl-noir-mutedbtn"
              onClick={() => setSearch("")}
              aria-label="Limpiar búsqueda"
              style={S.searchClear}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categorías verticales */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p style={S.catListLabel}>Categorías</p>
          {allCategories.map((cat) => {
            const active = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                className={active ? undefined : "bl-noir-mutedbtn"}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...S.catListBtn,
                  color: active ? NOIR.gold : ink(33),
                  borderBottomColor: active ? goldA(30) : NOIR.surfaceDeep,
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Carrito dorado — Favoritos legacy omitido (wishlist no existe en v2) */}
        <div style={{ marginTop: "auto", paddingTop: 24 }}>{goldCartButton}</div>
      </div>
    )
    return (
      <aside key={`${node.key}-sidebar`} className="bl-noir-sidebar" style={S.sidebar}>
        {editorWrap(node, content, "-sidebar")}
      </aside>
    )
  }

  // ── Header cinemático mobile (spec §2.2) ───────────────────────────────────
  function renderMobileHeader(node: SectionNode) {
    return editorWrap(
      node,
      <header className="bl-noir-mobile-header" style={S.mobileHeader}>
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={cover} alt={store.name} style={S.mobileCover} />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, var(--bl-background) 0%, var(--bl-border) 40%, ${NOIR.surfaceDeep} 100%)`,
            }}
          />
        )}

        {/* Overlays multicapa */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${bgA(30)}, transparent, var(--bl-background))` }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${bgA(50)}, transparent, transparent)` }} />

        {/* Nav superpuesto — carrito a la IZQUIERDA */}
        <div style={S.mobileNav}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              openCart()
            }}
            aria-label={`Abrir carrito${totalItems > 0 ? ` (${totalItems})` : ""}`}
            style={{ ...S.iconGhostBtn, position: "relative" }}
          >
            <ShoppingBag size={20} aria-hidden="true" />
            {totalItems > 0 && <span style={S.goldBadge}>{totalItems}</span>}
          </button>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              onClick={(e) => e.stopPropagation()}
              style={{ ...S.iconGhostBtn, color: textA(60) }}
            >
              <Instagram size={20} aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Identidad abajo */}
        <div style={S.mobileIdentity}>
          {store.avatar && (
            <div style={{ marginBottom: 16, width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: `1px solid ${goldA(30)}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt={store.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          {kicker && <p style={{ ...S.username, marginBottom: 6 }}>{kicker}</p>}
          <h1 style={{ ...S.storeName, fontSize: 36 }}>{headline}</h1>
          {store.username && <p style={{ ...S.username, marginTop: 8 }}>{store.username}</p>}
          {bio && <p style={S.mobileBio}>{bio}</p>}
          <div style={{ marginTop: 16 }}>{statsStrip}</div>
        </div>
      </header>,
      "-header",
    )
  }

  // ── Toolbar sticky + grid editorial (spec §2.3–2.4) ────────────────────────
  function renderGrid(node: SectionNode) {
    return editorWrap(
      node,
      <>
        <div style={S.toolbar}>
          {/* Fila 1 — tabs de categoría scrolleables */}
          <div className="bl-noir-tabs" style={S.tabsRow}>
            {allCategories.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  className={active ? undefined : "bl-noir-mutedbtn"}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCategory(cat)
                  }}
                  style={{
                    ...S.tab,
                    color: active ? NOIR.gold : ink(33),
                    borderBottomColor: active ? NOIR.gold : "transparent",
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Fila 2 — contador / search inline */}
          <div style={S.countRow}>
            {searchOpen ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                <Search size={14} style={{ color: ink(33), flexShrink: 0 }} aria-hidden="true" />
                <input
                  autoFocus
                  className="bl-noir-search"
                  placeholder="Buscar piezas..."
                  aria-label="Buscar piezas"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={S.inlineSearch}
                />
                <button
                  type="button"
                  className="bl-noir-mutedbtn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearchOpen(false)
                    setSearch("")
                  }}
                  aria-label="Cerrar búsqueda"
                  style={{ ...S.iconGhostBtn, color: ink(33) }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <p style={S.countText}>
                  {filtered.length} {filtered.length === 1 ? "pieza" : "piezas"}
                </p>
                <button
                  type="button"
                  className="bl-noir-mutedbtn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearchOpen(true)
                  }}
                  aria-label="Buscar"
                  style={{ ...S.iconGhostBtn, color: ink(33) }}
                >
                  <Search size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Grid editorial featured/pares */}
        <main className="bl-noir-main">
          {filtered.length === 0 ? (
            <div style={S.emptyWrap}>
              <div aria-hidden="true" style={S.emptySymbol}>∅</div>
              <div>
                <p style={S.emptyTitle}>Sin resultados</p>
                <p style={S.emptyHint}>Intenta otra búsqueda</p>
              </div>
            </div>
          ) : (
            <div>
              {gridRows.map((row, idx) =>
                row.type === "featured" ? (
                  <div key={`featured-${row.product.id}`} style={{ borderBottom: `1px solid ${NOIR.borderGrid}` }}>
                    <NoirProductCard
                      product={row.product}
                      fmt={fmt}
                      featuredSlot
                      showPrice={showPrice}
                      storeSlug={store.slug}
                      href={productHref?.(row.product) ?? null}
                      onOpen={onOpenProduct}
                      cart={cart}
                      openCart={openCart}
                    />
                    <Hairline variant="soft" />
                  </div>
                ) : (
                  <div
                    key={`pair-${idx}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: row.products.length === 2 ? "1fr 1fr" : "1fr",
                      borderBottom: `1px solid ${NOIR.borderGrid}`,
                    }}
                  >
                    {row.products.map((product, pIdx) => (
                      <div
                        key={product.id}
                        style={pIdx === 0 && row.products.length === 2 ? { borderRight: `1px solid ${NOIR.borderGrid}` } : undefined}
                      >
                        <NoirProductCard
                          product={product}
                          fmt={fmt}
                          markFeatured={isFeatured(product)}
                          showPrice={showPrice}
                          storeSlug={store.slug}
                          href={productHref?.(product) ?? null}
                          onOpen={onOpenProduct}
                          cart={cart}
                          openCart={openCart}
                        />
                      </div>
                    ))}
                  </div>
                ),
              )}
            </div>
          )}
        </main>
      </>,
    )
  }

  // ── Stats strip (sección seed, decisión nueva — spec §8) ──────────────────
  function renderStats(node: SectionNode) {
    const items = arr<{ value?: string; label?: string }>(node, "items")
    if (items.length === 0) return null
    return editorWrap(
      node,
      <div style={S.statsSection}>
        {items.map((it, i) => (
          <Fragment key={i}>
            {i > 0 && <span aria-hidden="true" style={{ width: 1, height: 24, background: ink(19) }} />}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: NOIR.serif, fontStyle: "italic", fontWeight: 300, fontSize: 24, color: NOIR.text }}>
                {it.value}
              </div>
              <div style={{ ...S.statText, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 10 }}>
                {it.label}
              </div>
            </div>
          </Fragment>
        ))}
      </div>,
    )
  }

  const rootStyle = {
    ...resolved.cssVars,
    background: "var(--bl-background)",
    color: "var(--bl-text)",
    fontFamily: NOIR.sans,
    minHeight: "100vh",
    containerType: "inline-size",
    containerName: "bl-noir",
  } as CSSProperties

  return (
    <div style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      {/* Serifa light/italic — sello del tema, googleFontsHref no trae ital */}
      <link rel="stylesheet" precedence="default" href={noirSerifHref(resolved.headingFontName)} />
      <style dangerouslySetInnerHTML={{ __html: NOIR_STYLES }} />

      <div className="bl-noir-layout">
        {heroNode && renderSidebar(heroNode)}

        <div className="bl-noir-feed">
          {sections.map((node) => {
            switch (node.type) {
              case "hero":
                return renderMobileHeader(node)
              case "featured_products":
                // Config-only: alimenta featuredIds del grid (spec §9), sin bloque propio.
                return null
              case "product_grid":
                return renderGrid(node)
              case "stats":
                return renderStats(node)
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
                    priceCtx={{ currency, convert: (n) => n }}
                  />,
                )
            }
          })}
        </div>
      </div>

      {/* Cart bar sticky mobile — solo con items (spec §2.5) */}
      {totalItems > 0 && (
        <div className="bl-noir-cartbar" style={S.cartBarWrap}>
          {goldCartButton}
        </div>
      )}
    </div>
  )
}

// ─── Product card — full-bleed sobre gradiente (spec §3) ─────────────────────

function NoirProductCard({
  product,
  fmt,
  featuredSlot = false,
  markFeatured = false,
  showPrice,
  storeSlug,
  href,
  onOpen,
  cart,
  openCart,
}: {
  product: TemplateProduct
  fmt: (n: number) => string
  /** Pintada en la fila full-width (aspect 4/3). */
  featuredSlot?: boolean
  /** Featured pero en slot normal → "✦ Destacado". */
  markFeatured?: boolean
  showPrice: boolean
  storeSlug: string
  href: string | null
  onOpen?: (p: TemplateProduct) => void
  cart: ReturnType<typeof useCartOptional>
  openCart: () => void
}) {
  const [added, setAdded] = useState(false)
  const { share, copied } = useNoirShare()
  const inStock = noirInStock(product)
  const image = product.images?.[0] ?? product.image ?? "/placeholder.svg"
  const discount = noirDiscount(product.price, product.compareAtPrice)

  function handleShare(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const url = product.slug
      ? `${window.location.origin}/${storeSlug}/${product.slug}`
      : window.location.href
    void share(url, product.name)
  }

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
    openCart()
    setTimeout(() => setAdded(false), 1800)
  }

  const card = (
    <div
      className="bl-noir-card"
      style={{ position: "relative", overflow: "hidden", aspectRatio: featuredSlot ? "4/3" : "3/4" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={product.name}
        className="bl-noir-card-img"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Gradiente inferior */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "75%",
          background: `linear-gradient(to top, var(--bl-background), ${bgA(60)}, transparent)`,
        }}
      />

      {/* Agotado */}
      {!inStock && (
        <div style={C.soldOut}>
          <span style={C.soldOutText}>Agotado</span>
        </div>
      )}

      {/* Top-right: share on hover (wishlist legacy omitida) */}
      <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
        <button
          type="button"
          className="bl-noir-reveal"
          onClick={handleShare}
          aria-label="Compartir"
          style={C.roundGhost}
        >
          {copied ? (
            <Check size={12} strokeWidth={2.5} style={{ color: NOIR.gold }} />
          ) : (
            <Share2 size={12} strokeWidth={1.5} style={{ color: ink(55) }} />
          )}
        </button>
      </div>

      {/* Top-left: badges */}
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        {discount != null && <span style={C.discountBadge}>-{discount}%</span>}
        {markFeatured && !featuredSlot && <span style={C.featuredMark}>✦ Destacado</span>}
      </div>

      {/* Info flotada */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 12 }}>
        <p style={C.name}>{product.name}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {showPrice ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={C.price}>{fmt(product.price)}</span>
              {product.compareAtPrice != null && product.compareAtPrice > product.price && (
                <span style={C.compare}>{fmt(product.compareAtPrice)}</span>
              )}
            </div>
          ) : (
            <span />
          )}

          {inStock && (
            <button
              type="button"
              className={added ? undefined : "bl-noir-reveal"}
              onClick={handleAdd}
              aria-label="Agregar al carrito"
              style={{
                ...C.quickAdd,
                ...(added
                  ? { background: NOIR.gold, borderColor: NOIR.gold, color: "var(--bl-background)", transform: "scale(1.1)" }
                  : { borderColor: ink(19), color: ink(55) }),
              }}
            >
              {added ? <Check size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2} />}
            </button>
          )}
        </div>
      </div>
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
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          onOpen(product)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onOpen(product)
        }}
        style={{ cursor: "pointer" }}
      >
        {card}
      </div>
    )
  }
  return card
}

// ─── helpers de props de sección (mismo contrato que el renderer base) ───────

function s(section: SectionNode | undefined, key: string, fallback = ""): string {
  const v = section?.props?.[key]
  return typeof v === "string" ? v : fallback
}

function bool(section: SectionNode | undefined, key: string, fallback = false): boolean {
  const v = section?.props?.[key]
  return typeof v === "boolean" ? v : fallback
}

function arr<T = unknown>(section: SectionNode, key: string): T[] {
  const v = section.props?.[key]
  return Array.isArray(v) ? (v as T[]) : []
}

// ─── estilos ──────────────────────────────────────────────────────────────────

const LABEL_10: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  fontFamily: NOIR.sans,
}

const S: Record<string, CSSProperties> = {
  editorTag: {
    position: "absolute", top: -1, left: 12, transform: "translateY(-100%)",
    background: "var(--brand, #1E3A8A)", color: "#fff", fontFamily: "monospace",
    fontSize: 9, padding: "2px 8px", borderRadius: "4px 4px 0 0",
    letterSpacing: "0.06em", zIndex: 30, pointerEvents: "none",
  },

  // Sidebar
  sidebar: {
    width: 288,
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    borderRight: "1px solid var(--bl-border)",
  },
  sidebarInner: {
    display: "flex", flexDirection: "column", gap: 24,
    padding: 28, minHeight: "100%",
  },
  storeName: {
    fontFamily: NOIR.serif, fontWeight: 300, fontStyle: "italic",
    color: NOIR.text, letterSpacing: "0.025em", lineHeight: 1.2, margin: 0,
  },
  username: { ...LABEL_10, fontSize: 11, color: NOIR.gold, margin: 0 },
  sidebarBio: {
    fontSize: 14, color: ink(40), lineHeight: 1.625,
    fontFamily: NOIR.sans, fontWeight: 300, margin: "-8px 0 0",
  },
  statText: { fontSize: 12, color: ink(33), letterSpacing: "0.025em", fontFamily: NOIR.sans },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: ink(33), pointerEvents: "none" },
  sidebarSearch: {
    width: "100%", height: 36, padding: "0 32px",
    background: NOIR.surfaceDeep, border: "1px solid var(--bl-border)",
    borderRadius: 8, fontSize: 14, color: NOIR.text,
    fontFamily: NOIR.sans, fontWeight: 300,
  },
  searchClear: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", padding: 2,
    display: "flex", alignItems: "center", color: ink(33),
  },
  catListLabel: {
    fontSize: 10, fontWeight: 600, color: ink(19),
    textTransform: "uppercase", letterSpacing: "0.2em",
    fontFamily: NOIR.sans, margin: "0 0 8px",
  },
  catListBtn: {
    textAlign: "left", padding: "8px 12px", fontSize: 12,
    letterSpacing: "0.12em", textTransform: "uppercase",
    background: "none", border: "none", cursor: "pointer",
    borderBottom: "1px solid", fontFamily: NOIR.sans,
    transition: "all .2s ease",
  },
  goldCartBtn: {
    position: "relative", width: "100%", height: 48,
    background: NOIR.gold, color: "var(--bl-background)",
    borderRadius: 2, border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: 14, fontFamily: NOIR.sans,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", letterSpacing: "0.025em",
  },

  // Header cinemático
  mobileHeader: {
    position: "relative", height: "65vh", width: "100%",
    overflow: "hidden", background: NOIR.surfaceDeep,
  },
  mobileCover: {
    position: "absolute", inset: 0, width: "100%", height: "100%",
    objectFit: "cover", transform: "scale(1.05)",
  },
  mobileNav: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "40px 20px 0",
  },
  iconGhostBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 0,
    color: textA(80), display: "flex", alignItems: "center",
  },
  goldBadge: {
    position: "absolute", top: -6, right: -6,
    width: 16, height: 16, borderRadius: "50%",
    background: NOIR.gold, color: "var(--bl-background)",
    fontSize: 9, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  mobileIdentity: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 32px" },
  mobileBio: {
    fontSize: 14, color: ink(55), marginTop: 12, lineHeight: 1.625,
    maxWidth: 320, fontFamily: NOIR.sans, fontWeight: 300,
  },

  // Toolbar sticky
  toolbar: {
    position: "sticky", top: 0, zIndex: 20,
    background: bgA(95),
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--bl-border)",
  },
  tabsRow: {
    display: "flex", overflowX: "auto",
    borderBottom: `1px solid ${NOIR.borderGrid}`,
  },
  tab: {
    flexShrink: 0, padding: "14px 20px", fontSize: 12,
    letterSpacing: "0.15em", textTransform: "uppercase",
    background: "none", border: "none", borderBottom: "2px solid",
    cursor: "pointer", fontFamily: NOIR.sans, transition: "all .2s ease",
    whiteSpace: "nowrap",
  },
  countRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 20px", minHeight: 44,
  },
  countText: {
    fontSize: 12, color: ink(33), letterSpacing: "0.1em",
    textTransform: "uppercase", fontFamily: NOIR.sans, margin: 0,
  },
  inlineSearch: {
    flex: 1, background: "transparent", border: "none",
    color: NOIR.text, fontSize: 14, fontFamily: NOIR.sans, fontWeight: 300,
  },

  // Empty state
  emptyWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "96px 0", textAlign: "center", gap: 16,
  },
  emptySymbol: {
    fontSize: 48, color: "var(--bl-border)", userSelect: "none",
    fontFamily: NOIR.serif, fontWeight: 300, fontStyle: "italic",
  },
  emptyTitle: {
    fontFamily: NOIR.serif, color: NOIR.text, fontSize: 18,
    fontWeight: 300, fontStyle: "italic", margin: 0,
  },
  emptyHint: {
    fontSize: 12, color: ink(26), marginTop: 8, letterSpacing: "0.1em",
    textTransform: "uppercase", fontFamily: NOIR.sans,
  },

  // Stats section
  statsSection: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 24, padding: "32px 20px",
    borderBottom: `1px solid ${NOIR.borderGrid}`,
  },

  // Cart bar mobile
  cartBarWrap: {
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
    maxWidth: 512, margin: "0 auto",
    padding: "12px 20px 24px",
    background: bgA(95),
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderTop: "1px solid var(--bl-border)",
  },
}

const C: Record<string, CSSProperties> = {
  soldOut: {
    position: "absolute", inset: 0, background: bgA(60),
    backdropFilter: "blur(1px)", WebkitBackdropFilter: "blur(1px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  soldOutText: {
    fontSize: 11, fontWeight: 300, letterSpacing: "0.3em",
    textTransform: "uppercase", color: ink(55), fontFamily: NOIR.sans,
  },
  roundGhost: {
    width: 28, height: 28, borderRadius: "50%",
    background: bgA(60), border: "none", cursor: "pointer",
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  discountBadge: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
    background: NOIR.gold, color: "var(--bl-background)",
    padding: "2px 8px", borderRadius: 2, fontFamily: NOIR.sans,
    alignSelf: "flex-start",
  },
  featuredMark: {
    fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
    color: NOIR.gold, fontWeight: 300, fontFamily: NOIR.sans,
  },
  name: {
    fontFamily: NOIR.serif, color: NOIR.text, fontSize: 14,
    lineHeight: 1.375, margin: "0 0 6px",
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  price: { color: NOIR.gold, fontSize: 14, fontWeight: 600, lineHeight: 1, fontFamily: NOIR.sans },
  compare: { color: ink(33), fontSize: 10, textDecoration: "line-through", lineHeight: 1.3, fontFamily: NOIR.sans },
  quickAdd: {
    width: 28, height: 28, borderRadius: "50%",
    border: "1px solid", background: "transparent", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all .3s ease",
  },
}
