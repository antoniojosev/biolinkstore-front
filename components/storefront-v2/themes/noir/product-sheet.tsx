"use client"

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import { ArrowLeft, Check, ChevronRight, Minus, Plus, Share2, ShoppingBag } from "lucide-react"
import type { ThemeProductSheetProps } from "../registry"
import type {
  TemplateAttribute,
  TemplateProduct,
  TemplateStore,
} from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import {
  Hairline,
  NOIR,
  NOIR_STYLES,
  bgA,
  fmtNoirPrice,
  goldA,
  ink,
  noirDiscount,
  noirInStock,
  textA,
  useNoirShare,
} from "./shared"

/**
 * NoirProductSheet — detail PROPIO del tema (spec §4). Takeover full-screen
 * fiel al legacy noir/product-detail.tsx: desktop = top bar + grid 2 col
 * (imagen 3/4 con overlay, thumbs con border-b dorado); mobile = hero
 * cinemático 70vh + CTA fijo abajo. Selectores dorados, ColorSwatch con
 * optionsMeta.hex, cantidad cuadrada, descripción colapsable y CTA con el
 * total a la derecha. Container queries (bl-noir-pd, 760px) — nunca @media.
 * Wishlist legacy omitida.
 */
export function NoirProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  if (!product) return null
  return <NoirDetail key={product.id} product={product} store={store} onClose={onClose} />
}

