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

/**
 * Atributo de producto con rol semántico (mismos roles que el backend):
 * sin role (o 'variant') = eje seleccionable · 'spec'/'tag' = ficha de
 * inmueble · 'ingredient-included'/'ingredient-extra' = flujo "arma tu…".
 * Los renderers por tema los consumen (specs de propiedades, ingredientes).
 */
/** Redes visibles en una sección: store.socials menos las ocultas (socialsHidden). */
export function filterVisibleSocials(
  socials: TemplateSocialLink[] | undefined,
  hidden: unknown,
): TemplateSocialLink[] {
  const list = socials ?? []
  const hiddenSet = new Set(Array.isArray(hidden) ? (hidden as string[]) : [])
  return list.filter((s) => !hiddenSet.has(s.platform))
}

export interface TemplateAttribute {
  name: string
  type: "text" | "color"
  role?: string
  options: string[]
  optionsMeta?: Record<string, { hex?: string; priceDelta?: number; images?: string[] }>
}

/**
 * Imágenes asociadas a la opción de color seleccionada (optionsMeta.images) —
 * para que el detalle muestre las fotos del producto en ese color. Devuelve
 * null si no hay atributo de color, no hay color elegido, o esa opción no tiene
 * imágenes propias (→ el sheet usa la galería base del producto).
 */
export function colorImagesForSelection(
  product: Pick<TemplateProduct, "attributes">,
  selected: Record<string, string>,
): string[] | null {
  const colorAttr = product.attributes?.find((a) => a.type === "color")
  if (!colorAttr) return null
  const value = selected[colorAttr.name]
  if (!value) return null
  const imgs = colorAttr.optionsMeta?.[value]?.images
  return imgs && imgs.length > 0 ? imgs : null
}

export interface TemplateProduct {
  id: string
  name: string
  /** Slug único por tienda — habilita la página propia /{tienda}/{producto}. */
  slug?: string
  category?: string
  price: number
  image?: string
  images?: string[]
  description?: string
  sku?: string
  stock?: number | null
  variants?: TemplateVariant[]
  /** Precio tachado (oferta) — los temas legacy muestran badge de sale. */
  compareAtPrice?: number
  /** Etiqueta corta del plato/pieza (ej. "Como te gusta" en poster). */
  tagline?: string
  featured?: boolean
  attributes?: TemplateAttribute[]
}

export interface TemplateCategory {
  id: string
  name: string
}

export interface TemplateSocialLink {
  platform: string
  url: string
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
  /** BE-124: redes reales de la tienda (plataforma-managed) — tienen prioridad sobre section.props.items. */
  socials?: TemplateSocialLink[]
}

export interface TemplateRendererProps {
  store: TemplateStore
  products: TemplateProduct[]
  categories: TemplateCategory[]
  theme: PublicStoreTheme
  onOpenProduct?: (p: TemplateProduct) => void
  /**
   * Cuando está presente, las cards de producto son <a href> reales hacia la
   * página propia del producto (SEO, middle-click, compartir). Sin él
   * (editor/previews) las cards quedan como botones que llaman onOpenProduct.
   */
  productHref?: (p: TemplateProduct) => string | null
  cartCount?: number
  onOpenCart?: () => void
  /** Tasa pública (BCV) para el toggle de moneda del comprador. null si no está disponible. */
  rate?: PublicRate | null
  /** Editor-only: resalta y hace clickeable cada sección para el inspector de secciones. */
  editorSelectedKey?: string
  onSectionClick?: (key: string) => void
}

