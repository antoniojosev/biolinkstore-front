"use client"

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import type { SectionNode } from "@/lib/page-builder-api"
import { googleFontsHref } from "@/lib/google-fonts"
import { resolveTokens } from "@/components/storefront-v2/template/tokens"
import {
  SectionRenderer,
  type TemplateProduct,
  type TemplateRendererProps,
} from "@/components/storefront-v2/template/template-renderer"

/**
 * PersonaRenderer — primer renderer custom del framework (Fase E), port fiel
 * del legacy components/templates/persona (rama feat/multi-currency-rates)
 * adaptado a la forma actual de manejar el diseño:
 *
 * - Colores/tipografías salen de los TOKENS del tema (editables en la tab
 *   Diseño), no de store.primaryColor como el legacy.
 * - Respeta el árbol de secciones del editor (orden/visibilidad/props):
 *   hero → perfil social · stats → fila de métricas · product_grid → tab
 *   Servicios · gallery → tab Portfolio. Las secciones commodity (about,
 *   socials, footer, etc.) se DELEGAN al catálogo base (SectionRenderer).
 * - Navegación actual: cards y celdas usan productHref (página de producto
 *   con OG); el checkout directo del legacy ya no existe.
 * - Responsive por container query (regla del framework — nunca @media).
 */
