"use client"

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import { Instagram, MessageCircle } from "lucide-react"
import type { SectionNode } from "@/lib/page-builder-api"
import { googleFontsHref } from "@/lib/google-fonts"
import { trackEvent } from "@/lib/analytics"
import { WhatsAppPaymentProvider } from "@/lib/payment-providers/whatsapp"
import { resolveTokens } from "@/components/storefront-v2/template/tokens"
import {
  SectionRenderer,
  type TemplateProduct,
  type TemplateRendererProps,
  type TemplateStore,
} from "@/components/storefront-v2/template/template-renderer"

/**
 * ProfileThemeRenderer — base compartida de los temas **persona** y
 * **servicios** (legacy byte-idénticos salvo 3 labels, ver
 * docs/legacy-theme-specs/persona.md §0). Port fiel del diseño legacy
 * (cover + avatar superpuesto, stats, tabs sticky, filtro de categorías,
 * cards horizontales con "Agendar" de checkout directo, grid IG 3-col,
 * FAB de WhatsApp) adaptado al framework:
 *
 * - Colores/tipografías por TOKENS (--bl-*), nunca hex propios. Única
 *   excepción documentada: el verde WhatsApp #25D366 (identidad de marca,
 *   nunca tokenizado — spec §1).
 * - Respeta el árbol de secciones (orden/visibilidad/props) + editorWrap
 *   con selección, y sincroniza tab ↔ sección seleccionada en el editor.
 * - Responsive por container query (nunca @media): cover 144 → 176px.
 * - "Agendar" = checkout directo de WhatsApp de 1 item (trackEvent
 *   CHECKOUT_START + WhatsAppPaymentProvider), como el legacy. El tema NO
 *   tiene carrito: cartCount/onOpenCart se aceptan por contrato pero no se
 *   muestra pill (el legacy no tenía indicador de carrito — spec §8.1.5).
 */
export interface ProfileThemeLabels {
  /** Label de la primera tab cuando la sección grid no define `title`. */
  servicesTab: string
  /** Label del segundo stat derivado (junto a "Trabajos"). */
  servicesStat: string
}

export interface ProfileThemeProps extends TemplateRendererProps {
  labels: ProfileThemeLabels
}

const WHATSAPP_GREEN = "#25D366" // hardcoded por spec — identidad WhatsApp, nunca tokenizado

/** Formato legacy: Intl es-VE currency sin decimales (spec servicios §1). */
export function profilePriceFmt(currency: string): (n: number) => string {
  try {
    const f = new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return (n: number) => f.format(n)
  } catch {
    // Moneda no-ISO en data demo/manual: caer al formato manual del framework.
    return (n: number) => `$${n.toLocaleString("es")}`
  }
}

export function useProfileWhatsAppProvider(store: TemplateStore) {
  return useMemo(
    () => new WhatsAppPaymentProvider(store.whatsappNumber ?? "", store.currency ?? "USD"),
    [store.whatsappNumber, store.currency],
  )
}

/** Checkout directo de 1 servicio (qty 1) — el "Agendar" del legacy. */
export async function bookService(
  store: TemplateStore,
  provider: WhatsAppPaymentProvider,
  product: TemplateProduct,
  image?: string,
): Promise<void> {
  if (!store.whatsappNumber) return
  trackEvent(store.slug, "CHECKOUT_START", product.id)
  await provider.checkout({
    items: [
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image,
      },
    ],
    total: product.price,
    currency: store.currency ?? "USD",
    storeSlug: store.slug,
  })
}

