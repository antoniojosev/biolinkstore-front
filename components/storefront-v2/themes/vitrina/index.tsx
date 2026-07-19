"use client"

import type { CSSProperties } from "react"
import { Instagram, Search, ShoppingBag, X } from "lucide-react"
import type { TemplateRendererProps } from "@/components/storefront-v2/template/template-renderer"
import { CatalogShell, sProp, boolProp, type CatalogCtx, type CatalogSkin } from "../shared/catalog-shell"
import { mix } from "../shared/catalog-shell/support"
import { V, VITRINA_CSS, VRX, V_CTA_SHADOW } from "./shared"
import { VitrinaProductCard } from "./product-card"

// Overlays propios del tema — para registrar junto al renderer en el registry.
export { VitrinaProductSheet } from "./product-sheet"
export { VitrinaCartSheet } from "./cart-sheet"

/**
 * VitrinaRenderer — port fiel del tema legacy vitrina (spec
 * docs/legacy-theme-specs/vitrina.md): catálogo claro y luminoso con acento
 * turquesa, sidebar sticky de perfil con avatar glow multicolor, search +
 * categorías verticales, header móvil con cover (fallback gradiente animado),
 * filtros sticky con pills, grid 2/3/4 con cards bordeadas y quick-add, y
 * barra inferior fija de carrito. Nivel 2 sobre CatalogShell (esqueleto
 * compartido con luxora). Wishlist legacy OMITIDA (plan-gated fuera de
 * alcance); tokens vía --bl-*, responsive por container query.
 */
export function VitrinaRenderer(props: TemplateRendererProps) {
  return <CatalogShell {...props} skin={vitrinaSkin} />
}

// ── piezas del skin ───────────────────────────────────────────────────────────

function AvatarGlow({ ctx }: { ctx: CatalogCtx }) {
  const avatar = ctx.store.avatar ?? "/placeholder.svg"
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: -4, borderRadius: "50%", background: V.glow, opacity: 0.6, filter: "blur(4px)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatar}
        alt={ctx.store.name}
        style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", border: `2px solid ${V.bg}`, objectFit: "cover", display: "block" }}
      />
    </div>
  )
}

function IgAndCount({ ctx, marginTop }: { ctx: CatalogCtx; marginTop: number }) {
  // Pill de conteo de productos: se puede ocultar desde el hero (prop
  // showProductCount, default true).
  const showCount = boolProp(ctx.heroNode, "showProductCount", true)
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop }}>
      {ctx.instagramUrl && (
        <a
          href={ctx.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bl-vitrina-outlinebtn"
          style={S.igBtn}
        >
          <Instagram style={{ width: 14, height: 14 }} />
          Seguir
        </a>
      )}
      {showCount && <span style={S.countPill}>{ctx.products.length} productos</span>}
    </div>
  )
}

function SearchInput({ ctx, placeholder }: { ctx: CatalogCtx; placeholder: string }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: V.mutedFg }} />
      <input
        className="bl-vitrina-input"
        placeholder={placeholder}
        value={ctx.search}
        onChange={(e) => ctx.setSearch(e.target.value)}
        style={S.searchInput}
      />
      {ctx.search && (
        <button
          type="button"
          className="bl-vitrina-clear"
          onClick={() => ctx.setSearch("")}
          aria-label="Limpiar búsqueda"
          style={S.clearBtn}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      )}
    </div>
  )
}

function CartButton({ ctx }: { ctx: CatalogCtx }) {
  return (
    <button
      type="button"
      className="bl-vitrina-primarybtn"
      onClick={ctx.openCart}
      style={S.cartBtn}
    >
      <ShoppingBag style={{ width: 16, height: 16 }} />
      {ctx.totalItems > 0 ? `Ver carrito · ${ctx.fmt(ctx.totalPrice)}` : "Carrito vacío"}
      {ctx.totalItems > 0 && <span style={S.cartBadge}>{ctx.totalItems}</span>}
    </button>
  )
}

