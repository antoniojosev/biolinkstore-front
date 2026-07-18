"use client"

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import {
  ArrowRight,
  Bookmark,
  Instagram,
  Mail,
  Menu,
  MessageCircle,
  Search,
  X,
} from "lucide-react"
import type { SectionNode } from "@/lib/page-builder-api"
import { googleFontsHref } from "@/lib/google-fonts"
import { resolveTokens } from "@/components/storefront-v2/template/tokens"
import {
  SectionRenderer,
  type PriceContext,
  type TemplateProduct,
  type TemplateRendererProps,
} from "@/components/storefront-v2/template/template-renderer"
import { InmueblesPropertyCard } from "./property-card"
import { INM, INM_STYLES, buildWaHref, detectOperation, makeFmt, paper, type Operation } from "./shared"

// Overlays propios del tema — para registrar junto al renderer en el registry.
export { InmueblesProductSheet } from "./product-sheet"
export { InmueblesCartSheet } from "./cart-sheet"

type OperationFilter = "todas" | Operation

const FILTERS: Array<{ id: OperationFilter; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "comprar", label: "Comprar" },
  { id: "alquilar", label: "Alquilar" },
  { id: "preventa", label: "Preventa" },
]

const FALLBACK_BIO =
  "Acompaño a comprar, alquilar o vender tu propiedad. Con calma, datos reales y acceso directo a los mejores proyectos."

/**
 * InmueblesRenderer — port fiel del tema legacy inmuebles (asesor
 * inmobiliario PRO; spec docs/legacy-theme-specs/inmuebles.md, HTML aprobado
 * landing-videos/inmuebles). Renderer custom nivel 2 (patrón persona/poster):
 *
 * - Editorial negro+navy+dorado por tokens --bl-* (seed ya corregido:
 *   accent=#d4a04f); hex literales solo identidad (verdes WhatsApp/online).
 * - Chrome del tema (no secciones): banner de estado sticky, page frame
 *   rounded-t sobre fondo negro, nav translúcida con drawer de menú
 *   (focus trap completo) y barra flotante de guardadas.
 * - Árbol de secciones respetado: hero → hero con search pill + quick
 *   filters glass · product_grid → featured peek + filtros de operación +
 *   grid de property cards · about → Sobre mí con 3 stats · footer → CTA
 *   grande + footer oscuro 3 columnas · resto delegado al catálogo base.
 * - Responsive SOLO por container queries (containerName bl-inmuebles).
 */
