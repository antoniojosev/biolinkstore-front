import type { CSSProperties } from "react"
import type { PublicStoreTheme, SectionNode } from "@/lib/page-builder-api"
import { buttonStyleProps, resolveTokens } from "./tokens"

export interface TemplateProduct {
  id: string
  name: string
  category?: string
  price: number
  image?: string
  description?: string
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
}

export function TemplateRenderer({ store, products, categories, theme }: TemplateRendererProps) {
  const resolved = resolveTokens(theme.tokens)
  const sections = theme.published?.tree.sections ?? []

  const rootStyle = {
    ...resolved.cssVars,
    background: "var(--bl-background)",
    color: "var(--bl-text)",
    fontFamily: "var(--bl-body-font)",
    minHeight: "100vh",
  } as CSSProperties

  return (
    <main style={rootStyle}>
      <NavBar store={store} resolved={resolved} />
      {sections.length === 0 ? (
        <EmptyTheme storeName={store.name} />
      ) : (
        sections.map((s) => (
          <SectionRenderer
            key={s.key}
            section={s}
            store={store}
            products={products}
            categories={categories}
            resolved={resolved}
          />
        ))
      )}
      <FooterBranding store={store} resolved={resolved} />
    </main>
  )
}

// ----------------------------------------------------------------------------
// Section dispatcher
// ----------------------------------------------------------------------------

interface SectionProps {
  section: SectionNode
  store: TemplateStore
  products: TemplateProduct[]
  categories: TemplateCategory[]
  resolved: ReturnType<typeof resolveTokens>
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

function formatPrice(p: TemplateProduct, currency?: string | null): string {
  const c = currency ?? "USD"
  const symbol = c === "USD" ? "$" : c === "EUR" ? "€" : c === "VES" ? "Bs. " : ""
  return `${symbol}${p.price.toLocaleString("es")}`
}

function whatsappUrl(phone: string | null | undefined, message: string): string {
  if (!phone) return "#"
  const clean = phone.replace(/\D/g, "")
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

// ----------------------------------------------------------------------------
// Layout chrome
// ----------------------------------------------------------------------------

function NavBar({ store, resolved }: { store: TemplateStore; resolved: ReturnType<typeof resolveTokens> }) {
  return (
    <header
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
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {store.avatar && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={store.avatar} alt={store.name} width={36} height={36} style={{ borderRadius: 999 }} />
        )}
        <span style={{ fontFamily: "var(--bl-heading-font)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
          {store.name}
        </span>
      </div>
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
      style={{
        padding: pad ? "calc(var(--bl-spacing) * 2.4) 28px" : 0,
        background,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>{children}</div>
    </section>
  )
}

function HeroSection({ section, store, resolved }: SectionProps) {
  const title = s(section, "title", store.name)
  const subtitle = s(section, "subtitle", store.bio ?? "")
  const image = s(section, "image")
  const eyebrow = s(section, "eyebrow")
  const ctaLabel = s(section, "ctaLabel", "Ver catálogo")

  return (
    <SectionShell>
      <div
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
            <a href="#catalog" style={buttonStyleProps(resolved.buttonStyle, resolved.radiusPx)}>
              {ctaLabel}
            </a>
            {store.whatsappNumber && (
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
}: {
  product: TemplateProduct
  resolved: ReturnType<typeof resolveTokens>
  currency?: string | null
}) {
  return (
    <a
      href={`#product-${product.id}`}
      style={{
        background: "var(--bl-surface)",
        border: "1px solid var(--bl-border)",
        borderRadius: resolved.radiusPx,
        overflow: "hidden",
        textDecoration: "none",
        color: "var(--bl-text)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
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
        <div
          style={{
            fontFamily: "var(--bl-mono-font)",
            marginTop: 8,
            fontSize: 14,
            color: "var(--bl-primary)",
            fontWeight: 600,
          }}
        >
          {formatPrice(product, currency)}
        </div>
      </div>
    </a>
  )
}

function ProductGridSection({ section, products, store, resolved }: SectionProps) {
  const title = s(section, "title", "Catálogo")
  const cols = (section.props?.columns as number) ?? 3
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
      {products.length === 0 ? (
        <p style={{ color: "var(--bl-text-muted)" }}>Aún no hay productos publicados.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 18,
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} resolved={resolved} currency={store.currency} />
          ))}
        </div>
      )}
    </SectionShell>
  )
}

function FeaturedProductsSection({ section, products, store, resolved }: SectionProps) {
  const title = s(section, "title", "Destacados")
  const productIds = arr<string>(section, "productIds")
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
          gridTemplateColumns: `repeat(${Math.min(subset.length || 1, 4)}, 1fr)`,
          gap: 18,
        }}
      >
        {subset.map((p) => (
          <ProductCard key={p.id} product={p} resolved={resolved} currency={store.currency} />
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
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
  const items = arr<{ src?: string; alt?: string }>(section, "items")
  if (items.length === 0) return null
  return (
    <SectionShell>
      <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 24, margin: "0 0 18px" }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {items.map((it, i) =>
          it.src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={i}
              src={it.src}
              alt={it.alt ?? `Imagen ${i + 1}`}
              style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: resolved.radiusPx }}
            />
          ) : null,
        )}
      </div>
    </SectionShell>
  )
}

function TextBlockSection({ section }: SectionProps) {
  const body = s(section, "body")
  const align = s(section, "align", "left")
  if (!body) return null
  return (
    <SectionShell>
      <div
        style={{
          maxWidth: 720,
          margin: align === "center" ? "0 auto" : "0",
          fontSize: 16,
          lineHeight: 1.6,
          color: "var(--bl-text)",
          textAlign: align as React.CSSProperties["textAlign"],
        }}
      >
        {body}
      </div>
    </SectionShell>
  )
}

function CtaBannerSection({ section, store, resolved }: SectionProps) {
  const title = s(section, "title", "Empezá ahora")
  const subtitle = s(section, "subtitle", "")
  const ctaLabel = s(section, "ctaLabel", "Contactar")
  const ctaUrl = s(section, "ctaUrl", store.whatsappNumber ? whatsappUrl(store.whatsappNumber, "Hola, quiero info") : "#")

  return (
    <SectionShell>
      <div
        style={{
          background: "var(--bl-primary)",
          color: "#FFF",
          borderRadius: resolved.radiusPx,
          padding: "48px 36px",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 28, margin: "0 0 12px" }}>{title}</h3>
        {subtitle && <p style={{ margin: "0 0 22px", opacity: 0.85, fontSize: 15 }}>{subtitle}</p>}
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...buttonStyleProps("solid", resolved.radiusPx),
            background: "#FFF",
            color: "var(--bl-primary)",
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
  const items = arr<{ q?: string; a?: string }>(section, "items")
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
            <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 15 }}>{it.q}</summary>
            <p style={{ marginTop: 10, color: "var(--bl-text-muted)", fontSize: 14, lineHeight: 1.55 }}>{it.a}</p>
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
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`, gap: 18 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 18 }}>
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

function MapSection({ section, store }: SectionProps) {
  const address = s(section, "address", store.address ?? "")
  if (!address) return null
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
  return (
    <SectionShell>
      <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 22, margin: "0 0 14px" }}>Ubicación</h2>
      <iframe
        src={mapUrl}
        loading="lazy"
        style={{ width: "100%", height: 360, border: 0, borderRadius: 12 }}
        title="Mapa"
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
