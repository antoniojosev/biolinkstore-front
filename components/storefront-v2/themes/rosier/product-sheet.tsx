"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Plus,
  RefreshCcw,
  Share2,
  Shield,
  ShoppingBag,
  Truck,
} from "lucide-react"
import type { ThemeProductSheetProps } from "../registry"
import { colorImagesForSelection } from "@/components/storefront-v2/template/template-renderer"
import type {
  TemplateAttribute,
  TemplateProduct,
  TemplateStore,
} from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import {
  ROSIER_STYLES,
  RS,
  fmtRosierPrice,
  ratingFor,
  rosierDiscount,
  rosierInStock,
  rosierSerifHref,
  splitTitle,
  useRosierShare,
} from "./shared"

/**
 * RosierProductSheet — detail PROPIO del tema, fiel al screen2 del HTML
 * aprobado (manda sobre el legacy React, spec §4): marca centrada en el top
 * bar, fila categoría+SKU, título con em italic rose, pill "Ahorras %",
 * tallas circulares (activa ink), colores con ring rose, qty y Total-stack en
 * la barra CTA rose con glow. Trust signals y acordeones del React. Container
 * bl-rosier-pd (760px): mobile = flechas de galería + barra fija; desktop =
 * grid 2 col con el mismo bloque CTA inline. Wishlist legacy omitida.
 */
export function RosierProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  if (!product) return null
  return <RosierDetail key={product.id} product={product} store={store} onClose={onClose} />
}

