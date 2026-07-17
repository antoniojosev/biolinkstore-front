"use client"

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import { ArrowLeft, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus, Share2, ShoppingBag } from "lucide-react"
import type { ThemeProductSheetProps } from "../registry"
import type { TemplateProduct, TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import { catalogFmt, ColorSwatch, mix, useShare } from "../shared/catalog-shell/support"
import { addSelectionToCart, optionAvailable, useProductSelection } from "../shared/catalog-shell/variants"
import { L, LRX, LUXORA_CSS, L_CTA_SHADOW } from "./shared"

/**
 * LuxoraProductSheet — detalle PROPIO del tema (spec luxora §4). En el legacy
 * era una página; acá es el slot del registry que usan los previews: takeover
 * monocromo con top bar (volver/share/carrito negro), galería cuadrada
 * rounded-2xl con thumbnails en ancho y flechas circulares + DOTS pastilla en
 * angosto, badge SALE fijo, swatches de color por optionsMeta.hex (el swap de
 * galería usa la imagen de la variante matcheada — ver variants.ts), pills
 * redondas de variante, stepper unido, descripción acordeón (oculta por
 * completo hasta abrir, sin line-clamp — diferencia clave vs vitrina), y CTA
 * negro h-14 justify-between con precio total en vivo y estado verde
 * "Agregado". Agrega las N unidades elegidas (loop de qty del legacy §4.2).
 */
export function LuxoraProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  if (!product) return null
  return <LuxoraDetail key={product.id} product={product} store={store} onClose={onClose} />
}