function NoirDetail({
  product,
  store,
  onClose,
}: {
  product: TemplateProduct
  store: TemplateStore
  onClose: () => void
}) {
  const cart = useCartOptional()
  const { share, copied } = useNoirShare()
  const fmt = (n: number) => fmtNoirPrice(n, store.currency)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const images = product.images?.length ? product.images : [product.image ?? "/placeholder.svg"]
  const inStock = noirInStock(product)

  // Ejes seleccionables: attrs sin role o role variant (contrato v2).
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
  const discount = noirDiscount(finalPrice, product.compareAtPrice)

  const canAdd =
    inStock &&
    (variantAttrs.length === 0 || Object.keys(selectedOptions).length === variantAttrs.length)

  function isOptionAvailable(attr: TemplateAttribute, option: string): boolean {
    if (!product.variants?.length) return true
    return product.variants.some((v) => v.combination[attr.name] === option && v.isAvailable)
  }

  function handleSelectOption(attrName: string, option: string) {
    const nextSelection = { ...selectedOptions, [attrName]: option }
    setSelectedOptions(nextSelection)
    // Si la variante matcheada tiene imagen propia, saltar a ella en la galería.
    const match = product.variants?.find((v) =>
      Object.entries(nextSelection).every(([k, val]) => v.combination[k] === val),
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
      ? Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(", ")
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
    setTimeout(() => setAdded(false), 1800)
  }

  function handleShare() {
    void share(window.location.href, product.name)
  }

  const totalItems = cart?.totalItems ?? 0

  // ── bloques compartidos desktop/mobile ─────────────────────────────────────

  const badges = (
    <>
      {discount != null && <span style={S.discountBadge}>-{discount}%</span>}
      {product.featured && <span style={S.featuredMark}>✦ Destacado</span>}
    </>
  )

  const variantSelectors = variantAttrs.map((attr) => (
    <div key={attr.name} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={S.label}>
        {attr.name}
        {selectedOptions[attr.name] && (
          <span style={{ color: NOIR.text, marginLeft: 8, letterSpacing: "normal", textTransform: "none" }}>
            {selectedOptions[attr.name]}
          </span>
        )}
      </p>
      {attr.type === "color" && attr.optionsMeta ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {attr.options.map((option) => (
            <NoirColorSwatch
              key={option}
              hex={attr.optionsMeta?.[option]?.hex ?? "#ccc"}
              label={option}
              isSelected={selectedOptions[attr.name] === option}
              isAvailable={isOptionAvailable(attr, option)}
              onClick={() => handleSelectOption(attr.name, option)}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {attr.options.map((option) => {
            const isSelected = selectedOptions[attr.name] === option
            const isAvailable = isOptionAvailable(attr, option)
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelectOption(attr.name, option)}
                disabled={!isAvailable}
                style={{
                  ...S.optionBtn,
                  ...(isSelected
                    ? { border: `1px solid ${NOIR.gold}`, color: NOIR.gold, background: goldA(10) }
                    : isAvailable
                      ? { border: `1px solid ${ink(19)}`, color: ink(55), background: "transparent" }
                      : {
                          border: "1px solid var(--bl-border)",
                          color: ink(19),
                          background: "transparent",
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
  ))

  const qtyStepper = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={S.label}>Cantidad</p>
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <button
          type="button"
          className="bl-noir-qtybtn"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Reducir cantidad"
          style={S.qtyBtn}
        >
          <Minus size={12} />
        </button>
        <span style={S.qtyValue}>{quantity}</span>
        <button
          type="button"
          className="bl-noir-qtybtn"
          onClick={() => setQuantity((q) => q + 1)}
          aria-label="Aumentar cantidad"
          style={S.qtyBtn}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  )

  const description = product.description ? (
    <>
      <Hairline variant="soft" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          type="button"
          className="bl-noir-goldhover"
          onClick={() => setShowFullDesc((v) => !v)}
          style={{ ...S.label, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
        >
          {showFullDesc ? "Ocultar detalles" : "Ver detalles"}
        </button>
        {showFullDesc && <p style={S.descBody}>{product.description}</p>}
      </div>
    </>
  ) : null

  const ctaButton = (
    <button
      type="button"
      className={canAdd ? "bl-noir-goldbtn" : undefined}
      onClick={handleAdd}
      disabled={!canAdd}
      style={{
        ...S.cta,
        ...(canAdd || added
          ? { background: NOIR.gold, color: "var(--bl-background)", cursor: "pointer" }
          : { background: "var(--bl-border)", color: ink(33), cursor: "not-allowed" }),
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ShoppingBag size={16} aria-hidden="true" />
        <span>{added ? "Agregado" : "Agregar"}</span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 700 }}>{fmt(finalPrice * quantity)}</span>
        <ChevronRight size={16} aria-hidden="true" />
      </span>
    </button>
  )

  const infoHead = (titleSize: number, priceSize: number): ReactNode => (
    <>
      <Hairline variant="strong" />
      <div>
        {product.category && <p style={S.category}>{product.category}</p>}
        <h1 style={{ ...S.title, fontSize: titleSize }}>{product.name}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: NOIR.gold, fontSize: priceSize, fontWeight: 600 }}>{fmt(finalPrice)}</span>
        {product.compareAtPrice != null && product.compareAtPrice > finalPrice && (
          <span style={{ color: ink(33), fontSize: 14, textDecoration: "line-through" }}>
            {fmt(product.compareAtPrice)}
          </span>
        )}
      </div>
      <Hairline variant="soft" />
    </>
  )

  const thumbs = (size: CSSProperties) =>
    images.length > 1 ? (
      <div style={{ display: "flex", gap: 1, overflowX: "auto" }}>
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            className={idx === selectedImage ? undefined : "bl-noir-thumb-dim"}
            onClick={() => setSelectedImage(idx)}
            aria-label={`Ver imagen ${idx + 1}`}
            style={{
              ...S.thumb,
              ...size,
              borderBottom: idx === selectedImage ? `2px solid ${NOIR.gold}` : "2px solid transparent",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
      </div>
    ) : null

  const shareBtn = (iconSize: number, color: string) => (
    <button type="button" onClick={handleShare} aria-label="Compartir" style={{ ...S.ghostIconBtn, color }}>
      {copied ? <Check size={iconSize} strokeWidth={2} style={{ color: NOIR.gold }} /> : <Share2 size={iconSize} strokeWidth={1.5} />}
    </button>
  )

  const soldOutOverlay = !inStock && (
    <div style={S.soldOut}>
      <span style={S.soldOutText}>Agotado</span>
    </div>
  )

  return (
    <div role="dialog" aria-modal="true" aria-label={product.name} style={S.overlay}>
      <style dangerouslySetInnerHTML={{ __html: NOIR_STYLES }} />

      {/* ── Desktop (≥760 del contenedor) ── */}
      <div className="bl-noir-pd-desktop" style={{ gridTemplateColumns: "1fr" }}>
        {/* Top bar */}
        <div style={S.topBar}>
          <button type="button" className="bl-noir-goldhover" onClick={onClose} style={S.backLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            Volver a la tienda
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {shareBtn(16, ink(33))}
            <button
              type="button"
              className="bl-noir-goldbtn"
              onClick={() => cart?.setIsOpen(true)}
              style={S.topCartBtn}
            >
              <ShoppingBag size={16} aria-hidden="true" />
              Carrito
              {totalItems > 0 && <span style={{ color: bgA(60), fontSize: 12 }}>{totalItems}</span>}
            </button>
          </div>
        </div>

        {/* Grid 2 col */}
        <div style={S.desktopGrid}>
          {/* Galería */}
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[selectedImage]} alt={product.name} style={S.mainImg} />
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${bgA(20)}, transparent, ${bgA(40)})` }} />
              {soldOutOverlay}
              <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                {badges}
              </div>
            </div>
            {thumbs({ flex: 1, height: 80 })}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "8px 0" }}>
            {infoHead(30, 20)}
            {variantSelectors}
            {qtyStepper}
            {description}
            {ctaButton}
          </div>
        </div>
      </div>

      {/* ── Mobile (<760) ── */}
      <div className="bl-noir-pd-mobile" style={{ maxWidth: 512, margin: "0 auto" }}>
        {/* Hero cinemático 70vh */}
        <div style={S.mobileHero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[selectedImage]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${bgA(40)}, transparent, var(--bl-background))` }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${bgA(40)}, transparent, transparent)` }} />

          {/* Nav superpuesto */}
          <div style={S.mobileNav}>
            <button type="button" onClick={onClose} aria-label="Volver a la tienda" style={{ ...S.ghostIconBtn, color: textA(80) }}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {shareBtn(18, textA(80))}
              <button
                type="button"
                onClick={() => cart?.setIsOpen(true)}
                aria-label={`Abrir carrito${totalItems > 0 ? ` (${totalItems})` : ""}`}
                style={{ ...S.ghostIconBtn, color: textA(80), position: "relative" }}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && <span style={S.goldBadge}>{totalItems}</span>}
              </button>
            </div>
          </div>

          {/* Badges */}
          <div style={{ position: "absolute", top: 80, left: 20, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start", zIndex: 10 }}>
            {badges}
          </div>

          {soldOutOverlay}
        </div>

        {images.length > 1 && <div style={{ paddingLeft: 16 }}>{thumbs({ width: 64, height: 64, flexShrink: 0 })}</div>}

        <div style={{ padding: "24px 20px 128px", display: "flex", flexDirection: "column", gap: 24 }}>
          {infoHead(24, 18)}
          {variantSelectors}
          {qtyStepper}
          {description}
        </div>

        {/* CTA fijo abajo */}
        <div style={S.mobileCtaBar}>{ctaButton}</div>
      </div>
    </div>
  )
}

/**
 * ColorSwatch del legacy compartido: círculo 32px, ring exterior con el hex
 * al seleccionar, diagonal si no disponible, label 10px debajo.
 */
function NoirColorSwatch({
  hex,
  label,
  isSelected,
  isAvailable,
  onClick,
}: {
  hex: string
  label: string
  isSelected: boolean
  isAvailable: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      aria-label={label}
      aria-pressed={isSelected}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        background: "none", border: "none", padding: 0,
        cursor: isAvailable ? "pointer" : "not-allowed",
        opacity: isAvailable ? 1 : 0.45,
      }}
    >
      <span
        style={{
          position: "relative",
          width: 32, height: 32, borderRadius: "50%",
          background: hex,
          border: `1px solid ${ink(19)}`,
          boxShadow: isSelected ? `0 0 0 2px var(--bl-background), 0 0 0 4px ${hex}` : "none",
          overflow: "hidden",
        }}
      >
        {!isAvailable && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute", left: "50%", top: "50%",
              width: 40, height: 1.5, background: "#f87171",
              transform: "translate(-50%, -50%) rotate(-45deg)",
            }}
          />
        )}
      </span>
      <span style={{ fontSize: 10, color: isSelected ? NOIR.text : ink(33), fontFamily: NOIR.sans }}>{label}</span>
    </button>
  )
}

const S: Record<string, CSSProperties> = {
  // z 400: mismo plano que los sheets genéricos; el cart drawer va después
  // en el DOM y queda arriba.
  overlay: {
    position: "fixed", inset: 0, zIndex: 400, overflowY: "auto",
    background: "var(--bl-background)", color: NOIR.text,
    fontFamily: NOIR.sans,
    containerType: "inline-size", containerName: "bl-noir-pd",
  },

  // Desktop
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 32px", borderBottom: "1px solid var(--bl-border)",
    maxWidth: 1152, margin: "0 auto", width: "100%",
  },
  backLink: {
    display: "flex", alignItems: "center", gap: 8, fontSize: 14,
    color: ink(33), background: "none", border: "none", cursor: "pointer",
    fontFamily: NOIR.sans, padding: 0,
  },
  topCartBtn: {
    position: "relative", display: "flex", alignItems: "center", gap: 8,
    height: 36, padding: "0 20px",
    background: NOIR.gold, color: "var(--bl-background)",
    fontSize: 14, fontWeight: 600, fontFamily: NOIR.sans,
    border: "none", borderRadius: 2, cursor: "pointer",
  },
  desktopGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64,
    maxWidth: 1152, margin: "0 auto", padding: "40px 32px 64px",
    alignItems: "start", width: "100%", boxSizing: "border-box",
  },
  mainImg: { width: "100%", height: "100%", objectFit: "cover", transition: "opacity .7s ease" },

  // Mobile
  mobileHero: { position: "relative", height: "70vh", width: "100%", overflow: "hidden" },
  mobileNav: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "40px 20px 0",
  },
  goldBadge: {
    position: "absolute", top: -6, right: -6,
    width: 16, height: 16, borderRadius: "50%",
    background: NOIR.gold, color: "var(--bl-background)",
    fontSize: 9, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  mobileCtaBar: {
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
    maxWidth: 512, margin: "0 auto",
    padding: "12px 20px 24px",
    background: bgA(95),
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderTop: "1px solid var(--bl-border)",
  },

  // Compartidos
  ghostIconBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 0,
    display: "flex", alignItems: "center",
  },
  discountBadge: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
    background: NOIR.gold, color: "var(--bl-background)",
    padding: "2px 8px", borderRadius: 2, fontFamily: NOIR.sans,
  },
  featuredMark: {
    fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
    color: NOIR.gold, fontWeight: 300, fontFamily: NOIR.sans,
  },
  category: {
    fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
    color: NOIR.gold, fontFamily: NOIR.sans, margin: "0 0 8px",
  },
  title: {
    fontFamily: NOIR.serif, fontWeight: 300, fontStyle: "italic",
    color: NOIR.text, letterSpacing: "0.025em", lineHeight: 1.2, margin: 0,
  },
  label: {
    fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
    color: ink(33), fontFamily: NOIR.sans, margin: 0,
  },
  optionBtn: {
    padding: "8px 16px", fontSize: 14, fontFamily: NOIR.sans,
    cursor: "pointer", transition: "all .3s ease", background: "transparent",
  },
  qtyBtn: {
    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
    border: `1px solid ${ink(19)}`, background: "transparent",
    color: ink(55), cursor: "pointer",
  },
  qtyValue: {
    width: 48, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
    borderTop: `1px solid ${ink(19)}`, borderBottom: `1px solid ${ink(19)}`,
    color: NOIR.text, fontSize: 14, fontFamily: NOIR.sans,
  },
  descBody: {
    fontSize: 14, color: ink(55), fontFamily: NOIR.sans,
    fontWeight: 300, lineHeight: 1.625, margin: 0, whiteSpace: "pre-wrap",
  },
  cta: {
    width: "100%", height: 48, borderRadius: 2, border: "none",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", fontWeight: 600, fontSize: 14,
    fontFamily: NOIR.sans, letterSpacing: "0.025em",
    transition: "all .2s ease",
  },
  soldOut: {
    position: "absolute", inset: 0, background: bgA(60),
    backdropFilter: "blur(1px)", WebkitBackdropFilter: "blur(1px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  soldOutText: {
    fontSize: 11, fontWeight: 300, letterSpacing: "0.3em",
    textTransform: "uppercase", color: ink(55), fontFamily: NOIR.sans,
  },
}
