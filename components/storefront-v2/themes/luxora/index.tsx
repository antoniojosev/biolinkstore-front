"use client"

import { useState, type CSSProperties } from "react"
import { Instagram, Search, ShoppingBag, X } from "lucide-react"
import type { TemplateRendererProps, TemplateProduct } from "@/components/storefront-v2/template/template-renderer"
import type { SectionNode } from "@/lib/page-builder-api"
import { CatalogShell, sProp, type CatalogCtx, type CatalogSkin } from "../shared/catalog-shell"
import { mix } from "../shared/catalog-shell/support"
import { L, LRX, LUXORA_CSS, L_BTN_SHADOW } from "./shared"
import { LuxoraProductCard } from "./product-card"

// Overlays propios del tema — para registrar junto al renderer en el registry.
export { LuxoraProductSheet } from "./product-sheet"
export { LuxoraCartSheet } from "./cart-sheet"

/**
 * LuxoraRenderer — port fiel del tema legacy luxora (spec
 * docs/legacy-theme-specs/luxora.md): catálogo minimal editorial MONOCROMO
 * (ink sobre crema), jerarquía por peso font-black (900), sidebar sticky con
 * cover aspect-video (o fila avatar), Instagram como link de texto, categorías
 * con activa negra sólida, header móvil con cover h-64 full-bleed, toolbar
 * sticky con contador editorial + search TOGGLE + pills redondas, grid 2/3/4
 * aireado (gap-y-6) de cards desnudas y barra inferior negra rounded-2xl.
 * Nivel 2 sobre CatalogShell (esqueleto compartido con vitrina). Wishlist
 * legacy OMITIDA (plan-gated fuera de alcance); tokens vía --bl-*, responsive
 * por container query.
 */
export function LuxoraRenderer(props: TemplateRendererProps) {
  return <CatalogShell {...props} skin={luxoraSkin} />
}

// ── piezas del skin ───────────────────────────────────────────────────────────

/** Identidad del sidebar (spec §2.1): cover aspect-video con scrim o fila avatar. */
function SidebarIdentity({ ctx }: { ctx: CatalogCtx }) {
  const cover = sProp(ctx.heroNode, "image")
  const name = sProp(ctx.heroNode, "headline") || ctx.store.name
  if (cover) {
    return (
      <div style={{ position: "relative", borderRadius: LRX.xl2, overflow: "hidden", aspectRatio: "16 / 9" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.5), transparent)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
          {sProp(ctx.heroNode, "kicker") && (
            <p style={{ ...S.kicker, color: "rgba(255,255,255,0.85)" }}>{sProp(ctx.heroNode, "kicker")}</p>
          )}
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.25 }}>{name}</h1>
        </div>
      </div>
    )
  }
  return <AvatarRow ctx={ctx} nameSize={20} />
}

/** Fila avatar 48px + nombre font-black + username (sidebar y móvil sin cover). */
function AvatarRow({ ctx, nameSize }: { ctx: CatalogCtx; nameSize: number }) {
  const name = sProp(ctx.heroNode, "headline") || ctx.store.name
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ctx.store.avatar ?? "/placeholder.svg"}
        alt={name}
        style={{ width: 48, height: 48, borderRadius: "50%", border: `1px solid ${L.borderStrong}`, objectFit: "cover", flexShrink: 0 }}
      />
      <div style={{ minWidth: 0 }}>
        {sProp(ctx.heroNode, "kicker") && <p style={S.kicker}>{sProp(ctx.heroNode, "kicker")}</p>}
        <h1 style={{ margin: 0, fontSize: nameSize, fontWeight: 900, color: L.ink, lineHeight: 1.25 }}>{name}</h1>
        {ctx.store.username && <p style={{ margin: 0, fontSize: 12, color: L.muted }}>{ctx.store.username}</p>}
      </div>
    </div>
  )
}

function SearchInput({ ctx, autoFocus }: { ctx: CatalogCtx; autoFocus?: boolean }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: L.muted }} />
      <input
        className="bl-luxora-input"
        placeholder="Buscar..."
        autoFocus={autoFocus}
        value={ctx.search}
        onChange={(e) => ctx.setSearch(e.target.value)}
        style={S.searchInput}
      />
      {!autoFocus && ctx.search && (
        <button
          type="button"
          className="bl-luxora-textlink"
          onClick={() => ctx.setSearch("")}
          aria-label="Limpiar búsqueda"
          style={S.clearBtn}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  )
}