function RosierDetail({
  product,
  store,
  onClose,
}: {
  product: TemplateProduct
  store: TemplateStore
  onClose: () => void
}) {
  const cart = useCartOptional()
  const { share, copied } = useRosierShare()
  const fmt = (n: number) => fmtRosierPrice(n, store.currency)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>("details")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Fotos por color: si el color elegido tiene imágenes propias, la galería usa
  // esas; si no, cae a la galería base.
  const baseImages = product.images?.length ? product.images : [product.image ?? "/placeholder.svg"]
  const colorImgs = colorImagesForSelection(product, selectedOptions)
  const images = colorImgs ?? baseImages
  const inStock = rosierInStock(product)

  useEffect(() => {
    setSelectedImage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorImgs?.join("|")])
  const rating = ratingFor(product.id)
  const { head: titleHead, em: titleEm } = splitTitle(product.name)

  const variantAttrs = (product.attributes ?? []).filter((a) => !a.role || a.role === "variant")

  const selectedVariant = useMemo(() => {
    if (!product.variants?.length) return null
    return (
      product.variants.find((v) =>
        Object.entries(selectedOptions).every(([key, val]) => v.combination[key] === val),
      ) ?? null
    )
  }, [product.variants, selectedOptions])

  const finalPrice = product.price + (selectedVariant?.priceAdjustment ?? 0)
  const discount = rosierDiscount(finalPrice, product.compareAtPrice)
  const isOnSale = discount != null

  const canAdd =
    inStock &&
    (variantAttrs.length === 0 || Object.keys(selectedOptions).length === variantAttrs.length)

  function isOptionAvailable(attr: TemplateAttribute, option: string): boolean {
    if (!product.variants?.length) return true
    return product.variants.some((v) => v.combination[attr.name] === option && v.isAvailable)
  }

  function handleSelectOption(attrName: string, option: string) {
    const next = { ...selectedOptions, [attrName]: option }
    setSelectedOptions(next)
    const match = product.variants?.find((v) =>
      Object.entries(next).every(([k, val]) => v.combination[k] === val),
    )
    if (match?.image) {
      const idx = images.indexOf(match.image)
      if (idx >= 0) setSelectedImage(idx)
    }
  }

  function handleAdd() {
    if (!canAdd || !cart) return
    const hasSelections = Object.keys(selectedOptions).length > 0
    const variantLabel = hasSelections
      ? Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(" · ")
      : undefined
    const optionsKey = hasSelections
      ? Object.entries(selectedOptions)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, v]) => v)
          .join("-")
      : ""
    const id = optionsKey ? `${product.id}-${optionsKey}` : product.id
    const existing = cart.items.find((i) => i.id === id)
    cart.addItem({
      id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: finalPrice,
      image: selectedVariant?.image ?? images[0],
      variant: variantLabel,
    })
    if (quantity > 1) {
      cart.updateQuantity(id, (existing?.quantity ?? 0) + quantity)
    }
    setAdded(true)
    cart.setIsOpen(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const totalItems = cart?.totalItems ?? 0
  const toggleSection = (key: string) => setOpenSection((cur) => (cur === key ? null : key))

  // ── selectores (spec §4.5–4.6) ─────────────────────────────────────────────

  const variantSelectors = variantAttrs.map((attr) => {
    const isColor = attr.type === "color" && attr.optionsMeta
    return (
      <div key={attr.name} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={S.optionsLabel}>
          {attr.name}
          {!selectedOptions[attr.name] && <span style={S.requiredHint}> · Requerido</span>}
          {selectedOptions[attr.name] && (
            <span style={S.selectedValue}>{selectedOptions[attr.name]}</span>
          )}
        </p>
        {isColor ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {attr.options.map((option) => {
              const isSelected = selectedOptions[attr.name] === option
              const isAvailable = isOptionAvailable(attr, option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption(attr.name, option)}
                  disabled={!isAvailable}
                  aria-label={option}
                  aria-pressed={isSelected}
                  style={{
                    ...S.colorDot,
                    background: attr.optionsMeta?.[option]?.hex ?? "#ccc",
                    boxShadow: isSelected ? `0 0 0 3px ${RS.rose}` : `0 0 0 1.5px ${RS.line}`,
                    opacity: isAvailable ? 1 : 0.4,
                    cursor: isAvailable ? "pointer" : "not-allowed",
                  }}
                />
              )
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {attr.options.map((option) => {
              const isSelected = selectedOptions[attr.name] === option
              const isAvailable = isOptionAvailable(attr, option)
              return (
                <button
                  key={option}
                  type="button"
                  className={`bl-rosier-sizebtn${isSelected ? " is-selected" : ""}`}
                  onClick={() => handleSelectOption(attr.name, option)}
                  disabled={!isAvailable}
                  style={{
                    ...S.sizeBtn,
                    ...(isSelected
                      ? { background: RS.ink, color: "#fff", borderColor: RS.ink }
                      : isAvailable
                        ? { background: "transparent", color: RS.ink, borderColor: RS.line }
                        : {
                            background: `color-mix(in srgb, ${RS.bgSoft} 50%, transparent)`,
                            color: RS.muted,
                            borderColor: RS.line,
                            textDecoration: "line-through",
                            cursor: "not-allowed",
                          }),
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  })

  // ── bloque CTA (Total stack + qty pill + CTA rose glow — HTML manda) ──────

  const qtyPill = (
    <div style={S.qtyPill}>
      <button
        type="button"
        className="bl-rosier-rosehover"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        aria-label="Reducir cantidad"
        style={S.qtyBtn}
      >
        <Minus size={14} strokeWidth={2} />
      </button>
      <span style={S.qtyVal}>{quantity}</span>
      <button
        type="button"
        className="bl-rosier-rosehover"
        onClick={() => setQuantity((q) => q + 1)}
        aria-label="Aumentar cantidad"
        style={S.qtyBtn}
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  )

  const ctaLabel = added
    ? "Añadido"
    : canAdd
      ? "Añadir a la bolsa"
      : variantAttrs.length > 0 && inStock
        ? "Elige opciones"
        : "Agotado"

  const ctaBlock = (
    <>
      <div style={S.totalStack}>
        <span style={S.totalLabel}>Total</span>
        <span style={S.totalVal}>{fmt(finalPrice * quantity)}</span>
      </div>
      {qtyPill}
      <button
        type="button"
        className={canAdd ? "bl-rosier-cta-rose" : undefined}
        onClick={handleAdd}
        disabled={!canAdd}
        style={{
          ...S.ctaBag,
          ...(canAdd || added
            ? { background: RS.rose, color: "#fff", boxShadow: "0 12px 30px -10px color-mix(in srgb, var(--bl-primary) 50%, transparent)", cursor: "pointer" }
            : { background: RS.cream2, color: RS.muted, cursor: "not-allowed", boxShadow: "none" }),
        }}
      >
        {added ? <Check size={16} strokeWidth={2.2} aria-hidden="true" /> : <ShoppingBag size={16} strokeWidth={1.8} aria-hidden="true" />}
        {ctaLabel}
      </button>
    </>
  )

  return (
    <div role="dialog" aria-modal="true" aria-label={product.name} style={S.overlay}>
      <link rel="stylesheet" precedence="default" href={rosierSerifHref("Fraunces")} />
      <style dangerouslySetInnerHTML={{ __html: ROSIER_STYLES }} />

      {/* Top bar glass — marca centrada (HTML manda) */}
      <div style={S.topBar}>
        <button type="button" className="bl-rosier-roundbtn" onClick={onClose} aria-label="Volver a la tienda" style={S.roundBtn}>
          <ArrowLeft size={18} strokeWidth={1.8} />
        </button>
        <span translate="no" style={S.brand}>
          {store.name}
          <span style={{ color: RS.ink, fontStyle: "normal", marginLeft: 2 }}>.</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            type="button"
            className="bl-rosier-roundbtn"
            onClick={() => void share(window.location.href, product.name)}
            aria-label="Compartir"
            style={{ ...S.roundBtn, width: 36, height: 36 }}
          >
            {copied ? <Check size={16} style={{ color: RS.rose }} strokeWidth={2.2} /> : <Share2 size={16} strokeWidth={1.6} />}
          </button>
          <button
            type="button"
            className="bl-rosier-roundbtn"
            onClick={() => cart?.setIsOpen(true)}
            aria-label={`Abrir bolsa${totalItems > 0 ? ` (${totalItems})` : ""}`}
            style={{ ...S.roundBtn, width: 36, height: 36, position: "relative" }}
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            {totalItems > 0 && <span style={S.badge}>{totalItems}</span>}
          </button>
        </div>
      </div>

      <div className="bl-rosier-pd-grid" style={S.content}>
        {/* ── Galería ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={S.heroImgWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[selectedImage]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {isOnSale ? (
              <span style={{ ...S.imgBadge, background: RS.rose }}>−{discount}%</span>
            ) : product.featured ? (
              <span style={{ ...S.imgBadge, background: RS.ink }}>Nuevo</span>
            ) : null}
            {!inStock && (
              <div style={S.soldOut}>
                <span style={S.soldOutText}>Agotado</span>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="bl-rosier-pd-arrow"
                  onClick={() => setSelectedImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                  aria-label="Imagen anterior"
                  style={{ ...S.arrow, left: 8 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="bl-rosier-pd-arrow"
                  onClick={() => setSelectedImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                  aria-label="Imagen siguiente"
                  style={{ ...S.arrow, right: 8 }}
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={idx === selectedImage ? undefined : "bl-rosier-thumb-dim"}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`Ver imagen ${idx + 1}`}
                  aria-pressed={idx === selectedImage}
                  style={{
                    ...S.thumb,
                    border: idx === selectedImage ? `3px solid ${RS.rose}` : "3px solid transparent",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 24 }}>
          <div>
            {/* Categoría + SKU (HTML manda) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              {product.category ? <p style={S.catTag}>{product.category}</p> : <span />}
              {product.sku && <p style={S.sku}>SKU {product.sku}</p>}
            </div>
            {/* Título con em rose (HTML manda) */}
            <h1 style={S.title}>
              {titleHead}
              <em style={{ fontStyle: "italic", color: RS.rose, fontWeight: 400 }}>{titleEm}</em>
            </h1>
            {/* Rating */}
            <div style={S.ratingRow}>
              <span style={{ color: RS.ink, letterSpacing: "0.08em" }} aria-hidden="true">★★★★★</span>
              {rating.score} · {rating.count} reseñas
            </div>
            {/* Fila precio + pill Ahorras (HTML manda) */}
            <div style={S.priceRow}>
              <span style={S.price}>{fmt(finalPrice)}</span>
              {isOnSale && (
                <span style={S.compare}>{fmt(product.compareAtPrice!)}</span>
              )}
              {isOnSale && <span style={S.savePill}>Ahorras {discount}%</span>}
            </div>
          </div>

          {variantSelectors}

          {/* Trust signals (React) */}
          <ul style={S.trustList}>
            <li style={S.trustItem}>
              <Truck size={16} style={{ color: RS.rose, flexShrink: 0 }} strokeWidth={1.6} aria-hidden="true" />
              Envío gratis sobre {fmt(50)}
            </li>
            <li style={S.trustItem}>
              <RefreshCcw size={16} style={{ color: RS.rose, flexShrink: 0 }} strokeWidth={1.6} aria-hidden="true" />
              30 días para devolver
            </li>
            <li style={S.trustItem}>
              <Shield size={16} style={{ color: RS.rose, flexShrink: 0 }} strokeWidth={1.6} aria-hidden="true" />
              Pago en 3 cuotas sin interés
            </li>
          </ul>

          {/* Acordeones (React) */}
          <div style={{ borderTop: `1px solid ${RS.line}` }}>
            {product.description && (
              <div style={{ borderBottom: `1px solid ${RS.line}` }}>
                <button
                  type="button"
                  onClick={() => toggleSection("details")}
                  aria-expanded={openSection === "details"}
                  style={S.accordionBtn}
                >
                  <span>Detalles del producto</span>
                  {openSection === "details" ? <ChevronUp size={16} style={{ color: RS.muted }} /> : <ChevronDown size={16} style={{ color: RS.muted }} />}
                </button>
                {openSection === "details" && <p style={S.accordionBody}>{product.description}</p>}
              </div>
            )}
            <div style={{ borderBottom: `1px solid ${RS.line}` }}>
              <button
                type="button"
                onClick={() => toggleSection("shipping")}
                aria-expanded={openSection === "shipping"}
                style={S.accordionBtn}
              >
                <span>Envíos y devoluciones</span>
                {openSection === "shipping" ? <ChevronUp size={16} style={{ color: RS.muted }} /> : <ChevronDown size={16} style={{ color: RS.muted }} />}
              </button>
              {openSection === "shipping" && (
                <div style={{ ...S.accordionBody, display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ margin: 0 }}>Envío a toda Venezuela en 2 a 5 días hábiles. Gratis sobre {fmt(50)}.</p>
                  <p style={{ margin: 0 }}>
                    Tienes 30 días desde la entrega para cambio o devolución. La prenda debe estar sin uso y con sus etiquetas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CTA inline (desktop ≥760) */}
          <div className="bl-rosier-pd-ctainline" style={{ alignItems: "center", gap: 14 }}>
            {ctaBlock}
          </div>
        </div>
      </div>

      {/* CTA sticky (mobile <760) — HTML manda el diseño */}
      <div className="bl-rosier-pd-ctabar" style={S.ctaBar}>
        {ctaBlock}
      </div>
    </div>
  )
}

const S: Record<string, CSSProperties> = {
  // z 400: mismo plano que los sheets genéricos; el cart drawer queda arriba.
  overlay: {
    position: "fixed", inset: 0, zIndex: 400, overflowY: "auto",
    background: RS.bg, color: RS.ink, fontFamily: RS.sans,
    containerType: "inline-size", containerName: "bl-rosier-pd",
    paddingBottom: 110,
  },
  topBar: {
    position: "sticky", top: 0, zIndex: 30,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12, padding: "10px 14px",
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
  brand: {
    fontFamily: RS.serif, fontStyle: "italic", fontWeight: 600,
    fontSize: 20, letterSpacing: "-0.02em", color: RS.rose,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  badge: {
    position: "absolute", top: 2, right: 2,
    minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999,
    background: RS.rose, color: "#fff",
    fontSize: 10, fontWeight: 600, fontVariantNumeric: "tabular-nums",
    display: "grid", placeItems: "center", lineHeight: 1,
  },
  content: {
    maxWidth: 1280, margin: "0 auto",
    padding: "24px 16px 48px", alignItems: "start",
  },

  // Galería
  heroImgWrap: {
    position: "relative", aspectRatio: "3/4", borderRadius: 8,
    overflow: "hidden", background: RS.bgSoft,
  },
  imgBadge: {
    position: "absolute", top: 12, left: 12,
    color: "#fff", fontSize: 11, fontWeight: 700,
    padding: "6px 11px", borderRadius: 4,
    letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: RS.sans,
  },
  soldOut: {
    position: "absolute", inset: 0,
    background: "color-mix(in srgb, var(--bl-background) 70%, transparent)",
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  soldOutText: {
    fontSize: 12, fontWeight: 600, color: RS.ink,
    letterSpacing: "0.1em", textTransform: "uppercase",
  },
  arrow: {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(255,255,255,.8)",
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    boxShadow: "0 1px 3px rgba(0,0,0,.12)",
    border: "none", cursor: "pointer", color: RS.ink,
    display: "grid", placeItems: "center",
  },
  thumb: {
    width: 64, height: 80, borderRadius: 6, overflow: "hidden",
    flexShrink: 0, padding: 0, cursor: "pointer", background: RS.bgSoft,
  },

  // Info
  catTag: {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.22em", color: RS.rose, margin: 0, fontFamily: RS.sans,
  },
  sku: { fontSize: 11, color: RS.muted, letterSpacing: "0.06em", margin: 0, fontFamily: RS.sans },
  title: {
    fontFamily: RS.serif, fontWeight: 500,
    fontSize: "clamp(28px, 4.5cqw, 44px)",
    lineHeight: 1.05, letterSpacing: "-0.02em",
    color: RS.ink, margin: 0,
  },
  ratingRow: {
    display: "flex", alignItems: "center", gap: 8,
    marginTop: 12, fontSize: 12, color: RS.muted, fontFamily: RS.sans,
  },
  priceRow: {
    display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap",
    marginTop: 16, paddingBottom: 20,
    borderBottom: `1px solid ${RS.line}`,
    fontVariantNumeric: "tabular-nums",
  },
  price: {
    fontSize: 28, fontWeight: 800, color: RS.ink,
    letterSpacing: "-0.015em", fontFamily: RS.sans,
  },
  compare: { fontSize: 15, color: RS.muted, textDecoration: "line-through" },
  savePill: {
    padding: "4px 12px", background: RS.rose, color: "#fff",
    borderRadius: 999, fontSize: 11, fontWeight: 700,
    letterSpacing: "0.04em", fontFamily: RS.sans,
  },
  optionsLabel: {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.18em", color: RS.ink, margin: 0, fontFamily: RS.sans,
  },
  requiredHint: {
    color: RS.muted, fontWeight: 500, textTransform: "none",
    letterSpacing: 0, fontSize: 11,
  },
  selectedValue: {
    color: RS.ink, marginLeft: 8, textTransform: "none", letterSpacing: "normal",
    fontStyle: "italic", fontWeight: 500, fontFamily: RS.serif, fontSize: 13,
  },
  sizeBtn: {
    minWidth: 44, height: 44, padding: "0 14px",
    borderRadius: 999, borderWidth: 1.5, borderStyle: "solid",
    display: "grid", placeItems: "center",
    fontSize: 14, fontWeight: 600, fontFamily: RS.sans, cursor: "pointer",
  },
  colorDot: {
    width: 36, height: 36, borderRadius: "50%",
    border: `3px solid ${RS.bg}`, padding: 0, cursor: "pointer",
    transition: "box-shadow .2s ease",
  },
  trustList: {
    listStyle: "none", margin: 0, padding: "4px 0 0",
    display: "flex", flexDirection: "column", gap: 12,
  },
  trustItem: {
    display: "flex", alignItems: "center", gap: 12,
    fontSize: 13, color: RS.inkSoft, fontFamily: RS.sans,
  },
  accordionBtn: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 0", background: "none", border: "none", cursor: "pointer",
    fontSize: 14, fontWeight: 500, color: RS.ink, fontFamily: RS.sans, textAlign: "left",
  },
  accordionBody: {
    fontSize: 13.5, color: RS.inkSoft, lineHeight: 1.7,
    padding: "0 0 20px", margin: 0, whiteSpace: "pre-wrap", fontFamily: RS.sans,
  },

  // CTA
  totalStack: { display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 },
  totalLabel: {
    fontSize: 11, fontWeight: 500, color: RS.muted,
    letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: RS.sans,
  },
  totalVal: {
    fontFamily: RS.serif, fontSize: 22, fontWeight: 600,
    color: RS.ink, letterSpacing: "-0.02em", lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  },
  qtyPill: {
    display: "inline-flex", alignItems: "center", gap: 4,
    border: `1.5px solid ${RS.line}`, borderRadius: 999, padding: 4,
    flexShrink: 0,
  },
  qtyBtn: {
    width: 32, height: 32, borderRadius: "50%",
    display: "grid", placeItems: "center",
    background: "transparent", border: "none", cursor: "pointer",
    color: RS.ink,
  },
  qtyVal: {
    minWidth: 24, textAlign: "center",
    fontSize: 14, fontWeight: 600, color: RS.ink,
    fontVariantNumeric: "tabular-nums", fontFamily: RS.sans,
  },
  ctaBag: {
    flex: 1, height: 52,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 999, border: "none",
    fontSize: 14, fontWeight: 700, fontFamily: RS.sans,
    letterSpacing: "-0.005em",
  },
  ctaBar: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
    display: "flex", alignItems: "center", gap: 14,
    padding: "12px 16px 20px",
    background: RS.glass96,
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    borderTop: `1px solid ${RS.line}`,
  },
}