export function PersonaRenderer({
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

  const [activeTab, setActiveTab] = useState<"servicios" | "portfolio">("servicios")
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const gridSection = sections.find((s) => s.type === "product_grid")
  const gallerySection = sections.find((s) => s.type === "gallery")

  // En el editor, seleccionar la sección de galería cambia a su tab para que
  // el canvas muestre lo que se está editando (y viceversa).
  useEffect(() => {
    if (!editorSelectedKey) return
    if (gallerySection && editorSelectedKey === gallerySection.key) setActiveTab("portfolio")
    if (gridSection && editorSelectedKey === gridSection.key) setActiveTab("servicios")
  }, [editorSelectedKey, gallerySection, gridSection])

  const filtered = useMemo(() => {
    if (selectedCategory === "Todos") return products
    return products.filter((p) => p.category === selectedCategory)
  }, [products, selectedCategory])

  // Portfolio = imágenes propias de la sección gallery + todas las fotos de
  // los productos filtrados (el feed 3-col tipo IG del legacy).
  const galleryImages = useMemo(() => {
    const own = (arr(gallerySection, "items") as { image?: string }[])
      .map((it) => ({ src: it.image ?? "", product: null as TemplateProduct | null }))
      .filter((it) => it.src)
    const fromProducts = filtered.flatMap((p) =>
      (p.images?.length ? p.images : p.image ? [p.image] : []).map((src) => ({ src, product: p as TemplateProduct | null })),
    )
    return [...own, ...fromProducts]
  }, [gallerySection, filtered])

  const hero = sections.find((s) => s.type === "hero")
  const stats = sections.find((s) => s.type === "stats")
  const rest = sections.filter(
    (s) => !["hero", "stats", "product_grid", "gallery"].includes(s.type),
  )

  const whatsappLink = store.whatsappNumber
    ? `https://wa.me/${store.whatsappNumber.replace(/\D/g, "")}`
    : null
  const instagramLink = store.socials?.find((s) => s.platform === "IG")?.url ?? null

  const currencySymbol = (store.currency ?? "USD") === "VES" ? "Bs. " : "$"
  const fmt = (n: number) => `${currencySymbol}${n.toLocaleString("es")}`

  const priceCtx = { currency: store.currency ?? "USD", convert: (n: number) => n }

  // Mismo patrón de selección del renderer base: cada sección clickeable en
  // el editor, con outline y etiqueta de tipo.
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
        {isSelected && (
          <div style={S.editorTag}>{node.type.toUpperCase()}</div>
        )}
        {children}
      </div>
    )
  }

  const rootStyle = {
    ...resolved.cssVars,
    background: "var(--bl-background)",
    color: "var(--bl-text)",
    fontFamily: "var(--bl-body-font)",
    minHeight: "100vh",
    containerType: "inline-size",
    containerName: "bl-persona",
  } as CSSProperties

  const accent = "var(--bl-primary)"

  return (
    <main style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <style dangerouslySetInnerHTML={{ __html: PERSONA_STYLES }} />

      {/* Carrito flotante (solo si hay items — persona no lleva navbar) */}
      {onOpenCart && cartCount > 0 && (
        <button type="button" onClick={onOpenCart} style={S.cartPill} aria-label="Ver carrito">
          🛒 {cartCount}
        </button>
      )}

      {/* Hero / perfil social */}
      {hero &&
        editorWrap(
          hero,
          <header>
            <div style={S.cover}>
              {s(hero, "image") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={s(hero, "image")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: accent, opacity: 0.1 }} />
              )}
            </div>
            <div style={S.profile}>
              {store.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={store.avatar} alt={store.name} style={S.avatar} />
              ) : (
                <div style={{ ...S.avatar, background: accent, display: "grid", placeItems: "center", color: "#fff", fontSize: 36, fontWeight: 800 }}>
                  {(s(hero, "headline") || store.name)[0]?.toUpperCase()}
                </div>
              )}
              {s(hero, "kicker") && <div style={S.kicker}>{s(hero, "kicker")}</div>}
              <h1 style={S.name}>{s(hero, "headline") || store.name}</h1>
              {(s(hero, "subheadline") || store.bio) && (
                <p style={S.bio}>{s(hero, "subheadline") || store.bio}</p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{ ...S.ctaBtn, background: accent, color: "#fff" }}>
                    💬 {s(hero, "ctaLabel") || "WhatsApp"}
                  </a>
                )}
                {instagramLink && (
                  <a href={instagramLink} target="_blank" rel="noopener noreferrer" style={{ ...S.ctaBtn, background: "transparent", color: "var(--bl-text)", borderWidth: 1.5, borderStyle: "solid", borderColor: "var(--bl-border)" }}>
                    Seguir
                  </a>
                )}
              </div>
            </div>
          </header>,
        )}

      {/* Stats */}
      {stats &&
        editorWrap(
          stats,
          <div style={S.statsRow}>
            {(statsItems(stats, galleryImages.length, products.length)).map((it, i, all) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={S.statValue}>{it.value}</div>
                  <div style={S.statLabel}>{it.label}</div>
                </div>
                {i < all.length - 1 && <div style={S.statDivider} />}
              </div>
            ))}
          </div>,
        )}

      {/* Tabs Servicios / Portfolio — el sello del tema */}
      {(gridSection || gallerySection) && (
        <div style={S.tabsBar}>
          <div style={S.tabsInner}>
            {gridSection && (
              <button type="button" onClick={() => setActiveTab("servicios")} style={{ ...S.tab, color: activeTab === "servicios" ? "var(--bl-text)" : "var(--bl-text-muted)" }}>
                {s(gridSection, "title") || "Servicios"}
                {activeTab === "servicios" && <div style={{ ...S.tabIndicator, background: accent }} />}
              </button>
            )}
            {gallerySection && (
              <button type="button" onClick={() => setActiveTab("portfolio")} style={{ ...S.tab, color: activeTab === "portfolio" ? "var(--bl-text)" : "var(--bl-text-muted)" }}>
                {s(gallerySection, "title") || "Portfolio"}
                {activeTab === "portfolio" && <div style={{ ...S.tabIndicator, background: accent }} />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filtro por categoría */}
      {bool(gridSection, "filterByCategory") && categories.length > 1 && (
        <div style={S.filterRow}>
          {["Todos", ...categories.map((c) => c.name)].map((cat) => {
            const active = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...S.filterChip,
                  ...(active ? { background: accent, color: "#fff" } : { background: "var(--bl-surface)", color: "var(--bl-text-muted)" }),
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Contenido según tab */}
      {activeTab === "servicios" && gridSection &&
        editorWrap(
          gridSection,
          <div style={S.servicesList}>
            {filtered.map((p) => (
              <ServiceCard key={p.id} product={p} fmt={fmt} accent={accent} href={productHref?.(p) ?? null} showPrice={bool(gridSection, "showPrice", true)} onOpen={onOpenProduct} />
            ))}
            {filtered.length === 0 && <div style={S.emptyMsg}>No hay servicios en esta categoría</div>}
          </div>,
        )}

      {activeTab === "portfolio" && gallerySection &&
        editorWrap(
          gallerySection,
          <div style={S.portfolioGrid}>
            {galleryImages.map((item, idx) => {
              const href = item.product ? productHref?.(item.product) ?? null : null
              const cell = (
                <div className="bl-persona-cell" style={S.portfolioCell}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.product?.name ?? `Trabajo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )
              return href ? (
                <a key={idx} href={href} style={{ display: "block" }}>
                  {cell}
                </a>
              ) : (
                <div key={idx}>{cell}</div>
              )
            })}
            {galleryImages.length === 0 && <div style={{ ...S.emptyMsg, gridColumn: "1 / -1" }}>Todavía no hay trabajos en el portfolio</div>}
          </div>,
        )}

      {/* Secciones commodity delegadas al catálogo base */}
      {rest.map((node) =>
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
        ),
      )}

      {/* FAB WhatsApp */}
      {whatsappLink && (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={S.fab} aria-label="Contactar por WhatsApp">
          💬
        </a>
      )}
      {/* rate aceptada por contrato; persona mantiene precios simples en la moneda de la tienda */}
      {rate ? null : null}
    </main>
  )
}

function ServiceCard({
  product,
  fmt,
  accent,
  href,
  showPrice,
  onOpen,
}: {
  product: TemplateProduct
  fmt: (n: number) => string
  accent: string
  href: string | null
  showPrice: boolean
  onOpen?: (p: TemplateProduct) => void
}) {
  const image = product.images?.[0] ?? product.image
  const body = (
    <div className="bl-persona-card" style={S.serviceCard}>
      <div style={S.serviceThumb}>
        {image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={S.serviceName}>{product.name}</div>
          {product.description && <div style={S.serviceDesc}>{product.description}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          {showPrice ? <span style={{ fontSize: 15, fontWeight: 700, color: accent }}>{fmt(product.price)}</span> : <span />}
          <span style={S.bookBtn}>💬 Agendar</span>
        </div>
      </div>
    </div>
  )
  if (href) {
    return (
      <a href={href} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
        {body}
      </a>
    )
  }
  return (
    <button type="button" onClick={() => onOpen?.(product)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: onOpen ? "pointer" : "default" }}>
      {body}
    </button>
  )
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

function arr(section: SectionNode | undefined, key: string): unknown[] {
  const v = section?.props?.[key]
  return Array.isArray(v) ? v : []
}

function statsItems(
  stats: SectionNode,
  trabajosCount: number,
  serviciosCount: number,
): Array<{ value: string; label: string }> {
  const own = (arr(stats, "items") as { value?: string; label?: string }[])
    .filter((it) => it.value && it.label)
    .map((it) => ({ value: it.value!, label: it.label! }))
  if (own.length > 0) return own
  // Sin items configurados: derivar como el legacy (trabajos / servicios).
  return [
    { value: String(trabajosCount), label: "Trabajos" },
    { value: String(serviciosCount), label: "Servicios" },
  ]
}

const PERSONA_STYLES = `
@container bl-persona (max-width: 760px) {
  .bl-persona-card { padding: 12px !important; }
}
.bl-persona-cell img { transition: transform .3s ease; }
.bl-persona-cell:hover img { transform: scale(1.05); }
`

const S: Record<string, CSSProperties> = {
  editorTag: {
    position: "absolute", top: -1, left: 12, transform: "translateY(-100%)",
    background: "var(--brand, #1E3A8A)", color: "#fff", fontFamily: "monospace",
    fontSize: 9, padding: "2px 8px", borderRadius: "4px 4px 0 0",
    letterSpacing: "0.06em", zIndex: 5, pointerEvents: "none",
  },
  cartPill: {
    position: "fixed", top: 16, right: 16, zIndex: 30,
    padding: "8px 14px", borderRadius: 999, border: "none",
    background: "var(--bl-primary)", color: "#fff", fontWeight: 700,
    fontSize: 13, cursor: "pointer", boxShadow: "0 8px 20px -6px rgba(0,0,0,0.3)",
  },
  cover: { height: 170, background: "var(--bl-surface)", overflow: "hidden" },
  profile: {
    maxWidth: 520, margin: "0 auto", padding: "0 16px 16px",
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", marginTop: -56,
  },
  avatar: {
    width: 112, height: 112, borderRadius: "50%", objectFit: "cover",
    borderWidth: 4, borderStyle: "solid", borderColor: "var(--bl-background)",
    boxShadow: "0 10px 25px -8px rgba(0,0,0,0.25)", flexShrink: 0,
  },
  kicker: {
    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em",
    color: "var(--bl-text-muted)", marginTop: 12, fontWeight: 700,
  },
  name: { fontFamily: "var(--bl-heading-font)", fontSize: 22, fontWeight: 700, margin: "10px 0 0" },
  bio: { fontSize: 14, color: "var(--bl-text-muted)", marginTop: 6, maxWidth: 320, lineHeight: 1.55 },
  ctaBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 20px", borderRadius: 999, fontSize: 13.5, fontWeight: 600,
    textDecoration: "none", cursor: "pointer",
  },
  statsRow: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 24, padding: "8px 16px 20px",
  },
  statValue: { fontSize: 18, fontWeight: 700, color: "var(--bl-text)" },
  statLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--bl-text-muted)", marginTop: 2 },
  statDivider: { width: 1, height: 32, background: "var(--bl-border)" },
  tabsBar: {
    position: "sticky", top: 0, zIndex: 10,
    background: "var(--bl-background)",
    borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "var(--bl-border)",
  },
  tabsInner: { maxWidth: 520, margin: "0 auto", display: "flex" },
  tab: {
    flex: 1, padding: "13px 0", fontSize: 14, fontWeight: 600,
    background: "none", border: "none", cursor: "pointer",
    fontFamily: "inherit", position: "relative",
  },
  tabIndicator: {
    position: "absolute", bottom: 0, left: "25%", right: "25%",
    height: 2.5, borderRadius: 999,
  },
  filterRow: {
    maxWidth: 520, margin: "0 auto", display: "flex", gap: 6,
    padding: "12px 16px 0", overflowX: "auto",
  },
  filterChip: {
    flexShrink: 0, padding: "6px 16px", borderRadius: 999,
    fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
    fontFamily: "inherit",
  },
  servicesList: {
    maxWidth: 520, margin: "0 auto", padding: "16px 16px 100px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  serviceCard: {
    display: "flex", gap: 16, padding: 16,
    background: "var(--bl-surface)",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--bl-border)",
    borderRadius: "var(--bl-radius)",
  },
  serviceThumb: {
    width: 80, height: 80, borderRadius: 12, overflow: "hidden",
    background: "var(--bl-border)", flexShrink: 0,
  },
  serviceName: { fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  serviceDesc: {
    fontSize: 12, color: "var(--bl-text-muted)", marginTop: 3, lineHeight: 1.5,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  bookBtn: {
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 11.5, fontWeight: 700, color: "#fff",
    background: "#25D366", padding: "6px 12px", borderRadius: 999,
  },
  portfolioGrid: {
    maxWidth: 720, margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2,
    paddingBottom: 100,
  },
  portfolioCell: { aspectRatio: "1 / 1", overflow: "hidden", background: "var(--bl-surface)" },
  emptyMsg: { textAlign: "center", padding: "48px 0", color: "var(--bl-text-muted)", fontSize: 13 },
  fab: {
    position: "fixed", bottom: 24, right: 24, zIndex: 20,
    width: 56, height: 56, borderRadius: "50%",
    background: "#25D366", color: "#fff", fontSize: 24,
    display: "grid", placeItems: "center", textDecoration: "none",
    boxShadow: "0 12px 28px -6px rgba(37,211,102,0.5)",
  },
}