function CategoryPills({ ctx }: { ctx: CatalogCtx }) {
  return (
    <div className="bl-luxora-pills" style={{ gap: 6, marginTop: 8, paddingBottom: 2 }}>
      {ctx.allCategories.map((cat) => {
        const active = ctx.selectedCategory === cat
        return (
          <button
            key={cat}
            type="button"
            className="bl-luxora-pill"
            data-active={active}
            onClick={() => ctx.setSelectedCategory(cat)}
            style={{
              ...S.pill,
              ...(active ? { background: L.ink, color: L.bg } : { background: L.surface, color: L.text2 }),
            }}
          >
            {cat}
            {ctx.showCategoryCount && (
              <span style={{ marginLeft: 6, opacity: 0.55, fontVariantNumeric: "tabular-nums" }}>
                {cat === "Todos" ? ctx.products.length : ctx.countByCategory[cat] ?? 0}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Toolbar móvil (spec §2.3): contador editorial font-black + iconos con
 * search TOGGLE (la lupa expande el input con autoFocus; X cierra Y limpia)
 * + pills redondas debajo.
 */
function LuxoraToolbar({ ctx }: { ctx: CatalogCtx }) {
  const [showSearch, setShowSearch] = useState(false)
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {showSearch ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <SearchInput ctx={ctx} autoFocus />
            <button
              type="button"
              className="bl-luxora-textlink"
              onClick={() => {
                setShowSearch(false)
                ctx.setSearch("")
              }}
              aria-label="Cerrar búsqueda"
              style={{ ...S.clearBtn, position: "static", transform: "none" }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        ) : (
          <>
            <p style={{ margin: 0, flex: 1, fontSize: 18, fontWeight: 900, color: L.ink, lineHeight: 1 }}>
              {ctx.filtered.length}{" "}
              <span style={{ fontWeight: 500, color: L.muted }}>
                {ctx.selectedCategory === "Todos" ? "productos" : ctx.selectedCategory.toLowerCase()}
              </span>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button type="button" className="bl-luxora-iconbtn" onClick={() => setShowSearch(true)} aria-label="Buscar" style={S.iconBtn}>
                <Search style={{ width: 16, height: 16, color: L.muted }} />
              </button>
              <button type="button" className="bl-luxora-iconbtn" onClick={ctx.openCart} aria-label="Ver carrito" style={{ ...S.iconBtn, position: "relative" }}>
                <ShoppingBag style={{ width: 16, height: 16, color: L.ink }} />
                {ctx.totalItems > 0 && <span style={S.toolbarBadge}>{ctx.totalItems}</span>}
              </button>
            </div>
          </>
        )}
      </div>
      {ctx.filterEnabled && <CategoryPills ctx={ctx} />}
    </div>
  )
}

// Hover del IG flotante sobre el cover móvil (bg-black/30 → /50 del legacy).
const INDEX_CSS = `
.bl-luxora-igfloat { transition: background .2s ease; }
.bl-luxora-igfloat:hover { background: rgba(0,0,0,.5) !important; }
`

const luxoraSkin: CatalogSkin = {
  prefix: "bl-luxora",
  css: LUXORA_CSS + INDEX_CSS,
  root: { background: L.bg, color: L.ink },
  sidebar: {
    borderRight: `1px solid ${L.border}`,
    padding: 28,
    gap: 24,
    background: L.bg,
  },
  toolbar: {
    background: mix(L.bg, 95),
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: `1px solid ${L.hairline}`,
    padding: "12px 20px",
  },
  topBar: {
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    borderBottom: `1px solid ${L.border}`,
  },
  gridWrap: { padding: "20px 20px 0" },
  grid: { columnGap: 16, rowGap: 24, paddingBottom: 112 },
  // Spec §2.6: la barra móvil de luxora NO lleva border-top (a diferencia de vitrina).
  bottomBar: {
    padding: "12px 20px 24px",
    background: mix(L.bg, 90),
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },

  renderSidebarProfile(ctx) {
    const bio = sProp(ctx.heroNode, "subheadline") || ctx.store.bio || ""
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SidebarIdentity ctx={ctx} />
        {bio && <p style={{ margin: 0, fontSize: 14, color: L.text2, lineHeight: 1.6 }}>{bio}</p>}
        {ctx.instagramUrl && (
          <a
            href={ctx.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bl-luxora-textlink"
            style={S.igTextLink}
          >
            <Instagram style={{ width: 16, height: 16 }} />
            Instagram
          </a>
        )}
      </div>
    )
  },

  renderSearch(ctx) {
    return <SearchInput ctx={ctx} />
  },

  renderCategoryList(ctx) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={S.catLabel}>Categorías</p>
        {ctx.allCategories.map((cat) => {
          const active = ctx.selectedCategory === cat
          return (
            <button
              key={cat}
              type="button"
              className="bl-luxora-catbtn"
              data-active={active}
              onClick={() => ctx.setSelectedCategory(cat)}
              style={{
                ...S.catBtn,
                ...(active ? { background: L.ink, color: L.bg } : { background: "transparent", color: L.text2 }),
                ...(ctx.showCategoryCount ? { display: "flex", justifyContent: "space-between", gap: 8 } : null),
              }}
            >
              {cat}
              {ctx.showCategoryCount && (
                <span style={{ opacity: 0.55, fontVariantNumeric: "tabular-nums" }}>
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
    return (
      <button type="button" className="bl-luxora-inkbtn" onClick={ctx.openCart} style={S.sidebarCartBtn}>
        <ShoppingBag style={{ width: 16, height: 16 }} />
        {ctx.totalItems > 0 ? `Ver carrito · ${ctx.fmt(ctx.totalPrice)}` : "Carrito vacío"}
        {ctx.totalItems > 0 && <span style={S.sidebarCartBadge}>{ctx.totalItems}</span>}
      </button>
    )
  },

  renderMobileHeader(ctx) {
    const cover = sProp(ctx.heroNode, "image")
    const name = sProp(ctx.heroNode, "headline") || ctx.store.name
    const bio = sProp(ctx.heroNode, "subheadline") || ctx.store.bio || ""
    if (cover) {
      return (
        <header style={{ position: "relative", height: 256, width: "100%", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,.1) 50%, transparent)" }} />
          {ctx.instagramUrl && (
            <a
              href={ctx.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bl-luxora-igfloat"
              aria-label="Instagram"
              style={S.igFloat}
            >
              <Instagram style={{ width: 16, height: 16, color: "#fff" }} />
            </a>
          )}
          <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.025em", filter: "drop-shadow(0 3px 3px rgba(0,0,0,.12))" }}>
              {name}
            </h1>
            {bio && (
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,.8)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.05))" }}>
                {bio}
              </p>
            )}
          </div>
        </header>
      )
    }
    return (
      <header style={{ background: L.bg, padding: "40px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <AvatarRow ctx={ctx} nameSize={24} />
          </div>
          {ctx.instagramUrl && (
            <a href={ctx.instagramUrl} target="_blank" rel="noopener noreferrer" className="bl-luxora-textlink" aria-label="Instagram" style={{ marginLeft: "auto", color: L.muted, display: "flex" }}>
              <Instagram style={{ width: 20, height: 20 }} />
            </a>
          )}
        </div>
        {bio && <p style={{ margin: "12px 0 0", fontSize: 14, color: L.text2, lineHeight: 1.6 }}>{bio}</p>}
      </header>
    )
  },

  renderToolbar(ctx) {
    return <LuxoraToolbar ctx={ctx} />
  },

  renderCounter(ctx) {
    return (
      <p style={{ margin: 0, fontSize: 14, color: L.muted }}>
        <span style={{ fontWeight: 700, color: L.ink }}>{ctx.filtered.length}</span>{" "}
        {ctx.selectedCategory === "Todos" ? "productos" : ctx.selectedCategory.toLowerCase()}
      </p>
    )
  },

  renderCard(p, ctx) {
    return (
      <LuxoraProductCard
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
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: L.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Search style={{ width: 24, height: 24, color: L.muted2 }} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: L.ink }}>Sin resultados</p>
          <p style={{ margin: "2px 0 0", fontSize: 14, color: L.muted }}>Probá otra búsqueda</p>
        </div>
      </div>
    )
  },

  renderBottomBar(ctx) {
    return (
      <button type="button" className="bl-luxora-inkbtn" onClick={ctx.openCart} style={S.bottomBarBtn}>
        <span style={{ background: "rgba(255,255,255,.2)", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
          {ctx.totalItems}
        </span>
        <span style={{ flex: 1, textAlign: "left", fontSize: 14 }}>Ver carrito</span>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{ctx.fmt(ctx.totalPrice)}</span>
      </button>
    )
  },

  // Sin renderFeatured: el legacy de luxora no tenía sección de destacados
  // (su único scroll horizontal eran las pills de categoría), así que se quitó
  // del árbol del seed — el grid es la única lista de productos.

  // Footer temático: el legacy no tenía footer (redes en el sidebar), así que
  // socials + footer del árbol se funden en un cierre minimal monocromo.
  renderFooter(ctx, footerNode, socialsNode) {
    const socials = ctx.store.socials ?? []
    const tagline = sProp(footerNode, "tagline") || ctx.store.bio || ""
    const socialsTitle = sProp(socialsNode, "title")
    return (
      <footer className="bl-luxora-footer" style={{ paddingTop: 32, paddingLeft: 20, paddingRight: 20, textAlign: "center", background: L.bg }}>
        <div style={{ height: 1, background: L.border, margin: "0 auto 24px", maxWidth: 320 }} />
        {socials.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: tagline ? 18 : 8 }}>
            {socialsTitle && (
              <p style={{ width: "100%", margin: "0 0 6px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: L.muted }}>
                {socialsTitle}
              </p>
            )}
            {socials.map((sn, i) => (
              <a
                key={i}
                href={sn.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bl-luxora-textlink"
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: L.ink, textDecoration: "none", padding: "6px 10px" }}
              >
                {sn.platform} ↗
              </a>
            ))}
          </div>
        )}
        {tagline && (
          <p style={{ margin: "0 auto 18px", maxWidth: 360, fontSize: 13, lineHeight: 1.6, color: L.muted }}>{tagline}</p>
        )}
        <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.06em", color: L.muted2 }}>
          Creado con <span style={{ fontWeight: 800, color: L.ink }}>ByLink</span>
        </p>
      </footer>
    )
  },
}

const S: Record<string, CSSProperties> = {
  igTextLink: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 14, color: L.muted, textDecoration: "none", cursor: "pointer",
  },
  igFloat: {
    position: "absolute", top: 16, right: 16,
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(0,0,0,.3)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
  },
  searchInput: {
    width: "100%", height: 36, padding: "0 12px 0 32px",
    background: L.surface, border: "none", borderRadius: LRX.xl,
    fontSize: 14, color: L.ink, outline: "none", fontFamily: "inherit",
  },
  clearBtn: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "none", border: "none", padding: 0, cursor: "pointer", color: L.muted,
  },
  catLabel: {
    margin: "0 0 4px", fontSize: 10, fontWeight: 600,
    color: L.muted2, textTransform: "uppercase", letterSpacing: "0.05em",
  },
  kicker: {
    margin: "0 0 3px", fontSize: 10, fontWeight: 700,
    color: L.muted, textTransform: "uppercase", letterSpacing: "0.12em",
  },
  catBtn: {
    textAlign: "left", padding: "8px 12px", borderRadius: LRX.xl,
    fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
  },
  sidebarCartBtn: {
    position: "relative", width: "100%", height: 48,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: LRX.xl, border: "none", cursor: "pointer",
    background: L.ink, color: L.bg,
    fontSize: 14, fontWeight: 600,
    boxShadow: L_BTN_SHADOW,
  },
  sidebarCartBadge: {
    position: "absolute", top: -6, right: -6,
    width: 16, height: 16, borderRadius: "50%",
    background: "#fff", color: L.ink,
    fontSize: 9, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: LRX.xl,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", cursor: "pointer",
  },
  toolbarBadge: {
    position: "absolute", top: -2, right: -2,
    width: 16, height: 16, borderRadius: "50%",
    background: L.ink, color: L.bg,
    fontSize: 9, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  pill: {
    flexShrink: 0, borderRadius: 999, padding: "6px 14px",
    fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap",
  },
  bottomBarBtn: {
    width: "100%", maxWidth: 512, margin: "0 auto", height: 56,
    display: "flex", alignItems: "center", gap: 12, padding: "0 20px",
    borderRadius: LRX.xl2, border: "none", cursor: "pointer",
    background: L.ink, color: L.bg,
    fontWeight: 600,
    boxShadow: L_BTN_SHADOW,
  },
}
