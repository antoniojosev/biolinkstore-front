import { useState, type CSSProperties } from "react"
import type { PublicStoreTheme, SectionNode } from "@/lib/page-builder-api"
import { buttonStyleProps, resolveTokens } from "./tokens"
import { googleFontsHref } from "@/lib/google-fonts"

export interface PublicRate {
  code: string
  valueVes: number
}

export interface TemplateVariant {
  id: string
  combination: Record<string, string>
  priceAdjustment: number
  stock?: number | null
  image?: string | null
  isAvailable: boolean
}

export interface TemplateProduct {
  id: string
  name: string
  category?: string
  price: number
  image?: string
  images?: string[]
  description?: string
  sku?: string
  stock?: number | null
  variants?: TemplateVariant[]
}

export interface TemplateCategory {
  id: string
  name: string
}

export interface TemplateStore {
  name: string
  username?: string | null
  bio?: string | null
  avatar?: string | null
  slug: string
  whatsappNumber?: string | null
  currency?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface TemplateRendererProps {
  store: TemplateStore
  products: TemplateProduct[]
  categories: TemplateCategory[]
  theme: PublicStoreTheme
  onOpenProduct?: (p: TemplateProduct) => void
  cartCount?: number
  onOpenCart?: () => void
  /** Tasa pública (BCV) para el toggle de moneda del comprador. null si no está disponible. */
  rate?: PublicRate | null
  /** Editor-only: resalta y hace clickeable cada sección para el inspector de secciones. */
  editorSelectedKey?: string
  onSectionClick?: (key: string) => void
}

export function TemplateRenderer({ store, products, categories, theme, onOpenProduct, cartCount = 0, onOpenCart, rate, editorSelectedKey, onSectionClick }: TemplateRendererProps) {
  const resolved = resolveTokens(theme.tokens)
  const sections = (theme.tree?.sections ?? []).filter(
    (s) => (s as { visible?: boolean }).visible !== false,
  )

  const canToggleCurrency = rate != null && (store.currency ?? "USD") !== "VES"
  const [showBs, setShowBs] = useState(false)
  const priceCtx: PriceContext = canToggleCurrency && showBs
    ? { currency: "VES", convert: (usd) => usd * rate!.valueVes }
    : { currency: store.currency ?? "USD", convert: (usd) => usd }

  const rootStyle = {
    ...resolved.cssVars,
    background: "var(--bl-background)",
    color: "var(--bl-text)",
    fontFamily: "var(--bl-body-font)",
    minHeight: "100vh",
  } as CSSProperties

  return (
    <main style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_STYLES }} />
      <NavBar
        store={store}
        resolved={resolved}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        canToggleCurrency={canToggleCurrency}
        showBs={showBs}
        onToggleCurrency={() => setShowBs((v) => !v)}
      />
      {sections.length === 0 ? (
        <EmptyTheme storeName={store.name} />
      ) : (
        sections.map((s) => {
          const section = (
            <SectionRenderer
              key={s.key}
              section={s}
              store={store}
              products={products}
              categories={categories}
              resolved={resolved}
              onOpenProduct={onOpenProduct}
              priceCtx={priceCtx}
            />
          )
          if (!onSectionClick) return section
          const isSelected = editorSelectedKey === s.key
          return (
            <div
              key={s.key}
              data-section-key={s.key}
              onClick={(e) => {
                e.stopPropagation()
                onSectionClick(s.key)
              }}
              style={{
                position: "relative",
                cursor: "pointer",
                outline: isSelected ? "2px solid var(--brand, #1E3A8A)" : "2px solid transparent",
                outlineOffset: -2,
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    left: 12,
                    transform: "translateY(-100%)",
                    background: "var(--brand, #1E3A8A)",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: 9,
                    padding: "2px 8px",
                    borderRadius: "4px 4px 0 0",
                    letterSpacing: "0.06em",
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                >
                  {s.type.toUpperCase()}
                </div>
              )}
              {section}
            </div>
          )
        })
      )}
      <FooterBranding store={store} resolved={resolved} />
    </main>
  )
}

