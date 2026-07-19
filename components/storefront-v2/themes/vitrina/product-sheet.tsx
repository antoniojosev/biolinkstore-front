"use client"

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import { ArrowLeft, Check, ChevronDown, ChevronUp, Minus, Plus, Share2, ShoppingBag } from "lucide-react"
import type { ThemeProductSheetProps } from "../registry"
import { colorImagesForSelection } from "@/components/storefront-v2/template/template-renderer"
import type { TemplateProduct, TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import { catalogFmt, ColorSwatch, mix, useShare } from "../shared/catalog-shell/support"
import { addSelectionToCart, optionAvailable, useProductSelection } from "../shared/catalog-shell/variants"
import { V, VITRINA_CSS, VRX, V_CTA_SHADOW } from "./shared"

/**
 * VitrinaProductSheet — detalle PROPIO del tema (spec vitrina §4). En el
 * legacy era una página; acá es el slot del registry que usan los previews:
 * takeover full-screen con top bar (volver/share/carrito), galería con
 * thumbnails (cuadrada en ancho, 4:5 en angosto), badges, swatches de color
 * por optionsMeta.hex, cantidad, descripción colapsable (line-clamp-3 visible)
 * y CTA con precio total en vivo.
 *
 * ⚠️ Quirk legacy corregido (spec §4.2): el CTA mostraba precio×qty pero
 * agregaba qty=1 — acá agrega las N unidades (comportamiento luxora).
 */
export function VitrinaProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  if (!product) return null
  return <VitrinaDetail key={product.id} product={product} store={store} onClose={onClose} />
}

