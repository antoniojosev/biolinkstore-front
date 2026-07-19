"use client"

import { Fragment, useMemo, type CSSProperties, type ReactNode } from "react"
import { ArrowRight, Camera, Instagram, Mail, MessageCircle, ShoppingBag } from "lucide-react"
import type { SectionNode } from "@/lib/page-builder-api"
import { googleFontsHref } from "@/lib/google-fonts"
import { resolveTokens } from "@/components/storefront-v2/template/tokens"
import {
  SectionRenderer,
  type PriceContext,
  type TemplateProduct,
  type TemplateRendererProps,
} from "@/components/storefront-v2/template/template-renderer"
import {
  ATELIER,
  ATELIER_STYLES,
  GALLERY_LAYOUT,
  LINE,
  MUTED,
  PAGE_BACKGROUND,
  PLACEHOLDER,
  atelierPriceFmt,
  beige,
  gatherGalleryImages,
  monogramFromName,
} from "./shared"

// Overlay propio del tema — para registrar junto al renderer en el registry.
// Atelier NO registra CartSheet: no tiene carrito en ninguna fuente (spec §5);
// el flujo es card → detail → reserva directa por WhatsApp. El genérico queda
// como fallback del sistema.
export { AtelierProductSheet } from "./product-sheet"

/**
 * AtelierRenderer — port fiel del tema legacy atelier (portfolio editorial de
 * servicios creativos; spec docs/legacy-theme-specs/atelier.md, HTML aprobado
 * landing-videos/atelier — el HTML MANDA en Filosofía forest y en el detail).
 * Renderer custom nivel 2 (patrón poster/persona):
 *
 * - Paleta/tipografías por tokens --bl-* con alphas firma vía color-mix
 *   (muted/line); los hex restantes son identidad documentada (forest + ficha
 *   azul del detail, ver shared.ts).
 * - Árbol de secciones respetado: hero → hero 100dvh blureado (+ tarjeta
 *   destacada de featured_products) · text_block → Filosofía forest ·
 *   product_grid → Servicios (cards editoriales, pill "Reservar") · gallery →
 *   Portafolio 12-col · footer → "Capturemos algo juntos" · resto delegado al
 *   catálogo base (SectionRenderer).
 * - Sin carrito: cartCount/onOpenCart se aceptan por contrato; solo si el
 *   sistema tiene items se muestra una pill flotante discreta (spec §9).
 * - Responsive SOLO por container queries (containerName bl-atelier).
 */