// Real breakpoint for layouts that must STACK (not just shrink columns) on
// mobile — hero/about are asymmetric text+image pairs, auto-fit grids elsewhere
// already collapse naturally via minmax().
const RESPONSIVE_STYLES = `
@media (max-width: 760px) {
  .bl-hero-grid, .bl-about-grid { grid-template-columns: 1fr !important; }
  .bl-section { padding-top: calc(var(--bl-spacing) * 1.4) !important; padding-bottom: calc(var(--bl-spacing) * 1.4) !important; }
  .bl-navbar { padding: 14px 16px !important; }
}
`

// ----------------------------------------------------------------------------
// Section dispatcher
// ----------------------------------------------------------------------------

interface PriceContext {
  currency: string
  convert: (usdOrBasePrice: number) => number
}

interface SectionProps {
  section: SectionNode
  store: TemplateStore
  products: TemplateProduct[]
  categories: TemplateCategory[]
  resolved: ReturnType<typeof resolveTokens>
  onOpenProduct?: (p: TemplateProduct) => void
  priceCtx?: PriceContext
}

function SectionRenderer(props: SectionProps) {
  switch (props.section.type) {
    case "hero":
      return <HeroSection {...props} />
    case "product_grid":
      return <ProductGridSection {...props} />
    case "featured_products":
      return <FeaturedProductsSection {...props} />
    case "categories":
      return <CategoriesSection {...props} />
    case "about":
      return <AboutSection {...props} />
    case "contact":
      return <ContactSection {...props} />
    case "hours":
      return <HoursSection {...props} />
    case "socials":
      return <SocialsSection {...props} />
    case "gallery":
      return <GallerySection {...props} />
    case "text_block":
      return <TextBlockSection {...props} />
    case "cta_banner":
      return <CtaBannerSection {...props} />
    case "faq":
      return <FaqSection {...props} />
    case "stats":
      return <StatsSection {...props} />
    case "testimonials":
      return <TestimonialsSection {...props} />
    case "map":
      return <MapSection {...props} />
    case "footer":
      return <FooterSection {...props} />
    default:
      return <UnknownSection type={props.section.type} />
  }
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function s(section: SectionNode, key: string, fallback = ""): string {
  const v = section.props?.[key]
  return typeof v === "string" ? v : fallback
}

function bool(section: SectionNode, key: string, fallback = false): boolean {
  const v = section.props?.[key]
  return typeof v === "boolean" ? v : fallback
}

function arr<T = unknown>(section: SectionNode, key: string): T[] {
  const v = section.props?.[key]
  return Array.isArray(v) ? (v as T[]) : []
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "VES" ? "Bs. " : ""
  return `${symbol}${amount.toLocaleString("es", { maximumFractionDigits: currency === "VES" ? 0 : 2 })}`
}

function priceLabel(amount: number, ctx: PriceContext | undefined, fallbackCurrency?: string | null): string {
  if (!ctx) return formatAmount(amount, fallbackCurrency ?? "USD")
  return formatAmount(ctx.convert(amount), ctx.currency)
}

function whatsappUrl(phone: string | null | undefined, message: string): string {
  if (!phone) return "#"
  const clean = phone.replace(/\D/g, "")
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

// ----------------------------------------------------------------------------
// Layout chrome
// ----------------------------------------------------------------------------

function NavBar({
  store,
  resolved,
  cartCount = 0,
  onOpenCart,
  canToggleCurrency = false,
  showBs = false,
  onToggleCurrency,
}: {
  store: TemplateStore
  resolved: ReturnType<typeof resolveTokens>
  cartCount?: number
  onOpenCart?: () => void
  canToggleCurrency?: boolean
  showBs?: boolean
  onToggleCurrency?: () => void
}) {
  return (
    <header
      className="bl-navbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 28px",
        borderBottom: "1px solid var(--bl-border)",
        position: "sticky",
        top: 0,
        background: "var(--bl-background)",
        zIndex: 10,
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {store.avatar && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={store.avatar} alt={store.name} width={36} height={36} style={{ borderRadius: 999, flexShrink: 0 }} />
        )}
        <span style={{ fontFamily: "var(--bl-heading-font)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {store.name}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {canToggleCurrency && (
          <button
            type="button"
            onClick={onToggleCurrency}
            aria-label="Cambiar moneda"
            style={{
              height: 44,
              padding: "0 12px",
              borderRadius: resolved.radiusPx,
              border: "1.5px solid var(--bl-border)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--bl-text)",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "var(--bl-mono-font)",
            }}
          >
            {showBs ? "Bs" : store.currency ?? "USD"}
          </button>
        )}
        {onOpenCart && (
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Ver carrito"
            style={{
              position: "relative",
              width: 44,
              height: 44,
              borderRadius: resolved.radiusPx,
              border: "1.5px solid var(--bl-border)",
              background: "transparent",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "var(--bl-text)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 4h13M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 999,
                  background: "var(--bl-accent)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  padding: "0 4px",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        )}
        {store.whatsappNumber && (
          <a
            href={whatsappUrl(store.whatsappNumber, `Hola ${store.name}, vi tu catálogo en bylink.app/${store.slug}`)}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyleProps(resolved.buttonStyle, resolved.radiusPx)}
          >
            Contactar
          </a>
        )}
      </div>
    </header>
  )
}

function FooterBranding({ store, resolved }: { store: TemplateStore; resolved: ReturnType<typeof resolveTokens> }) {
  return (
    <footer
      style={{
        padding: "32px 28px",
        borderTop: "1px solid var(--bl-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 12,
        color: "var(--bl-text-muted)",
        fontFamily: resolved.monoFont,
      }}
    >
      <span>© {new Date().getFullYear()} {store.name}</span>
      <span>
        powered by{" "}
        <a
          href="https://bylink.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--bl-primary)", textDecoration: "none", fontWeight: 600 }}
        >
          bylink
        </a>
      </span>
    </footer>
  )
}

function EmptyTheme({ storeName }: { storeName: string }) {
  return (
    <section
      style={{
        padding: "120px 28px",
        textAlign: "center",
        color: "var(--bl-text-muted)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--bl-heading-font)",
          fontSize: 36,
          letterSpacing: "-0.025em",
          margin: "0 0 12px",
          color: "var(--bl-text)",
        }}
      >
        {storeName}
      </h1>
      <p style={{ maxWidth: 480, margin: "0 auto", fontSize: 15, lineHeight: 1.55 }}>
        Esta tienda todavía no publicó su diseño. Vuelve pronto.
      </p>
    </section>
  )
}

// ----------------------------------------------------------------------------
// Sections
// ----------------------------------------------------------------------------

function SectionShell({
  children,
  pad = true,
  background,
}: {
  children: React.ReactNode
  pad?: boolean
  background?: string
}) {
  return (
    <section
      className={pad ? "bl-section" : undefined}
      style={{
        padding: pad ? "calc(var(--bl-spacing) * 2.4) 28px" : 0,
        background,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>{children}</div>
    </section>
  )
}

function ctaHref(section: SectionNode, store: TemplateStore, fallbackMessage: string, defaultType = "scroll"): string {
  const ctaType = s(section, "ctaType", defaultType)
  const ctaUrl = s(section, "ctaUrl")
  if (ctaType === "whatsapp") return whatsappUrl(store.whatsappNumber, ctaUrl || fallbackMessage)
  if (ctaType === "external") return ctaUrl || "#"
  return "#catalog"
}

function HeroSection({ section, store, resolved }: SectionProps) {
  const title = s(section, "headline", store.name)
  const subtitle = s(section, "subheadline", store.bio ?? "")
  const image = s(section, "image")
  const eyebrow = s(section, "eyebrow")
  const ctaLabel = s(section, "ctaLabel", "Ver catálogo")
  const ctaHrefValue = ctaHref(section, store, `Hola ${store.name}, vi tu tienda y quiero más info`)
  const ctaExternal = s(section, "ctaType", "scroll") !== "scroll"

  return (
    <SectionShell>
      <div
        className="bl-hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: image ? "1fr 1fr" : "1fr",
          gap: "calc(var(--bl-spacing) * 2)",
          alignItems: "center",
        }}
      >
        <div>
          {eyebrow && (
            <div
              style={{
                color: "var(--bl-accent)",
                fontWeight: 700,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.08,
                marginBottom: 14,
              }}
            >
              {eyebrow}
            </div>
          )}
          <h1
            style={{
              fontFamily: "var(--bl-heading-font)",
              fontSize: "clamp(36px, 5vw, 56px)",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              margin: 0,
              color: "var(--bl-text)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--bl-text-muted)",
                marginTop: 18,
                maxWidth: 520,
              }}
            >
              {subtitle}
            </p>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
            <a
              href={ctaHrefValue}
              {...(ctaExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              style={buttonStyleProps(resolved.buttonStyle, resolved.radiusPx)}
            >
              {ctaLabel}
            </a>
            {store.whatsappNumber && s(section, "ctaType", "scroll") !== "whatsapp" && (
              <a
                href={whatsappUrl(
                  store.whatsappNumber,
                  `Hola ${store.name}, vi tu tienda y quiero más info`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...buttonStyleProps(resolved.buttonStyle, resolved.radiusPx, "secondary"),
                  background: "transparent",
                  color: "var(--bl-text)",
                  border: "1.5px solid var(--bl-border)",
                }}
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
        {image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: resolved.radiusPx,
              aspectRatio: "4/3",
              objectFit: "cover",
            }}
          />
        )}
      </div>
    </SectionShell>
  )
}

function ProductCard({
  product,
  resolved,
  currency,
  priceCtx,
  showPrice = true,
  showSku = false,
  onOpen,
}: {
  product: TemplateProduct
  resolved: ReturnType<typeof resolveTokens>
  currency?: string | null
  priceCtx?: PriceContext
  showPrice?: boolean
  showSku?: boolean
  onOpen?: (product: TemplateProduct) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(product)}
      style={{
        background: "var(--bl-surface)",
        border: "1px solid var(--bl-border)",
        borderRadius: resolved.radiusPx,
        overflow: "hidden",
        textAlign: "left",
        cursor: "pointer",
        color: "var(--bl-text)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 0,
        font: "inherit",
      }}
    >
      <div style={{ aspectRatio: "4 / 3", background: "var(--bl-border)" }}>
        {product.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>
      <div style={{ padding: "8px 14px 16px" }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{product.name}</div>
        {product.category && (
          <div style={{ fontSize: 11, color: "var(--bl-text-muted)", marginTop: 2 }}>{product.category}</div>
        )}
        {showSku && product.sku && (
          <div style={{ fontSize: 10, color: "var(--bl-text-muted)", fontFamily: "var(--bl-mono-font)", marginTop: 2 }}>{product.sku}</div>
        )}
        {showPrice && (
          <div
            style={{
              fontFamily: "var(--bl-mono-font)",
              marginTop: 8,
              fontSize: 14,
              color: "var(--bl-primary)",
              fontWeight: 600,
            }}
          >
            {priceLabel(product.price, priceCtx, currency)}
          </div>
        )}
      </div>
    </button>
  )
}

// minmax() width tuned so ~N columns fit a desktop viewport, collapsing gracefully
// on narrow screens without a hard breakpoint (list stays 1 column always).
const LAYOUT_MINMAX: Record<string, string> = {
  "grid-2": "280px",
  "grid-3": "220px",
  "grid-4": "170px",
  list: "100%",
}

function ProductGridSection({ section, products, categories, store, resolved, onOpenProduct, priceCtx }: SectionProps) {
  const title = s(section, "title", "Catálogo")
  const layout = s(section, "layout", "grid-3")
  const colMinWidth = LAYOUT_MINMAX[layout] ?? "220px"
  const filterByCategory = bool(section, "filterByCategory", false)
  const showPrice = bool(section, "showPrice", true)
  const showSku = bool(section, "showSku", false)

  return (
    <SectionShell>
      <div id="catalog" />
      <h2
        style={{
          fontFamily: "var(--bl-heading-font)",
          fontSize: 28,
          letterSpacing: "-0.02em",
          margin: "0 0 calc(var(--bl-spacing) * 1.2)",
        }}
      >
        {title}
      </h2>
      {filterByCategory && categories.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#category-${c.id}`}
              style={{
                padding: "6px 14px",
                border: "1px solid var(--bl-border)",
                borderRadius: 999,
                textDecoration: "none",
                color: "var(--bl-text)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {c.name}
            </a>
          ))}
        </div>
      )}
      {products.length === 0 ? (
        <p style={{ color: "var(--bl-text-muted)" }}>Aún no hay productos publicados.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fit, minmax(${colMinWidth}, 1fr))`,
            gap: 18,
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} resolved={resolved} currency={store.currency} priceCtx={priceCtx} showPrice={showPrice} showSku={showSku} onOpen={onOpenProduct} />
          ))}
        </div>
      )}
    </SectionShell>
  )
}

function FeaturedProductsSection({ section, products, store, resolved, onOpenProduct, priceCtx }: SectionProps) {
  const title = s(section, "title", "Destacados")
  const productIdItems = arr<{ id?: string }>(section, "productIds")
  const productIds = productIdItems.map((it) => it.id).filter((id): id is string => Boolean(id))
  const subset = productIds.length > 0 ? products.filter((p) => productIds.includes(p.id)) : products.slice(0, 4)

  return (
    <SectionShell background="var(--bl-surface)">
      <h2
        style={{
          fontFamily: "var(--bl-heading-font)",
          fontSize: 28,
          letterSpacing: "-0.02em",
          margin: "0 0 calc(var(--bl-spacing) * 1.2)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
        }}
      >
        {subset.map((p) => (
          <ProductCard key={p.id} product={p} resolved={resolved} currency={store.currency} priceCtx={priceCtx} onOpen={onOpenProduct} />
        ))}
      </div>
    </SectionShell>
  )
}

function CategoriesSection({ section, categories, resolved }: SectionProps) {
  const title = s(section, "title", "Categorías")
  return (
    <SectionShell>
      <h2
        style={{
          fontFamily: "var(--bl-heading-font)",
          fontSize: 24,
          letterSpacing: "-0.02em",
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#category-${c.id}`}
            style={{
              padding: "8px 16px",
              border: "1px solid var(--bl-border)",
              borderRadius: 999,
              textDecoration: "none",
              color: "var(--bl-text)",
              fontSize: 13,
              fontWeight: 500,
              background: "var(--bl-background)",
            }}
          >
            {c.name}
          </a>
        ))}
      </div>
    </SectionShell>
  )
}

