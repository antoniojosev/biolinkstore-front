"use client"

import {
  Fragment,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import {
  ArrowRight,
  Grid3x3,
  Home,
  Instagram,
  Menu,
  MessageCircle,
  ShoppingBag,
  Star,
  X,
} from "lucide-react"
import type { SectionNode } from "@/lib/page-builder-api"
import { googleFontsHref } from "@/lib/google-fonts"
import { useCartOptional } from "@/lib/cart-context"
import { resolveTokens } from "@/components/storefront-v2/template/tokens"
import {
  SectionRenderer,
  type TemplateProduct,
  type TemplateRendererProps,
} from "@/components/storefront-v2/template/template-renderer"
import { RosierProductCard } from "./product-card"
import {
  ROSIER_STYLES,
  RS,
  fmtRosierPrice,
  inkA,
  rosierDiscount,
  rosierSerifHref,
  whiteA,
} from "./shared"

// Overlays propios del tema — para registrar junto al renderer en el registry.
export { RosierProductSheet } from "./product-sheet"
export { RosierCartSheet } from "./cart-sheet"

/** Marquee legacy (spec §2.4) — el HTML omite el último ítem (opcional, se incluye). */
const MARQUEE_ITEMS = [
  "Envío a toda Venezuela",
  "3 cuotas sin interés",
  "Cambios en 30 días",
  "Atención por WhatsApp",
  "Pago en USD o Bs.",
  "Stock limitado por drop",
]

/**
 * RosierRenderer — port fiel del tema rosier (boutique rose+cream; fuente
 * primaria el HTML aprobado landing-videos/rosier/index.html + legacy React,
 * spec docs/legacy-theme-specs/rosier.md). Renderer custom nivel 2:
 *
 * - Tokens --bl-* (rose=primary, ink=secondary); derivados por color-mix.
 * - NAV glass sticky + drawer menú + HERO split (radiales, watermark N°14,
 *   stats pill glass) + marquee ink 28s + categorías + grid de cards +
 *   sale banner −30% + testimonios + footer ink 3 col + bottom-nav mobile.
 * - Árbol respetado: hero → hero+marquee · product_grid → categorías+grid ·
 *   featured_products → sale banner · testimonials → cards · socials →
 *   embebido en el footer ink · footer → footer ink.
 * - Container queries (bl-rosier) — nunca @media. Wishlist legacy omitida.
 */
export function RosierRenderer({
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

  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const catsRef = useRef<HTMLDivElement | null>(null)
  const productsRef = useRef<HTMLDivElement | null>(null)
  const saleRef = useRef<HTMLDivElement | null>(null)

  const currency = store.currency ?? "USD"
  const fmt = (n: number) => fmtRosierPrice(n, currency)

  const totalItems = cart?.totalItems ?? cartCount

  function openCart() {
    if (onOpenCart) onOpenCart()
    else cart?.setIsOpen(true)
  }

  const whatsapp = store.whatsappNumber ?? null
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${store.name}, quiero más información.`)}`
    : "#"
  const instagramUrl = store.socials?.find((s) => /^ig$|insta/i.test(s.platform))?.url ?? null

  const categoryPool = useMemo(() => categories.slice(0, 6), [categories])
  const visibleProducts = useMemo(
    () => (activeCategory ? products.filter((p) => p.category === activeCategory) : products),
    [products, activeCategory],
  )

  // −N% del sale banner: mayor descuento real del catálogo, fallback 30 (HTML).
  const saleDiscount = useMemo(() => {
    let max = 0
    for (const p of products) {
      const d = rosierDiscount(p.price, p.compareAtPrice)
      if (d && d > max) max = d
    }
    return max || 30
  }, [products])

  const heroNode = sections.find((s) => s.type === "hero")
  const heroImage = (heroNode && s(heroNode, "image")) || products[0]?.image || ""
  const hasSale = sections.some((sec) => sec.type === "featured_products")
  const showSocials = sections.some((sec) => sec.type === "socials")

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function scrollTop() {
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function goToCategory(cat: string | null) {
    setActiveCategory(cat)
    setMenuOpen(false)
    scrollTo(productsRef)
  }

  // Mismo patrón de selección del editor que poster (Fragment sin editor —
  // el nav sticky y los anchors necesitan el flujo normal del documento).
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

  const brand = (size: number, color: string = RS.rose, dotColor: string = RS.ink) => (
    <span translate="no" style={{ fontFamily: RS.serif, fontStyle: "italic", fontWeight: 600, fontSize: size, letterSpacing: "-0.02em", color }}>
      {store.name}
      <span style={{ color: dotColor, fontStyle: "normal", marginLeft: 2 }}>.</span>
    </span>
  )

  const badge = (n: number) => (
    <span style={S.navBadge}>{n}</span>
  )

  // ── Head patrón de sección: kicker + h2 con em rose (spec §2.5) ────────────
  function sectionHead(kicker: string, head: string, em: string, seeAll?: ReactNode) {
    return (
      <div style={S.sectionHeadRow}>
        <div>
          <p style={S.kicker}>{kicker}</p>
          <h2 style={S.sectionTitle}>
            {head}{" "}
            <em style={{ fontStyle: "italic", color: RS.rose, fontWeight: 400 }}>{em}</em>
          </h2>
        </div>
        {seeAll}
      </div>
    )
  }

  // ── HERO + marquee (hero_main) ─────────────────────────────────────────────
  function renderHero(node: SectionNode) {
    const kicker = s(node, "kicker") || "Colección · Nueva entrega"
    const headline = s(node, "headline") || "Elegancia que no pasa desapercibida."
    const { head, em } = splitHeadline(headline)
    const desc =
      s(node, "subheadline") ||
      store.bio ||
      "Cápsulas semanales en terciopelo, lana y seda. Piezas pensadas para usarse, no para guardarse."
    const ctaPrimary = s(node, "ctaPrimaryLabel") || "Ver colección"
    const ctaSecondary = s(node, "ctaSecondaryLabel") || "Ver ofertas"
    const watermark = s(node, "watermarkText") || "N°14"
    const stats = arrOf<{ value?: string; label?: string }>(node, "stats")
    const statItems =
      stats.length > 0
        ? stats
        : [
            { value: "2.4k", label: "Pedidos /mes" },
            { value: "4.9★", label: "1.2k reviews" },
          ]
    // Watermark "N°14": prefijo no-numérico como <sup> (HTML) .
    const wmMatch = /^(\D*)(.*)$/.exec(watermark)
    const wmSup = wmMatch?.[1] ?? ""
    const wmBody = wmMatch?.[2] ?? watermark

    return editorWrap(
      node,
      <>
        <header className="bl-rosier-hero" style={{ position: "relative", color: "#fff" }}>
          {/* Bloque rose */}
          <div className="bl-rosier-heroblock" style={S.heroBlock}>
            <div aria-hidden="true" style={S.heroRadials} />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 620 }}>
              <p style={S.heroKicker}>
                <span aria-hidden="true" style={{ width: 22, height: 1.5, background: "#fff", display: "inline-block" }} />
                {kicker}
              </p>
              <h1 style={S.heroTitle}>
                {head}
                <em style={{ fontStyle: "italic", fontWeight: 400, opacity: 0.9 }}>{em}</em>
              </h1>
              <p style={S.heroDesc}>{desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <button
                  type="button"
                  className="bl-rosier-cta-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    scrollTo(productsRef)
                  }}
                  style={S.heroCtaPrimary}
                >
                  {ctaPrimary}
                  <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                </button>
                {hasSale && (
                  <button
                    type="button"
                    className="bl-rosier-cta-outline-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      scrollTo(saleRef)
                    }}
                    style={S.heroCtaSecondary}
                  >
                    {ctaSecondary}
                  </button>
                )}
              </div>
            </div>
            {/* Watermark N°14 */}
            <div aria-hidden="true" style={S.watermark}>
              {wmSup && <sup style={{ fontSize: "0.32em", verticalAlign: "super", marginRight: "0.03em", fontStyle: "normal", fontWeight: 400 }}>{wmSup}</sup>}
              {wmBody}
            </div>
          </div>

          {/* Bloque media + stats pill glass */}
          <div style={{ position: "relative", overflow: "hidden", background: RS.ink }}>
            {heroImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={heroImage}
                alt={`${store.name} — colección destacada`}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "40% 18%", position: "absolute", inset: 0 }}
              />
            )}
            <div aria-hidden="true" style={S.statsPill}>
              {statItems.map((it, i) => (
                <div key={i}>
                  <strong style={S.statVal}>{it.value}</strong>
                  <span style={S.statLbl}>{it.label}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Marquee ink 28s */}
        <div style={S.marquee} aria-hidden="true">
          <div className="bl-rosier-marquee" style={S.marqueeInner}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 44 }}>
                <span style={{ opacity: 0.7 }}>{item}</span>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "color-mix(in srgb, var(--bl-primary) 80%, transparent)", flexShrink: 0 }} />
              </span>
            ))}
          </div>
        </div>
      </>,
    )
  }

  // ── Categorías + productos (product_grid_main) ─────────────────────────────
  function renderGrid(node: SectionNode) {
    const showPrice = bool(node, "showPrice", true)
    const showSwatches = bool(node, "showSwatches", true)
    const title = s(node, "title") || "Recién llegados"
    const { head, em } = splitHeadline(title)

    return editorWrap(
      node,
      <>
        {/* Categorías */}
        {categoryPool.length > 0 && (
          <section ref={catsRef} className="bl-rosier-section" style={S.sectionShell} aria-label="Categorías">
            {sectionHead(
              "Explora",
              "Compra por",
              "categoría",
              <button
                type="button"
                className="bl-rosier-seeall"
                onClick={(e) => {
                  e.stopPropagation()
                  goToCategory(null)
                }}
                style={S.seeAll}
              >
                Ver todas
                <ArrowRight size={13} strokeWidth={1.6} aria-hidden="true" />
              </button>,
            )}
            <div className="bl-rosier-cats">
              {categoryPool.map((cat) => (
                <div key={cat.id} className="bl-rosier-cat">
                  <button
                    type="button"
                    className="bl-rosier-cathover"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToCategory(cat.name)
                    }}
                    style={S.catCard}
                    aria-label={cat.name}
                  >
                    {/* Contrato v2 sin imagen de categoría → placeholder gradiente del HTML */}
                    <div style={S.catPlaceholder} />
                    <div style={S.catLabelWrap}>
                      <strong style={S.catLabel}>{cat.name}</strong>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Productos */}
        <section ref={productsRef} className="bl-rosier-section" style={{ ...S.sectionShell, paddingTop: 0 }} aria-label={title}>
          {sectionHead("Nuevo esta semana", head.trim() || "Recién", em)}
          {activeCategory && (
            <button
              type="button"
              className="bl-rosier-rosehover"
              onClick={(e) => {
                e.stopPropagation()
                setActiveCategory(null)
              }}
              style={S.filterChip}
            >
              {activeCategory}
              <X size={12} aria-hidden="true" />
            </button>
          )}
          {visibleProducts.length === 0 ? (
            <p style={{ color: RS.muted, fontSize: 14 }}>Aún no hay productos disponibles.</p>
          ) : (
            <div className="bl-rosier-products">
              {visibleProducts.map((product) => (
                <RosierProductCard
                  key={product.id}
                  product={product}
                  fmt={fmt}
                  showPrice={showPrice}
                  showSwatches={showSwatches}
                  href={productHref?.(product) ?? null}
                  onOpen={onOpenProduct}
                  cart={cart}
                  openCart={openCart}
                />
              ))}
            </div>
          )}
        </section>
      </>,
    )
  }

  // ── Sale banner (featured_main, spec §2.7) ─────────────────────────────────
  function renderSale(node: SectionNode) {
    const title = s(node, "title") || "Últimas piezas"
    return editorWrap(
      node,
      <section ref={saleRef} style={S.saleBanner} aria-label={title}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: `linear-gradient(135deg, ${roseGrad(92)} 0%, ${roseDarkGrad(82)} 100%)${heroImage ? `, url("${heroImage}") center/cover` : ""}`,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={S.saleTitle}>{title}</h2>
          <div aria-hidden="true" style={S.saleBig}>
            −{saleDiscount}
            <small style={S.salePct}>%</small>
          </div>
          <p style={S.saleDesc}>
            Hasta {saleDiscount}% de descuento en prendas seleccionadas de la temporada anterior. Stock limitado, por orden de llegada.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bl-rosier-cta-white"
            onClick={(e) => e.stopPropagation()}
            style={{ ...S.heroCtaPrimary, padding: "16px 24px" }}
          >
            Consultar disponibilidad
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </section>,
    )
  }

  // ── Testimonios (spec §2.8) ────────────────────────────────────────────────
  function renderTestimonials(node: SectionNode) {
    const items = arrOf<{ quote?: string; author?: string; role?: string; avatar?: string }>(node, "items")
    if (items.length === 0) return null
    return editorWrap(
      node,
      <section className="bl-rosier-section" style={S.sectionShell} aria-label="Reseñas">
        {sectionHead("Reseñas verificadas", "Lo que dicen", "nuestras clientas")}
        <div className="bl-rosier-testimonials">
          {items.map((t, i) => (
            <div key={i} className="bl-rosier-testimonial" style={S.testimonialCard}>
              <div style={{ display: "flex", gap: 2, color: RS.rose }} aria-label="5 estrellas">
                {[0, 1, 2, 3, 4].map((st) => (
                  <Star key={st} size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                ))}
              </div>
              <blockquote style={S.quote}>
                <span aria-hidden="true" style={S.quoteMark}>“</span>
                {t.quote}
              </blockquote>
              <div style={S.testimonialFoot}>
                <div style={S.avatarCircle}>
                  {t.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={t.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    (t.author ?? "?").charAt(0)
                  )}
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: 13, fontWeight: 500, color: RS.ink }}>{t.author}</strong>
                  <span style={{ display: "block", fontSize: 11, color: RS.muted, letterSpacing: "0.025em" }}>
                    {t.role || "Compra verificada"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>,
    )
  }

  // ── Footer ink 3 col (footer_main; socials_bar embebido — spec §9) ─────────
  function renderFooter(node: SectionNode) {
    return editorWrap(
      node,
      <footer className="bl-rosier-footer" style={S.footer}>
        <div className="bl-rosier-footer-grid" style={{ maxWidth: 1440, margin: "0 auto", marginBottom: 40 }}>
          <div>
            <div style={{ marginBottom: 16 }}>{brand(22, "#fff", RS.rose)}</div>
            {store.bio && <p style={S.footerBio}>{store.bio}</p>}
            {showSocials && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                {whatsapp && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" style={S.footerLink}>
                    <MessageCircle size={14} style={{ opacity: 0.7 }} aria-hidden="true" />
                    {whatsapp}
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" style={S.footerLink}>
                    <Instagram size={14} style={{ opacity: 0.7 }} aria-hidden="true" />
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
          <div>
            <h3 style={S.footerColTitle}>Comprar</h3>
            <ul style={S.footerList}>
              {categoryPool.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToCategory(cat.name)
                    }}
                    style={S.footerListBtn}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={S.footerColTitle}>Ayuda</h3>
            <ul style={S.footerList}>
              {["Envíos", "Devoluciones", "Guía de tallas", "Contacto"].map((label) => (
                <li key={label}>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ ...S.footerListBtn, textDecoration: "none" }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={S.footerBottom}>
          <span>
            © {new Date().getFullYear()} <span translate="no">{store.name}</span> · Creado con <span translate="no">ByLink</span>
          </span>
        </div>
      </footer>,
    )
  }

  const rootStyle = {
    ...resolved.cssVars,
    background: "var(--bl-background)",
    color: "var(--bl-text)",
    fontFamily: RS.sans,
    minHeight: "100vh",
    containerType: "inline-size",
    containerName: "bl-rosier",
  } as CSSProperties

  return (
    <div ref={rootRef} className="bl-rosier-root" style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      {/* Fraunces italic — voz de marca del tema, googleFontsHref no trae ital */}
      <link rel="stylesheet" precedence="default" href={rosierSerifHref(resolved.headingFontName)} />
      <style dangerouslySetInnerHTML={{ __html: ROSIER_STYLES }} />

      {/* ── NAV glass sticky (chrome del tema) ── */}
      <nav aria-label="Principal" style={S.nav}>
        <button
          type="button"
          className="bl-rosier-roundbtn"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          style={S.roundBtn}
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        <button type="button" onClick={scrollTop} aria-label={store.name} style={S.brandBtn}>
          {brand(22)}
        </button>

        <div className="bl-rosier-navlinks" style={S.navLinks}>
          {categoryPool.slice(0, 3).map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="bl-rosier-rosehover"
              onClick={() => goToCategory(cat.name)}
              style={S.navLink}
            >
              {cat.name}
            </button>
          ))}
          {hasSale && (
            <button type="button" onClick={() => scrollTo(saleRef)} style={{ ...S.navLink, color: RS.rose, fontWeight: 600 }}>
              Sale −{saleDiscount}%
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
          <button
            type="button"
            className="bl-rosier-roundbtn"
            onClick={openCart}
            aria-label={`Abrir bolsa${totalItems > 0 ? ` (${totalItems} artículos)` : ""}`}
            style={{ ...S.roundBtn, position: "relative" }}
          >
            <ShoppingBag size={19} strokeWidth={1.6} />
            {totalItems > 0 && badge(totalItems)}
          </button>
        </div>
      </nav>

      {/* ── DRAWER MENÚ ── */}
      {menuOpen && <div style={S.menuOverlay} onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        style={{
          ...S.menuDrawer,
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          visibility: menuOpen ? "visible" : "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          {brand(20)}
          <button
            type="button"
            className="bl-rosier-roundbtn"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            style={{ ...S.roundBtn, width: 36, height: 36, border: `1px solid ${RS.line}` }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <ul style={{ listStyle: "none", margin: "0 0 32px", padding: 0 }}>
          {categoryPool.map((cat) => (
            <li key={cat.id}>
              <button type="button" className="bl-rosier-menu-item" onClick={() => goToCategory(cat.name)} style={S.menuItem}>
                {cat.name}
                <ArrowRight size={14} className="bl-rosier-arrow" aria-hidden="true" />
              </button>
            </li>
          ))}
          {hasSale && (
            <li>
              <button
                type="button"
                className="bl-rosier-menu-item"
                onClick={() => {
                  setMenuOpen(false)
                  scrollTo(saleRef)
                }}
                style={{ ...S.menuItem, fontStyle: "italic", color: RS.rose }}
              >
                Sale −{saleDiscount}%
                <ArrowRight size={14} className="bl-rosier-arrow" aria-hidden="true" />
              </button>
            </li>
          )}
        </ul>

        <div style={S.menuFooter}>
          <p style={{ color: RS.ink, fontWeight: 500, margin: "0 0 2px" }}>Atención al cliente</p>
          {store.bio && <p style={{ color: RS.muted, margin: 0 }}>{store.bio}</p>}
          {whatsapp && <p style={{ margin: "2px 0 0" }}>{whatsapp}</p>}
        </div>
      </aside>

      <main>
        {sections.map((node) => {
          switch (node.type) {
            case "hero":
              return renderHero(node)
            case "product_grid":
              return renderGrid(node)
            case "featured_products":
              return renderSale(node)
            case "testimonials":
              return renderTestimonials(node)
            case "socials":
              // Embebido en el footer ink (spec §9) — sin bloque propio.
              return null
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
                  priceCtx={{ currency, convert: (n) => n }}
                />,
              )
          }
        })}
      </main>

      {/* ── BOTTOM-NAV mobile (chrome, spec §2.10) ── */}
      <nav className="bl-rosier-bottomnav" aria-label="Navegación móvil" style={S.bottomNav}>
        <button type="button" onClick={scrollTop} style={{ ...S.bottomItem, color: RS.rose }} aria-current="page">
          <Home size={18} strokeWidth={1.6} aria-hidden="true" />
          Inicio
        </button>
        <button type="button" className="bl-rosier-rosehover" onClick={() => scrollTo(catsRef)} style={S.bottomItem}>
          <Grid3x3 size={18} strokeWidth={1.6} aria-hidden="true" />
          Tienda
        </button>
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="bl-rosier-rosehover" style={{ ...S.bottomItem, textDecoration: "none" }}>
          <MessageCircle size={18} strokeWidth={1.6} aria-hidden="true" />
          Contacto
        </a>
        <button
          type="button"
          className="bl-rosier-rosehover"
          onClick={openCart}
          style={{ ...S.bottomItem, position: "relative" }}
        >
          <ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true" />
          Bolsa
          {totalItems > 0 && (
            <span style={{ ...S.navBadge, top: 8, right: "calc(50% - 18px)" }}>{totalItems}</span>
          )}
        </button>
      </nav>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function s(section: SectionNode | undefined, key: string, fallback = ""): string {
  const v = section?.props?.[key]
  return typeof v === "string" ? v : fallback
}

function bool(section: SectionNode | undefined, key: string, fallback = false): boolean {
  const v = section?.props?.[key]
  return typeof v === "boolean" ? v : fallback
}

function arrOf<T = unknown>(section: SectionNode, key: string): T[] {
  const v = section.props?.[key]
  return Array.isArray(v) ? (v as T[]) : []
}

/** Última(s) palabra(s) al em italic — patrón "Recién *llegados*". */
function splitHeadline(text: string): { head: string; em: string } {
  const words = text.trim().split(/\s+/)
  if (words.length < 2) return { head: "", em: text }
  const cut = Math.max(1, Math.ceil(words.length / 2))
  return { head: words.slice(0, cut).join(" ") + " ", em: words.slice(cut).join(" ") }
}

/** rgba(200,51,76,α) / rgba(155,34,55,α) del sale banner, derivadas del token rose. */
function roseGrad(pct: number): string {
  return `color-mix(in srgb, var(--bl-primary) ${pct}%, transparent)`
}
function roseDarkGrad(pct: number): string {
  return `color-mix(in srgb, ${RS.roseDark} ${pct}%, transparent)`
}

// ── estilos ───────────────────────────────────────────────────────────────────

const S: Record<string, CSSProperties> = {
  editorTag: {
    position: "absolute", top: -1, left: 12, transform: "translateY(-100%)",
    background: "var(--brand, #1E3A8A)", color: "#fff", fontFamily: "monospace",
    fontSize: 9, padding: "2px 8px", borderRadius: "4px 4px 0 0",
    letterSpacing: "0.06em", zIndex: 55, pointerEvents: "none",
  },

  // Nav
  nav: {
    position: "sticky", top: 0, zIndex: 40,
    display: "flex", alignItems: "center", gap: 8,
    padding: "12px 16px",
    background: RS.glass,
    backdropFilter: "blur(14px) saturate(150%)",
    WebkitBackdropFilter: "blur(14px) saturate(150%)",
    borderBottom: `1px solid ${RS.line}`,
  },
  roundBtn: {
    width: 40, height: 40, borderRadius: "50%",
    display: "grid", placeItems: "center",
    background: "transparent", border: "none", cursor: "pointer",
    color: RS.ink, flexShrink: 0,
  },
  brandBtn: { background: "none", border: "none", cursor: "pointer", padding: 0, margin: "0 auto" },
  navLinks: { alignItems: "center", gap: 28, marginLeft: 4 },
  navLink: {
    background: "none", border: "none", cursor: "pointer", padding: 0,
    fontSize: 13.5, fontWeight: 500, color: RS.inkSoft, fontFamily: RS.sans,
  },
  navBadge: {
    position: "absolute", top: 6, right: 6,
    minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999,
    background: RS.rose, color: "#fff",
    fontSize: 10, fontWeight: 600, fontVariantNumeric: "tabular-nums",
    display: "grid", placeItems: "center", lineHeight: 1,
  },

  // Drawer menú
  menuOverlay: {
    position: "fixed", inset: 0, zIndex: 90,
    background: inkA(55),
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
  },
  menuDrawer: {
    position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
    width: "min(380px, 88vw)",
    background: RS.bg,
    boxShadow: "20px 0 50px -20px rgba(0,0,0,0.3)",
    transition: `transform .35s ${RS.ease}, visibility .35s`,
    display: "flex", flexDirection: "column",
    padding: "18px 24px 24px",
    overflowY: "auto", overscrollBehavior: "contain",
  },
  menuItem: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 0", background: "none", border: "none", cursor: "pointer",
    fontSize: 22, fontWeight: 500, color: RS.ink, textAlign: "left",
    fontFamily: RS.serif, letterSpacing: "-0.02em",
    borderBottom: `1px solid ${RS.line}`,
  },
  menuFooter: {
    marginTop: "auto", paddingTop: 20,
    borderTop: `1px solid ${RS.line}`,
    fontSize: 12.5, color: RS.muted, lineHeight: 1.7,
  },

  // Hero
  heroBlock: {
    position: "relative",
    background: RS.rose,
    padding: "36px 20px",
    display: "flex", flexDirection: "column", justifyContent: "center",
    overflow: "hidden", isolation: "isolate",
  },
  heroRadials: {
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    background:
      "radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,.08) 0%, transparent 55%), radial-gradient(140% 100% at 0% 100%, rgba(26,20,19,.18) 0%, transparent 60%)",
  },
  heroKicker: {
    display: "inline-flex", alignItems: "center", gap: 10,
    fontSize: 11.5, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.2em", color: "#fff", margin: "0 0 16px",
    fontFamily: RS.sans,
  },
  heroTitle: {
    fontFamily: RS.serif, fontWeight: 500,
    fontSize: "clamp(40px, 10.5cqw, 84px)",
    lineHeight: 1.02, letterSpacing: "-0.03em",
    color: "#fff", margin: "0 0 16px",
  },
  heroDesc: {
    fontSize: 14, lineHeight: 1.55, color: whiteA(90),
    maxWidth: 420, margin: "0 0 24px", fontFamily: RS.sans,
  },
  heroCtaPrimary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "14px 20px", borderRadius: 999, border: "none", cursor: "pointer",
    background: "#fff", color: RS.rose,
    fontSize: 13.5, fontWeight: 600, fontFamily: RS.sans,
    textDecoration: "none",
  },
  heroCtaSecondary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "14px 20px", borderRadius: 999, cursor: "pointer",
    background: "transparent", color: "#fff",
    border: `1px solid ${whiteA(60)}`,
    fontSize: 13.5, fontWeight: 600, fontFamily: RS.sans,
  },
  watermark: {
    position: "absolute", right: -14, bottom: -28, zIndex: 1,
    fontFamily: RS.serif, fontStyle: "italic", fontWeight: 500,
    color: whiteA(9),
    fontSize: "clamp(220px, 42cqw, 380px)",
    lineHeight: 0.8, letterSpacing: "-0.04em",
    pointerEvents: "none", userSelect: "none",
  },
  statsPill: {
    position: "absolute", left: 20, bottom: 20,
    display: "flex", gap: 20,
    padding: "12px 16px",
    background: inkA(40),
    backdropFilter: "blur(12px) saturate(150%)",
    WebkitBackdropFilter: "blur(12px) saturate(150%)",
    borderRadius: 999, color: "#fff",
  },
  statVal: {
    display: "block", fontFamily: RS.serif, fontWeight: 500,
    fontSize: 20, lineHeight: 1, marginBottom: 2, color: "#fff",
  },
  statLbl: {
    display: "block", fontSize: 9.5, textTransform: "uppercase",
    letterSpacing: "0.1em", opacity: 0.75, fontFamily: RS.sans,
  },

  // Marquee
  marquee: {
    background: RS.ink, color: whiteA(60),
    padding: "16px 0", overflow: "hidden", whiteSpace: "nowrap",
  },
  marqueeInner: {
    display: "inline-flex", alignItems: "center", gap: 44, paddingLeft: 44,
    fontFamily: RS.serif, fontStyle: "italic", fontSize: 18, fontWeight: 500,
    willChange: "transform",
  },

  // Secciones
  sectionShell: { maxWidth: 1440, margin: "0 auto" },
  sectionHeadRow: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    gap: 16, marginBottom: 28, flexWrap: "wrap",
  },
  kicker: {
    fontSize: 10.5, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.22em", color: RS.rose, margin: "0 0 8px",
    fontFamily: RS.sans,
  },
  sectionTitle: {
    fontFamily: RS.serif, fontWeight: 500,
    fontSize: "clamp(32px, 6cqw, 54px)",
    lineHeight: 1.02, letterSpacing: "-0.02em",
    color: RS.ink, margin: 0,
  },
  seeAll: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 12.5, fontWeight: 500, color: RS.ink,
    background: "none", border: "none", borderBottom: `1px solid ${RS.ink}`,
    paddingBottom: 2, cursor: "pointer", fontFamily: RS.sans,
  },
  catCard: {
    position: "relative", display: "block", width: "100%",
    aspectRatio: "3/4", borderRadius: 4, overflow: "hidden",
    background: RS.bgSoft, border: "none", cursor: "pointer", padding: 0,
  },
  catPlaceholder: {
    width: "100%", height: "100%",
    background: `linear-gradient(to bottom right, ${RS.cream2}, ${RS.bgSoft})`,
  },
  catLabelWrap: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: "56px 14px 14px", textAlign: "left",
    background: `linear-gradient(to top, ${inkA(85)}, transparent)`,
  },
  catLabel: {
    display: "block", fontSize: 17, fontWeight: 500, fontStyle: "italic",
    letterSpacing: "-0.01em", color: "#fff", fontFamily: RS.serif,
  },
  filterChip: {
    display: "inline-flex", alignItems: "center", gap: 6,
    marginBottom: 20, padding: "6px 14px", borderRadius: 999,
    border: `1px solid ${RS.line}`, background: RS.bgSoft,
    fontSize: 12.5, fontWeight: 500, color: RS.ink, cursor: "pointer",
    fontFamily: RS.sans,
  },

  // Sale banner
  saleBanner: {
    position: "relative", overflow: "hidden", isolation: "isolate",
    color: "#fff", padding: "96px 24px",
    minHeight: "clamp(380px, 50dvh, 560px)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
  },
  saleTitle: {
    fontFamily: RS.serif, fontWeight: 500,
    fontSize: "clamp(20px, 4cqw, 32px)", letterSpacing: "-0.02em",
    margin: "0 0 10px", color: "#fff",
  },
  saleBig: {
    fontFamily: RS.serif, fontStyle: "italic", fontWeight: 500,
    fontSize: "clamp(72px, 24cqw, 200px)",
    lineHeight: 0.9, letterSpacing: "-0.04em", marginBottom: 12,
  },
  salePct: {
    fontSize: "0.22em", fontStyle: "normal", fontWeight: 600,
    letterSpacing: "0.1em", display: "inline-block",
    verticalAlign: "top", marginTop: "0.35em", fontFamily: RS.sans,
  },
  saleDesc: {
    fontSize: 14, color: whiteA(90), maxWidth: 460,
    margin: "0 0 28px", lineHeight: 1.6, fontFamily: RS.sans,
  },

  // Testimonios
  testimonialCard: {
    background: RS.bgSoft, borderRadius: 8,
    padding: "24px 20px",
    display: "flex", flexDirection: "column", gap: 14,
  },
  quote: {
    fontFamily: RS.serif, fontSize: 18, fontWeight: 500,
    color: RS.ink, lineHeight: 1.4, letterSpacing: "-0.02em",
    margin: 0, flex: 1,
  },
  quoteMark: {
    color: RS.rose, fontSize: 40, lineHeight: 0,
    verticalAlign: "-0.2em", marginRight: 4, fontFamily: RS.serif,
  },
  testimonialFoot: {
    display: "flex", alignItems: "center", gap: 12,
    paddingTop: 14, borderTop: `1px solid ${RS.line}`,
  },
  avatarCircle: {
    width: 36, height: 36, borderRadius: "50%", overflow: "hidden",
    background: RS.cream2, color: RS.inkSoft,
    display: "grid", placeItems: "center",
    fontSize: 14, fontWeight: 600, flexShrink: 0, fontFamily: RS.sans,
  },

  // Footer
  footer: {
    background: RS.ink, color: whiteA(75),
    // padding-bottom lo controla .bl-rosier-footer (espaciador del bottom-nav
    // móvil, reseteado por container query en desktop); no se fija acá para
    // que la clase CSS gane sin necesitar !important.
    paddingTop: 64, paddingLeft: 24, paddingRight: 24,
  },
  footerBio: { fontSize: 13, lineHeight: 1.7, maxWidth: 320, margin: "0 0 20px" },
  footerLink: {
    display: "inline-flex", alignItems: "center", gap: 10,
    color: whiteA(80), textDecoration: "none", fontSize: 13,
  },
  footerColTitle: {
    color: "#fff", fontSize: 11, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 16px",
    fontFamily: RS.sans,
  },
  footerList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13 },
  footerListBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 0,
    color: whiteA(70), fontSize: 13, fontFamily: RS.sans, textAlign: "left",
  },
  footerBottom: {
    maxWidth: 1440, margin: "0 auto", paddingTop: 20,
    borderTop: `1px solid ${whiteA(10)}`,
    fontSize: 12, color: whiteA(50),
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 16, flexWrap: "wrap",
  },

  // Bottom-nav
  bottomNav: {
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
    display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", height: 64,
    background: RS.glass96,
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    borderTop: `1px solid ${RS.line}`,
  },
  bottomItem: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 4,
    fontSize: 10, color: RS.inkSoft, fontFamily: RS.sans,
    background: "none", border: "none", cursor: "pointer",
  },
}