export function InmueblesRenderer({
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

  const [filter, setFilter] = useState<OperationFilter>("todas")
  const [search, setSearch] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [year, setYear] = useState<number | null>(null)

  const gridRef = useRef<HTMLElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  // Año del copyright vía useEffect (evita hydration mismatch — legacy).
  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  // Drawer de menú: focus trap Tab/Shift-Tab, Escape, autofocus en X,
  // body.overflow, inert en el frame, restauración de foco (legacy completo).
  useEffect(() => {
    if (!drawerOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = "hidden"
    const focusTimer = setTimeout(() => closeBtnRef.current?.focus(), 50)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false)
        return
      }
      if (e.key !== "Tab" || !drawerRef.current) return
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
      clearTimeout(focusTimer)
      previouslyFocused?.focus?.()
    }
  }, [drawerOpen])

  // Toggle de moneda del comprador (mecánica del framework, spec §9.7).
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

  const waPhone = store.whatsappNumber
  const waMain = buildWaHref(waPhone, `Hola ${store.name}, te escribo desde tu sitio web.`)
  const waCta = buildWaHref(
    waPhone,
    `Hola ${store.name}, quiero más información sobre tus propiedades.`,
  )
  const instagramUrl = store.socials?.find((s) => /^ig$|insta/i.test(s.platform))?.url ?? null

  const shortBio = store.bio || FALLBACK_BIO

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((p) => {
      if (filter !== "todas" && detectOperation(p) !== filter) return false
      if (!query) return true
      return (
        p.name.toLowerCase().includes(query) ||
        (p.category ?? "").toLowerCase().includes(query) ||
        (p.description ?? "").toLowerCase().includes(query)
      )
    })
  }, [products, filter, search])

  const featured = useMemo(
    () => products.find((p) => p.featured && (p.stock == null || p.stock > 0)) ?? products[0],
    [products],
  )

  // Quick filters glass: categorías de los primeros productos (máx 4, únicas).
  const quickChips = useMemo(() => {
    const cats = products
      .slice(0, 4)
      .map((p) => p.category)
      .filter((c, i, arr): c is string => Boolean(c) && arr.indexOf(c) === i)
    return cats.slice(0, 4)
  }, [products])

  const scrollToGrid = () => gridRef.current?.scrollIntoView({ behavior: "smooth" })

  const openProduct = (p: TemplateProduct) => onOpenProduct?.(p)

  // ── editor wrap (misma mecánica que poster/persona) ──────────────────────
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

  // ── Hero: kicker con líneas, H1 con em dorado, search pill, chips glass ──
  function renderHero(node: SectionNode) {
    const kicker = s(node, "kicker") || "Asesor inmobiliario"
    const headline = s(node, "headline")
    const sub = s(node, "subheadline") || shortBio
    const heroPoster = s(node, "image") || "/cover.webp"

    return editorWrap(
      node,
      <header style={S.hero}>
        <div aria-hidden="true" style={S.heroBg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroPoster} alt="" fetchPriority="high" style={S.heroImg} />
          {/* 🔶 Veladura de 4 stops del HTML (más oscura al pie). */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.35) 30%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.82) 100%)",
            }}
          />
        </div>

        <p style={S.heroKicker}>
          <span aria-hidden="true" style={S.kickerLine} />
          {kicker}
          <span aria-hidden="true" style={S.kickerLine} />
        </p>
        <h1 style={S.heroTitle}>
          {headline ? (
            headline
          ) : (
            <>
              Tu próxima casa{" "}
              {/* 🔶 em dorado del HTML (el React usaba text-white/70). */}
              <em style={{ fontStyle: "normal", color: INM.gold }}>la encontramos juntos.</em>
            </>
          )}
        </h1>
        <p style={S.heroDesc}>{sub}</p>

        <form
          role="search"
          style={S.searchPill}
          onSubmit={(e) => {
            e.preventDefault()
            scrollToGrid()
          }}
        >
          <label htmlFor="bl-inm-hero-search" className="bl-inm-skip">
            Buscar propiedades
          </label>
          <input
            id="bl-inm-hero-search"
            type="search"
            autoComplete="off"
            spellCheck={false}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Buscar por zona, tipo o precio…"
            style={S.searchInput}
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="bl-inm-searchbtn"
            onClick={(e) => e.stopPropagation()}
            style={S.searchBtn}
          >
            <Search style={{ width: 16, height: 16 }} strokeWidth={2} aria-hidden="true" />
          </button>
        </form>

        {quickChips.length > 0 && (
          <nav aria-label="Filtros rápidos" style={S.chips}>
            {quickChips.map((chip) => {
              // 🔶 Estado activo del HTML: chip blanca cuando search === categoría.
              const active = search === chip
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearch(active ? "" : chip)
                    scrollToGrid()
                  }}
                  className={`bl-inm-chip${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  style={{
                    ...S.chip,
                    ...(active
                      ? { background: "#ffffff", color: "#0a0a0a", borderColor: "#ffffff" }
                      : {}),
                  }}
                >
                  {chip}
                </button>
              )
            })}
          </nav>
        )}
      </header>,
    )
  }

  // ── Grid: featured peek + filtros de operación + property cards ──────────
  function renderGrid(node: SectionNode) {
    const title = s(node, "title") || "Mis propiedades"
    const showFilters = bool(node, "showFilters", true)
    const showPrice = bool(node, "showPrice", true)

    return editorWrap(
      node,
      <>
        {/* Featured peek — solapa el hero */}
        {featured && (
          <section aria-label="Propiedad destacada" style={S.peekWrap}>
            <PeekLink
              product={featured}
              href={productHref?.(featured) ?? null}
              onOpen={openProduct}
            >
              <div style={S.peekImg}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.images?.[0] ?? featured.image ?? "/placeholder.svg"}
                  alt={featured.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                {/* 🔶 Label dorado por HTML (el React usaba navy). */}
                <span style={S.peekLabel}>Propiedad destacada</span>
                <h2 style={S.peekTitle}>{featured.name}</h2>
                {featured.category && <p style={S.peekCat}>{featured.category}</p>}
                <span style={S.peekPrice}>{fmt(featured.price)}</span>
              </div>
            </PeekLink>
          </section>
        )}

        {/* Grid de propiedades */}
        <section id="destacados" ref={gridRef} aria-labelledby="bl-inm-seg-h" style={S.gridSection}>
          <div className="bl-inm-gridhead" style={S.gridHead}>
            <div style={{ minWidth: 0 }}>
              <p style={S.gridKicker}>
                Portafolio · {products.length} disponible{products.length === 1 ? "" : "s"}
              </p>
              <h2 id="bl-inm-seg-h" style={S.gridTitle}>
                {title}
              </h2>
            </div>
            {showFilters && (
              <div
                role="radiogroup"
                aria-label="Filtrar por operación"
                className="bl-inm-scroll-x"
                style={S.opPills}
              >
                {FILTERS.map((f) => {
                  const active = filter === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={(e) => {
                        e.stopPropagation()
                        setFilter(f.id)
                      }}
                      className={`bl-inm-oppill${active ? " is-active" : ""}`}
                      style={{
                        ...S.opPill,
                        ...(active
                          ? { background: INM.ink, color: INM.paper, borderColor: INM.ink }
                          : { background: "transparent", color: INM.body, borderColor: INM.border }),
                      }}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div style={S.empty}>No hay propiedades que coincidan con tu búsqueda.</div>
          ) : (
            <ul className="bl-inm-grid" style={S.grid}>
              {filtered.map((p) => (
                <InmueblesPropertyCard
                  key={p.id}
                  product={p}
                  store={store}
                  fmt={fmt}
                  currency={priceCtx.currency}
                  href={productHref?.(p) ?? null}
                  onOpen={openProduct}
                  showPrice={showPrice}
                />
              ))}
            </ul>
          )}
        </section>
      </>,
    )
  }

  // ── Sobre mí con 3 stats ──────────────────────────────────────────────────
  function renderAbout(node: SectionNode) {
    const title = s(node, "title") || "Años viendo cómo se mueve el mercado."
    const body = s(node, "body") || shortBio
    const image = s(node, "image") || store.avatar || "/placeholder.svg"
    return editorWrap(
      node,
      <section id="sobre-mi" aria-labelledby="bl-inm-about-h" className="bl-inm-about-grid" style={S.about}>
        <div className="bl-inm-about-img" style={S.aboutImg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={`Retrato profesional de ${store.name}`}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div style={{ maxWidth: 500, minWidth: 0 }}>
          <p style={S.aboutKicker}>Sobre mí</p>
          <h2 id="bl-inm-about-h" style={S.aboutTitle}>
            {title}
          </h2>
          <p style={S.aboutBody}>{body}</p>
          <p style={S.aboutBody}>
            Mi forma de trabajar: pocas propiedades, conversación larga, recorridos con tiempo.
            Cero presión.
          </p>
          <div style={S.stats}>
            <div>
              <strong style={S.statValue}>{products.length}+</strong>
              <span style={S.statLabel}>Propiedades</span>
            </div>
            <div>
              <strong style={S.statValue}>12</strong>
              <span style={S.statLabel}>Años de carrera</span>
            </div>
            <div>
              <strong style={S.statValue}>&lt;&nbsp;1h</strong>
              <span style={S.statLabel}>Respuesta</span>
            </div>
          </div>
        </div>
      </section>,
    )
  }

  // ── CTA grande + footer oscuro (el schema no trae cta_banner: van juntos) ─
  function renderFooter(node: SectionNode) {
    const tagline = s(node, "tagline") || shortBio
    const showBranding = bool(node, "showBranding", true)
    return editorWrap(
      node,
      <>
        {/* CTA grande */}
        <section aria-labelledby="bl-inm-cta-h" style={S.bigCta}>
          <p style={S.bigCtaKicker}>¿Quieres vender o buscas algo puntual?</p>
          <h2 id="bl-inm-cta-h" style={S.bigCtaTitle}>
            Escríbeme. Respondo yo, no un call&nbsp;center.
          </h2>
          <p style={S.bigCtaBody}>
            Cuéntame qué buscas o qué quieres vender y te contacto el mismo día con opciones
            reales.
          </p>
          {waCta && (
            <a
              href={waCta}
              target="_blank"
              rel="noopener noreferrer"
              className="bl-inm-btn-dark"
              onClick={(e) => e.stopPropagation()}
              style={S.bigCtaBtn}
            >
              Escribir por WhatsApp
              <MessageCircle style={{ width: 16, height: 16 }} aria-hidden="true" />
            </a>
          )}
        </section>

        {/* Footer oscuro 3 columnas */}
        <footer id="contacto" style={S.footer}>
          <div className="bl-inm-footer-grid" style={S.footerGrid}>
            <div>
              <div translate="no" style={S.footerLogo}>
                {store.name}
                <span style={{ color: INM.navyLight }}>.</span>
              </div>
              <p style={S.footerBio}>{tagline}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                {waMain && waPhone && (
                  <a
                    href={waMain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bl-inm-footlink"
                    onClick={(e) => e.stopPropagation()}
                    style={S.footerContact}
                  >
                    <MessageCircle style={S.footerContactIcon} aria-hidden="true" />
                    {waPhone}
                  </a>
                )}
                {store.email && (
                  <a
                    href={`mailto:${store.email}`}
                    className="bl-inm-footlink"
                    onClick={(e) => e.stopPropagation()}
                    style={S.footerContact}
                  >
                    <Mail style={S.footerContactIcon} strokeWidth={1.6} aria-hidden="true" />
                    Escribir por email
                  </a>
                )}
              </div>
            </div>
            <div>
              <h3 style={S.footerColTitle}>Propiedades</h3>
              <ul style={S.footerList}>
                {FILTERS.filter((f) => f.id !== "todas").map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      className="bl-inm-footlink"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFilter(f.id)
                        scrollToGrid()
                      }}
                      style={S.footerBtn}
                    >
                      {f.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={S.footerColTitle}>Zonas</h3>
              <ul style={S.footerList}>
                {Array.from(
                  new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))),
                )
                  .slice(0, 4)
                  .map((zone) => (
                    <li key={zone}>
                      <button
                        type="button"
                        className="bl-inm-footlink"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSearch(zone)
                          scrollToGrid()
                        }}
                        style={S.footerBtn}
                      >
                        {zone}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="bl-inm-footer-bottom" style={S.footerBottom}>
            <span>
              {year !== null && <>© {year} </>}
              <span translate="no">{store.name}</span> · Asesor inmobiliario
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="bl-inm-footicon"
                  onClick={(e) => e.stopPropagation()}
                  style={S.footerIcon}
                >
                  <Instagram style={{ width: 14, height: 14 }} strokeWidth={1.6} aria-hidden="true" />
                </a>
              )}
              {waMain && (
                <a
                  href={waMain}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="bl-inm-footicon"
                  onClick={(e) => e.stopPropagation()}
                  style={S.footerIcon}
                >
                  <MessageCircle style={{ width: 14, height: 14 }} aria-hidden="true" />
                </a>
              )}
            </div>
            {showBranding && (
              <span>
                Creado con <span translate="no">ByLink</span>
              </span>
            )}
          </div>
        </footer>
      </>,
    )
  }

  const rootStyle = {
    ...resolved.cssVars,
    background: INM.ink,
    color: INM.text,
    fontFamily: INM.bodyFont,
    minHeight: "100dvh",
    overflowX: "clip",
    containerType: "inline-size",
    containerName: "bl-inmuebles",
  } as CSSProperties

  return (
    <main className="bl-inm-root" style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <style dangerouslySetInnerHTML={{ __html: INM_STYLES }} />

      <a href="#destacados" className="bl-inm-skip">
        Saltar al contenido
      </a>

      {/* Banner de estado — sticky, dot verde con halo (🔶 verdes del HTML) */}
      <div role="region" aria-label="Disponibilidad" style={S.banner}>
        <span aria-hidden="true" style={S.bannerDot} />
        <span className="bl-inm-banner-long">
          Disponible esta semana · respondo en menos de 1&nbsp;h por&nbsp;
        </span>
        <span className="bl-inm-banner-short">Online ahora ·&nbsp;</span>
        {waMain ? (
          <a
            href={waMain}
            target="_blank"
            rel="noopener noreferrer"
            style={S.bannerLink}
          >
            WhatsApp
          </a>
        ) : (
          <span style={S.bannerLink}>WhatsApp</span>
        )}
      </div>

      {/* Page frame — efecto pestaña sobre el fondo negro */}
      <div style={S.frame} inert={drawerOpen}>
        {/* Nav */}
        <nav aria-label="Principal" style={S.nav}>
          <div style={S.navInner}>
            <a href="#destacados" translate="no" aria-label={`${store.name} — inicio`} style={S.logo}>
              <span style={S.logoText}>{store.name}</span>
              <span style={{ color: INM.navy, flexShrink: 0 }}>.</span>
            </a>
            <div className="bl-inm-nav-links" style={S.navLinks}>
              <a href="#destacados" className="bl-inm-navlink" style={S.navLink}>
                Propiedades
              </a>
              <a href="#destacados" style={S.navPill}>
                En preventa
              </a>
              <a href="#sobre-mi" className="bl-inm-navlink" style={S.navLink}>
                Sobre mí
              </a>
              <a href="#contacto" className="bl-inm-navlink" style={S.navLink}>
                Contacto
              </a>
            </div>
            <div style={S.navRight}>
              {canToggleCurrency && (
                <button
                  type="button"
                  className="bl-inm-btn-outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowBs((v) => !v)
                  }}
                  aria-label="Cambiar moneda"
                  style={{ ...S.menuBtn, fontVariantNumeric: "tabular-nums" }}
                >
                  {showBs ? "Bs" : store.currency ?? "USD"}
                </button>
              )}
              {waMain && (
                <a
                  href={waMain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bl-inm-btn-dark"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Escribir por WhatsApp"
                  style={S.navCta}
                >
                  <MessageCircle style={{ width: 14, height: 14 }} aria-hidden="true" />
                  <span className="bl-inm-sm">Escribir</span>
                </a>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setDrawerOpen(true)
                }}
                aria-label="Abrir menú"
                aria-expanded={drawerOpen}
                aria-controls="bl-inm-drawer"
                className="bl-inm-btn-outline"
                style={S.menuBtn}
              >
                <Menu style={{ width: 16, height: 16 }} strokeWidth={1.6} aria-hidden="true" />
                <span className="bl-inm-sm">Menú</span>
              </button>
            </div>
          </div>
        </nav>

        {sections.map((node) => {
          switch (node.type) {
            case "hero":
              return renderHero(node)
            case "product_grid":
              return renderGrid(node)
            case "about":
              return renderAbout(node)
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
      </div>

      {/* Drawer backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
        style={{
          ...S.backdrop,
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* Drawer de menú */}
      <aside
        id="bl-inm-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bl-inm-drawer-title"
        inert={!drawerOpen}
        style={{
          ...S.drawer,
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <span id="bl-inm-drawer-title" translate="no" style={S.drawerLogo}>
            {store.name}
            <span style={{ color: INM.navy }}>.</span>
          </span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
            className="bl-inm-btn-outline"
            style={S.drawerClose}
          >
            <X style={{ width: 16, height: 16 }} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <ul style={S.drawerList}>
          {[
            { href: "#destacados", label: "Propiedades" },
            { href: "#destacados", label: "En preventa" },
            { href: "#sobre-mi", label: "Sobre mí" },
            { href: "#contacto", label: "Contacto" },
          ].map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className="bl-inm-drawerlink"
                style={S.drawerLink}
              >
                {item.label}
                <ArrowRight
                  className="bl-inm-drawer-arrow"
                  style={{ width: 16, height: 16 }}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
        <div style={S.drawerFooter}>
          <p style={S.drawerFooterKicker}>¿Buscas algo puntual?</p>
          {waMain && (
            <a
              href={waMain}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setDrawerOpen(false)}
              className="bl-inm-btn-dark"
              style={S.drawerWaBtn}
            >
              <MessageCircle style={{ width: 14, height: 14 }} aria-hidden="true" />
              Escribir por WhatsApp
            </a>
          )}
        </div>
      </aside>

      {/* Barra flotante de guardadas — trigger del drawer "Propiedades de interés" */}
      {onOpenCart && cartCount > 0 && (
        <div style={S.savedBarWrap}>
          <button
            type="button"
            onClick={onOpenCart}
            className="bl-inm-btn-dark"
            style={S.savedBar}
            aria-label={`Ver propiedades guardadas — ${cartCount}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Bookmark style={{ width: 16, height: 16 }} aria-hidden="true" />
              <span style={S.savedBadge}>{cartCount}</span>
            </span>
            <span>Ver propiedades guardadas</span>
            <ArrowRight style={{ width: 16, height: 16 }} aria-hidden="true" />
          </button>
        </div>
      )}
    </main>
  )
}

