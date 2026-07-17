"use client"

import { Fragment, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import { ArrowRight, Instagram, Search } from "lucide-react"
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
import { PosterProductCard } from "./product-card"
import { Leaf, POSTER, POSTER_STYLES, makeFmt } from "./shared"

// Overlays propios del tema — para registrar junto al renderer en el registry.
export { PosterProductSheet } from "./product-sheet"
export { PosterCartSheet } from "./cart-sheet"

/**
 * PosterRenderer — port fiel del tema legacy poster (restaurante estilo
 * cartel; spec docs/legacy-theme-specs/poster.md, HTML aprobado
 * landing-videos/poster). Renderer custom nivel 2 (patrón persona):
 *
 * - Paleta/tipografías por tokens --bl-* (seed atardecer ya replica el HTML);
 *   los hex restantes son identidad documentada del tema (ver shared.tsx).
 * - Allura se carga SIEMPRE (sello del tema, no token); Anton llega por
 *   --bl-heading-font del seed.
 * - Árbol de secciones respetado: hero → brand bar + hero poster ·
 *   product_grid → pills de categoría + grid de posters · footer → social
 *   footer poster · resto delegado al catálogo base (SectionRenderer).
 * - Cart bar flotante propia (trigger del PosterCartSheet vía onOpenCart).
 * - Responsive SOLO por container queries (containerName bl-poster).
 */
export function PosterRenderer({
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

  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES)

  // Toggle de moneda del comprador (misma mecánica que el renderer base).
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

  const visibleProducts = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  const totalItems = cart?.totalItems ?? cartCount
  const totalPrice = cart?.totalPrice ?? 0

  const instagramUrl =
    store.socials?.find((s) => /^ig$|insta/i.test(s.platform))?.url ?? null
  const storeInitial = store.name.charAt(0).toUpperCase()

  // ── editor wrap: misma mecánica de selección que el renderer base ────────
  // Sin editor NO se envuelve en div: el brand bar sticky del hero necesita
  // que su containing block sea el <main> (si no, se des-pega al pasar el hero).
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

  // ── secciones propias del tema ────────────────────────────────────────────
  function renderHero(node: SectionNode) {
    const headline = s(node, "headline") || store.name
    const kicker = s(node, "kicker") || "Bienvenido a"
    const bio = s(node, "subheadline") || store.bio || ""
    return editorWrap(
      node,
      <>
        {/* Brand bar sticky */}
        <header style={S.brandBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={S.logo}>
              {store.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={store.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span aria-hidden="true">{storeInitial}</span>
              )}
            </div>
            <div>
              <h1 style={S.brandName}>{store.name}</h1>
              {store.bio && <p style={S.brandBio}>{store.bio}</p>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {canToggleCurrency && (
              <button
                type="button"
                className="bl-poster-iconbtn"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowBs((v) => !v)
                }}
                aria-label="Cambiar moneda"
                style={{ ...S.iconBtn, width: "auto", padding: "0 14px", fontSize: 11, fontWeight: 700, letterSpacing: ".06em" }}
              >
                {showBs ? "Bs" : store.currency ?? "USD"}
              </button>
            )}
            <button type="button" className="bl-poster-iconbtn" aria-label="Buscar" style={S.iconBtn}>
              <Search style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </header>

        {/* Hero */}
        <section style={S.hero}>
          <Leaf
            variant="a"
            style={{ pointerEvents: "none", position: "absolute", left: -8, top: 6, width: 70, transform: "rotate(-25deg)", opacity: 0.55 }}
          />
          <Leaf
            variant="b"
            style={{ pointerEvents: "none", position: "absolute", right: -12, top: 30, width: 60, transform: "rotate(40deg)", opacity: 0.55 }}
          />
          <p style={S.heroKicker}>{kicker}</p>
          <h2 style={S.heroTitle}>{headline}</h2>
          {bio && <p style={S.heroBio}>{bio}</p>}
        </section>
      </>,
    )
  }

  function renderGrid(node: SectionNode) {
    const showPrice = bool(node, "showPrice", true)
    const groupBy = s(node, "groupBy", "none")

    const grid = (items: TemplateProduct[]) => (
      <div className="bl-poster-grid" style={S.grid}>
        {items.length === 0 ? (
          <p style={S.emptyMsg}>No hay platos en esta categoría.</p>
        ) : (
          items.map((p) => (
            <PosterProductCard
              key={p.id}
              product={p}
              fmt={fmt}
              href={productHref?.(p) ?? null}
              onOpen={onOpenProduct}
              showPrice={showPrice}
            />
          ))
        )}
      </div>
    )

    const grouped =
      groupBy === "category" && activeCategory === ALL_CATEGORIES && categories.length > 0
    const groups = grouped
      ? (() => {
          const byName = new Map<string, TemplateProduct[]>()
          for (const p of visibleProducts) {
            const key = p.category || "Otros"
            byName.set(key, [...(byName.get(key) ?? []), p])
          }
          const ordered = categories
            .map((c) => ({ name: c.name, items: byName.get(c.name) ?? [] }))
            .filter((g) => g.items.length > 0)
          const known = new Set(categories.map((c) => c.name))
          const rest = visibleProducts.filter((p) => !known.has(p.category || ""))
          return rest.length > 0 ? [...ordered, { name: "Otros", items: rest }] : ordered
        })()
      : null

    return editorWrap(
      node,
      <>
        {/* Category strip */}
        {categories.length > 0 && (
          <nav className="bl-poster-pills" style={S.pills} aria-label="Categorías" role="tablist">
            <CategoryPill
              label={ALL_CATEGORIES}
              active={activeCategory === ALL_CATEGORIES}
              onClick={() => setActiveCategory(ALL_CATEGORIES)}
            />
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                label={c.name}
                active={activeCategory === c.name}
                onClick={() => setActiveCategory(c.name)}
              />
            ))}
          </nav>
        )}

        {/* Grid de posters */}
        <div id="menu">
          {groups ? (
            <div style={{ display: "grid", gap: 8 }}>
              {groups.map((g) => (
                <div key={g.name}>
                  <h3 style={S.groupHeading}>{g.name}</h3>
                  {grid(g.items)}
                </div>
              ))}
            </div>
          ) : (
            grid(visibleProducts)
          )}
        </div>
      </>,
    )
  }

  function renderFooter(node: SectionNode) {
    const tagline = s(node, "tagline") || store.bio || ""
    return editorWrap(
      node,
      <footer style={S.socialFooter}>
        {instagramUrl && (
          <>
            <h3 style={S.followTitle}>Síguenos</h3>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="bl-poster-ig"
                style={S.igBtn}
              >
                <Instagram style={{ width: 20, height: 20 }} strokeWidth={2} />
              </a>
            </div>
          </>
        )}
        {tagline && <p style={S.footerTagline}>{tagline}</p>}
        <p style={S.branding}>Creado con ByLink</p>
      </footer>,
    )
  }

  const rootStyle = {
    ...resolved.cssVars,
    background: POSTER.pageBackground,
    color: "var(--bl-text)",
    fontFamily: POSTER.inter,
    minHeight: "100dvh",
    overflowX: "clip",
    containerType: "inline-size",
    containerName: "bl-poster",
  } as CSSProperties

  return (
    <main className="bl-poster-root" style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        // Allura siempre: es sello del tema (kickers cursivos), no un token editable.
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName, "Allura"])}
      />
      <style dangerouslySetInnerHTML={{ __html: POSTER_STYLES }} />

      <a href="#menu" className="bl-poster-skip">
        Saltar al menú
      </a>

      {sections.map((node) => {
        switch (node.type) {
          case "hero":
            return renderHero(node)
          case "product_grid":
            return renderGrid(node)
          case "footer":
            return renderFooter(node)
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

      {/* Cart bar flotante — trigger del carrito propio */}
      {onOpenCart && totalItems > 0 && (
        <button
          type="button"
          onClick={onOpenCart}
          className="bl-poster-cartbar"
          style={S.cartBar}
          aria-label={`Ver pedido — ${totalItems} ítems, total ${fmt(totalPrice)}`}
        >
          <div style={S.cartBarLeft}>
            <span style={S.cartBarCount}>{totalItems}</span>
            Tu pedido · {fmt(totalPrice)}
          </div>
          <div aria-hidden="true" style={S.cartBarArrow}>
            <ArrowRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
          </div>
        </button>
      )}
    </main>
  )
}

const ALL_CATEGORIES = "Todo"

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={active ? undefined : "bl-poster-pill-inactive"}
      style={{
        ...S.pill,
        ...(active
          ? {
              border: "1px solid var(--bl-secondary)",
              background: POSTER.gold,
              color: "var(--bl-background)",
              fontWeight: 700,
              boxShadow: "0 6px 18px -6px rgba(244,162,58,.6)",
            }
          : {
              border: "1px solid rgba(255,255,255,.05)",
              background: "rgba(255,255,255,.1)",
              color: POSTER.cream,
            }),
      }}
    >
      {label}
    </button>
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

const S: Record<string, CSSProperties> = {
  editorTag: {
    position: "absolute", top: -1, left: 12, transform: "translateY(-100%)",
    background: "var(--brand, #1E3A8A)", color: "#fff", fontFamily: "monospace",
    fontSize: 9, padding: "2px 8px", borderRadius: "4px 4px 0 0",
    letterSpacing: "0.06em", zIndex: 55, pointerEvents: "none",
  },
  brandBar: {
    position: "sticky", top: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,.05)",
    padding: "14px 20px",
    background: POSTER.topbarGradient,
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
  },
  logo: {
    display: "grid", placeItems: "center", overflow: "hidden",
    width: 42, height: 42, borderRadius: 12,
    background: POSTER.goldGradient,
    color: "#4a0a0a",
    fontFamily: POSTER.anton, fontSize: 20,
    boxShadow: "0 6px 18px -6px rgba(244,162,58,.6)",
    flexShrink: 0,
  },
  brandName: {
    margin: 0, fontFamily: POSTER.anton, fontWeight: 400, fontSize: 17,
    letterSpacing: ".04em", lineHeight: 1, textTransform: "uppercase",
  },
  brandBio: {
    margin: "3px 0 0", maxWidth: 220, fontSize: 11, textTransform: "uppercase",
    letterSpacing: ".12em", opacity: 0.65, overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  iconBtn: {
    display: "grid", placeItems: "center", width: 40, height: 40,
    borderRadius: 999, border: "none", background: "rgba(255,255,255,.1)",
    color: POSTER.cream, cursor: "pointer", fontFamily: "inherit",
  },
  hero: { position: "relative", padding: "36px 20px 16px", textAlign: "center" },
  heroKicker: {
    margin: 0, transform: "translateY(8px)", lineHeight: 1,
    fontFamily: POSTER.allura, fontSize: 36, color: POSTER.goldSoft,
  },
  heroTitle: {
    margin: 0,
    fontFamily: POSTER.anton,
    fontWeight: 400,
    fontSize: "clamp(36px, 10cqw, 64px)",
    lineHeight: 0.95,
    letterSpacing: ".01em",
    textTransform: "uppercase",
    backgroundImage: POSTER.titleGradient,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    textShadow: "0 2px 0 rgba(0,0,0,.15)",
  },
  heroBio: { margin: "12px auto 0", maxWidth: 320, fontSize: 14, opacity: 0.8, lineHeight: 1.5 },
  pills: {
    maxWidth: 1280, margin: "0 auto", display: "flex", gap: 8,
    overflowX: "auto", padding: "8px 20px 16px",
  },
  pill: {
    flexShrink: 0, borderRadius: 999, padding: "10px 16px",
    fontFamily: "inherit", fontSize: 12, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: ".08em",
    cursor: "pointer", transition: "all .2s ease",
  },
  grid: {
    maxWidth: 1280, margin: "0 auto",
    display: "grid", gridTemplateColumns: "1fr", gap: 16,
    padding: "0 16px 130px",
  },
  groupHeading: {
    margin: "0 0 4px", textAlign: "center",
    fontFamily: POSTER.allura, fontWeight: 400, fontSize: 30,
    lineHeight: 1.1, color: POSTER.goldSoft,
  },
  emptyMsg: { gridColumn: "1 / -1", padding: "64px 0", textAlign: "center", fontSize: 14, opacity: 0.6 },
  socialFooter: { padding: "32px 20px 110px", textAlign: "center" },
  followTitle: { margin: "0 0 10px", fontFamily: POSTER.allura, fontWeight: 400, fontSize: 28, color: POSTER.goldSoft },
  igBtn: {
    display: "grid", placeItems: "center", width: 44, height: 44,
    borderRadius: 999, background: "rgba(255,255,255,.1)", color: POSTER.cream,
  },
  footerTagline: { margin: "20px auto 0", maxWidth: 420, fontSize: 13, opacity: 0.7, lineHeight: 1.55 },
  branding: { margin: "24px 0 0", fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", opacity: 0.4 },
  cartBar: {
    position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 60,
    margin: "0 auto", maxWidth: 480,
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    borderRadius: 999, border: "none",
    background: POSTER.cream, color: "var(--bl-background)",
    padding: "12px 20px 12px 24px",
    fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
    boxShadow: "0 18px 40px -8px rgba(0,0,0,.5)",
  },
  cartBarLeft: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 14, textTransform: "uppercase", letterSpacing: ".05em",
  },
  cartBarCount: {
    borderRadius: 999, background: "var(--bl-background)", color: POSTER.cream,
    padding: "2px 10px", fontSize: 12,
  },
  cartBarArrow: {
    display: "grid", placeItems: "center", width: 30, height: 30,
    borderRadius: 999, background: "var(--bl-background)", color: POSTER.cream,
    flexShrink: 0,
  },
}
