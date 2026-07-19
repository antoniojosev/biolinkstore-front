"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import {
  Bath,
  Bed,
  Bookmark,
  Car,
  Check,
  Grid3x3,
  MapPin,
  MessageCircle,
  Phone,
  Square,
  X,
} from "lucide-react"
import type { ThemeProductSheetProps } from "../registry"
import { colorImagesForSelection } from "@/components/storefront-v2/template/template-renderer"
import type { TemplateProduct, TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import {
  INM,
  INM_STYLES,
  buildWaHref,
  isRental,
  makeFmt,
  operationLabel,
  paper,
  parkingOf,
  refOf,
  specsOf,
  tagsOf,
  waInquiryMessage,
} from "./shared"

/**
 * InmueblesProductSheet — detalle PROPIO del tema (spec §4). Takeover
 * full-screen fiel a la página legacy + HTML aprobado: banner de estado,
 * page frame, breadcrumb, galería 1.5fr/1fr con thumbs (+N overlay), strip
 * de specs 4-col (Bed/Bath/Square/Car), descripción por párrafos,
 * características con check navy, aside sticky (precio, CTAs, Referencia =
 * id.slice(0,10).toUpperCase(), agent card) y sticky CTA móvil. El toggle
 * Guardar alimenta el "carrito" de guardadas (drawer Propiedades de interés).
 * El mensaje de WhatsApp sigue el contrato de copy del HTML (incluye Ref).
 */
export function InmueblesProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  if (!product) return null
  return <InmueblesDetail key={product.id} product={product} store={store} onClose={onClose} />
}