function AboutSection({ section, resolved }: SectionProps) {
  const title = s(section, "title", "Sobre nosotros")
  const body = s(section, "body")
  const image = s(section, "image")
  const layout = s(section, "layout", "left")

  return (
    <SectionShell background="var(--bl-surface)">
      <div
        className="bl-about-grid"
        style={{
          display: "grid",
          gridTemplateColumns: image ? (layout === "right" ? "1fr 1fr" : "1fr 1fr") : "1fr",
          gap: "calc(var(--bl-spacing) * 1.5)",
          alignItems: "center",
        }}
      >
        {image && layout === "left" && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt={title}
            style={{ width: "100%", borderRadius: resolved.radiusPx, aspectRatio: "4/3", objectFit: "cover" }}
          />
        )}
        <div>
          <h2
            style={{
              fontFamily: "var(--bl-heading-font)",
              fontSize: 28,
              letterSpacing: "-0.02em",
              margin: "0 0 14px",
            }}
          >
            {title}
          </h2>
          {body && (
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--bl-text-muted)" }}>{body}</p>
          )}
        </div>
        {image && layout === "right" && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt={title}
            style={{ width: "100%", borderRadius: resolved.radiusPx, aspectRatio: "4/3", objectFit: "cover" }}
          />
        )}
      </div>
    </SectionShell>
  )
}