/** Featured peek: <a> real en tienda, botón en previews (contrato productHref). */
function PeekLink({
  product,
  href,
  onOpen,
  children,
}: {
  product: TemplateProduct
  href: string | null
  onOpen: (p: TemplateProduct) => void
  children: ReactNode
}) {
  if (href) {
    return (
      <a href={href} className="bl-inm-peek" style={S.peek}>
        {children}
      </a>
    )
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onOpen(product)
      }}
      className="bl-inm-peek"
      aria-label={`Ver ${product.name}`}
      style={{ ...S.peek, border: "none", font: "inherit", textAlign: "left", width: "100%" }}
    >
      {children}
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
  // ── Banner de estado ──
  banner: {
    position: "sticky", top: 0, zIndex: 60,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    minHeight: 42,
    background: INM.ink, color: "#ffffff",
    fontSize: 12, lineHeight: 1.35, letterSpacing: ".005em",
    padding: "10px 14px",
    paddingTop: "max(10px, env(safe-area-inset-top))",
    paddingLeft: "max(14px, env(safe-area-inset-left))",
    paddingRight: "max(14px, env(safe-area-inset-right))",
  },
  bannerDot: {
    width: 7, height: 7, borderRadius: 999, flexShrink: 0,
    background: INM.dotGreen,
    boxShadow: `0 0 0 3px ${INM.dotHalo}`,
  },
  bannerLink: {
    color: "#ffffff", fontWeight: 500, whiteSpace: "nowrap",
    textDecoration: "underline", textUnderlineOffset: 3,
  },
  // ── Page frame ──
  frame: {
    position: "relative", zIndex: 0,
    background: INM.paper,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    minHeight: "calc(100dvh - 42px)",
    overflow: "clip",
  },
  // ── Nav ──
  nav: {
    position: "sticky", top: 42, zIndex: 50,
    background: paper(92),
    backdropFilter: "saturate(140%) blur(14px)",
    WebkitBackdropFilter: "saturate(140%) blur(14px)",
    borderBottom: `1px solid ${INM.border}`,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingLeft: "max(16px, env(safe-area-inset-left))",
    paddingRight: "max(16px, env(safe-area-inset-right))",
  },
  navInner: {
    maxWidth: 1280, margin: "0 auto",
    display: "flex", alignItems: "center", gap: 16,
    padding: "14px 0",
  },
  logo: {
    display: "flex", alignItems: "baseline", gap: 1,
    color: INM.text, textDecoration: "none",
    fontWeight: 700, fontSize: 19, letterSpacing: "-.02em",
    minWidth: 0, flex: 1,
    fontFamily: INM.heading,
  },
  logoText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  navLinks: { alignItems: "center", gap: 24, fontSize: 13, fontWeight: 500, color: INM.body },
  navLink: { color: "inherit", textDecoration: "none" },
  navPill: {
    color: INM.text, textDecoration: "none",
    background: INM.surface, padding: "7px 12px", borderRadius: 4,
  },
  navRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  navCta: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "8px 14px", borderRadius: 999,
    background: INM.ink, color: INM.paper,
    textDecoration: "none", fontSize: 13, fontWeight: 500,
  },
  menuBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "8px 13px", borderRadius: 999,
    border: `1px solid ${INM.border}`, background: "transparent",
    color: INM.text, fontSize: 13, fontWeight: 500,
    fontFamily: "inherit", cursor: "pointer",
  },
  // ── Hero ──
  hero: {
    position: "relative", isolation: "isolate", overflow: "hidden",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    color: "#ffffff", textAlign: "center",
    padding: "56px 16px 112px",
    minHeight: "clamp(520px, 78dvh, 780px)",
  },
  heroBg: { position: "absolute", inset: 0, zIndex: -2, background: "#1a1a1a", overflow: "hidden" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  heroKicker: {
    display: "inline-flex", alignItems: "center", gap: 10,
    margin: "0 0 22px", opacity: 0.9,
    fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".22em",
  },
  kickerLine: { width: 22, height: 1, background: "rgba(255,255,255,.5)" },
  heroTitle: {
    margin: 0, maxWidth: 980,
    fontFamily: INM.heading,
    fontSize: "clamp(36px, 7cqw, 82px)",
    fontWeight: 600, lineHeight: 1.04, letterSpacing: "-.02em",
    textWrap: "balance",
  },
  heroDesc: {
    margin: "20px 0 0", maxWidth: 540,
    fontSize: 14, lineHeight: 1.6, opacity: 0.85,
    textWrap: "pretty",
  },
  searchPill: {
    marginTop: 34, width: "100%", maxWidth: 680,
    display: "flex", alignItems: "center", gap: 8,
    background: "#ffffff", borderRadius: 999,
    padding: "6px 6px 6px 20px",
    boxShadow: "0 18px 40px -16px rgba(0,0,0,.35)",
  },
  searchInput: {
    flex: 1, minWidth: 0,
    background: "transparent", border: 0, outline: 0,
    fontSize: 14, color: "#0a0a0a", padding: "12px 0",
    fontFamily: "inherit",
  },
  searchBtn: {
    width: 44, height: 44, borderRadius: 999, border: "none", flexShrink: 0,
    display: "grid", placeItems: "center",
    background: INM.navy, color: "#ffffff", cursor: "pointer",
  },
  chips: { marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  chip: {
    padding: "7px 14px", borderRadius: 999,
    border: "1px solid rgba(255,255,255,.35)",
    background: "rgba(255,255,255,.1)",
    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    color: "#ffffff", fontSize: 12, fontWeight: 500,
    fontFamily: "inherit", cursor: "pointer",
  },
  // ── Featured peek ──
  peekWrap: {
    position: "relative", zIndex: 5,
    margin: "-80px auto 0", maxWidth: 1280,
    padding: "0 16px",
  },
  peek: {
    display: "flex", alignItems: "center", gap: 14,
    maxWidth: 440,
    background: INM.paper, color: INM.text, textDecoration: "none",
    borderRadius: 8, padding: 14, cursor: "pointer",
    boxShadow: "0 30px 70px -20px rgba(0,0,0,.3)",
  },
  peekImg: {
    width: 90, height: 90, borderRadius: 4, overflow: "hidden",
    background: INM.imgPh, flexShrink: 0,
  },
  peekLabel: {
    display: "inline-block", marginBottom: 6,
    fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase",
    color: INM.gold,
  },
  peekTitle: {
    margin: "0 0 4px",
    fontSize: 15, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-.01em",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    fontFamily: INM.heading,
  },
  peekCat: {
    margin: "0 0 8px", fontSize: 12, color: INM.muted,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  peekPrice: { fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: INM.text },
  // ── Grid ──
  gridSection: {
    margin: "64px auto 0", maxWidth: 1280, padding: "0 16px",
    scrollMarginTop: 90,
  },
  gridHead: {
    display: "flex", flexDirection: "column", gap: 16,
    borderBottom: `1px solid ${INM.border}`, paddingBottom: 24, marginBottom: 32,
  },
  gridKicker: {
    margin: "0 0 10px",
    fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".22em",
    color: INM.muted,
  },
  gridTitle: {
    margin: 0,
    fontFamily: INM.heading,
    fontSize: "clamp(28px, 4cqw, 44px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.02em",
    textWrap: "balance",
  },
  opPills: { display: "flex", gap: 4, overflowX: "auto" },
  opPill: {
    flexShrink: 0, padding: "8px 16px", borderRadius: 999,
    borderWidth: 1, borderStyle: "solid",
    fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
  },
  empty: { padding: "48px 0", textAlign: "center", fontSize: 14, color: INM.muted },
  grid: {
    listStyle: "none", margin: 0, padding: 0,
    display: "grid", gridTemplateColumns: "1fr", gap: 24,
  },
  // ── Sobre mí ──
  about: {
    margin: "80px auto 0", maxWidth: 1280, padding: "0 16px",
    display: "grid", gridTemplateColumns: "1fr", gap: 40, alignItems: "center",
    scrollMarginTop: 90,
  },
  aboutImg: {
    aspectRatio: "4 / 5", borderRadius: 6, overflow: "hidden",
    background: INM.imgPh, maxWidth: 400, margin: "0 auto", width: "100%",
  },
  aboutKicker: {
    margin: "0 0 16px",
    fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".22em",
    color: INM.muted,
  },
  aboutTitle: {
    margin: "0 0 24px",
    fontFamily: INM.heading,
    fontSize: "clamp(28px, 4cqw, 48px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.02em",
    textWrap: "balance",
  },
  aboutBody: { margin: "0 0 14px", fontSize: 15, lineHeight: 1.7, color: INM.body, textWrap: "pretty" },
  stats: {
    display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 20,
    marginTop: 36, borderTop: `1px solid ${INM.border}`, paddingTop: 28,
  },
  statValue: {
    display: "block", marginBottom: 6,
    fontSize: "clamp(22px, 2.5cqw, 28px)", fontWeight: 600, lineHeight: 1,
    letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums",
    fontFamily: INM.heading,
  },
  statLabel: {
    fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".16em",
    color: INM.muted,
  },
  // ── CTA grande ──
  bigCta: {
    marginTop: 80, padding: "clamp(80px, 10cqw, 100px) 16px",
    background: INM.surface, textAlign: "center",
  },
  bigCtaKicker: {
    margin: "0 0 18px",
    fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".22em",
    color: INM.muted,
  },
  bigCtaTitle: {
    margin: "0 auto 22px", maxWidth: 820,
    fontFamily: INM.heading,
    fontSize: "clamp(30px, 5.5cqw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.02em",
    textWrap: "balance",
  },
  bigCtaBody: {
    margin: "0 auto 32px", maxWidth: 540,
    fontSize: 15, lineHeight: 1.6, color: INM.body, textWrap: "pretty",
  },
  bigCtaBtn: {
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "16px 28px", borderRadius: 999,
    background: INM.ink, color: INM.paper,
    textDecoration: "none", fontSize: 14, fontWeight: 500,
  },
  // ── Footer ──
  footer: {
    background: INM.ink,
    color: "rgba(255,255,255,.75)",
    padding: "70px 16px 32px",
  },
  footerGrid: {
    maxWidth: 1280, margin: "0 auto 48px",
    display: "grid", gridTemplateColumns: "1fr", gap: 36,
  },
  footerLogo: {
    color: "#ffffff", fontSize: 22, fontWeight: 700, letterSpacing: "-.02em",
    marginBottom: 16, fontFamily: INM.heading,
  },
  footerBio: { margin: "0 0 20px", maxWidth: 320, fontSize: 13, lineHeight: 1.7, textWrap: "pretty" },
  footerContact: {
    display: "inline-flex", alignItems: "center", gap: 10,
    color: "rgba(255,255,255,.85)", textDecoration: "none",
  },
  footerContactIcon: { width: 14, height: 14, opacity: 0.7, flexShrink: 0 },
  footerColTitle: {
    margin: "0 0 16px", color: "#ffffff",
    fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".18em",
  },
  footerList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 },
  footerBtn: {
    background: "transparent", border: 0, padding: 0, cursor: "pointer",
    color: "rgba(255,255,255,.7)", fontSize: 13, textAlign: "left", fontFamily: "inherit",
  },
  footerBottom: {
    maxWidth: 1280, margin: "0 auto",
    borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 24,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
    fontSize: 12, color: "rgba(255,255,255,.5)",
  },
  footerIcon: {
    width: 34, height: 34, borderRadius: 999,
    border: "1px solid rgba(255,255,255,.2)",
    display: "grid", placeItems: "center", color: "#ffffff",
  },
  // ── Drawer de menú ──
  backdrop: {
    position: "fixed", inset: 0, zIndex: 90,
    background: "rgba(0,0,0,.5)",
    backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
    transition: "opacity .25s ease",
  },
  drawer: {
    position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 100,
    width: "min(420px, 92vw)",
    display: "flex", flexDirection: "column",
    overflowY: "auto", overscrollBehavior: "contain",
    background: INM.paper, color: INM.text,
    boxShadow: "-20px 0 50px -20px rgba(0,0,0,.3)",
    transition: "transform .35s cubic-bezier(.2,.7,.3,1)",
    paddingTop: "max(20px, env(safe-area-inset-top))",
    paddingRight: "max(28px, env(safe-area-inset-right))",
    paddingBottom: "max(28px, env(safe-area-inset-bottom))",
    paddingLeft: 28,
  },
  drawerLogo: { fontWeight: 700, fontSize: 18, letterSpacing: "-.02em", fontFamily: INM.heading },
  drawerClose: {
    width: 38, height: 38, borderRadius: 999,
    border: `1px solid ${INM.border}`, background: "transparent",
    display: "grid", placeItems: "center", color: INM.text, cursor: "pointer",
    padding: 0,
  },
  drawerList: { listStyle: "none", margin: "0 0 36px", padding: 0, display: "flex", flexDirection: "column", gap: 4 },
  drawerLink: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 0",
    color: INM.text, textDecoration: "none",
    fontSize: 22, fontWeight: 500, letterSpacing: "-.01em",
    borderBottom: `1px solid ${INM.border}`,
    transition: "color .2s ease",
  },
  drawerFooter: { marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${INM.border}` },
  drawerFooterKicker: {
    margin: "0 0 14px",
    fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".18em",
    color: INM.muted,
  },
  drawerWaBtn: {
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "14px 20px", borderRadius: 999,
    background: INM.ink, color: INM.paper,
    textDecoration: "none", fontSize: 14, fontWeight: 500,
  },
  // ── Barra flotante de guardadas ──
  savedBarWrap: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
    padding: 16,
    paddingBottom: "max(16px, env(safe-area-inset-bottom))",
    background: paper(95),
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    borderTop: `1px solid ${INM.border}`,
  },
  savedBar: {
    width: "100%", maxWidth: 720, margin: "0 auto", height: 48,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", borderRadius: 999, border: "none",
    background: INM.ink, color: INM.paper,
    fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
  },
  savedBadge: {
    background: "#ffffff", color: "#0a0a0a",
    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
    fontVariantNumeric: "tabular-nums",
  },
}
