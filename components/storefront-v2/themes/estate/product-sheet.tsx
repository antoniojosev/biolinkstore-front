"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import {
  ArrowLeft,
  Bath,
  Bed,
  Bookmark,
  Building2,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageCircle,
  Ruler,
} from "lucide-react"
import type { ThemeProductSheetProps } from "../registry"
import type { TemplateProduct, TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import {
  ESTATE,
  ESTATE_STYLES,
  GRAY,
  RADIUS,
  gold,
  inStock,
  makeFmt,
  navy,
  specsOf,
  tagsOf,
  useEstateWhatsAppProvider,
  waNumberOf,
} from "./shared"

/**
 * EstateProductSheet — detalle PROPIO del tema (spec §4). Takeover
 * full-screen fiel a la página legacy: sticky nav (volver + guardar + badge
 * de guardadas), galería 3/2 con thumb strip de borde dorado, precio navy,
 * specs-grid 3-col (Bed/Bath/Ruler/Calendar/Car), tags, descripción
 * colapsable, agent card y sticky CTA verde WhatsApp de consulta directa
 * (trackEvent CHECKOUT_START + checkout de 1 ítem, quantity 1).
 */
export function EstateProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  if (!product) return null
  return <EstateDetail key={product.id} product={product} store={store} onClose={onClose} />
}