function VitrinaDetail({
  product,
  store,
  onClose,
}: {
  product: TemplateProduct
  store: TemplateStore
  onClose: () => void
}) {
  const cart = useCartOptional()
  const { share, copied } = useShare()
  const fmt = useMemo(() => catalogFmt(store.currency), [store.currency])
  const sel = useProductSelection(product)
  const [added, setAdded] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Fotos por color: si el color elegido tiene imágenes propias, la galería usa
  // esas; si no, cae a la galería base del hook. Índice clamp + reset a 0.
  const colorImgs = colorImagesForSelection(product, sel.selectedOptions)
  const images = colorImgs ?? sel.images
  const selectedImage = Math.min(sel.selectedImage, images.length - 1)
  useEffect(() => {
    sel.setSelectedImage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorImgs?.join("|")])

  const discount =
    product.compareAtPrice && product.compareAtPrice > sel.finalPrice
      ? Math.round(((product.compareAtPrice - sel.finalPrice) / product.compareAtPrice) * 100)
      : null

  const handleAdd = () => {
    if (!sel.canAdd || !cart) return
    addSelectionToCart(cart, product, sel)
    setAdded(true)
    cart.setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleShare = () => share(window.location.href, product.name)

  // ── selectores de variantes (compartidos por ambos layouts, spec §4.1) ────
  const variantSelectors = sel.variantAttrs.map((attr) => (
    <div key={attr.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={S.attrLabel}>
        {attr.name}
        {sel.selectedOptions[attr.name] && (
          <span style={{ color: V.text, marginLeft: 6, textTransform: "none", letterSpacing: "normal" }}>
            — {sel.selectedOptions[attr.name]}
          </span>
        )}
      </p>
      {attr.type === "color" && attr.optionsMeta ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {attr.options.map((option) => (
            <ColorSwatch
              key={option}
              hex={attr.optionsMeta?.[option]?.hex ?? "#ccc"}
              label={option}
              isSelected={sel.selectedOptions[attr.name] === option}
              isAvailable={optionAvailable(product, attr.name, option)}
              onClick={() => sel.selectOption(attr.name, option)}
              labelColor={V.mutedFg}
              labelSelectedColor={V.text}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {attr.options.map((option) => {
            const isSelected = sel.selectedOptions[attr.name] === option
            const isAvailable = optionAvailable(product, attr.name, option)
            return (
              <button
                key={option}
                type="button"
                className="bl-vitrina-textopt"
                data-state={isSelected ? "selected" : isAvailable ? "available" : "soldout"}
                onClick={() => isAvailable && sel.selectOption(attr.name, option)}
                disabled={!isAvailable}
                style={{
                  ...S.textOpt,
                  ...(isSelected
                    ? { background: V.primary, color: V.primaryFg, border: "1px solid transparent", boxShadow: "0 1px 2px 0 rgba(0,0,0,.05)" }
                    : isAvailable
                      ? { background: V.muted, color: V.mutedFg, border: `1px solid ${mix(V.border, 50)}` }
                      : { background: mix(V.muted, 50), color: mix(V.mutedFg, 40), border: "1px solid transparent", textDecoration: "line-through", cursor: "not-allowed" }),
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={S.attrLabel}>Cantidad</p>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button type="button" onClick={() => sel.setQuantity((q) => Math.max(1, q - 1))} aria-label="Quitar uno" style={S.qtyBtn}>
          <Minus style={{ width: 14, height: 14 }} />
        </button>
        <span style={{ width: 40, textAlign: "center", fontSize: 14, fontWeight: 500, color: V.text }}>{sel.quantity}</span>
        <button type="button" onClick={() => sel.setQuantity((q) => q + 1)} aria-label="Agregar uno" style={S.qtyBtn}>
          <Plus style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  )

  const description = product.description ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        type="button"
        className="bl-vitrina-desc-toggle"
        onClick={() => setShowFullDesc((v) => !v)}
        style={{ ...S.attrLabel, display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        Descripción
        {showFullDesc ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
      </button>
      <p
        style={{
          margin: 0, fontSize: 14, color: mix(V.text, 70), lineHeight: 1.6,
          ...(showFullDesc
            ? {}
            : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }),
        }}
      >
        {product.description}
      </p>
    </div>
  ) : null

  const priceRow = (compareSize: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 24, fontWeight: 700, color: V.primary }}>{fmt(sel.finalPrice)}</span>
      {product.compareAtPrice && product.compareAtPrice > sel.finalPrice && (
        <span style={{ fontSize: compareSize, color: V.mutedFg, textDecoration: "line-through" }}>
          {fmt(product.compareAtPrice)}
        </span>
      )}
    </div>
  )

  const ctaBtn = (
    <button
      type="button"
      className="bl-vitrina-primarybtn"
      onClick={handleAdd}
      disabled={!sel.canAdd || !cart}
      style={{ ...S.cta, opacity: !sel.canAdd || !cart ? 0.5 : 1, cursor: !sel.canAdd || !cart ? "not-allowed" : "pointer" }}
    >
      {added ? (
        <>
          <Check style={{ width: 20, height: 20 }} />
          Agregado
        </>
      ) : (
        <>
          <ShoppingBag style={{ width: 20, height: 20 }} />
          <span style={{ flex: 1, textAlign: "left" }}>Agregar al carrito</span>
          <span style={{ fontWeight: 700 }}>{fmt(sel.finalPrice * sel.quantity)}</span>
        </>
      )}
    </button>
  )

  const badges = (
    <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, zIndex: 5 }}>
      {discount != null && <span style={S.discountBadge}>-{discount}%</span>}
      {product.featured && <span style={S.featuredBadge}>Destacado</span>}
    </div>
  )

  const soldOutOverlay = !sel.inStock && (
    <div style={S.soldOut}>
      <span style={S.soldOutText}>Agotado</span>
    </div>
  )

  const thumbs = (size: number) =>
    images.length > 1 && (
      <div className="bl-vitrina-thumbs">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            className="bl-vitrina-thumb"
            data-active={idx === selectedImage}
            onClick={() => sel.setSelectedImage(idx)}
            style={{
              flexShrink: 0, width: size, height: size, borderRadius: VRX.lg, overflow: "hidden",
              padding: 0, cursor: "pointer", background: V.muted,
              border: idx === selectedImage ? `2px solid ${V.primary}` : "2px solid transparent",
              opacity: idx === selectedImage ? 1 : 0.6,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </button>
        ))}
      </div>
    )

  const iconBtn = (onClick: () => void, label: string, children: ReactNode) => (
    <button type="button" className="bl-vitrina-iconbtn" onClick={onClick} aria-label={label} style={S.iconBtn}>
      {children}
    </button>
  )

  const cartIcon = (badgePos: boolean) => (
    <button type="button" className="bl-vitrina-iconbtn" onClick={() => cart?.setIsOpen(true)} aria-label="Ver carrito" style={{ ...S.iconBtn, position: "relative" }}>
      <ShoppingBag style={{ width: 16, height: 16 }} />
      {badgePos && (cart?.totalItems ?? 0) > 0 && <span style={S.iconBadge}>{cart?.totalItems}</span>}
    </button>
  )

  return (
    <div className="bl-vitrina-root" role="dialog" aria-modal="true" aria-label={product.name} style={S.overlay}>
      <style dangerouslySetInnerHTML={{ __html: VITRINA_CSS + SHEET_CSS }} />

      {/* ── Layout ancho (2 columnas) ── */}
      <div className="bl-vitrina-sheet-desktop">
        <div style={S.dTopBar}>
          <button type="button" onClick={onClose} style={S.backLink}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Volver a la tienda
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {iconBtn(handleShare, "Compartir", copied ? <Check style={{ width: 16, height: 16, color: V.primary }} strokeWidth={2.5} /> : <Share2 style={{ width: 16, height: 16 }} />)}
            <button type="button" className="bl-vitrina-primarybtn" onClick={() => cart?.setIsOpen(true)} style={S.dCartBtn}>
              <ShoppingBag style={{ width: 16, height: 16 }} />
              Carrito
              {(cart?.totalItems ?? 0) > 0 && (
                <span style={{ background: "rgba(255,255,255,.2)", fontSize: 12, fontWeight: 700, padding: "0 6px", borderRadius: 999 }}>
                  {cart?.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <div style={S.dGrid}>
          {/* Galería */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative", borderRadius: VRX.xl2, overflow: "hidden", background: V.muted, aspectRatio: "1 / 1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[selectedImage]} alt={product.name} style={S.mainImg} />
              {soldOutOverlay}
              {badges}
            </div>
            {thumbs(64)}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 8, paddingBottom: 8 }}>
            <div>
              {product.category && <p style={S.category}>{product.category}</p>}
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, lineHeight: 1.25, color: V.text }}>{product.name}</h1>
            </div>
            {priceRow(16)}
            {variantSelectors}
            {qtyStepper}
            {description}
            {ctaBtn}
          </div>
        </div>
      </div>

      {/* ── Layout angosto ── */}
      <div className="bl-vitrina-sheet-mobile" style={{ maxWidth: 512, margin: "0 auto" }}>
        <div style={S.mNav}>
          <button type="button" onClick={onClose} style={S.backLink}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Volver
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {iconBtn(handleShare, "Compartir", copied ? <Check style={{ width: 16, height: 16, color: V.primary }} strokeWidth={2.5} /> : <Share2 style={{ width: 16, height: 16 }} />)}
            {cartIcon(true)}
          </div>
        </div>

        <div style={{ padding: "8px 16px 0" }}>
          <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", background: V.muted, borderRadius: VRX.xl2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[selectedImage]} alt={product.name} style={S.mainImg} />
            {soldOutOverlay}
            {badges}
          </div>
        </div>

        {images.length > 1 && <div style={{ padding: "12px 16px" }}>{thumbs(56)}</div>}

        <div style={{ background: V.card, padding: "20px 20px 144px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            {product.category && <p style={S.category}>{product.category}</p>}
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.25, color: V.text }}>{product.name}</h1>
          </div>
          {priceRow(14)}
          {variantSelectors}
          {qtyStepper}
          {description}
        </div>

        <div style={S.mCtaBar}>{ctaBtn}</div>
      </div>
    </div>
  )
}

// El sheet vive en overlay propio → container query sobre su propio root.
const SHEET_CSS = `
.bl-vitrina-sheet-desktop { display: none; }
@container bl-vitrina-sheet (min-width: 1024px) {
  .bl-vitrina-sheet-desktop { display: block; }
  .bl-vitrina-sheet-mobile { display: none; }
}
`

const S: Record<string, CSSProperties> = {
  // z 400: mismo plano que los sheets genéricos; el cart drawer va después
  // en el DOM y queda arriba.
  overlay: {
    position: "fixed", inset: 0, zIndex: 400, overflowY: "auto",
    background: V.bg, color: V.text, fontFamily: "var(--bl-body-font)",
    containerType: "inline-size", containerName: "bl-vitrina-sheet",
  },
  dTopBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 32px", borderBottom: `1px solid ${mix(V.border, 30)}`,
    maxWidth: 1152, margin: "0 auto",
  },
  backLink: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 14, color: V.mutedFg, background: "none", border: "none",
    padding: 0, cursor: "pointer", fontFamily: "inherit",
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: VRX.xl,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", cursor: "pointer", color: V.mutedFg,
  },
  iconBadge: {
    position: "absolute", top: -4, right: -4, width: 16, height: 16,
    borderRadius: "50%", background: V.primary, color: V.primaryFg,
    fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
  },
  dCartBtn: {
    position: "relative", display: "flex", alignItems: "center", gap: 8,
    height: 36, padding: "0 16px", borderRadius: VRX.xl,
    background: V.primary, color: V.primaryFg,
    fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
  },
  dGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64,
    maxWidth: 1152, margin: "0 auto", padding: "40px 32px", alignItems: "start",
  },
  mainImg: { width: "100%", height: "100%", objectFit: "cover", transition: "opacity .5s ease" },
  category: { margin: "0 0 4px", fontSize: 11, color: mix(V.mutedFg, 70), textTransform: "uppercase", letterSpacing: "0.05em" },
  attrLabel: {
    margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em",
    color: V.mutedFg, fontWeight: 500, fontFamily: "inherit",
  },
  textOpt: {
    padding: "6px 12px", borderRadius: VRX.lg, fontSize: 14, fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
  },
  qtyBtn: {
    width: 36, height: 36, borderRadius: VRX.lg,
    background: V.secondary, color: V.text, border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  cta: {
    width: "100%", height: 48, borderRadius: VRX.md, border: "none",
    background: V.primary, color: V.primaryFg,
    fontSize: 16, fontWeight: 500,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    padding: "0 16px", boxShadow: V_CTA_SHADOW,
  },
  discountBadge: {
    background: V.primary, color: V.primaryFg,
    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, lineHeight: 1.4,
  },
  featuredBadge: {
    background: V.secondary, color: V.text,
    fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 6, lineHeight: 1.4,
  },
  soldOut: {
    position: "absolute", inset: 0,
    background: mix(V.bg, 75), backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4,
  },
  soldOutText: { fontSize: 14, fontWeight: 500, color: V.mutedFg, letterSpacing: "0.05em", textTransform: "uppercase" },
  mNav: {
    position: "sticky", top: 0, zIndex: 20,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px",
    background: mix(V.bg, 95), backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderBottom: `1px solid ${mix(V.border, 40)}`,
  },
  mCtaBar: {
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
    maxWidth: 512, margin: "0 auto", padding: 16,
    background: mix(V.bg, 80), backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    borderTop: `1px solid ${V.border}`,
  },
}