export function ProfileThemeRenderer({
  store,
  products,
  categories,
  theme,
  onOpenProduct,
  productHref,
  rate,
  editorSelectedKey,
  onSectionClick,
  labels,
}: ProfileThemeProps) {
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

  const fmt = useMemo(() => profilePriceFmt(store.currency ?? "USD"), [store.currency])
  const paymentProvider = useProfileWhatsAppProvider(store)

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
        {isSelected && <div style={S.editorTag}>{node.type.toUpperCase()}</div>}
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
    containerName: "bl-profile",
  } as CSSProperties

  const accent = "var(--bl-primary)"

  return (
    <main style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <style dangerouslySetInnerHTML={{ __html: PROFILE_STYLES }} />

      {/* Hero / perfil social */}
      {hero &&
        editorWrap(
          hero,
          <header>
            <div className="bl-profile-cover" style={S.cover}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{ ...S.ctaBtn, background: accent, color: "#fff" }}>
                    <MessageCircle size={16} />
                    {s(hero, "ctaLabel") || "WhatsApp"}
                  </a>
                )}
                {instagramLink && (
                  <a href={instagramLink} target="_blank" rel="noopener noreferrer" style={{ ...S.ctaBtn, background: "transparent", color: "var(--bl-text)", borderWidth: 1.5, borderStyle: "solid", borderColor: "var(--bl-border)" }}>
                    <Instagram size={16} />
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
            {statsItems(stats, galleryImages.length, products.length, labels.servicesStat).map((it, i, all) => (
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
              <button
                type="button"
                className="bl-profile-tab"
                data-active={activeTab === "servicios"}
                onClick={() => setActiveTab("servicios")}
                style={{ ...S.tab, color: activeTab === "servicios" ? "var(--bl-text)" : "var(--bl-text-muted)" }}
              >
                {s(gridSection, "title") || labels.servicesTab}
                {activeTab === "servicios" && <div style={{ ...S.tabIndicator, background: accent }} />}
              </button>
            )}
            {gallerySection && (
              <button
                type="button"
                className="bl-profile-tab"
                data-active={activeTab === "portfolio"}
                onClick={() => setActiveTab("portfolio")}
                style={{ ...S.tab, color: activeTab === "portfolio" ? "var(--bl-text)" : "var(--bl-text-muted)" }}
              >
                {s(gallerySection, "title") || "Portfolio"}
                {activeTab === "portfolio" && <div style={{ ...S.tabIndicator, background: accent }} />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filtro por categoría — visible por defecto si hay >1, como el legacy
          (spec §8.1.4: default true; la sección puede apagarlo con la prop). */}
      {bool(gridSection, "filterByCategory", true) && categories.length > 1 && (
        <div style={S.filterWrap}>
          <div className="bl-profile-filter" style={S.filterRow}>
            {["Todos", ...categories.map((c) => c.name)].map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  className="bl-profile-chip"
                  data-active={active}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...S.filterChip,
                    ...(active
                      ? { background: accent, color: "#fff", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }
                      : { background: "var(--bl-surface)", color: "var(--bl-text-muted)" }),
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Contenido según tab */}
      {activeTab === "servicios" && gridSection &&
        editorWrap(
          gridSection,
          <div style={S.servicesList}>
            {filtered.map((p) => (
              <ServiceCard
                key={p.id}
                product={p}
                fmt={fmt}
                accent={accent}
                href={productHref?.(p) ?? null}
                showPrice={bool(gridSection, "showPrice", true)}
                onOpen={onOpenProduct}
                onBook={
                  store.whatsappNumber
                    ? (image) => void bookService(store, paymentProvider, p, image)
                    : undefined
                }
              />
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
                <div className="bl-profile-cell" style={S.portfolioCell}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.product?.name ?? `Trabajo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )
              if (href) {
                return (
                  <a key={idx} href={href} style={{ display: "block" }}>
                    {cell}
                  </a>
                )
              }
              if (item.product && onOpenProduct) {
                const p = item.product
                return (
                  <button key={idx} type="button" onClick={() => onOpenProduct(p)} style={S.cellBtn}>
                    {cell}
                  </button>
                )
              }
              return <div key={idx}>{cell}</div>
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
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bl-profile-fab" style={S.fab} aria-label="Contactar por WhatsApp">
          <MessageCircle size={24} />
        </a>
      )}
      {/* rate aceptada por contrato; el tema mantiene precios en la moneda de la tienda */}
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
  onBook,
}: {
  product: TemplateProduct
  fmt: (n: number) => string
  accent: string
  href: string | null
  showPrice: boolean
  onOpen?: (p: TemplateProduct) => void
  onBook?: (image?: string) => void
}) {
  const image = product.images?.[0] ?? product.image

  // "Agendar" NO navega: checkout directo de WhatsApp (legacy spec §3).
  function handleBook(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    onBook?.(image)
  }

  const body = (
    <div className="bl-profile-card" style={S.serviceCard}>
      <div className="bl-profile-thumb" style={S.serviceThumb}>
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
          {showPrice ? <span style={{ fontSize: 16, fontWeight: 700, color: accent }}>{fmt(product.price)}</span> : <span />}
          {onBook ? (
            <button type="button" className="bl-profile-book" onClick={handleBook} style={S.bookBtn}>
              <MessageCircle size={12} />
              Agendar
            </button>
          ) : (
            <span className="bl-profile-book" style={S.bookBtn}>
              <MessageCircle size={12} />
              Agendar
            </span>
          )}
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
  // Wrapper div (no <button>): el body contiene el boton Agendar y un boton
  // no puede anidar botones — rompia hidratacion en el canvas del editor.
  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={() => onOpen?.(product)}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onOpen(product)
        }
      }}
      style={{ width: "100%", cursor: onOpen ? "pointer" : "default" }}
    >
      {body}
    </div>
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
  servicesLabel: string,
): Array<{ value: string; label: string }> {
  const own = (arr(stats, "items") as { value?: string; label?: string }[])
    .filter((it) => it.value && it.label)
    .map((it) => ({ value: it.value!, label: it.label! }))
  if (own.length > 0) return own
  // Sin items configurados: derivar como el legacy (trabajos / servicios).
  // ⚠️ Trabajos usa las fotos de los productos FILTRADOS → reacciona al filtro.
  return [
    { value: String(trabajosCount), label: "Trabajos" },
    { value: String(serviciosCount), label: servicesLabel },
  ]
}

// Hovers y el único breakpoint del legacy (cover h-36 → sm:h-44) viven acá.
// Container query contra el root del renderer — NUNCA @media (regla del
// framework: un preview embebido en un frame angosto debe verse móvil).
const PROFILE_STYLES = `
@container bl-profile (min-width: 640px) {
  .bl-profile-cover { height: 176px !important; }
}
.bl-profile-card { transition: box-shadow .2s ease; }
.bl-profile-card:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }
.bl-profile-thumb img { transition: transform .3s ease; }
.bl-profile-card:hover .bl-profile-thumb img { transform: scale(1.05); }
.bl-profile-cell { position: relative; }
.bl-profile-cell img { transition: transform .3s ease; }
.bl-profile-cell:hover img { transform: scale(1.05); }
.bl-profile-cell::after { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,0); transition: background .3s ease; pointer-events: none; }
.bl-profile-cell:hover::after { background: rgba(0,0,0,0.2); }
.bl-profile-tab { transition: color .2s ease; }
.bl-profile-tab[data-active="false"]:hover { color: color-mix(in srgb, var(--bl-text) 60%, var(--bl-text-muted)) !important; }
.bl-profile-chip { transition: all .2s ease; }
.bl-profile-chip[data-active="false"]:hover { color: var(--bl-text) !important; }
.bl-profile-book { transition: opacity .2s ease, transform .1s ease; }
.bl-profile-book:hover { opacity: .9; }
.bl-profile-book:active { transform: scale(.95); }
.bl-profile-fab { transition: transform .2s ease; }
.bl-profile-fab:hover { transform: scale(1.05); }
.bl-profile-filter { scrollbar-width: thin; scrollbar-color: var(--bl-border) transparent; }
.bl-profile-filter::-webkit-scrollbar { height: 4px; }
.bl-profile-filter::-webkit-scrollbar-thumb { background: var(--bl-border); border-radius: 999px; }
.bl-profile-filter::-webkit-scrollbar-track { background: transparent; }
`

const S: Record<string, CSSProperties> = {
  editorTag: {
    position: "absolute", top: -1, left: 12, transform: "translateY(-100%)",
    background: "var(--brand, #1E3A8A)", color: "#fff", fontFamily: "monospace",
    fontSize: 9, padding: "2px 8px", borderRadius: "4px 4px 0 0",
    letterSpacing: "0.06em", zIndex: 5, pointerEvents: "none",
  },
  // h-36 (144px) móvil → 176px ≥640px vía container query (PROFILE_STYLES)
  cover: { height: 144, background: "var(--bl-surface)", overflow: "hidden" },
  profile: {
    maxWidth: 512, margin: "0 auto", padding: "0 16px 16px",
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", marginTop: -56,
  },
  avatar: {
    width: 112, height: 112, borderRadius: "50%", objectFit: "cover",
    borderWidth: 4, borderStyle: "solid", borderColor: "var(--bl-background)",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)", flexShrink: 0,
  },
  kicker: {
    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em",
    color: "var(--bl-text-muted)", marginTop: 12, fontWeight: 700,
  },
  name: { fontFamily: "var(--bl-heading-font)", fontSize: 20, fontWeight: 700, margin: "12px 0 0" },
  bio: { fontSize: 14, color: "var(--bl-text-muted)", marginTop: 6, maxWidth: 320, lineHeight: 1.55 },
  // shadcn h-9 px-5 text-sm del legacy: 36px alto, 20px lateral, 14px
  ctaBtn: {
    display: "inline-flex", alignItems: "center", gap: 8, height: 36,
    padding: "0 20px", borderRadius: 999, fontSize: 14, fontWeight: 600,
    textDecoration: "none", cursor: "pointer",
  },
  statsRow: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 24, padding: "8px 16px 16px",
  },
  statValue: { fontSize: 18, fontWeight: 700, color: "var(--bl-text)" },
  statLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--bl-text-muted)", marginTop: 2 },
  statDivider: { width: 1, height: 32, background: "var(--bl-border)" },
  tabsBar: {
    position: "sticky", top: 0, zIndex: 10,
    background: "var(--bl-background)",
    borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "var(--bl-border)",
  },
  tabsInner: { maxWidth: 512, margin: "0 auto", display: "flex" },
  // py-3 text-sm font-medium del legacy: 12px vertical, 14px, weight 500
  tab: {
    flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 500,
    background: "none", border: "none", cursor: "pointer",
    fontFamily: "inherit", position: "relative",
  },
  tabIndicator: {
    position: "absolute", bottom: 0, left: "25%", right: "25%",
    height: 2, borderRadius: 999,
  },
  filterWrap: { background: "var(--bl-background)", padding: "12px 16px 0" },
  filterRow: {
    maxWidth: 512, margin: "0 auto", display: "flex", gap: 6,
    paddingBottom: 12, overflowX: "auto",
  },
  filterChip: {
    flexShrink: 0, padding: "6px 16px", borderRadius: 999,
    fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
    fontFamily: "inherit", whiteSpace: "nowrap",
  },
  // main pb-24 del legacy = 96px de aire para el FAB
  servicesList: {
    maxWidth: 512, margin: "0 auto", padding: "16px 16px 96px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  serviceCard: {
    display: "flex", gap: 16, padding: 16,
    background: "var(--bl-background)",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--bl-border)",
    borderRadius: "var(--bl-radius)",
    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
  },
  serviceThumb: {
    width: 80, height: 80, borderRadius: 12, overflow: "hidden",
    background: "var(--bl-surface)", flexShrink: 0,
  },
  serviceName: { fontSize: 14, fontWeight: 600, lineHeight: 1.375, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  serviceDesc: {
    fontSize: 12, color: "var(--bl-text-muted)", marginTop: 2, lineHeight: 1.55,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  bookBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 12, fontWeight: 600, color: "#fff",
    background: WHATSAPP_GREEN, padding: "6px 12px", borderRadius: 999,
    border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
  },
  // max-w-lg (512px) como el resto — el portfolio legacy NO es más ancho
  portfolioGrid: {
    maxWidth: 512, margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2,
    paddingBottom: 96,
  },
  portfolioCell: { aspectRatio: "1 / 1", overflow: "hidden", background: "var(--bl-surface)" },
  cellBtn: { display: "block", width: "100%", padding: 0, border: "none", background: "none", cursor: "pointer" },
  emptyMsg: { textAlign: "center", padding: "48px 0", color: "var(--bl-text-muted)", fontSize: 14 },
  fab: {
    position: "fixed", bottom: 24, right: 24, zIndex: 20,
    width: 56, height: 56, borderRadius: "50%",
    background: WHATSAPP_GREEN, color: "#fff",
    display: "grid", placeItems: "center", textDecoration: "none",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  },
}