function ContactSection({ section, store, resolved }: SectionProps) {
  const title = s(section, "title", "Contacto")
  const phone = s(section, "phone", store.phone ?? store.whatsappNumber ?? "")
  const email = s(section, "email", store.email ?? "")
  const address = s(section, "address", store.address ?? "")
  const showWa = bool(section, "showWhatsappCta", true)

  return (
    <SectionShell>
      <h2
        style={{
          fontFamily: "var(--bl-heading-font)",
          fontSize: 28,
          letterSpacing: "-0.02em",
          margin: "0 0 calc(var(--bl-spacing) * 1.2)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
        {phone && (
          <div>
            <div style={{ color: "var(--bl-text-muted)", fontSize: 12, marginBottom: 4 }}>Teléfono</div>
            <div style={{ fontWeight: 600 }}>{phone}</div>
          </div>
        )}
        {email && (
          <div>
            <div style={{ color: "var(--bl-text-muted)", fontSize: 12, marginBottom: 4 }}>Email</div>
            <a href={`mailto:${email}`} style={{ fontWeight: 600, color: "var(--bl-text)", textDecoration: "none" }}>
              {email}
            </a>
          </div>
        )}
        {address && (
          <div>
            <div style={{ color: "var(--bl-text-muted)", fontSize: 12, marginBottom: 4 }}>Dirección</div>
            <div style={{ fontWeight: 600 }}>{address}</div>
          </div>
        )}
      </div>
      {showWa && store.whatsappNumber && (
        <div style={{ marginTop: 22 }}>
          <a
            href={whatsappUrl(store.whatsappNumber, "Hola, quería hacerte una consulta")}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyleProps(resolved.buttonStyle, resolved.radiusPx)}
          >
            Escribir por WhatsApp
          </a>
        </div>
      )}
    </SectionShell>
  )
}

const DAY_NAMES: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
}

