"use client"

// Detalle de producto PROPIO del tema menu — port fiel de MenuProductDetail
// (legacy components/templates/menu/product-detail.tsx) adaptado al slot
// ThemeProductSheetProps del registry: en previews el detalle abre como
// drawer lateral themeado (la página del legacy era full-screen; acá el
// contenido es el mismo — sticky nav "Menú", hero 4:3, thumbnails,
// selectores de variante por attributes, cantidad, descripción colapsable y
// CTA con precio total). Colores por tokens --bl-* (paleta legacy ya en seed).

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { colorImagesForSelection } from "@/components/storefront-v2/template/template-renderer"
import type {
  TemplateProduct,
  TemplateVariant,
} from "@/components/storefront-v2/template/template-renderer"
import type { ThemeProductSheetProps } from "../registry"
import { BG_BLUR_85, BG_BLUR_95, GRAY_300, GRAY_400, SURFACE_75, SURFACE_DIM, fmtMenuPrice, productInStock } from "./format"

export function MenuProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  if (!product) return null
  // key por producto: resetea selección/cantidad al cambiar de plato.
  return <MenuProductSheetInner key={product.id} product={product} currency={store.currency} onClose={onClose} />
}

function MenuProductSheetInner({
  product,
  currency,
  onClose,
}: {
  product: TemplateProduct
  currency?: string | null
  onClose: () => void
}) {
  const { addItem, updateQuantity, items, setIsOpen, totalItems } = useCart()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const fmt = (n: number) => fmtMenuPrice(n, currency)

  // Fotos por color: si el color elegido tiene imágenes propias, la galería usa
  // esas; si no, cae a la galería base.
  const baseImages = product.images?.length ? product.images : [product.image ?? "/placeholder.svg"]
  const colorImgs = colorImagesForSelection(product, selectedOptions)
  const images = colorImgs ?? baseImages
  const variants: TemplateVariant[] = product.variants ?? []

  useEffect(() => {
    setSelectedImage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorImgs?.join("|")])
  const inStock = productInStock(product)

  // Ejes seleccionables: attributes con role 'variant' (o sin role — mismo
  // criterio que el contrato de TemplateAttribute).
  const variantAttrs = (product.attributes ?? []).filter(
    (a) => !a.role || a.role === "variant",
  )

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return null
    return (
      variants.find((v) =>
        Object.entries(selectedOptions).every(([key, val]) => v.combination[key] === val),
      ) ?? null
    )
  }, [variants, selectedOptions])

  const finalPrice = product.price + (selectedVariant?.priceAdjustment ?? 0)

  const canAdd =
    inStock &&
    (variantAttrs.length === 0 || Object.keys(selectedOptions).length === variantAttrs.length)

  function handleAdd() {
    if (!canAdd) return
    const hasSelections = Object.keys(selectedOptions).length > 0
    const variantLabel = hasSelections
      ? Object.entries(selectedOptions)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : undefined
    // id compuesto: opciones ordenadas alfabéticamente por attr (legacy).
    const optionsKey = hasSelections
      ? Object.entries(selectedOptions)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, v]) => v)
          .join("-")
      : ""
    const id = optionsKey ? `${product.id}-${optionsKey}` : product.id
    const existing = items.find((i) => i.id === id)
    addItem({
      id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: finalPrice,
      image: selectedVariant?.image ?? images[0],
      variant: variantLabel,
    })
    if (quantity > 1) {
      const baseQty = existing ? existing.quantity : 0
      updateQuantity(id, baseQty + quantity)
    }
    setAdded(true)
    setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <style dangerouslySetInnerHTML={{ __html: SHEET_STYLES }} />
      <div
        style={S.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        {/* Sticky nav: volver al menú + carrito con badge */}
        <div style={S.topBar}>
          <button type="button" onClick={onClose} className="bl-menudetail-back" style={S.backBtn}>
            <ArrowLeft size={16} aria-hidden="true" />
            Menú
          </button>
          <button
            type="button"
            className="bl-menudetail-cartbtn"
            onClick={() => {
              setIsOpen(true)
              onClose()
            }}
            aria-label="Ver pedido"
            style={S.cartBtn}
          >
            <ShoppingBag size={16} aria-hidden="true" />
            {totalItems > 0 && <span style={S.cartBadge}>{totalItems}</span>}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Hero 4:3 */}
          <div style={S.heroWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[selectedImage]} alt={product.name} style={S.heroImg} />
            {!inStock && (
              <div style={S.soldOutOverlay}>
                <span style={S.soldOutText}>No disponible</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={S.thumbsRow} role="tablist" aria-label="Imágenes del plato">
              {images.map((img, idx) => {
                const active = idx === selectedImage
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Ver imagen ${idx + 1} de ${images.length}`}
                    onClick={() => setSelectedImage(idx)}
                    className="bl-menudetail-thumb"
                    style={{
                      ...S.thumbBtn,
                      opacity: active ? 1 : 0.6,
                      borderColor: active ? "var(--bl-primary)" : "transparent",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                )
              })}
            </div>
          )}

          {/* Detalles */}
          <div style={S.details}>
            <div>
              {product.category && <p style={S.category}>{product.category}</p>}
              <h1 style={S.title}>{product.name}</h1>
            </div>

            <span style={S.price}>{fmt(finalPrice)}</span>

            {/* Selectores de variante (Punto / Sabor / Tamaño…) */}
            {variantAttrs.map((attr) => (
              <div key={attr.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={S.attrLabel}>
                  {attr.name}
                  {selectedOptions[attr.name] && (
                    <span style={S.attrValue}> — {selectedOptions[attr.name]}</span>
                  )}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {attr.options.map((option) => {
                    const isSelected = selectedOptions[attr.name] === option
                    // Disponible si no hay variants reales, si las variants no
                    // combinan este attr, o si alguna combinación con la
                    // opción está isAvailable.
                    const attrInVariants = variants.some((v) => attr.name in v.combination)
                    const isAvailable =
                      variants.length === 0 ||
                      !attrInVariants ||
                      variants.some((v) => v.combination[attr.name] === option && v.isAvailable)
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, [attr.name]: option }))
                        }
                        disabled={!isAvailable}
                        aria-pressed={isSelected}
                        aria-label={`${attr.name}: ${option}${isAvailable ? "" : " — no disponible"}`}
                        className="bl-menudetail-opt"
                        style={{
                          ...S.optionBtn,
                          ...(isSelected
                            ? { background: "var(--bl-primary)", color: "#fff", borderColor: "transparent", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
                            : isAvailable
                              ? { background: "var(--bl-surface)", color: "var(--bl-text-muted)", borderColor: "var(--bl-border)" }
                              : {
                                  background: SURFACE_DIM,
                                  color: GRAY_300,
                                  borderColor: "transparent",
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
              </div>
            ))}

            {/* Cantidad */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={S.attrLabel}>Cantidad</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  type="button"
                  aria-label="Disminuir cantidad"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  style={{ ...S.qtyBtn, opacity: quantity <= 1 ? 0.5 : 1, cursor: quantity <= 1 ? "not-allowed" : "pointer" }}
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <span style={S.qtyValue} aria-live="polite" aria-label={`Cantidad: ${quantity}`}>
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={S.qtyBtn}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Descripción colapsable */}
            {product.description && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowFullDesc((v) => !v)}
                  aria-expanded={showFullDesc}
                  aria-controls="bl-menu-desc"
                  className="bl-menudetail-desc-toggle"
                  style={S.descToggle}
                >
                  Descripción
                  {showFullDesc ? (
                    <ChevronUp size={14} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={14} aria-hidden="true" />
                  )}
                </button>
                <p
                  id="bl-menu-desc"
                  style={{
                    ...S.descText,
                    ...(showFullDesc
                      ? {}
                      : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }),
                  }}
                >
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA fija inferior */}
        <div style={S.ctaBar}>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            aria-label={
              canAdd
                ? `Agregar ${quantity} al pedido — ${fmt(finalPrice * quantity)}`
                : "Selecciona las opciones requeridas"
            }
            style={{ ...S.ctaBtn, opacity: canAdd ? 1 : 0.5, cursor: canAdd ? "pointer" : "not-allowed" }}
          >
            {added ? (
              <>
                <Check size={20} aria-hidden="true" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingBag size={20} aria-hidden="true" />
                <span style={{ flex: 1, textAlign: "left" }}>
                  {canAdd ? "Agregar al pedido" : "Selecciona las opciones"}
                </span>
                <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(finalPrice * quantity)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const SHEET_STYLES = `
.bl-menudetail-back:hover { color: var(--bl-text) !important; }
.bl-menudetail-cartbtn:hover { background: ${SURFACE_75}; }
.bl-menudetail-thumb:hover { opacity: 1 !important; }
.bl-menudetail-desc-toggle:hover { color: var(--bl-text) !important; }
.bl-menudetail-opt { transition: all .2s ease; }
`

const S: Record<string, CSSProperties> = {
  // z 400: por encima del modal de preview (300), igual que los sheets genéricos.
  overlay: { position: "fixed", inset: 0, background: "rgba(10,15,31,0.5)", zIndex: 400, display: "flex", justifyContent: "flex-end" },
  sheet: {
    background: "var(--bl-background)", width: "100%", maxWidth: 480, height: "100%",
    display: "flex", flexDirection: "column", fontFamily: "var(--bl-body-font)", color: "var(--bl-text)",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px",
    borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "var(--bl-border)",
    background: BG_BLUR_95, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    flexShrink: 0,
  },
  backBtn: {
    display: "flex", alignItems: "center", gap: 6, fontSize: 14,
    color: "var(--bl-text-muted)", background: "none", border: "none",
    cursor: "pointer", fontFamily: "inherit", padding: 0, transition: "color .15s ease",
  },
  cartBtn: {
    position: "relative", width: 36, height: 36, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "none", border: "none", cursor: "pointer",
    color: "var(--bl-text-muted)", transition: "background .15s ease",
  },
  cartBadge: {
    position: "absolute", top: -4, right: -4, width: 16, height: 16,
    borderRadius: "50%", background: "var(--bl-primary)", color: "#fff",
    fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
  },
  heroWrap: { position: "relative", aspectRatio: "4 / 3", overflow: "hidden", background: SURFACE_DIM },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  soldOutOverlay: {
    position: "absolute", inset: 0, background: SURFACE_75,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  soldOutText: {
    fontSize: 14, fontWeight: 500, color: "var(--bl-text-muted)",
    textTransform: "uppercase", letterSpacing: "0.05em",
  },
  thumbsRow: { display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto" },
  thumbBtn: {
    flexShrink: 0, width: 56, height: 56, borderRadius: 8, overflow: "hidden",
    borderWidth: 2, borderStyle: "solid", padding: 0, cursor: "pointer",
    background: "none", transition: "all .2s ease",
  },
  details: { padding: "20px 16px 24px", display: "flex", flexDirection: "column", gap: 20 },
  category: {
    fontSize: 12, color: GRAY_400, textTransform: "uppercase",
    letterSpacing: "0.05em", margin: "0 0 4px",
  },
  title: {
    fontSize: 24, fontWeight: 700, color: "var(--bl-text)", lineHeight: 1.25,
    fontFamily: "var(--bl-heading-font)", margin: 0,
  },
  price: { fontSize: 24, fontWeight: 700, color: "var(--bl-primary)" },
  attrLabel: {
    fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em",
    color: "var(--bl-text-muted)", fontWeight: 500, margin: 0,
  },
  attrValue: { color: "var(--bl-text)", marginLeft: 6, textTransform: "none", letterSpacing: "normal" },
  optionBtn: {
    padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 500,
    borderWidth: 1, borderStyle: "solid", cursor: "pointer", fontFamily: "inherit",
  },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 8, border: "none",
    background: SURFACE_DIM, color: "var(--bl-text)",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  qtyValue: {
    width: 40, textAlign: "center", fontSize: 14, fontWeight: 500,
    color: "var(--bl-text)", fontVariantNumeric: "tabular-nums",
  },
  descToggle: {
    display: "flex", alignItems: "center", gap: 6, fontSize: 12,
    textTransform: "uppercase", letterSpacing: "0.05em",
    color: "var(--bl-text-muted)", fontWeight: 500,
    background: "none", border: "none", cursor: "pointer", padding: 0,
    fontFamily: "inherit", transition: "color .15s ease", alignSelf: "flex-start",
  },
  descText: { fontSize: 14, color: "var(--bl-text-muted)", lineHeight: 1.625, margin: 0 },
  ctaBar: {
    padding: 16, flexShrink: 0,
    borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--bl-border)",
    background: BG_BLUR_85, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
  },
  ctaBtn: {
    width: "100%", height: 48, display: "flex", alignItems: "center", gap: 12,
    padding: "0 20px", borderRadius: 12, border: "none",
    background: "var(--bl-primary)", color: "#fff",
    fontSize: 16, fontWeight: 600, fontFamily: "inherit", justifyContent: "center",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.15)",
  },
}