function InmueblesDetail({
  product,
  store,
  onClose,
}: {
  product: TemplateProduct
  store: TemplateStore
  onClose: () => void
}) {
  const cart = useCartOptional()
  const fmt = useMemo(() => makeFmt(store.currency), [store.currency])
  const currency = store.currency ?? "USD"

  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Fotos por color: cableado defensivo (inmobiliaria no maneja color →
  // colorImgs null → galería base).
  const baseImages = product.images?.length ? product.images : [product.image ?? "/placeholder.svg"]
  const colorImgs = colorImagesForSelection(product, {})
  const images = colorImgs ?? baseImages
  const mainImage = images[selectedImage] ?? images[0]

  useEffect(() => {
    setSelectedImage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorImgs?.join("|")])
  const thumbs = images.slice(0, 4)
  const extraImagesCount = images.length - thumbs.length

  const specs = specsOf(product)
  const tagList = tagsOf(product)
  const hab = specs["Habitaciones"] ?? specs["Hab"]
  const bath = specs["Baños"] ?? specs["Banos"]
  const m2 = specs["m²"] ?? specs["m2"]
  const parking = parkingOf(specs)
  const rental = isRental(product)
  const opLabel = operationLabel(product)
  const available = product.stock == null || product.stock > 0

  const priceLabel = fmt(product.price)
  const waPhone = store.whatsappNumber
  const waVisit = buildWaHref(waPhone, waInquiryMessage(store.name, product, priceLabel, currency))
  const telHref = waPhone ? `tel:${waPhone.replace(/\s+/g, "")}` : null

  const isSaved = cart?.items.some((i) => i.productId === product.id) ?? false
  const totalSaved = cart?.totalItems ?? 0

  const toggleSave = () => {
    if (!cart) return
    if (isSaved) {
      const cartItem = cart.items.find((i) => i.productId === product.id)
      if (cartItem) cart.removeItem(cartItem.id)
    } else {
      cart.addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
      })
    }
  }

  // Sin teléfono no hay checkout directo acá (el provider vive en el cart
  // sheet): se guarda la propiedad y se abre el drawer de consulta agrupada.
  const inquiryFallback = () => {
    if (!cart) return
    if (!isSaved) toggleSave()
    cart.setIsOpen(true)
  }

  const specStrip: Array<{ icon: typeof Bed; value: string; label: string }> = []
  if (hab) specStrip.push({ icon: Bed, value: hab, label: "Habitaciones" })
  if (bath) specStrip.push({ icon: Bath, value: bath, label: "Baños" })
  if (m2) specStrip.push({ icon: Square, value: `${m2} m²`, label: "Construcción" })
  if (parking) specStrip.push({ icon: Car, value: parking, label: "Estacionamientos" })

  return (
    <div
      className="bl-inm-sheet"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      style={S.overlay}
    >
      <style dangerouslySetInnerHTML={{ __html: INM_STYLES }} />

      {/* Banner de estado */}
      <div role="region" aria-label="Disponibilidad" style={S.banner}>
        <span aria-hidden="true" style={S.bannerDot} />
        <span className="bl-inm-banner-long">
          Disponible esta semana · respondo en menos de 1&nbsp;h por&nbsp;
        </span>
        <span className="bl-inm-banner-short">Online ahora ·&nbsp;</span>
        {waVisit ? (
          <a href={waVisit} target="_blank" rel="noopener noreferrer" style={S.bannerLink}>
            WhatsApp
          </a>
        ) : (
          <span style={S.bannerLink}>WhatsApp</span>
        )}
      </div>

      {/* Page frame */}
      <div style={S.frame}>
        {/* Nav — logo vuelve al listado; X cierra el detalle */}
        <nav aria-label="Principal" style={S.nav}>
          <div style={S.navInner}>
            <button
              type="button"
              onClick={onClose}
              translate="no"
              aria-label={`${store.name} — volver al inicio`}
              style={S.logoBtn}
            >
              <span style={S.logoText}>{store.name}</span>
              <span style={{ color: INM.navy, flexShrink: 0 }}>.</span>
            </button>
            <div style={S.navRight}>
              {waVisit && (
                <a
                  href={waVisit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bl-inm-btn-dark"
                  aria-label={`Escribir por WhatsApp sobre ${product.name}`}
                  style={S.navCta}
                >
                  <MessageCircle style={{ width: 14, height: 14 }} aria-hidden="true" />
                  <span className="bl-inm-sm">Escribir</span>
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar detalle"
                className="bl-inm-btn-outline"
                style={S.closeBtn}
              >
                <X style={{ width: 16, height: 16 }} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>

        <div style={S.content}>
          {/* Breadcrumb */}
          <nav aria-label="Migas de pan" style={S.breadcrumb}>
            <ol style={S.breadcrumbList}>
              <li>
                <button type="button" onClick={onClose} style={S.crumbBtn}>
                  Inicio
                </button>
                <span style={S.crumbSep}>/</span>
              </li>
              <li>
                <button type="button" onClick={onClose} style={S.crumbBtn}>
                  Propiedades
                </button>
                <span style={S.crumbSep}>/</span>
              </li>
              <li aria-current="page" style={{ color: INM.text, fontWeight: 500 }}>
                {product.name}
              </li>
            </ol>
          </nav>

          {/* Galería 1.5fr/1fr */}
          <section aria-label="Galería de la propiedad" className="bl-inm-pd-gallery" style={S.gallery}>
            <button
              type="button"
              onClick={() => setSelectedImage(0)}
              className="bl-inm-pd-main"
              style={S.galleryMain}
              aria-label="Ver imagen principal"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainImage} alt={product.name} fetchPriority="high" style={S.galleryImg} />
              {images.length > 1 && (
                <span style={S.photosPill}>
                  <Grid3x3 style={{ width: 12, height: 12 }} aria-hidden="true" />
                  Ver las {images.length} fotos
                </span>
              )}
            </button>
            {thumbs.length > 1 && (
              <div className="bl-inm-pd-thumbs bl-inm-scroll-x" style={S.thumbs}>
                {thumbs.map((img, idx) => {
                  const isActive = selectedImage === idx
                  return (
                    <button
                      key={img + idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={`Ver imagen ${idx + 1}${isActive ? " (seleccionada)" : ""}`}
                      className={`bl-inm-thumb bl-inm-pd-thumb${isActive ? " is-active" : ""}`}
                      style={{
                        ...S.thumb,
                        ...(isActive
                          ? { outline: `2px solid ${INM.navy}`, outlineOffset: 2, opacity: 1 }
                          : { opacity: 0.75 }),
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" loading="lazy" style={S.galleryImg} />
                      {idx === thumbs.length - 1 && extraImagesCount > 0 && (
                        <span style={S.extraOverlay}>+{extraImagesCount}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Listing */}
          <article className="bl-inm-pd-listing" style={S.listing}>
            <div>
              <header>
                {product.featured && <span style={S.featuredBadge}>Destacada</span>}
                <h1 style={S.title}>{product.name}</h1>
                {product.category && (
                  <p style={S.location}>
                    <MapPin style={{ width: 14, height: 14, opacity: 0.7 }} strokeWidth={1.6} aria-hidden="true" />
                    {product.category}
                  </p>
                )}

                {specStrip.length > 0 && (
                  <ul className="bl-inm-pd-specs" style={S.specStrip}>
                    {specStrip.map(({ icon: Icon, value, label }) => (
                      <li key={label} style={S.specCell}>
                        <Icon style={S.specIcon} strokeWidth={1.6} aria-hidden="true" />
                        <strong style={S.specValue}>{value}</strong>
                        <span style={S.specLabel}>{label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </header>

              {product.description && (
                <section aria-labelledby="bl-inm-desc-h" style={{ marginBottom: 48 }}>
                  <h2 id="bl-inm-desc-h" style={S.sectionLabel}>
                    Descripción
                  </h2>
                  {product.description.split(/\n{2,}/).map((para, i) => (
                    <p key={i} style={S.descPara}>
                      {para}
                    </p>
                  ))}
                </section>
              )}

              {tagList.length > 0 && (
                <section aria-labelledby="bl-inm-feat-h" style={{ marginBottom: 48 }}>
                  <h2 id="bl-inm-feat-h" style={S.sectionLabel}>
                    Características
                  </h2>
                  <ul className="bl-inm-tags-grid" style={S.tagsGrid}>
                    {tagList.map((t) => (
                      <li key={t} style={S.tagItem}>
                        <Check
                          style={{ width: 16, height: 16, color: INM.navy, flexShrink: 0 }}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Aside sticky */}
            <aside aria-label="Precio y contacto" className="bl-inm-pd-aside" style={S.aside}>
              <div style={S.priceCard}>
                <p style={S.priceKicker}>Precio {rental ? "de alquiler" : "de venta"}</p>
                <p style={S.priceValue}>
                  {priceLabel}
                  {rental && <span style={S.priceSuffix}> /mes</span>}
                </p>
                <p style={S.priceSub}>
                  {currency} · {opLabel}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {waVisit ? (
                    <a
                      href={waVisit}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bl-inm-btn-dark"
                      style={S.ctaPrimary}
                    >
                      <MessageCircle style={{ width: 16, height: 16 }} aria-hidden="true" />
                      Contactar por WhatsApp
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={inquiryFallback}
                      disabled={!cart}
                      className="bl-inm-btn-dark"
                      style={{ ...S.ctaPrimary, cursor: "pointer" }}
                    >
                      <MessageCircle style={{ width: 16, height: 16 }} aria-hidden="true" />
                      Consultar disponibilidad
                    </button>
                  )}
                  {telHref && (
                    <a href={telHref} className="bl-inm-btn-outline" style={S.ctaOutline}>
                      <Phone style={{ width: 16, height: 16 }} strokeWidth={1.8} aria-hidden="true" />
                      Llamar por teléfono
                    </a>
                  )}
                  {cart && (
                    <button
                      type="button"
                      onClick={toggleSave}
                      aria-pressed={isSaved}
                      className={isSaved ? undefined : "bl-inm-oppill"}
                      style={{
                        ...S.ctaSave,
                        ...(isSaved
                          ? { background: INM.navy, color: "#ffffff", borderColor: INM.navy }
                          : { background: "transparent", color: INM.body, borderColor: INM.border }),
                      }}
                    >
                      <Bookmark
                        style={{ width: 16, height: 16 }}
                        fill={isSaved ? "currentColor" : "none"}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      {isSaved ? "Guardada" : "Guardar"}
                    </button>
                  )}
                </div>

                {/* Info 2×2: Referencia · Estado · Operación · Zona */}
                <div style={S.infoGrid}>
                  <div>
                    <span style={S.infoLabel}>Referencia</span>
                    <strong style={{ ...S.infoValue, fontVariantNumeric: "tabular-nums" }}>
                      {refOf(product)}
                    </strong>
                  </div>
                  <div>
                    <span style={S.infoLabel}>Estado</span>
                    <strong style={S.infoValue}>{available ? "Disponible" : "No disponible"}</strong>
                  </div>
                  <div>
                    <span style={S.infoLabel}>Operación</span>
                    <strong style={S.infoValue}>{opLabel}</strong>
                  </div>
                  {product.category && (
                    <div>
                      <span style={S.infoLabel}>Zona</span>
                      <strong
                        style={{
                          ...S.infoValue,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.category}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent card */}
              <div style={S.agentCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={store.avatar ?? "/placeholder.svg"}
                  alt={store.name}
                  width={56}
                  height={56}
                  loading="lazy"
                  style={S.agentAvatar}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={S.agentLabel}>Asesor</p>
                  <strong translate="no" style={S.agentName}>
                    {store.name}
                  </strong>
                  <small style={S.agentSub}>Responde en menos de 1&nbsp;h</small>
                </div>
              </div>
            </aside>
          </article>
        </div>
      </div>

      {/* Sticky CTA móvil (🔶 pd-sticky del HTML: única fila de acción) */}
      <div role="region" aria-label="Acciones rápidas" className="bl-inm-pd-sticky" style={S.stickyCta}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={S.stickyPrice}>
            {priceLabel}
            {rental && <span style={S.priceSuffix}> /mes</span>}
          </strong>
          <span style={S.stickySub}>
            {currency} · {opLabel}
          </span>
        </div>
        {waVisit ? (
          <a
            href={waVisit}
            target="_blank"
            rel="noopener noreferrer"
            className="bl-inm-btn-dark"
            style={S.stickyBtn}
          >
            <MessageCircle style={{ width: 16, height: 16 }} aria-hidden="true" />
            Contactar
          </a>
        ) : (
          <button
            type="button"
            onClick={inquiryFallback}
            disabled={!cart}
            className="bl-inm-btn-dark"
            style={S.stickyBtn}
          >
            <MessageCircle style={{ width: 16, height: 16 }} aria-hidden="true" />
            Consultar
          </button>
        )}
      </div>

      {/* Botón flotante desktop — guardadas */}
      {cart && totalSaved > 0 && (
        <button
          type="button"
          onClick={() => cart.setIsOpen(true)}
          className="bl-inm-pd-savedbtn bl-inm-btn-dark"
          style={S.savedBtn}
        >
          <Bookmark style={{ width: 16, height: 16 }} aria-hidden="true" />
          <span style={S.savedBadge}>{totalSaved}</span>
          Guardadas
        </button>
      )}
    </div>
  )
}

const S: Record<string, CSSProperties> = {
  // z 400: mismo plano que los sheets genéricos; el cart drawer va después
  // en el DOM del host y queda arriba.
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 400,
    overflowY: "auto",
    overscrollBehavior: "contain",
    background: INM.ink,
    color: INM.text,
    fontFamily: INM.bodyFont,
    containerType: "inline-size",
    containerName: "bl-inm-sheet",
  },
  banner: {
    position: "sticky", top: 0, zIndex: 60,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    minHeight: 42,
    background: INM.ink, color: "#ffffff",
    fontSize: 12, lineHeight: 1.35, letterSpacing: ".005em",
    padding: "10px 14px",
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
  frame: {
    position: "relative", zIndex: 0,
    background: INM.paper,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    minHeight: "calc(100dvh - 42px)",
  },
  nav: {
    position: "sticky", top: 42, zIndex: 50,
    background: paper(92),
    backdropFilter: "saturate(140%) blur(14px)",
    WebkitBackdropFilter: "saturate(140%) blur(14px)",
    borderBottom: `1px solid ${INM.border}`,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    padding: "0 16px",
  },
  navInner: {
    maxWidth: 1280, margin: "0 auto",
    display: "flex", alignItems: "center", gap: 16,
    padding: "14px 0",
  },
  logoBtn: {
    display: "flex", alignItems: "baseline", gap: 1,
    background: "none", border: "none", padding: 0, cursor: "pointer",
    color: INM.text,
    fontWeight: 700, fontSize: 19, letterSpacing: "-.02em",
    minWidth: 0, flex: 1, textAlign: "left",
    fontFamily: INM.heading,
  },
  logoText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  navRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  navCta: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "8px 14px", borderRadius: 999,
    background: INM.ink, color: INM.paper,
    textDecoration: "none", fontSize: 13, fontWeight: 500,
  },
  closeBtn: {
    width: 38, height: 38, borderRadius: 999,
    border: `1px solid ${INM.border}`, background: "transparent",
    display: "grid", placeItems: "center", color: INM.text, cursor: "pointer",
    padding: 0,
  },
  content: { paddingBottom: 112 },
  breadcrumb: { maxWidth: 1280, margin: "0 auto", padding: "16px 16px 0", fontSize: 12, color: INM.muted },
  breadcrumbList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  crumbBtn: {
    background: "none", border: "none", padding: 0, cursor: "pointer",
    color: INM.muted, fontSize: 12, fontFamily: "inherit",
  },
  crumbSep: { marginLeft: 8, opacity: 0.5 },
  gallery: {
    maxWidth: 1280, margin: "18px auto 0", padding: "0 16px",
    display: "grid", gap: 8,
  },
  galleryMain: {
    position: "relative", borderRadius: 6, overflow: "hidden",
    background: INM.imgPh, border: "none", padding: 0, cursor: "pointer",
    height: 280, width: "100%", display: "block",
  },
  galleryImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  photosPill: {
    position: "absolute", right: 16, bottom: 16,
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,.95)", color: "#0a0a0a",
    padding: "8px 16px", borderRadius: 999,
    fontSize: 12, fontWeight: 500,
    boxShadow: "0 6px 18px -8px rgba(0,0,0,.4)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
  },
  thumbs: {
    display: "flex", gap: 8, overflowX: "auto",
    scrollSnapType: "x mandatory", paddingBottom: 4,
  },
  thumb: {
    position: "relative", borderRadius: 6, overflow: "hidden",
    background: INM.imgPh, border: "none", padding: 0, cursor: "pointer",
    width: 140, height: 90, flexShrink: 0, scrollSnapAlign: "start",
  },
  extraOverlay: {
    position: "absolute", inset: 0,
    display: "grid", placeItems: "center",
    background: "rgba(0,0,0,.55)", color: "#ffffff",
    fontSize: 12, fontWeight: 600,
  },
  listing: {
    maxWidth: 1280, margin: "0 auto", padding: "36px 16px 50px",
    display: "grid", gridTemplateColumns: "1fr", gap: 32, alignItems: "start",
  },
  featuredBadge: {
    display: "inline-block", marginBottom: 16,
    fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase",
    color: INM.navy, background: INM.surface,
    padding: "6px 10px", borderRadius: 3,
  },
  title: {
    margin: "0 0 12px",
    fontFamily: INM.heading,
    fontSize: "clamp(28px, 4.4cqw, 48px)", fontWeight: 600,
    lineHeight: 1.05, letterSpacing: "-.02em",
    textWrap: "balance",
  },
  location: {
    display: "flex", alignItems: "center", gap: 6,
    margin: "0 0 28px", fontSize: 14, color: INM.body,
  },
  specStrip: {
    listStyle: "none", margin: "0 0 36px", padding: "20px 0",
    display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20,
    borderTop: `1px solid ${INM.border}`, borderBottom: `1px solid ${INM.border}`,
  },
  specCell: { display: "flex", flexDirection: "column", gap: 4 },
  specIcon: { width: 18, height: 18, opacity: 0.55, marginBottom: 6 },
  specValue: {
    fontSize: 18, fontWeight: 600,
    fontVariantNumeric: "tabular-nums", letterSpacing: "-.01em",
  },
  specLabel: { fontSize: 11, color: INM.muted, textTransform: "uppercase", letterSpacing: ".12em" },
  sectionLabel: {
    margin: "0 0 20px", paddingBottom: 14,
    borderBottom: `1px solid ${INM.border}`,
    fontSize: 18, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".14em",
    color: INM.muted, fontFamily: INM.heading,
  },
  descPara: {
    margin: "0 0 14px", maxWidth: "64ch",
    fontSize: 15, lineHeight: 1.75, color: INM.inkSoft, textWrap: "pretty",
  },
  tagsGrid: {
    listStyle: "none", margin: 0, padding: 0,
    display: "grid", gridTemplateColumns: "1fr", columnGap: 28, rowGap: 0,
  },
  tagItem: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 0", fontSize: 14, color: INM.text,
    borderBottom: `1px dashed ${INM.border}`,
  },
  aside: { display: "flex", flexDirection: "column", gap: 16 },
  priceCard: {
    background: INM.paper,
    border: `1px solid ${INM.border}`, borderRadius: 12,
    padding: 24,
    boxShadow: "0 8px 30px -20px rgba(0,0,0,.25)",
  },
  priceKicker: {
    margin: "0 0 8px",
    fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".18em",
    color: INM.muted,
  },
  priceValue: {
    margin: "0 0 4px",
    fontSize: "clamp(28px, 4.4cqw, 40px)", fontWeight: 600,
    lineHeight: 1, letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums",
    fontFamily: INM.heading,
  },
  priceSuffix: { fontSize: 14, fontWeight: 500, color: INM.muted },
  priceSub: { margin: "0 0 24px", fontSize: 12, color: INM.muted },
  ctaPrimary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "14px 20px", borderRadius: 999, border: "1px solid transparent",
    background: INM.ink, color: INM.paper,
    textDecoration: "none", fontSize: 14, fontWeight: 500,
    fontFamily: "inherit",
  },
  ctaOutline: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "14px 20px", borderRadius: 999,
    border: `1px solid ${INM.border}`, background: "transparent",
    color: INM.text, textDecoration: "none", fontSize: 14, fontWeight: 500,
    fontFamily: "inherit", cursor: "pointer",
  },
  ctaSave: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "12px 20px", borderRadius: 999,
    borderWidth: 1, borderStyle: "solid",
    fontSize: 14, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
    transition: "background-color .2s ease, color .2s ease, border-color .2s ease",
  },
  infoGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
    marginTop: 24, paddingTop: 24, borderTop: `1px solid ${INM.border}`,
  },
  infoLabel: {
    display: "block", marginBottom: 4,
    fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em",
    color: INM.muted,
  },
  infoValue: { display: "block", fontSize: 14, fontWeight: 600, color: INM.text },
  agentCard: {
    display: "flex", alignItems: "center", gap: 14,
    background: INM.paper,
    border: `1px solid ${INM.border}`, borderRadius: 12,
    padding: 16,
  },
  agentAvatar: {
    width: 56, height: 56, borderRadius: 999, objectFit: "cover",
    background: INM.imgPh, flexShrink: 0,
  },
  agentLabel: {
    margin: 0, fontSize: 11, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: ".14em", color: INM.muted,
  },
  agentName: {
    display: "block", fontSize: 14, fontWeight: 600, letterSpacing: "-.01em",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  agentSub: { display: "block", fontSize: 12, color: INM.muted },
  stickyCta: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
    display: "flex", alignItems: "center", gap: 12,
    background: paper(95),
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    borderTop: `1px solid ${INM.border}`,
    boxShadow: "0 -20px 40px -20px rgba(0,0,0,.15)",
    padding: "12px 16px",
    paddingBottom: "max(12px, env(safe-area-inset-bottom))",
  },
  stickyPrice: {
    display: "block", fontSize: 15, fontWeight: 600,
    fontVariantNumeric: "tabular-nums", color: INM.text,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  stickySub: {
    display: "block", fontSize: 11, color: INM.muted,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  stickyBtn: {
    display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0,
    padding: "12px 18px", borderRadius: 999, border: "none",
    background: INM.ink, color: INM.paper,
    textDecoration: "none", fontSize: 14, fontWeight: 500,
    fontFamily: "inherit", cursor: "pointer",
  },
  savedBtn: {
    position: "fixed", right: 24, bottom: 24, zIndex: 40,
    alignItems: "center", gap: 8, height: 48,
    padding: "0 20px", borderRadius: 999, border: "none",
    background: INM.ink, color: INM.paper,
    fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
    boxShadow: "0 10px 24px -8px rgba(0,0,0,.4)",
  },
  savedBadge: {
    background: "#ffffff", color: "#0a0a0a",
    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
    fontVariantNumeric: "tabular-nums",
  },
}