export function AtelierRenderer({
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

  const fmt = useMemo(() => atelierPriceFmt(store.currency ?? "USD"), [store.currency])
  const priceCtx: PriceContext = { currency: store.currency ?? "USD", convert: (n) => n }

  const heroNode = sections.find((n) => n.type === "hero")
  const featuredNode = sections.find((n) => n.type === "featured_products")
  const footerNode = sections.find((n) => n.type === "footer")
  const galleryNode = sections.find((n) => n.type === "gallery")

  // ── datos derivados (mismas reglas del legacy) ────────────────────────────
  const monogram = monogramFromName(store.name)
  const metaLine =
    s(heroNode, "kicker") ||
    (store.bio ? store.bio.split(/[.·\n]/)[0].trim() : "Servicios creativos")
  const heroSubject = metaLine.split(/\s+/).slice(0, 2).join(" ").toLowerCase()
  const pillars = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ).slice(0, 4)
  const heroImage =
    s(heroNode, "image") || products[0]?.images?.[0] || products[0]?.image || store.avatar || ""

  // Tarjeta destacada del hero: productIds de featured_products manda, si no
  // el primer producto featured (spec §2.2 / mapeo featured_main).
  const featured = useMemo(() => {
    const ids = arr<{ id?: string }>(featuredNode, "productIds")
      .map((it) => it.id)
      .filter(Boolean)
    if (ids.length > 0) {
      const match = products.find((p) => p.id === ids[0])
      if (match) return match
    }
    return products.find((p) => p.featured) ?? products[0]
  }, [featuredNode, products])

  const galleryImages = useMemo(() => {
    const own = arr<{ image?: string }>(galleryNode, "items")
      .map((it) => it.image ?? "")
      .filter(Boolean)
    return gatherGalleryImages(products, own)
  }, [galleryNode, products])

  const waPhone = store.whatsappNumber
  const waMain = whatsappUrl(waPhone, `Hola ${store.name}, me gustaría conversar sobre un proyecto.`)
  const instagramUrl = store.socials?.find((so) => /^ig$|insta/i.test(so.platform))?.url ?? null

  // ── editor wrap: misma mecánica de selección que el renderer base ────────
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

  // ── HERO (spec §2.2): 100dvh, cover blureado + velo radial + degradado ────
  function renderHero(node: SectionNode) {
    const headline = s(node, "headline")
    const asideBody =
      s(node, "subheadline") ||
      store.bio ||
      "Estudio creativo independiente. Proyectos con alma, no con plantilla."
    return editorWrap(
      node,
      <header id="main" style={S.hero}>
        {heroImage && (
          <div
            aria-hidden="true"
            style={{
              ...S.heroBg,
              backgroundImage: `url('${heroImage}')`,
            }}
          />
        )}
        <div aria-hidden="true" style={S.heroVeilRadial} />
        <div aria-hidden="true" style={S.heroVeilLinear} />
        <div style={S.heroInner}>
          <h1 style={S.heroTitle}>
            {headline || (store.bio ? `Tu ${heroSubject}` : "Cada proyecto")}
            <br />
            <em style={S.heroEm}>es un ritual</em>
          </h1>
          {pillars.length > 0 && (
            <ul role="list" className="bl-at-pillars" style={S.pillars}>
              {pillars.map((pillar) => (
                <li key={pillar} style={S.pillar}>
                  {pillar}
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside className="bl-at-heroaside" style={S.heroAside}>
          <h3 style={S.heroAsideTitle}>
            La cámara
            <br />
            como pausa
          </h3>
          <p style={S.heroAsideBody}>{asideBody}</p>
        </aside>
        {featured && (
          <aside className="bl-at-featured" style={S.featuredCard}>
            <div
              role="img"
              aria-label={`Foto destacada: ${featured.name}`}
              style={{
                ...S.featuredThumb,
                backgroundImage: `url('${featured.images?.[0] ?? featured.image ?? ""}')`,
              }}
            />
            <div style={{ fontSize: 11 }}>
              <strong style={S.featuredName}>{featured.name}</strong>
              <span style={S.featuredTag}>Trabajo destacado</span>
            </div>
          </aside>
        )}
      </header>,
    )
  }

  // ── FILOSOFÍA (spec §2.3 — HTML manda: bloque FOREST oscuro) ──────────────
  function renderFilosofia(node: SectionNode) {
    const kicker = s(node, "kicker") || `Filosofía · ${store.name}`
    const headline = s(node, "headline")
    const body =
      s(node, "body") ||
      store.bio ||
      "Cada sesión es una conversación — sin plantillas, sin prisas, sin cliché."
    const photo = store.avatar || galleryImages[0] || heroImage
    return editorWrap(
      node,
      <section id="manifesto" style={S.filosofia}>
        {photo && (
          <div
            role="img"
            aria-label={`Retrato de ${store.name}`}
            style={{ ...S.filosofiaImg, backgroundImage: `url('${photo}')` }}
          />
        )}
        <p style={S.filosofiaKicker}>{kicker}</p>
        <h2 style={S.filosofiaTitle}>
          {headline || (
            <>
              El instante <em style={{ fontStyle: "italic", color: "rgba(236,230,215,.72)" }}>es la obra.</em>
            </>
          )}
        </h2>
        <p style={S.filosofiaBody}>{body}</p>
      </section>,
    )
  }

  // ── SERVICIOS (spec §2.4): head + cards editoriales con pill "Reservar" ───
  function renderServicios(node: SectionNode) {
    const title = s(node, "title") || "Servicios"
    const showPrice = bool(node, "showPrice", true)
    return editorWrap(
      node,
      <section id="servicios" style={S.section}>
        <div style={S.sectionHead}>
          <h2 style={S.sectionTitle}>{title}</h2>
          <span style={S.sectionMeta}>
            {String(products.length).padStart(2, "0")} · disponibles
          </span>
        </div>
        {products.length === 0 ? (
          <p style={{ color: MUTED, fontSize: 14 }}>Aún no hay servicios publicados.</p>
        ) : (
          <div className="bl-at-services" style={S.servicesGrid}>
            {products.map((p) => (
              <ServiceCard
                key={p.id}
                product={p}
                fmt={fmt}
                showPrice={showPrice}
                href={productHref?.(p) ?? null}
                onOpen={onOpenProduct}
              />
            ))}
          </div>
        )}
      </section>,
    )
  }

  // ── PORTAFOLIO (spec §2.5): grid editorial 12-col con GALLERY_LAYOUT ──────
  function renderPortafolio(node: SectionNode) {
    if (galleryImages.length === 0) return <Fragment key={node.key} />
    const title = s(node, "title") || "Trabajos recientes"
    return editorWrap(
      node,
      <section id="portafolio" style={S.gallerySection}>
        <div style={{ ...S.sectionHead, margin: "0 20px 48px" }}>
          <h2 style={S.sectionTitle}>{title}</h2>
          <span style={S.sectionMeta}>Portafolio</span>
        </div>
        <ul className="bl-at-gallery" style={S.galleryGrid}>
          {galleryImages.map((img, idx) => {
            const layout = GALLERY_LAYOUT[idx] ?? GALLERY_LAYOUT[GALLERY_LAYOUT.length - 1]
            return (
              <li
                key={`${img}-${idx}`}
                className="bl-at-cell"
                style={
                  {
                    ...S.galleryCell,
                    // Desktop (≥768 del contenedor) toma span/aspect de acá
                    // vía container query; el default inline es el mobile.
                    "--at-span": `span ${layout.colSpan}`,
                    "--at-aspect": layout.aspect,
                  } as CSSProperties
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" loading="lazy" style={S.galleryImg} />
              </li>
            )
          })}
        </ul>
      </section>,
    )
  }

  // ── FOOTER / CONTACTO (spec §2.6) ─────────────────────────────────────────
  function renderFooter(node: SectionNode) {
    const showSocials = bool(node, "showSocials", true)
    return editorWrap(
      node,
      <footer id="contacto" style={S.footer}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={S.footerKicker}>Hablemos</p>
          <h2 style={S.footerTitle}>
            Capturemos algo
            <br />
            <em style={S.heroEm}>juntos.</em>
          </h2>
          {waPhone && (
            <a
              href={waMain}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Escribir por WhatsApp a ${store.name}`}
              className="bl-at-wa"
              style={S.footerCta}
            >
              Escribir por WhatsApp
              <MessageCircle style={{ width: 16, height: 16 }} aria-hidden="true" />
            </a>
          )}
        </div>
        <div style={S.footerBar}>
          <span>
            © {new Date().getFullYear()} {store.name}
          </span>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {showSocials && instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bl-at-icon" style={S.footerIcon}>
                <Instagram style={{ width: 14, height: 14 }} strokeWidth={1.6} aria-hidden="true" />
              </a>
            )}
            {waPhone && (
              <a href={waMain} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="bl-at-icon" style={S.footerIcon}>
                <MessageCircle style={{ width: 14, height: 14 }} aria-hidden="true" />
              </a>
            )}
            {store.email && (
              <a href={`mailto:${store.email}`} aria-label="Enviar correo" className="bl-at-icon" style={S.footerIcon}>
                <Mail style={{ width: 14, height: 14 }} strokeWidth={1.6} aria-hidden="true" />
              </a>
            )}
          </div>
          <span>Creado con ByLink</span>
        </div>
      </footer>,
    )
  }

  const rootStyle = {
    ...resolved.cssVars,
    background: PAGE_BACKGROUND,
    color: "var(--bl-text)",
    fontFamily: ATELIER.body,
    minHeight: "100dvh",
    overflowX: "clip",
    containerType: "inline-size",
    containerName: "bl-atelier",
  } as CSSProperties

  return (
    <main className="bl-atelier-root" style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <style dangerouslySetInnerHTML={{ __html: ATELIER_STYLES }} />

      <a href="#main" className="bl-at-skip">
        Saltar al contenido
      </a>

      {/* Nav glass — chrome del tema (fuera del árbol, como el NavBar base).
          Sticky y no fixed: un overlay fixed se escapa del frame en los
          previews embebidos del editor; visualmente equivale al legacy. */}
      <nav aria-label="Principal" style={S.nav}>
        <a href="#main" translate="no" aria-label={`${store.name} — inicio`} style={S.brand}>
          <span aria-hidden="true" style={S.monogram}>
            {monogram}
          </span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
            <span style={S.brandName}>{store.name}</span>
            <span style={S.brandTagline}>{metaLine}</span>
          </span>
        </a>
        <div className="bl-at-navlinks" style={S.navLinks}>
          <a href="#servicios" className="bl-at-navlink" style={S.navLink}>
            Servicios
          </a>
          <a href="#manifesto" className="bl-at-navlink" style={S.navLink}>
            Filosofía
          </a>
          {galleryImages.length > 0 && (
            <a href="#portafolio" className="bl-at-navlink" style={S.navLink}>
              Portafolio
            </a>
          )}
          <a href="#contacto" className="bl-at-navlink" style={S.navLink}>
            Contacto
          </a>
        </div>
        <a href="#contacto" style={S.navCta}>
          Conversemos
        </a>
      </nav>

      {sections.map((node) => {
        switch (node.type) {
          case "hero":
            return renderHero(node)
          case "featured_products":
            // Consumida por la tarjeta destacada del hero (spec: featured_main
            // no es bloque aparte). Sin hero en el árbol, se delega al base.
            return heroNode ? <Fragment key={node.key} /> : delegate(node)
          case "text_block":
            return renderFilosofia(node)
          case "product_grid":
            return renderServicios(node)
          case "gallery":
            return renderPortafolio(node)
          case "footer":
            return renderFooter(node)
          case "socials":
            // Plegada en el footer custom (spec §9: socials_bar + footer_main
            // → footer con iconos circulares desde store.socials).
            return footerNode ? <Fragment key={node.key} /> : delegate(node)
          default:
            return delegate(node)
        }
      })}

      {/* Sin carrito en el tema — pill discreta SOLO si el sistema ya tiene
          items (contrato cartCount/onOpenCart, spec §9). */}
      {onOpenCart && cartCount > 0 && (
        <button type="button" onClick={onOpenCart} aria-label={`Ver reserva — ${cartCount} ítems`} style={S.cartPill}>
          <ShoppingBag style={{ width: 15, height: 15 }} strokeWidth={1.8} aria-hidden="true" />
          {cartCount}
        </button>
      )}
      {/* rate aceptada por contrato; el tema mantiene precios en la moneda de la tienda */}
      {rate ? null : null}
    </main>
  )

  function delegate(node: SectionNode) {
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
}

// ── Card de servicio (spec §2.4/§3): imagen grande, precio italic, pill ─────
function ServiceCard({
  product,
  fmt,
  showPrice,
  href,
  onOpen,
}: {
  product: TemplateProduct
  fmt: (n: number) => string
  showPrice: boolean
  href: string | null
  onOpen?: (p: TemplateProduct) => void
}) {
  const image = product.images?.[0] ?? product.image
  const isQuote = product.price === 0
  const priceLabel = isQuote ? "Cotizar" : `desde ${fmt(product.price)}`
  const isContact = !href && !onOpen

  const body = (
    <>
      <div className="bl-at-service-img" style={S.serviceImg}>
        {image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={image} alt={product.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>
      <div style={S.serviceRow}>
        <h3 style={S.serviceName}>{product.name}</h3>
        {showPrice && (
          <span style={{ ...S.servicePrice, color: isQuote ? "var(--bl-accent)" : "var(--bl-secondary)" }}>
            {priceLabel}
          </span>
        )}
      </div>
      {product.description && <p style={S.serviceDesc}>{product.description}</p>}
      <span style={S.servicePill}>
        <Camera style={{ width: 16, height: 16 }} strokeWidth={1.8} aria-hidden="true" />
        <span style={S.servicePillLabel}>{isContact ? "Solicitar info" : "Reservar"}</span>
        <ArrowRight className="bl-at-arrow" style={{ width: 14, height: 14 }} strokeWidth={1.5} aria-hidden="true" />
      </span>
    </>
  )

  if (href) {
    return (
      <a href={href} className="bl-at-card" style={S.serviceCard}>
        {body}
      </a>
    )
  }
  if (onOpen) {
    return (
      <button type="button" onClick={() => onOpen(product)} className="bl-at-card" style={{ ...S.serviceCard, width: "100%", background: "none", border: "none", padding: 0, font: "inherit" }}>
        {body}
      </button>
    )
  }
  // Servicio sin destino (sin slug ni handler): ancla a contacto (spec §2.4).
  return (
    <a href="#contacto" className="bl-at-card" style={S.serviceCard}>
      {body}
    </a>
  )
}

// ── helpers de props de sección (mismo contrato que el renderer base) ───────
function s(section: SectionNode | undefined, key: string, fallback = ""): string {
  const v = section?.props?.[key]
  return typeof v === "string" ? v : fallback
}

function bool(section: SectionNode | undefined, key: string, fallback = false): boolean {
  const v = section?.props?.[key]
  return typeof v === "boolean" ? v : fallback
}

function arr<T = unknown>(section: SectionNode | undefined, key: string): T[] {
  const v = section?.props?.[key]
  return Array.isArray(v) ? (v as T[]) : []
}

function whatsappUrl(phone: string | null | undefined, message: string): string {
  if (!phone) return "#contacto"
  const clean = phone.replace(/\D/g, "")
  if (!clean) return "#contacto"
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

const S: Record<string, CSSProperties> = {
  editorTag: {
    position: "absolute", top: -1, left: 12, transform: "translateY(-100%)",
    background: "var(--brand, #1E3A8A)", color: "#fff", fontFamily: "monospace",
    fontSize: 9, padding: "2px 8px", borderRadius: "4px 4px 0 0",
    letterSpacing: "0.06em", zIndex: 55, pointerEvents: "none",
  },
  // Nav glass (spec §2.1)
  nav: {
    position: "sticky", top: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    padding: "16px 20px",
    borderBottom: `1px solid ${LINE}`,
    background: beige(55),
    backdropFilter: "saturate(120%) blur(18px)",
    WebkitBackdropFilter: "saturate(120%) blur(18px)",
  },
  brand: { display: "inline-flex", alignItems: "center", gap: 12, color: "var(--bl-text)", textDecoration: "none", lineHeight: 1, minWidth: 0 },
  monogram: {
    width: 34, height: 34, display: "grid", placeItems: "center", flexShrink: 0,
    border: "1px solid var(--bl-text)", borderRadius: "50%",
    fontFamily: "var(--bl-heading-font)", fontStyle: "italic", fontWeight: 500,
    fontSize: 14, letterSpacing: "-0.01em", paddingBottom: 1,
  },
  brandName: { fontFamily: "var(--bl-heading-font)", fontSize: 15, fontWeight: 500, letterSpacing: "0.01em", lineHeight: 1 },
  brandTagline: {
    fontSize: 9, textTransform: "uppercase", letterSpacing: "0.24em",
    color: MUTED, lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200,
  },
  navLinks: { gap: 32, fontSize: 13, color: "var(--bl-secondary)" },
  navLink: { color: "var(--bl-secondary)", textDecoration: "none" },
  navCta: {
    fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em",
    color: "var(--bl-text)", textDecoration: "none",
    borderBottom: "1px solid var(--bl-text)", paddingBottom: 2, whiteSpace: "nowrap", flexShrink: 0,
  },
  // Hero (spec §2.2)
  hero: { position: "relative", isolation: "isolate", overflow: "hidden", minHeight: "100dvh", display: "flex", flexDirection: "column" },
  heroBg: {
    position: "absolute", inset: -32, zIndex: -2,
    backgroundSize: "cover", backgroundPosition: "center 25%",
    filter: "blur(14px) saturate(.85)", transform: "scale(1.1)",
  },
  heroVeilRadial: {
    position: "absolute", inset: 0, zIndex: -2,
    background: `radial-gradient(900px 600px at 30% 40%, ${beige(40)} 0%, ${beige(62)} 60%, ${beige(70)} 100%)`,
  },
  heroVeilLinear: {
    position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none",
    background: `linear-gradient(180deg, ${beige(65)} 0%, transparent 18%, transparent 70%, ${beige(90)} 100%)`,
  },
  heroInner: {
    position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
    maxWidth: 1400, width: "100%", margin: "0 auto", padding: "112px 20px 180px",
  },
  heroTitle: {
    margin: 0, fontFamily: "var(--bl-heading-font)", fontWeight: 400,
    fontSize: "clamp(44px, 8.5cqw, 112px)", lineHeight: 1, letterSpacing: "-0.02em",
    color: "var(--bl-text)", maxWidth: 1100, textWrap: "balance",
    textShadow: "0 1px 0 rgba(255,255,255,.15)",
  },
  heroEm: { fontStyle: "italic", fontWeight: 400, color: "var(--bl-secondary)" },
  pillars: {
    listStyle: "none", margin: "40px 0 0", maxWidth: 760,
    display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14,
    borderTop: `1px solid ${LINE}`, paddingTop: 20, paddingLeft: 0,
  },
  pillar: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--bl-secondary)", fontWeight: 500 },
  heroAside: { position: "absolute", left: 20, bottom: 24, zIndex: 2, maxWidth: 280 },
  heroAsideTitle: {
    margin: "0 0 10px", fontFamily: "var(--bl-heading-font)", fontStyle: "italic", fontWeight: 400,
    fontSize: "clamp(21px, 2.2cqw, 26px)", lineHeight: 1.05, color: "var(--bl-text)",
  },
  heroAsideBody: { margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--bl-secondary)", textWrap: "pretty" },
  featuredCard: {
    position: "absolute", right: 32, bottom: 32, zIndex: 2,
    alignItems: "center", gap: 12,
    background: "var(--bl-surface)", padding: "8px 16px 8px 8px", borderRadius: 4,
    boxShadow: "0 14px 30px -12px rgba(0,0,0,.2)",
  },
  featuredThumb: { width: 56, height: 56, borderRadius: 2, backgroundSize: "cover", backgroundPosition: "center", background: PLACEHOLDER, flexShrink: 0 },
  featuredName: { display: "block", fontFamily: "var(--bl-heading-font)", fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em" },
  featuredTag: { color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 10 },
  // Filosofía forest (spec §2.3 — hex identidad, ver shared.ts)
  filosofia: { background: ATELIER.forest, color: ATELIER.forestCream, padding: "96px 20px 120px", overflow: "hidden", scrollMarginTop: 80 },
  filosofiaImg: {
    width: "100%", maxWidth: 900, margin: "0 auto", aspectRatio: "3 / 4",
    backgroundSize: "cover", backgroundPosition: "center 18%", borderRadius: 4,
    boxShadow: "0 32px 70px -24px rgba(0,0,0,0.6)",
  },
  filosofiaKicker: {
    maxWidth: 900, margin: "56px auto 0", fontSize: 11, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(236,230,215,.6)",
  },
  filosofiaTitle: {
    maxWidth: 900, margin: "24px auto 0", fontFamily: "var(--bl-heading-font)", fontWeight: 400,
    fontSize: "clamp(32px, 4.5cqw, 56px)", lineHeight: 1.02, letterSpacing: "-0.02em", color: ATELIER.forestCream,
  },
  filosofiaBody: {
    maxWidth: 860, margin: "38px auto 0", fontSize: 15, lineHeight: 1.55,
    color: "rgba(236,230,215,.78)",
  },
  // Head de sección (spec §2.4)
  section: { maxWidth: 1280, margin: "0 auto", padding: "80px 20px 64px", scrollMarginTop: 80 },
  sectionHead: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16,
    borderBottom: `1px solid ${LINE}`, paddingBottom: 24, marginBottom: 48,
  },
  sectionTitle: {
    margin: 0, fontFamily: "var(--bl-heading-font)", fontWeight: 400,
    fontSize: "clamp(32px, 5cqw, 52px)", lineHeight: 1, letterSpacing: "-0.02em", minWidth: 0,
  },
  sectionMeta: {
    fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em",
    color: MUTED, fontVariantNumeric: "tabular-nums", flexShrink: 0,
  },
  // Servicios
  // Stack mobile con gap grande (HTML aprobado); ≥768 la CQ baja a 60px.
  servicesGrid: { display: "grid", gridTemplateColumns: "1fr", rowGap: 96 },
  serviceCard: { display: "block", color: "inherit", textDecoration: "none", cursor: "pointer", textAlign: "left" },
  serviceImg: { aspectRatio: "1 / 1", overflow: "hidden", borderRadius: 6, background: PLACEHOLDER, marginBottom: 20 },
  serviceRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 12 },
  serviceName: {
    margin: 0, fontFamily: "var(--bl-heading-font)", fontWeight: 400,
    fontSize: "clamp(22px, 2.5cqw, 26px)", lineHeight: 1.1, letterSpacing: "-0.01em",
    minWidth: 0, overflowWrap: "anywhere",
  },
  servicePrice: {
    fontFamily: "var(--bl-heading-font)", fontStyle: "italic", fontSize: 14,
    fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", flexShrink: 0,
  },
  serviceDesc: {
    margin: "0 0 16px", fontSize: 14, lineHeight: 1.65, color: "var(--bl-secondary)", maxWidth: 460,
    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textWrap: "pretty",
  },
  servicePill: {
    display: "inline-flex", alignItems: "center", gap: 12,
    borderRadius: 999, background: "var(--bl-surface)", border: `1.5px solid ${LINE}`,
    padding: "12px 20px", color: "var(--bl-text)",
  },
  servicePillLabel: { fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.2em" },
  // Portafolio
  gallerySection: { maxWidth: 1400, margin: "0 auto", padding: "80px 0 0", scrollMarginTop: 80 },
  galleryGrid: {
    listStyle: "none", margin: 0,
    display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, padding: "0 8px",
  },
  galleryCell: { position: "relative", overflow: "hidden", background: PLACEHOLDER, gridColumn: "span 1", aspectRatio: "4/5" },
  galleryImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  // Footer
  footer: { maxWidth: 1280, margin: "0 auto", padding: "80px 20px 40px", scrollMarginTop: 80 },
  footerKicker: { margin: "0 0 20px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: MUTED },
  footerTitle: {
    margin: "0 0 32px", fontFamily: "var(--bl-heading-font)", fontWeight: 400,
    fontSize: "clamp(40px, 7cqw, 84px)", lineHeight: 1, letterSpacing: "-0.02em", textWrap: "balance",
  },
  footerCta: {
    display: "inline-flex", alignItems: "center", gap: 12,
    fontSize: 14, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em",
    color: "var(--bl-surface)", background: "var(--bl-primary)", textDecoration: "none",
    padding: "16px 28px", borderRadius: 999,
  },
  footerBar: {
    borderTop: `1px solid ${LINE}`, paddingTop: 40,
    display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24,
    fontSize: 12, color: MUTED, textAlign: "center",
  },
  footerIcon: {
    display: "grid", placeItems: "center", width: 36, height: 36,
    borderRadius: "50%", border: `1px solid ${LINE}`, color: "var(--bl-text)",
  },
  cartPill: {
    position: "fixed", right: 20, bottom: 20, zIndex: 60,
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "var(--bl-primary)", color: "var(--bl-surface)",
    border: "none", borderRadius: 999, padding: "10px 16px",
    fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
    boxShadow: "0 14px 30px -12px rgba(0,0,0,.35)",
  },
}