export function TemplateRenderer({ store, products, categories, theme, onOpenProduct, productHref, cartCount = 0, onOpenCart, rate, editorSelectedKey, onSectionClick }: TemplateRendererProps) {
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
    // El breakpoint "móvil" de RESPONSIVE_STYLES mide el ancho de ESTE
    // contenedor, no el viewport — así un preview embebido en un frame
    // angosto (editor, modal de temas) apila el layout de verdad.
    containerType: "inline-size",
    containerName: "bl-store",
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
              productHref={productHref}
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
// already collapse naturally via minmax(). Container query (not @media): mide
// el ancho del <main> (containerName: bl-store), no el viewport, para que un
// preview embebido en un frame angosto muestre el layout móvil real.
const RESPONSIVE_STYLES = `
@container bl-store (max-width: 760px) {
  .bl-hero-grid, .bl-about-grid { grid-template-columns: 1fr !important; }
  .bl-section { padding-top: calc(var(--bl-spacing) * 1.4) !important; padding-bottom: calc(var(--bl-spacing) * 1.4) !important; }
  .bl-navbar { padding: 14px 16px !important; }
}
`

// ----------------------------------------------------------------------------
// Section dispatcher
// ----------------------------------------------------------------------------

export interface PriceContext {
  currency: string
  convert: (usdOrBasePrice: number) => number
}

export interface SectionProps {
  section: SectionNode
  store: TemplateStore
  products: TemplateProduct[]
  categories: TemplateCategory[]
  resolved: ReturnType<typeof resolveTokens>
  onOpenProduct?: (p: TemplateProduct) => void
  productHref?: (p: TemplateProduct) => string | null
  priceCtx?: PriceContext
}

export function SectionRenderer(props: SectionProps) {
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

export function NavBar({
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
  // Bug: el schema declara "kicker" (3 de 9 templates lo tienen), el renderer
  // leia "eyebrow" - una prop que ningun template declara. Nunca se mostraba.
  const eyebrow = s(section, "kicker")
  const ctaLabel = s(section, "ctaLabel", "Ver catálogo")
  const ctaHrefValue = ctaHref(section, store, `Hola ${store.name}, vi tu tienda y quiero más info`)
  const ctaExternal = s(section, "ctaType", "scroll") !== "scroll"
  const layout = s(section, "layout", "split")
  const centered = layout === "compact" || layout === "banner"
  const onDark = layout === "banner" && Boolean(image)

  const eyebrowEl = eyebrow ? (
    <div
      style={{
        color: onDark ? "rgba(255,255,255,0.9)" : "var(--bl-accent)",
        fontWeight: 700,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.08,
        marginBottom: 14,
      }}
    >
      {eyebrow}
    </div>
  ) : null

  const ctasEl = (
    <div style={{ display: "flex", gap: 10, marginTop: 26, justifyContent: centered ? "center" : "flex-start" }}>
      <a
        href={ctaHrefValue}
        {...(ctaExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        style={buttonStyleProps(resolved.buttonStyle, resolved.radiusPx)}
      >
        {ctaLabel}
      </a>
      {store.whatsappNumber && s(section, "ctaType", "scroll") !== "whatsapp" && (
        <a
          href={whatsappUrl(store.whatsappNumber, `Hola ${store.name}, vi tu tienda y quiero más info`)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...buttonStyleProps(resolved.buttonStyle, resolved.radiusPx, "secondary"),
            background: "transparent",
            color: onDark ? "#fff" : "var(--bl-text)",
            border: `1.5px solid ${onDark ? "rgba(255,255,255,0.6)" : "var(--bl-border)"}`,
          }}
        >
          WhatsApp
        </a>
      )}
    </div>
  )

  if (layout === "compact") {
    return (
      <SectionShell>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          {eyebrowEl}
          <h1
            style={{
              fontFamily: "var(--bl-heading-font)",
              fontSize: "clamp(32px, 5vw, 48px)",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              margin: 0,
              color: "var(--bl-text)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--bl-text-muted)", marginTop: 16, maxWidth: 480, marginInline: "auto" }}>
              {subtitle}
            </p>
          )}
          {ctasEl}
        </div>
      </SectionShell>
    )
  }

  if (layout === "banner" && image) {
    return (
      <section
        className="bl-section"
        style={{
          position: "relative",
          minHeight: "56vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "calc(var(--bl-spacing) * 2.4) 28px",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55))" }} />
        <div style={{ position: "relative", maxWidth: 640, textAlign: "center", color: "#fff" }}>
          {eyebrowEl}
          <h1
            style={{
              fontFamily: "var(--bl-heading-font)",
              fontSize: "clamp(36px, 5vw, 56px)",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              margin: 0,
              color: "#fff",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 17, lineHeight: 1.55, color: "rgba(255,255,255,0.85)", marginTop: 18, maxWidth: 520, marginInline: "auto" }}>
              {subtitle}
            </p>
          )}
          {ctasEl}
        </div>
      </section>
    )
  }

  // split — default, y fallback si "banner" se eligió sin imagen cargada
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
          {eyebrowEl}
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
          {ctasEl}
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
  href,
}: {
  product: TemplateProduct
  resolved: ReturnType<typeof resolveTokens>
  currency?: string | null
  priceCtx?: PriceContext
  showPrice?: boolean
  showSku?: boolean
  onOpen?: (product: TemplateProduct) => void
  href?: string | null
}) {
  const cardStyle: CSSProperties = {
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
    textDecoration: "none",
  }

  const body = (
    <>
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
    </>
  )

  if (href) {
    return (
      <a href={href} style={cardStyle}>
        {body}
      </a>
    )
  }
  return (
    <button type="button" onClick={() => onOpen?.(product)} style={cardStyle}>
      {body}
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

function ProductGridSection({ section, products, categories, store, resolved, onOpenProduct, productHref, priceCtx }: SectionProps) {
  const title = s(section, "title", "Catálogo")
  const layout = s(section, "layout", "grid-3")
  const colMinWidth = LAYOUT_MINMAX[layout] ?? "220px"
  const filterByCategory = bool(section, "filterByCategory", false)
  const showPrice = bool(section, "showPrice", true)
  const showSku = bool(section, "showSku", false)
  const groupBy = s(section, "groupBy", "none")

  const grid = (items: TemplateProduct[]) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${colMinWidth}, 1fr))`, gap: 18 }}>
      {items.map((p) => (
        <ProductCard key={p.id} product={p} resolved={resolved} currency={store.currency} priceCtx={priceCtx} showPrice={showPrice} showSku={showSku} onOpen={onOpenProduct} href={productHref?.(p)} />
      ))}
    </div>
  )

  const groupedByCategory = groupBy === "category" && categories.length > 0
  const groups = groupedByCategory
    ? (() => {
        const byName = new Map<string, TemplateProduct[]>()
        for (const p of products) {
          const key = p.category || "Otros"
          byName.set(key, [...(byName.get(key) ?? []), p])
        }
        const ordered = categories.map((c) => ({ id: c.id, name: c.name, items: byName.get(c.name) ?? [] })).filter((g) => g.items.length > 0)
        const known = new Set(categories.map((c) => c.name))
        const rest = products.filter((p) => !known.has(p.category || ""))
        return rest.length > 0 ? [...ordered, { id: undefined, name: "Otros", items: rest }] : ordered
      })()
    : null

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
      ) : groups ? (
        <div style={{ display: "grid", gap: "calc(var(--bl-spacing) * 1.5)" }}>
          {groups.map((g) => (
            // id="category-{id}" = destino de los enlaces de categoría (pills
            // de CategoriesSection y del propio grid); scrollMarginTop deja
            // aire para navs/toolbars sticky.
            <div key={g.name} id={g.id ? `category-${g.id}` : undefined} style={{ scrollMarginTop: 80 }}>
              <h3 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 18, fontWeight: 600, margin: "0 0 14px" }}>{g.name}</h3>
              {grid(g.items)}
            </div>
          ))}
        </div>
      ) : (
        grid(products)
      )}
    </SectionShell>
  )
}

function FeaturedProductsSection({ section, products, store, resolved, onOpenProduct, productHref, priceCtx }: SectionProps) {
  const title = s(section, "title", "Destacados")
  const productIdItems = arr<{ id?: string }>(section, "productIds")
  const productIds = productIdItems.map((it) => it.id).filter((id): id is string => Boolean(id))
  const subset = productIds.length > 0 ? products.filter((p) => productIds.includes(p.id)) : products.slice(0, 4)
  const layout = s(section, "layout", "grid")

  const heading = (
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
  )

  if (layout === "carousel") {
    return (
      <SectionShell background="var(--bl-surface)">
        {heading}
        <div style={{ display: "flex", gap: 18, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}>
          {subset.map((p) => (
            <div key={p.id} style={{ minWidth: 220, flexShrink: 0, scrollSnapAlign: "start" }}>
              <ProductCard product={p} resolved={resolved} currency={store.currency} priceCtx={priceCtx} onOpen={onOpenProduct} href={productHref?.(p)} />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  }

  if (layout === "spotlight" && subset.length > 0) {
    const [first, ...rest] = subset
    const firstHref = productHref?.(first)
    const spotlightStyle: CSSProperties = { background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", color: "var(--bl-text)", font: "inherit", textDecoration: "none", display: "block" }
    const spotlightBody = (
      <>
        <div style={{ aspectRatio: "4/3", borderRadius: resolved.radiusPx, background: "var(--bl-border)", overflow: "hidden" }}>
          {first.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={first.image} alt={first.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: 20, marginTop: 14 }}>{first.name}</div>
        {first.description && <p style={{ fontSize: 14, color: "var(--bl-text-muted)", marginTop: 6, lineHeight: 1.5 }}>{first.description}</p>}
        <div style={{ fontFamily: "var(--bl-mono-font)", fontSize: 16, color: "var(--bl-primary)", fontWeight: 600, marginTop: 8 }}>
          {priceLabel(first.price, priceCtx, store.currency)}
        </div>
      </>
    )
    return (
      <SectionShell background="var(--bl-surface)">
        {heading}
        <div style={{ display: "grid", gridTemplateColumns: rest.length > 0 ? "1.3fr 1fr" : "1fr", gap: "calc(var(--bl-spacing) * 1.5)", alignItems: "start" }}>
          {firstHref ? (
            <a href={firstHref} style={spotlightStyle}>
              {spotlightBody}
            </a>
          ) : (
            <button type="button" onClick={() => onOpenProduct?.(first)} style={spotlightStyle}>
              {spotlightBody}
            </button>
          )}
          {rest.length > 0 && (
            <div style={{ display: "grid", gap: 12 }}>
              {rest.map((p) => (
                <ProductCard key={p.id} product={p} resolved={resolved} currency={store.currency} priceCtx={priceCtx} onOpen={onOpenProduct} href={productHref?.(p)} />
              ))}
            </div>
          )}
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell background="var(--bl-surface)">
      {heading}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
        }}
      >
        {subset.map((p) => (
          <ProductCard key={p.id} product={p} resolved={resolved} currency={store.currency} priceCtx={priceCtx} onOpen={onOpenProduct} href={productHref?.(p)} />
        ))}
      </div>
    </SectionShell>
  )
}

function CategoriesSection({ section, categories, resolved }: SectionProps) {
  const title = s(section, "title", "Categorías")
  const layout = s(section, "layout", "pills")
  const heading = (
    <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 24, letterSpacing: "-0.02em", margin: "0 0 16px" }}>{title}</h2>
  )

  if (layout === "cards") {
    return (
      <SectionShell>
        {heading}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#category-${c.id}`}
              style={{
                display: "block",
                padding: "22px 16px",
                textAlign: "center",
                border: "1px solid var(--bl-border)",
                borderRadius: resolved.radiusPx,
                background: "var(--bl-surface)",
                textDecoration: "none",
                color: "var(--bl-text)",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {c.name}
            </a>
          ))}
        </div>
      </SectionShell>
    )
  }

  if (layout === "sidebar") {
    return (
      <SectionShell>
        {heading}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 280 }}>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#category-${c.id}`}
              style={{
                padding: "12px 14px",
                textDecoration: "none",
                color: "var(--bl-text)",
                fontSize: 14,
                fontWeight: 500,
                borderBottom: "1px solid var(--bl-border)",
              }}
            >
              {c.name}
            </a>
          ))}
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell>
      {heading}
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