function HoursSection({ section }: SectionProps) {
  const title = s(section, "title", "Horarios")
  const items = arr<{ day?: string; open?: string; close?: string; closed?: boolean }>(section, "items")
  return (
    <SectionShell>
      <h2
        style={{
          fontFamily: "var(--bl-heading-font)",
          fontSize: 24,
          letterSpacing: "-0.02em",
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {items.map((h, i) => (
          <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--bl-border)" }}>
            <span style={{ fontWeight: 500 }}>{DAY_NAMES[h.day ?? ""] ?? h.day}</span>
            <span style={{ fontFamily: "var(--bl-mono-font)", color: "var(--bl-text-muted)", fontSize: 13 }}>
              {h.closed ? "Cerrado" : `${h.open} – ${h.close}`}
            </span>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

function SocialsSection({ section }: SectionProps) {
  const title = s(section, "title")
  const items = arr<{ platform?: string; url?: string }>(section, "items")
  return (
    <SectionShell background="var(--bl-surface)">
      {title && (
        <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 22, margin: "0 0 14px" }}>{title}</h2>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {items.map((it, i) => (
          <a
            key={i}
            href={it.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 14px",
              border: "1px solid var(--bl-border)",
              borderRadius: 999,
              textDecoration: "none",
              color: "var(--bl-text)",
              fontSize: 13,
              fontWeight: 600,
              background: "var(--bl-background)",
              textTransform: "capitalize",
            }}
          >
            {it.platform ?? "link"} ↗
          </a>
        ))}
      </div>
    </SectionShell>
  )
}

function GallerySection({ section, resolved }: SectionProps) {
  const title = s(section, "title", "Galería")
  const items = arr<{ image?: string; caption?: string }>(section, "items")
  if (items.length === 0) return null
  return (
    <SectionShell>
      <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 24, margin: "0 0 18px" }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {items.map((it, i) =>
          it.image ? (
            <figure key={i} style={{ margin: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.image}
                alt={it.caption ?? `Imagen ${i + 1}`}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: resolved.radiusPx }}
              />
              {it.caption && (
                <figcaption style={{ marginTop: 6, fontSize: 12, color: "var(--bl-text-muted)" }}>{it.caption}</figcaption>
              )}
            </figure>
          ) : null,
        )}
      </div>
    </SectionShell>
  )
}

function TextBlockSection({ section }: SectionProps) {
  const kicker = s(section, "kicker")
  const headline = s(section, "headline")
  const body = s(section, "body")
  const align = s(section, "align", "left")
  if (!body && !headline) return null
  return (
    <SectionShell>
      <div
        style={{
          maxWidth: 720,
          margin: align === "center" ? "0 auto" : "0",
          textAlign: align as React.CSSProperties["textAlign"],
        }}
      >
        {kicker && (
          <div style={{ color: "var(--bl-accent)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 10 }}>{kicker}</div>
        )}
        {headline && (
          <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 12px" }}>{headline}</h2>
        )}
        {body && (
          <div style={{ fontSize: 16, lineHeight: 1.6, color: "var(--bl-text)" }}>{body}</div>
        )}
      </div>
    </SectionShell>
  )
}

function CtaBannerSection({ section, store, resolved }: SectionProps) {
  const title = s(section, "headline", "Empieza ahora")
  const subtitle = s(section, "subline", "")
  const ctaLabel = s(section, "ctaLabel", "Contactar")
  const backgroundColor = s(section, "backgroundColor", "") || "var(--bl-primary)"
  const href = ctaHref(section, store, "Hola, quiero info", "whatsapp")
  const external = s(section, "ctaType", "whatsapp") !== "scroll"

  return (
    <SectionShell>
      <div
        style={{
          background: backgroundColor,
          color: "#FFF",
          borderRadius: resolved.radiusPx,
          padding: "48px 36px",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 28, margin: "0 0 12px" }}>{title}</h3>
        {subtitle && <p style={{ margin: "0 0 22px", opacity: 0.85, fontSize: 15 }}>{subtitle}</p>}
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          style={{
            ...buttonStyleProps("solid", resolved.radiusPx),
            background: "#FFF",
            color: backgroundColor,
          }}
        >
          {ctaLabel}
        </a>
      </div>
    </SectionShell>
  )
}

function FaqSection({ section }: SectionProps) {
  const title = s(section, "title", "Preguntas frecuentes")
  const items = arr<{ question?: string; answer?: string }>(section, "items")
  if (items.length === 0) return null
  return (
    <SectionShell>
      <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 24, margin: "0 0 18px" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((it, i) => (
          <details
            key={i}
            style={{
              border: "1px solid var(--bl-border)",
              borderRadius: 10,
              padding: "14px 18px",
              background: "var(--bl-surface)",
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 15 }}>{it.question}</summary>
            <p style={{ marginTop: 10, color: "var(--bl-text-muted)", fontSize: 14, lineHeight: 1.55 }}>{it.answer}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  )
}

function StatsSection({ section }: SectionProps) {
  const items = arr<{ value?: string; label?: string }>(section, "items")
  if (items.length === 0) return null
  return (
    <SectionShell>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 18 }}>
        {items.map((it, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--bl-heading-font)",
                fontSize: 36,
                fontWeight: 700,
                color: "var(--bl-primary)",
              }}
            >
              {it.value}
            </div>
            <div style={{ fontSize: 13, color: "var(--bl-text-muted)", marginTop: 4 }}>{it.label}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

function TestimonialsSection({ section }: SectionProps) {
  const title = s(section, "title", "Lo que dicen")
  const items = arr<{ quote?: string; author?: string }>(section, "items")
  if (items.length === 0) return null
  return (
    <SectionShell background="var(--bl-surface)">
      <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 24, margin: "0 0 22px" }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
        {items.map((it, i) => (
          <blockquote
            key={i}
            style={{
              background: "var(--bl-background)",
              border: "1px solid var(--bl-border)",
              borderRadius: 12,
              padding: 22,
              margin: 0,
            }}
          >
            <p style={{ margin: 0, fontStyle: "italic", lineHeight: 1.55 }}>{it.quote}</p>
            {it.author && (
              <footer
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "var(--bl-text-muted)",
                  fontFamily: "var(--bl-mono-font)",
                }}
              >
                — {it.author}
              </footer>
            )}
          </blockquote>
        ))}
      </div>
    </SectionShell>
  )
}

function num(section: SectionNode, key: string): number | undefined {
  const v = section.props?.[key]
  return typeof v === "number" ? v : undefined
}

function MapSection({ section, store }: SectionProps) {
  const title = s(section, "title", "Ubicación")
  const lat = num(section, "latitude")
  const lng = num(section, "longitude")
  const zoom = num(section, "zoom") ?? 14
  const hasCoords = lat != null && lng != null
  if (!hasCoords && !store.address) return null
  const mapUrl = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(store.address ?? "")}&output=embed`
  return (
    <SectionShell>
      <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 22, margin: "0 0 14px" }}>{title}</h2>
      <iframe
        src={mapUrl}
        loading="lazy"
        style={{ width: "100%", height: 360, border: 0, borderRadius: 12 }}
        title={title}
      />
    </SectionShell>
  )
}

function FooterSection({ section, store }: SectionProps) {
  const tagline = s(section, "tagline", store.bio ?? "")
  return (
    <SectionShell background="var(--bl-surface)" pad={false}>
      <div style={{ padding: "36px 28px", textAlign: "center" }}>
        {tagline && (
          <p style={{ margin: 0, color: "var(--bl-text-muted)", fontSize: 14, maxWidth: 480, marginInline: "auto" }}>
            {tagline}
          </p>
        )}
      </div>
    </SectionShell>
  )
}

function UnknownSection({ type }: { type: string }) {
  if (process.env.NODE_ENV !== "development") return null
  return (
    <div
      style={{
        margin: "12px 28px",
        padding: "14px 18px",
        border: "1px dashed var(--bl-border)",
        borderRadius: 10,
        background: "var(--bl-surface)",
        color: "var(--bl-text-muted)",
        fontSize: 12,
        fontFamily: "var(--bl-mono-font)",
      }}
    >
      Section type &quot;{type}&quot; aún no implementada en el renderer.
    </div>
  )
}