function LuxoraDetail({
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

  // Spec §4.2: isOnSale = comparePrice > finalPrice; badge fijo "SALE" sin %.
  const isOnSale = product.compareAtPrice != null && product.compareAtPrice > sel.finalPrice
  const canAdd = sel.canAdd && cart != null

  const handleAdd = () => {
    if (!canAdd || !cart) return
    addSelectionToCart(cart, product, sel)
    setAdded(true)
    cart.setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleShare = () => share(window.location.href, product.name)

  // ── selectores de variantes (spec §4.1: valor elegido en bold, sin guión) ──
  const variantSelectors = sel.variantAttrs.map((attr) => (
    <div key={attr.name} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={S.attrLabel}>
        {attr.name}
        {sel.selectedOptions[attr.name] && (
          <span style={{ color: L.ink, marginLeft: 6, textTransform: "none", letterSpacing: "normal", fontWeight: 700 }}>
            {sel.selectedOptions[attr.name]}
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
              labelColor={L.muted}
              labelSelectedColor={L.ink}
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
                className="bl-luxora-textopt"
                data-state={isSelected ? "selected" : isAvailable ? "available" : "soldout"}
                onClick={() => isAvailable && sel.selectOption(attr.name, option)}
                disabled={!isAvailable}
                style={{
                  ...S.textOpt,
                  ...(isSelected
                    ? { background: L.ink, color: L.bg }
                    : isAvailable
                      ? { background: L.surface, color: L.text2 }
                      : { background: mix(L.surface, 50), color: L.muted3, textDecoration: "line-through", cursor: "not-allowed" }),
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

  // Stepper unido rounded-xl (spec §4: botones 40px hover surface, valor bold).
  const qtyStepper = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={S.attrLabel}>Cantidad</p>
      <div style={S.stepper}>
        <button type="button" className="bl-luxora-stepbtn" onClick={() => sel.setQuantity((q) => Math.max(1, q - 1))} aria-label="Quitar uno" style={S.stepBtn}>
          <Minus style={{ width: 14, height: 14 }} />
        </button>
        <span style={{ width: 40, textAlign: "center", fontSize: 14, fontWeight: 700, color: L.ink }}>{sel.quantity}</span>
        <button type="button" className="bl-luxora-stepbtn" onClick={() => sel.setQuantity((q) => q + 1)} aria-label="Agregar uno" style={S.stepBtn}>
          <Plus style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  )

  const hairline = <div style={{ height: 1, background: L.hairline }} />

  // Acordeón: contenido oculto POR COMPLETO hasta abrir (spec §4, sin clamp).
  const description = product.description ? (
    <>
      {hairline}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          type="button"
          onClick={() => setShowFullDesc((v) => !v)}
          style={S.descToggle}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: L.ink }}>Descripción</span>
          {showFullDesc ? (
            <ChevronUp style={{ width: 16, height: 16, color: L.muted }} />
          ) : (
            <ChevronDown style={{ width: 16, height: 16, color: L.muted }} />
          )}
        </button>
        {showFullDesc && (
          <p style={{ margin: 0, fontSize: 14, color: L.text2, lineHeight: 1.6 }}>{product.description}</p>
        )}
      </div>
    </>
  ) : null

  const titleBlock = (titleSize: number, priceSize: number, compareSize: number) => (
    <div>
      <h1 style={{ margin: 0, fontSize: titleSize, fontWeight: 900, lineHeight: 1.25, color: L.ink }}>{product.name}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: titleSize >= 30 ? 12 : 8 }}>
        <span style={{ fontSize: priceSize, fontWeight: 700, color: L.ink }}>{fmt(sel.finalPrice)}</span>
        {isOnSale && (
          <span style={{ fontSize: compareSize, color: L.muted, textDecoration: "line-through" }}>
            {fmt(product.compareAtPrice!)}
          </span>
        )}
      </div>
      {product.category && <p style={{ margin: "4px 0 0", fontSize: 12, color: L.muted }}>{product.category}</p>}
    </div>
  )

  // CTA negro justify-between con precio total (spec §4: added → verde).
  const ctaBtn = (
    <button
      type="button"
      className={added || !canAdd ? "" : "bl-luxora-inkbtn"}
      onClick={handleAdd}
      disabled={!canAdd}
      style={{
        ...S.cta,
        ...(added
          ? { background: L.success, color: "#fff" }
          : canAdd
            ? { background: L.ink, color: L.bg, cursor: "pointer" }
            : { background: L.borderStrong, color: L.muted, cursor: "not-allowed" }),
      }}
    >
      <span>{added ? "Agregado" : "Agregar al carrito"}</span>
      <span style={{ fontWeight: 700 }}>{fmt(sel.finalPrice * sel.quantity)}</span>
    </button>
  )

  const saleBadge = isOnSale && <div style={S.saleBadge}>SALE</div>

  const soldOutOverlay = !sel.inStock && (
    <div style={S.soldOut}>
      <span style={S.soldOutText}>Agotado</span>
    </div>
  )

  const thumbs = sel.images.length > 1 && (
    <div className="bl-luxora-thumbs" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {sel.images.map((img, idx) => (
        <button
          key={idx}
          type="button"
          className="bl-luxora-thumb"
          data-active={idx === sel.selectedImage}
          onClick={() => sel.setSelectedImage(idx)}
          style={{
            flexShrink: 0, width: 64, height: 64, borderRadius: LRX.xl, overflow: "hidden",
            padding: 0, cursor: "pointer", background: L.imageBg,
            border: idx === sel.selectedImage ? `2px solid ${L.ink}` : "2px solid transparent",
            opacity: idx === sel.selectedImage ? 1 : 0.5,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </button>
      ))}
    </div>
  )

  const iconBtn = (onClick: () => void, label: string, children: ReactNode) => (
    <button type="button" className="bl-luxora-iconbtn" onClick={onClick} aria-label={label} style={S.iconBtn}>
      {children}
    </button>
  )

  const shareIcon = copied ? (
    <Check style={{ width: 16, height: 16, color: L.ink }} strokeWidth={2.5} />
  ) : (
    <Share2 style={{ width: 16, height: 16, color: L.muted }} />
  )

  const prevImg = () => sel.setSelectedImage(sel.selectedImage === 0 ? sel.images.length - 1 : sel.selectedImage - 1)
  const nextImg = () => sel.setSelectedImage(sel.selectedImage === sel.images.length - 1 ? 0 : sel.selectedImage + 1)

  return (
    <div className="bl-luxora-root" role="dialog" aria-modal="true" aria-label={product.name} style={S.overlay}>
      <style dangerouslySetInnerHTML={{ __html: LUXORA_CSS + SHEET_CSS }} />

      {/* ── Layout ancho (2 columnas, spec §4 Desktop) ── */}
      <div className="bl-luxora-sheet-desktop">
        <div style={S.dTopBar}>
          <button type="button" className="bl-luxora-textlink" onClick={onClose} style={S.backLink}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Volver a la tienda
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {iconBtn(handleShare, "Compartir", shareIcon)}
            <button type="button" className="bl-luxora-inkbtn" onClick={() => cart?.setIsOpen(true)} style={S.dCartBtn}>
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
            <div style={{ position: "relative", borderRadius: LRX.xl2, overflow: "hidden", background: L.imageBg, aspectRatio: "1 / 1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sel.images[sel.selectedImage]} alt={product.name} style={S.mainImg} />
              {saleBadge}
              {soldOutOverlay}
            </div>
            {thumbs}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 8, paddingBottom: 8 }}>
            {titleBlock(30, 24, 16)}
            {hairline}
            {variantSelectors}
            {qtyStepper}
            {description}
            {ctaBtn}
          </div>
        </div>
      </div>

      {/* ── Layout angosto (spec §4 Mobile) ── */}
      <div className="bl-luxora-sheet-mobile" style={{ maxWidth: 512, margin: "0 auto" }}>
        {/* Top bar sticky SIN border-b */}
        <div style={S.mNav}>
          {iconBtn(onClose, "Volver", <ArrowLeft style={{ width: 20, height: 20, color: L.ink }} />)}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {iconBtn(handleShare, "Compartir", copied ? <Check style={{ width: 16, height: 16, color: L.ink }} strokeWidth={2.5} /> : <Share2 style={{ width: 16, height: 16, color: L.ink }} />)}
            <button type="button" className="bl-luxora-iconbtn" onClick={() => cart?.setIsOpen(true)} aria-label="Ver carrito" style={{ ...S.iconBtn, position: "relative" }}>
              <ShoppingBag style={{ width: 20, height: 20, color: L.ink }} />
              {(cart?.totalItems ?? 0) > 0 && <span style={S.mCartBadge}>{cart?.totalItems}</span>}
            </button>
          </div>
        </div>

        {/* Imagen principal con flechas circulares */}
        <div style={{ padding: "4px 20px 0" }}>
          <div style={{ position: "relative", borderRadius: LRX.xl2, overflow: "hidden", background: L.imageBg, aspectRatio: "1 / 1" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sel.images[sel.selectedImage]} alt={product.name} style={S.mainImg} />
            {soldOutOverlay}
            {saleBadge}
            {sel.images.length > 1 && (
              <>
                <button type="button" className="bl-luxora-navarrow" onClick={prevImg} aria-label="Imagen anterior" style={{ ...S.navArrow, left: 8 }}>
                  <ChevronLeft style={{ width: 16, height: 16 }} />
                </button>
                <button type="button" className="bl-luxora-navarrow" onClick={nextImg} aria-label="Imagen siguiente" style={{ ...S.navArrow, right: 8 }}>
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dots pastilla (no thumbnails en angosto — spec §4 Mobile 3) */}
        {sel.images.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "12px 0" }}>
            {sel.images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className="bl-luxora-dot"
                data-active={idx === sel.selectedImage}
                onClick={() => sel.setSelectedImage(idx)}
                aria-label={`Imagen ${idx + 1}`}
                style={{
                  border: "none", padding: 0, cursor: "pointer", borderRadius: 999,
                  ...(idx === sel.selectedImage
                    ? { width: 20, height: 8, background: L.ink }
                    : { width: 8, height: 8, background: L.dot }),
                }}
              />
            ))}
          </div>
        )}

        <div style={{ padding: "8px 20px 144px", display: "flex", flexDirection: "column", gap: 20 }}>
          {titleBlock(24, 20, 14)}
          {hairline}
          {variantSelectors}
          {qtyStepper}
          {description}
        </div>

        {/* CTA fija inferior (bg/90 blur, sin borde) */}
        <div style={S.mCtaBar}>{ctaBtn}</div>
      </div>
    </div>
  )
}

// El sheet vive en overlay propio → container query sobre su propio root.
const SHEET_CSS = `
.bl-luxora-sheet-desktop { display: none; }
@container bl-luxora-sheet (min-width: 1024px) {
  .bl-luxora-sheet-desktop { display: block; }
  .bl-luxora-sheet-mobile { display: none; }
}
`

const S: Record<string, CSSProperties> = {
  // z 400: mismo plano que los sheets genéricos; el cart drawer va después
  // en el DOM y queda arriba.
  overlay: {
    position: "fixed", inset: 0, zIndex: 400, overflowY: "auto",
    background: L.bg, color: L.ink, fontFamily: "var(--bl-body-font)",
    containerType: "inline-size", containerName: "bl-luxora-sheet",
  },
  dTopBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 32px", borderBottom: `1px solid ${L.border}`,
    maxWidth: 1152, margin: "0 auto",
  },
  backLink: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 14, color: L.muted, background: "none", border: "none",
    padding: 0, cursor: "pointer", fontFamily: "inherit",
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: LRX.xl,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", cursor: "pointer",
  },
  dCartBtn: {
    position: "relative", display: "flex", alignItems: "center", gap: 8,
    height: 36, padding: "0 16px", borderRadius: LRX.xl,
    background: L.ink, color: L.bg,
    fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
  },
  mCartBadge: {
    position: "absolute", top: -4, right: -4, width: 16, height: 16,
    borderRadius: "50%", background: L.ink, color: L.bg,
    fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
  },
  dGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64,
    maxWidth: 1152, margin: "0 auto", padding: "40px 32px", alignItems: "start",
  },
  mainImg: { width: "100%", height: "100%", objectFit: "cover", transition: "opacity .5s ease" },
  saleBadge: {
    position: "absolute", top: 12, left: 12, zIndex: 5,
    background: L.ink, color: L.bg,
    fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999, lineHeight: 1.4,
  },
  soldOut: {
    position: "absolute", inset: 0, zIndex: 4,
    background: "rgba(255,255,255,.7)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  soldOutText: { fontSize: 12, fontWeight: 600, color: L.ink, letterSpacing: "0.1em", textTransform: "uppercase" },
  navArrow: {
    position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 5,
    width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer",
    background: "rgba(255,255,255,.8)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    color: L.ink, display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 1px 2px 0 rgba(0,0,0,.05)",
  },
  attrLabel: {
    margin: 0, fontSize: 12, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.05em", color: L.muted, fontFamily: "inherit",
  },
  textOpt: {
    padding: "8px 16px", borderRadius: 999, fontSize: 14, fontWeight: 600,
    border: "none", cursor: "pointer", fontFamily: "inherit",
  },
  stepper: {
    display: "inline-flex", alignItems: "center", alignSelf: "flex-start",
    border: `1px solid ${L.borderStrong}`, borderRadius: LRX.xl, overflow: "hidden",
  },
  stepBtn: {
    width: 40, height: 40, background: "transparent", border: "none",
    cursor: "pointer", color: L.muted,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  descToggle: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", background: "none", border: "none", padding: 0,
    cursor: "pointer", fontFamily: "inherit",
  },
  cta: {
    width: "100%", height: 56, borderRadius: LRX.xl2, border: "none",
    fontSize: 14, fontWeight: 600, fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", boxShadow: L_CTA_SHADOW,
    transition: "all .2s ease",
  },
  mNav: {
    position: "sticky", top: 0, zIndex: 20,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 20px",
    background: mix(L.bg, 95), backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
  },
  mCtaBar: {
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
    maxWidth: 512, margin: "0 auto", padding: "12px 20px 24px",
    background: mix(L.bg, 90), backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
  },
}