function EstateDetail({
  product,
  store,
  onClose,
}: {
  product: TemplateProduct
  store: TemplateStore
  onClose: () => void
}) {
  const cart = useCartOptional()
  const paymentProvider = useEstateWhatsAppProvider(store)
  const fmt = useMemo(() => makeFmt(store.currency), [store.currency])

  const [selectedImage, setSelectedImage] = useState(0)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [inquiryLoading, setInquiryLoading] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const images = product.images && product.images.length > 0 ? product.images : [product.image ?? "/placeholder.svg"]
  const image = images[0] ?? "/placeholder.svg"
  const stocked = inStock(product)
  const specs = specsOf(product)
  const tags = tagsOf(product)
  const totalItems = cart?.totalItems ?? 0
  const isSaved = cart?.items.some((i) => i.productId === product.id) ?? false
  const canInquiry = Boolean(waNumberOf(store))
  const avatar = store.avatar ?? "/placeholder.svg"

  const handleSave = () => {
    if (!cart) return
    if (isSaved) {
      const item = cart.items.find((i) => i.productId === product.id)
      if (item) cart.removeItem(item.id)
    } else {
      cart.addItem({ id: product.id, productId: product.id, name: product.name, price: product.price, image })
    }
  }

  // Consulta directa por ESTA propiedad (spec §4.4) — checkout de 1 ítem.
  const handleDirectInquiry = async () => {
    if (inquiryLoading) return
    setInquiryLoading(true)
    trackEvent(store.slug, "CHECKOUT_START", product.id)
    try {
      await paymentProvider.checkout({
        items: [{ productId: product.id, name: product.name, price: product.price, quantity: 1, image }],
        total: product.price,
        currency: store.currency ?? "USD",
        storeSlug: store.slug,
      })
    } finally {
      setInquiryLoading(false)
    }
  }

  const specCells: { icon: typeof Bed; value?: string; label: string }[] = [
    { icon: Bed, value: specs.hab, label: "Habitaciones" },
    { icon: Bath, value: specs.bath, label: "Baños" },
    { icon: Ruler, value: specs.m2, label: "m²" },
    { icon: Calendar, value: specs.year, label: "Año" },
    // El legacy leía Estacionamiento pero no lo renderizaba (omisión, spec
    // §4 ⚠️) — decisión de port: sí se muestra, la data del seed lo trae.
    { icon: Car, value: specs.parking, label: "Estacionamiento" },
  ]
  const visibleSpecs = specCells.filter((c) => c.value)

  return (
    <div
      className="bl-estate-root"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      style={S.overlay}
    >
      <style dangerouslySetInnerHTML={{ __html: ESTATE_STYLES }} />

      {/* Sticky nav */}
      <div style={S.nav}>
        <button type="button" className="bl-estate-backlink" onClick={onClose} style={S.backLink}>
          <ArrowLeft style={{ width: 16, height: 16 }} aria-hidden="true" />
          Propiedades
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            className={`bl-estate-navbtn${isSaved ? " is-saved" : ""}`}
            onClick={handleSave}
            disabled={!cart}
            aria-label={isSaved ? "Quitar de guardados" : "Guardar propiedad"}
            aria-pressed={isSaved}
            style={{
              ...S.navBtn,
              ...(isSaved ? { background: gold(10), color: ESTATE.gold } : { color: GRAY.g500 }),
            }}
          >
            {isSaved ? (
              <Check style={{ width: 16, height: 16 }} strokeWidth={2.5} />
            ) : (
              <Bookmark style={{ width: 16, height: 16 }} />
            )}
          </button>
          {totalItems > 0 && cart && (
            <button
              type="button"
              className="bl-estate-navbtn"
              onClick={() => cart.setIsOpen(true)}
              aria-label={`Ver propiedades guardadas — ${totalItems}`}
              style={{ ...S.navBtn, position: "relative", color: GRAY.g500 }}
            >
              <Building2 style={{ width: 16, height: 16 }} />
              <span style={S.navBadge}>{totalItems}</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 768, margin: "0 auto" }}>
        {/* Galería hero */}
        <div style={S.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[selectedImage]} alt={product.name} style={S.heroImg} />
          {!stocked && (
            <div style={S.soldOverlay}>
              <span style={S.soldText}>No disponible</span>
            </div>
          )}
          {stocked && <div style={S.statusBadge}>Disponible</div>}
          {images.length > 1 && (
            <div style={S.photoCount}>
              {selectedImage + 1}/{images.length} fotos
            </div>
          )}
        </div>

        {/* Thumb strip */}
        {images.length > 1 && (
          <div className="bl-estate-hscroll" style={S.thumbs}>
            {images.map((img, idx) => {
              const active = idx === selectedImage
              return (
                <button
                  key={idx}
                  type="button"
                  className={`bl-estate-thumb${active ? " is-active" : ""}`}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`Foto ${idx + 1}`}
                  aria-pressed={active}
                  style={{
                    ...S.thumb,
                    ...(active
                      ? { border: `2px solid ${ESTATE.gold}`, opacity: 1 }
                      : { border: "2px solid transparent", opacity: 0.6 }),
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              )
            })}
          </div>
        )}

        {/* Info */}
        <div style={S.info}>
          {/* Precio */}
          <div>
            <span style={S.price}>{fmt(product.price)}</span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <span style={S.compare}>{fmt(product.compareAtPrice)}</span>
            )}
          </div>

          {/* Título + categoría */}
          <div>
            <h1 style={S.title}>{product.name}</h1>
            {product.category && (
              <p style={S.category}>
                <MapPin style={{ width: 14, height: 14, flexShrink: 0 }} aria-hidden="true" />
                {product.category}
              </p>
            )}
          </div>

          {/* Specs grid 3-col */}
          {visibleSpecs.length > 0 && (
            <div style={S.specsGrid}>
              {visibleSpecs.map(({ icon: Icon, value, label }) => (
                <div key={label} style={S.specCell}>
                  <Icon style={{ width: 20, height: 20, color: navy(60) }} aria-hidden="true" />
                  <span style={S.specValue}>{value}</span>
                  <span style={S.specLabel}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div style={S.tags}>
              {tags.map((tag) => (
                <span key={tag} style={S.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Descripción colapsable */}
          {product.description && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                className="bl-estate-descbtn"
                onClick={() => setShowFullDesc((v) => !v)}
                aria-expanded={showFullDesc}
                style={S.descBtn}
              >
                Descripción
                {showFullDesc ? (
                  <ChevronUp style={{ width: 14, height: 14 }} aria-hidden="true" />
                ) : (
                  <ChevronDown style={{ width: 14, height: 14 }} aria-hidden="true" />
                )}
              </button>
              <p
                style={{
                  ...S.desc,
                  ...(showFullDesc
                    ? {}
                    : { display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }),
                }}
              >
                {product.description}
              </p>
            </div>
          )}

          {/* Agent card */}
          <div style={S.agentCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt={store.name} style={S.agentAvatar} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={S.agentName}>{store.name}</p>
                <p style={S.agentRole}>Asesor inmobiliario</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div style={S.stickyBottom}>
        <div style={S.ctaRow}>
          <button
            type="button"
            className={`bl-estate-savebig${isSaved ? " is-saved" : ""}`}
            onClick={handleSave}
            disabled={!cart}
            aria-label={isSaved ? "Quitar de guardados" : "Guardar propiedad"}
            aria-pressed={isSaved}
            style={{
              ...S.saveBig,
              ...(isSaved
                ? { background: gold(10), border: `2px solid ${ESTATE.gold}`, color: ESTATE.gold }
                : { border: `2px solid ${GRAY.border200}`, color: GRAY.g500 }),
            }}
          >
            <Bookmark style={{ width: 20, height: 20 }} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            className="bl-estate-wabtn"
            onClick={handleDirectInquiry}
            disabled={inquiryLoading || !canInquiry}
            style={{ ...S.waBtn, opacity: inquiryLoading || !canInquiry ? 0.7 : 1 }}
          >
            <MessageCircle style={{ width: 20, height: 20 }} aria-hidden="true" />
            {inquiryLoading ? "Abriendo WhatsApp..." : "Consultar por WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  )
}

const S: Record<string, CSSProperties> = {
  // z 400: mismo plano que los sheets genéricos (sobre el modal de preview,
  // 300); el cart drawer va después en el DOM y queda arriba.
  overlay: {
    position: "fixed", inset: 0, zIndex: 400,
    overflowY: "auto",
    background: ESTATE.bg, color: ESTATE.text, fontFamily: ESTATE.body,
    containerType: "inline-size", containerName: "bl-estate-sheet",
  },
  nav: {
    position: "sticky", top: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px",
    background: "color-mix(in srgb, var(--bl-surface) 95%, transparent)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderBottom: `1px solid ${GRAY.border200}`,
  },
  backLink: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: 0, border: "none", background: "none",
    fontSize: 14, fontFamily: "inherit", color: GRAY.g500, cursor: "pointer",
  },
  navBtn: {
    display: "grid", placeItems: "center", width: 36, height: 36,
    borderRadius: RADIUS.xl, border: "none", background: "transparent", cursor: "pointer",
  },
  navBadge: {
    position: "absolute", top: -4, right: -4,
    display: "grid", placeItems: "center", width: 16, height: 16,
    borderRadius: 999, background: ESTATE.gold, color: ESTATE.navy,
    fontSize: 9, fontWeight: 700,
  },
  hero: { position: "relative", aspectRatio: "3 / 2", overflow: "hidden", background: GRAY.chip100 },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", transition: "opacity .3s ease" },
  soldOverlay: {
    position: "absolute", inset: 0, display: "grid", placeItems: "center",
    background: "rgba(255,255,255,.75)",
  },
  soldText: {
    fontSize: 14, fontWeight: 500, color: GRAY.g500,
    textTransform: "uppercase", letterSpacing: ".05em",
  },
  statusBadge: {
    position: "absolute", top: 12, left: 12,
    background: ESTATE.emerald, color: "#fff",
    fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: RADIUS.lg,
    textTransform: "uppercase", letterSpacing: ".025em",
  },
  photoCount: {
    position: "absolute", bottom: 12, left: 12,
    background: ESTATE.photoOverlay, color: "#fff",
    fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: RADIUS.lg,
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
  },
  thumbs: { display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto" },
  thumb: {
    flexShrink: 0, width: 64, height: 48, padding: 0,
    borderRadius: RADIUS.lg, overflow: "hidden", cursor: "pointer", background: "none",
  },
  info: { display: "flex", flexDirection: "column", gap: 20, padding: "20px 16px 160px" },
  price: { fontSize: 30, fontWeight: 700, color: ESTATE.navy, fontFamily: ESTATE.heading },
  compare: { marginLeft: 12, fontSize: 16, color: GRAY.g400, textDecoration: "line-through" },
  title: { margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.25, color: GRAY.strong, fontFamily: ESTATE.heading },
  category: { margin: "4px 0 0", display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: GRAY.g500 },
  specsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  specCell: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    background: ESTATE.surface, borderRadius: RADIUS.xl, padding: 12,
    border: `1px solid ${GRAY.border100}`,
  },
  specValue: { fontSize: 18, fontWeight: 700, color: ESTATE.navy },
  specLabel: {
    fontSize: 10, color: GRAY.g500, textTransform: "uppercase",
    letterSpacing: ".025em", textAlign: "center",
  },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: {
    fontSize: 12, fontWeight: 500, background: navy(5), color: ESTATE.navy,
    padding: "4px 10px", borderRadius: 999,
  },
  descBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
    padding: 0, border: "none", background: "none",
    fontSize: 12, fontWeight: 500, fontFamily: "inherit",
    textTransform: "uppercase", letterSpacing: ".05em",
    color: GRAY.g500, cursor: "pointer",
  },
  desc: { margin: 0, fontSize: 14, lineHeight: 1.625, color: GRAY.g600, whiteSpace: "pre-line" },
  agentCard: {
    background: ESTATE.surface, borderRadius: RADIUS.xxl, padding: 16,
    border: `1px solid ${GRAY.border100}`, boxShadow: "0 1px 2px rgba(0,0,0,.05)",
  },
  agentAvatar: {
    width: 48, height: 48, borderRadius: 999, objectFit: "cover", flexShrink: 0,
    border: `2px solid ${gold(30)}`,
  },
  agentName: { margin: 0, fontSize: 14, fontWeight: 700, color: ESTATE.navy },
  agentRole: { margin: "2px 0 0", fontSize: 12, color: GRAY.g500 },
  stickyBottom: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
    padding: 16,
    background: "color-mix(in srgb, var(--bl-surface) 90%, transparent)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    borderTop: `1px solid ${GRAY.border200}`,
  },
  ctaRow: { display: "flex", gap: 8, maxWidth: 768, margin: "0 auto" },
  saveBig: {
    display: "grid", placeItems: "center", flexShrink: 0,
    width: 52, height: 52, borderRadius: RADIUS.xl,
    background: "transparent", cursor: "pointer",
  },
  waBtn: {
    display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 8,
    height: 52, borderRadius: RADIUS.xl, border: "none",
    background: ESTATE.waGreen, color: "#fff",
    fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(37,211,102,.3)",
  },
}