const vitrinaSkin: CatalogSkin = {
  prefix: "bl-vitrina",
  css: VITRINA_CSS,
  root: { background: V.bg, color: V.text },
  sidebar: {
    borderRight: `1px solid ${mix(V.border, 50)}`,
    padding: 24,
    gap: 24,
    background: V.bg,
  },
  toolbar: {
    background: mix(V.bg, 90),
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: `1px solid ${mix(V.border, 50)}`,
    padding: "12px 16px 8px",
  },
  topBar: {
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    borderBottom: `1px solid ${mix(V.border, 30)}`,
  },
  gridWrap: { padding: "16px 16px 0" },
  grid: { gap: 12, paddingBottom: 112 },
  bottomBar: {
    padding: 16,
    background: mix(V.bg, 80),
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderTop: `1px solid ${V.border}`,
  },

  renderSidebarProfile(ctx) {
    const name = sProp(ctx.heroNode, "headline") || ctx.store.name
    const bio = sProp(ctx.heroNode, "subheadline") || ctx.store.bio || ""
    const kicker = sProp(ctx.heroNode, "kicker")
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
        <AvatarGlow ctx={ctx} />
        <div>
          {kicker && <p style={S.kicker}>{kicker}</p>}
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: V.text }}>{name}</h1>
          {ctx.store.username && <p style={{ margin: "2px 0 0", fontSize: 12, color: V.mutedFg }}>{ctx.store.username}</p>}
          {bio && <p style={{ margin: "8px 0 0", fontSize: 12, color: mix(V.text, 60), lineHeight: 1.6 }}>{bio}</p>}
        </div>
        <IgAndCount ctx={ctx} marginTop={0} />
      </div>
    )
  },

  renderSearch(ctx) {
    return <SearchInput ctx={ctx} placeholder="Buscar..." />
  },

  renderCategoryList(ctx) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={S.catLabel}>Categorías</p>
        {ctx.allCategories.map((cat) => {
          const active = ctx.selectedCategory === cat
          return (
            <button
              key={cat}
              type="button"
              className="bl-vitrina-catbtn"
              data-active={active}
              onClick={() => ctx.setSelectedCategory(cat)}
              style={{
                ...S.catBtn,
                ...(active
                  ? { background: mix(V.primary, 10), color: V.primary }
                  : { background: "transparent", color: V.mutedFg }),
                ...(ctx.showCategoryCount ? { display: "flex", justifyContent: "space-between", gap: 8 } : null),
              }}
            >
              {cat}
              {ctx.showCategoryCount && (
                <span style={{ opacity: 0.6, fontVariantNumeric: "tabular-nums" }}>
                  {cat === "Todos" ? ctx.products.length : ctx.countByCategory[cat] ?? 0}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  },

  renderSidebarFooter(ctx) {
    return <CartButton ctx={ctx} />
  },

  renderMobileHeader(ctx) {
    const cover = sProp(ctx.heroNode, "image")
    const name = sProp(ctx.heroNode, "headline") || ctx.store.name
    const bio = sProp(ctx.heroNode, "subheadline") || ctx.store.bio || ""
    const kicker = sProp(ctx.heroNode, "kicker")
    return (
      <header style={{ position: "relative" }}>
        <div style={{ position: "relative", height: 128, width: "100%", overflow: "hidden" }}>
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={cover} alt={`${name} cover`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div className="bl-vitrina-gradientbg" style={{ height: "100%", width: "100%", opacity: 0.8 }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 0%, transparent 50%, ${V.bg} 100%)` }} />
        </div>
        <div style={{ position: "relative", padding: "0 16px 16px", marginTop: -40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ marginBottom: 12 }}>
            <AvatarGlow ctx={ctx} />
          </div>
          {kicker && <p style={S.kicker}>{kicker}</p>}
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: V.text }}>{name}</h1>
          {ctx.store.username && <p style={{ margin: "2px 0 0", fontSize: 14, color: V.mutedFg }}>{ctx.store.username}</p>}
          {bio && <p style={{ margin: "8px 0 0", fontSize: 14, color: mix(V.text, 70), maxWidth: 320, lineHeight: 1.6 }}>{bio}</p>}
          <IgAndCount ctx={ctx} marginTop={12} />
        </div>
      </header>
    )
  },

  renderToolbar(ctx) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SearchInput ctx={ctx} placeholder="Buscar productos..." />
        </div>
        {ctx.filterEnabled && (
          <div className="bl-vitrina-pills" style={{ gap: 6, paddingBottom: 4 }}>
            {ctx.allCategories.map((cat) => {
              const active = ctx.selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  className="bl-vitrina-pill"
                  data-active={active}
                  onClick={() => ctx.setSelectedCategory(cat)}
                  style={{
                    ...S.pill,
                    ...(active
                      ? { background: V.primary, color: V.primaryFg, boxShadow: `0 1px 2px 0 ${mix(V.primary, 30)}` }
                      : { background: V.muted, color: V.mutedFg }),
                  }}
                >
                  {cat}
                  {ctx.showCategoryCount && (
                    <span style={{ marginLeft: 6, opacity: 0.6, fontVariantNumeric: "tabular-nums" }}>
                      {cat === "Todos" ? ctx.products.length : ctx.countByCategory[cat] ?? 0}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  },

  renderCounter(ctx) {
    return (
      <p style={{ margin: 0, fontSize: 14, color: V.mutedFg }}>
        <span style={{ fontWeight: 600, color: V.text }}>{ctx.filtered.length}</span>{" "}
        {ctx.selectedCategory === "Todos" ? "productos" : ctx.selectedCategory.toLowerCase()}
      </p>
    )
  },

  renderCard(p, ctx) {
    return (
      <VitrinaProductCard
        product={p}
        fmt={ctx.fmt}
        href={ctx.productHref?.(p) ?? null}
        onOpen={ctx.onOpenProduct}
        showPrice={ctx.showPrice}
        onOpenCart={ctx.openCart}
      />
    )
  },

  renderEmpty() {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", textAlign: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: V.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Search style={{ width: 24, height: 24, color: V.mutedFg }} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 500, color: V.text }}>Sin resultados</p>
          <p style={{ margin: "2px 0 0", fontSize: 14, color: V.mutedFg }}>Probá con otra búsqueda o categoría</p>
        </div>
      </div>
    )
  },

  renderBottomBar(ctx) {
    return (
      <button
        type="button"
        className="bl-vitrina-primarybtn"
        onClick={ctx.openCart}
        style={S.bottomBarBtn}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingBag style={{ width: 20, height: 20 }} />
          <span style={{ background: "rgba(255,255,255,.2)", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
            {ctx.totalItems}
          </span>
        </span>
        <span style={{ flex: 1, textAlign: "left" }}>Ver carrito</span>
        <span style={{ fontWeight: 700 }}>{ctx.fmt(ctx.totalPrice)}</span>
      </button>
    )
  },

  // Footer temático: socials + footer del árbol fundidas en un cierre claro
  // (el legacy tenía las redes en el sidebar; en móvil no había footer).
  renderFooter(ctx, footerNode, socialsNode) {
    const socials = ctx.store.socials ?? []
    const tagline = sProp(footerNode, "tagline") || ctx.store.bio || ""
    const socialsTitle = sProp(socialsNode, "title")
    return (
      <footer className="bl-vitrina-footer" style={{ paddingTop: 32, paddingLeft: 20, paddingRight: 20, textAlign: "center", background: V.bg }}>
        <div style={{ height: 1, background: V.border, margin: "0 auto 24px", maxWidth: 320 }} />
        {socials.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: tagline ? 18 : 8 }}>
            {socialsTitle && (
              <p style={{ width: "100%", margin: "0 0 6px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: V.mutedFg }}>
                {socialsTitle}
              </p>
            )}
            {socials.map((sn, i) => (
              <a
                key={i}
                href={sn.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.03em", textTransform: "capitalize", color: V.primary, textDecoration: "none", padding: "8px 14px", border: `1px solid ${mix(V.border, 60)}`, borderRadius: 999, background: V.card }}
              >
                {sn.platform} ↗
              </a>
            ))}
          </div>
        )}
        {tagline && (
          <p style={{ margin: "0 auto 18px", maxWidth: 360, fontSize: 13, lineHeight: 1.6, color: V.mutedFg }}>{tagline}</p>
        )}
        <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.04em", color: mix(V.mutedFg, 70) }}>
          Creado con <span style={{ fontWeight: 800, color: V.primary }}>ByLink</span>
        </p>
      </footer>
    )
  },
}

const S: Record<string, CSSProperties> = {
  igBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: 32, padding: "0 12px",
    border: `1px solid ${V.border}`, borderRadius: VRX.md,
    background: "transparent", color: V.text,
    fontSize: 12, fontWeight: 500, textDecoration: "none", cursor: "pointer",
  },
  countPill: {
    fontSize: 12, color: V.mutedFg, background: V.muted,
    padding: "6px 12px", borderRadius: 999,
  },
  kicker: {
    margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: V.primary,
  },
  searchInput: {
    width: "100%", height: 36, padding: "0 36px",
    background: V.muted, border: "1px solid transparent", borderRadius: VRX.md,
    fontSize: 14, color: V.text, outline: "none", fontFamily: "inherit",
  },
  clearBtn: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "none", border: "none", padding: 0, cursor: "pointer", color: V.mutedFg,
  },
  catLabel: {
    margin: "0 0 4px", fontSize: 10, fontWeight: 600,
    color: mix(V.mutedFg, 60), textTransform: "uppercase", letterSpacing: "0.05em",
  },
  catBtn: {
    textAlign: "left", padding: "8px 12px", borderRadius: VRX.lg,
    fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
  },
  cartBtn: {
    position: "relative", width: "100%", height: 36,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: VRX.md, border: "none", cursor: "pointer",
    background: V.primary, color: V.primaryFg,
    fontSize: 14, fontWeight: 500,
    boxShadow: V_CTA_SHADOW,
  },
  cartBadge: {
    position: "absolute", top: -6, right: -6,
    width: 16, height: 16, borderRadius: "50%",
    background: "#fff", color: V.primary,
    fontSize: 9, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  pill: {
    flexShrink: 0, borderRadius: 999, padding: "4px 12px",
    fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", whiteSpace: "nowrap",
  },
  bottomBarBtn: {
    width: "100%", maxWidth: 512, margin: "0 auto", height: 52,
    display: "flex", alignItems: "center", gap: 12, padding: "0 16px",
    borderRadius: VRX.md, border: "none", cursor: "pointer",
    background: V.primary, color: V.primaryFg,
    fontSize: 16, fontWeight: 500,
    boxShadow: V_CTA_SHADOW,
  },
}