function AboutSection({ section, store, resolved }: SectionProps) {
  const title = s(section, "title", "Sobre nosotros")
  // Sin body propio, captura la bio real de la tienda (misma regla que el
  // hero con el nombre): los datos guardados mandan, el default solo viste.
  const body = s(section, "body", store.bio ?? "")
  const image = s(section, "image")
  // Bug: el schema declara split-left/split-right/centered, pero esto comparaba
  // contra "left"/"right" — nunca matcheaba, así que elegir una opción no hacía nada.
  const layout = s(section, "layout", "split-left")

  if (layout === "centered" || !image) {
    return (
      <SectionShell background="var(--bl-surface)">
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          {image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={image}
              alt={title}
              style={{ width: 160, height: 160, borderRadius: "50%", objectFit: "cover", margin: "0 auto 24px" }}
            />
          )}
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
      </SectionShell>
    )
  }

  return (
    <SectionShell background="var(--bl-surface)">
      <div
        className="bl-about-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "calc(var(--bl-spacing) * 1.5)",
          alignItems: "center",
        }}
      >
        {layout === "split-left" && (
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
        {layout === "split-right" && (
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

function SocialsSection({ section, store }: SectionProps) {
  const title = s(section, "title")
  // BE-124: redes reales de la tienda tienen prioridad; los props del tema
  // quedan como fallback para tiendas que aún no configuraron sus redes.
  const items =
    store.socials && store.socials.length > 0
      ? store.socials
      : arr<{ platform?: string; url?: string }>(section, "items")
  // Sin redes no hay nada que mostrar: colapsar en vez de dejar un bloque
  // vacío con padding y fondo (el "espacio muerto" al final de los previews).
  if (items.length === 0) return null
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

function GalleryItem({ item, index, resolved, aspectRatio = "1/1", breakInside }: { item: { image?: string; caption?: string }; index: number; resolved: ReturnType<typeof resolveTokens>; aspectRatio?: string; breakInside?: boolean }) {
  if (!item.image) return null
  return (
    <figure style={{ margin: breakInside ? "0 0 10px" : 0, breakInside: breakInside ? "avoid" : undefined }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt={item.caption ?? `Imagen ${index + 1}`}
        style={{ width: "100%", aspectRatio: breakInside ? undefined : aspectRatio, objectFit: "cover", borderRadius: resolved.radiusPx, display: "block" }}
      />
      {item.caption && <figcaption style={{ marginTop: 6, fontSize: 12, color: "var(--bl-text-muted)" }}>{item.caption}</figcaption>}
    </figure>
  )
}

function GallerySection({ section, resolved }: SectionProps) {
  const title = s(section, "title", "Galería")
  const items = arr<{ image?: string; caption?: string }>(section, "items")
  const layout = s(section, "layout", "grid")
  if (items.length === 0) return null

  const heading = <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 24, margin: "0 0 18px" }}>{title}</h2>

  if (layout === "carousel") {
    return (
      <SectionShell>
        {heading}
        <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}>
          {items.map((it, i) =>
            it.image ? (
              <div key={i} style={{ minWidth: 200, flexShrink: 0, scrollSnapAlign: "start" }}>
                <GalleryItem item={it} index={i} resolved={resolved} />
              </div>
            ) : null,
          )}
        </div>
      </SectionShell>
    )
  }

  if (layout === "masonry") {
    return (
      <SectionShell>
        {heading}
        <div style={{ columnCount: 3, columnGap: 10 }}>
          {items.map((it, i) => (
            <GalleryItem key={i} item={it} index={i} resolved={resolved} breakInside />
          ))}
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell>
      {heading}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {items.map((it, i) => (
          <GalleryItem key={i} item={it} index={i} resolved={resolved} />
        ))}
      </div>
    </SectionShell>
  )
}

function TextBlockSection({ section }: SectionProps) {
  const kicker = s(section, "kicker")
  const headline = s(section, "headline")
  const body = s(section, "body")
  const align = s(section, "align", "left")
  const layout = s(section, "layout", "editorial")
  if (!body && !headline) return null

  const kickerEl = kicker ? (
    <div style={{ color: "var(--bl-accent)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 10 }}>
      {kicker}
    </div>
  ) : null

  if (layout === "centered-quote") {
    return (
      <SectionShell>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          {kickerEl}
          {headline && (
            <h2 style={{ fontFamily: "var(--bl-heading-font)", fontStyle: "italic", fontWeight: 400, fontSize: 32, letterSpacing: "-0.01em", margin: "0 0 14px", lineHeight: 1.3 }}>
              “{headline}”
            </h2>
          )}
          {body && <div style={{ fontSize: 15, lineHeight: 1.6, color: "var(--bl-text-muted)" }}>{body}</div>}
        </div>
      </SectionShell>
    )
  }

  if (layout === "two-column") {
    return (
      <SectionShell>
        {headline && (
          <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 16px" }}>{headline}</h2>
        )}
        {kickerEl}
        {body && (
          <div style={{ fontSize: 15, lineHeight: 1.65, color: "var(--bl-text)", columnCount: 2, columnGap: 32 }}>{body}</div>
        )}
      </SectionShell>
    )
  }

  return (
    <SectionShell>
      <div
        style={{
          maxWidth: 720,
          margin: align === "center" ? "0 auto" : "0",
          textAlign: align as React.CSSProperties["textAlign"],
        }}
      >
        {kickerEl}
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

function TestimonialCard({ item }: { item: { quote?: string; author?: string } }) {
  return (
    <blockquote
      style={{
        background: "var(--bl-background)",
        border: "1px solid var(--bl-border)",
        borderRadius: 12,
        padding: 22,
        margin: 0,
      }}
    >
      <p style={{ margin: 0, fontStyle: "italic", lineHeight: 1.55 }}>{item.quote}</p>
      {item.author && (
        <footer style={{ marginTop: 12, fontSize: 12, color: "var(--bl-text-muted)", fontFamily: "var(--bl-mono-font)" }}>
          — {item.author}
        </footer>
      )}
    </blockquote>
  )
}

function TestimonialsSection({ section }: SectionProps) {
  const title = s(section, "title", "Lo que dicen")
  const items = arr<{ quote?: string; author?: string }>(section, "items")
  const layout = s(section, "layout", "cards")
  if (items.length === 0) return null

  const heading = <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 24, margin: "0 0 22px" }}>{title}</h2>

  if (layout === "carousel") {
    return (
      <SectionShell background="var(--bl-surface)">
        {heading}
        <div style={{ display: "flex", gap: 18, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}>
          {items.map((it, i) => (
            <div key={i} style={{ minWidth: 280, flexShrink: 0, scrollSnapAlign: "start" }}>
              <TestimonialCard item={it} />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell background="var(--bl-surface)">
      {heading}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
        {items.map((it, i) => (
          <TestimonialCard key={i} item={it} />
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
  // Marca de plataforma (requisito del plan free); se oculta con la prop
  // showBranding=false, igual que en los footers custom por tema.
  const showBranding = section?.props?.showBranding !== false
  // Redes de la tienda: viven fijas en el footer (ya no como sección movible),
  // con toggle showSocials (default true) + selección por sección (socialsHidden).
  const showSocials = section?.props?.showSocials !== false
  const socials = showSocials ? filterVisibleSocials(store.socials, section?.props?.socialsHidden) : []
  return (
    <SectionShell background="var(--bl-surface)" pad={false}>
      <div style={{ padding: "36px 28px", textAlign: "center", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        {socials.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {socials.map((sn, i) => (
              <a
                key={i}
                href={sn.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.03em", textTransform: "capitalize", color: "var(--bl-text)", textDecoration: "none", padding: "8px 14px", border: "1px solid var(--bl-border)", borderRadius: 999, background: "var(--bl-background)" }}
              >
                {sn.platform} ↗
              </a>
            ))}
          </div>
        )}
        {tagline && (
          <p style={{ margin: 0, color: "var(--bl-text-muted)", fontSize: 14, maxWidth: 480 }}>
            {tagline}
          </p>
        )}
        {showBranding && (
          <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.04em", color: "var(--bl-text-muted)" }}>
            Creado con{" "}
            <span translate="no" style={{ fontWeight: 800, color: "var(--bl-text)" }}>
              ByLink
            </span>
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
