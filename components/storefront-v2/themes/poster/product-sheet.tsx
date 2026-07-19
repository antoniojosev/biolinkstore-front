"use client"

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import { ArrowLeft, Check, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import type { ThemeProductSheetProps } from "../registry"
import { colorImagesForSelection } from "@/components/storefront-v2/template/template-renderer"
import type { TemplateProduct, TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import {
  POSTER,
  POSTER_STYLES,
  buildLabel,
  cream,
  deep,
  echoFrom,
  gold,
  makeFmt,
} from "./shared"

/**
 * PosterProductSheet — detalle PROPIO del tema: flujo "Arma tu…" (spec §4).
 * Takeover full-screen fiel a la página legacy: topbar sticky, hero dish
 * rotado con echo, tamaños (attrs variant), "Lleva incluido"
 * (role ingredient-included, toggle para quitar), "Súmale extras"
 * (role ingredient-extra con optionsMeta.priceDelta), cantidad y total en
 * vivo en el sticky bottom. Configuraciones distintas = líneas de carrito
 * distintas (id firmado).
 */
export function PosterProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  if (!product) return null
  return <PosterDetail key={product.id} product={product} store={store} onClose={onClose} />
}

function PosterDetail({
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

  // ── attrs por rol (spec §4.4) ─────────────────────────────────────────────
  const variantAttrs = (product.attributes ?? []).filter((a) => !a.role || a.role === "variant")
  const sizeAttr =
    variantAttrs.find((a) => a.name.toLowerCase().includes("tama")) ?? variantAttrs[0]
  const includedAttr = (product.attributes ?? []).find((a) => a.role === "ingredient-included")
  const extrasAttr = (product.attributes ?? []).find((a) => a.role === "ingredient-extra")
  const customizable = Boolean(includedAttr || extrasAttr)

  // ── selección ─────────────────────────────────────────────────────────────
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizeAttr?.options[0])
  const [removedIncluded, setRemovedIncluded] = useState<Set<string>>(new Set())
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set())
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const selectedVariant = useMemo(() => {
    if (!sizeAttr || !selectedSize) return null
    return product.variants?.find((v) => v.combination[sizeAttr.name] === selectedSize) ?? null
  }, [product.variants, sizeAttr, selectedSize])

  const extrasTotal = useMemo(() => {
    if (!extrasAttr) return 0
    let sum = 0
    for (const opt of selectedExtras) {
      const delta = extrasAttr.optionsMeta?.[opt]?.priceDelta
      if (delta) sum += delta
    }
    return sum
  }, [extrasAttr, selectedExtras])

  const unitPrice = product.price + (selectedVariant?.priceAdjustment ?? 0) + extrasTotal
  const totalPrice = unitPrice * quantity

  // Fotos por color: cableado defensivo. Si algún atributo color con imágenes
  // aplica al tamaño elegido usa su primera foto; si no (caso típico del menú),
  // colorImgs es null y usa la galería base.
  const colorImgs = colorImagesForSelection(
    product,
    sizeAttr && selectedSize ? { [sizeAttr.name]: selectedSize } : {},
  )
  const hero = colorImgs?.[0] ?? product.images?.[0] ?? product.image ?? "/placeholder.svg"
  const echo = echoFrom(product.name)

  const toggleIncluded = (opt: string) =>
    setRemovedIncluded((prev) => {
      const next = new Set(prev)
      if (next.has(opt)) next.delete(opt)
      else next.add(opt)
      return next
    })
  const toggleExtra = (opt: string) =>
    setSelectedExtras((prev) => {
      const next = new Set(prev)
      if (next.has(opt)) next.delete(opt)
      else next.add(opt)
      return next
    })

  const handleAdd = () => {
    if (!cart) return
    const parts: string[] = []
    if (sizeAttr && selectedSize) parts.push(`${sizeAttr.name}: ${selectedSize}`)
    if (removedIncluded.size > 0) parts.push(`Sin: ${Array.from(removedIncluded).join(", ")}`)
    if (extrasAttr && selectedExtras.size > 0)
      parts.push(`Extras: ${Array.from(selectedExtras).join(", ")}`)
    const variantLabel = parts.join(" · ")

    // Firma: configuraciones distintas = líneas distintas del pedido.
    const signature = [
      selectedSize ?? "",
      Array.from(removedIncluded).sort().join(","),
      Array.from(selectedExtras).sort().join(","),
    ].join("|")
    const id = `${product.id}-${signature}`

    const existing = cart.items.find((i) => i.id === id)
    cart.addItem({
      id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: unitPrice,
      image: hero,
      variant: variantLabel || undefined,
    })
    if (quantity > 1) {
      const baseQty = existing ? existing.quantity : 0
      cart.updateQuantity(id, baseQty + quantity)
    }
    setAdded(true)
    cart.setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div
      className="bl-poster-root"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      style={S.overlay}
    >
      <style dangerouslySetInnerHTML={{ __html: POSTER_STYLES }} />

      {/* Topbar sticky */}
      <nav style={S.topbar}>
        <button
          type="button"
          className="bl-poster-iconbtn"
          onClick={onClose}
          aria-label="Volver al menú"
          style={S.backBtn}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={S.topbarName}>{store.name}</div>
          <span style={S.topbarSub}>{customizable ? "Personalizar pedido" : "Pedido"}</span>
        </div>
        <div style={{ width: 40, height: 40 }} aria-hidden="true" />
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Hero dish */}
        <section style={S.heroSection}>
          <div aria-hidden="true" style={S.echo}>
            {echo}
          </div>
          <div
            style={{ ...S.dish, backgroundImage: `url(${hero})` }}
            role="img"
            aria-label={product.name}
          />
          {customizable && (
            <div style={S.buildBadge}>
              <Star style={{ width: 13, height: 13 }} fill="currentColor" aria-hidden="true" />
              {buildLabel(product.name)}
            </div>
          )}
        </section>

        {/* Title block */}
        <div style={{ padding: "8px 24px 20px", textAlign: "center" }}>
          {(product.tagline ?? product.category) && (
            <p style={S.titleKicker}>{product.tagline ?? product.category}</p>
          )}
          <h2 style={S.title}>{product.name}</h2>
          {product.description && <p style={S.description}>{product.description}</p>}
        </div>

        {/* ── Tamaño ── */}
        {sizeAttr && sizeAttr.options.length > 0 && (
          <Section title={sizeAttr.name} hint="Elegí 1">
            <div className="bl-poster-sizes" role="radiogroup" aria-label={sizeAttr.name} style={S.sizes}>
              {sizeAttr.options.map((opt) => {
                const variant = product.variants?.find((v) => v.combination[sizeAttr.name] === opt)
                const delta = variant?.priceAdjustment ?? 0
                const selected = selectedSize === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedSize(opt)}
                    className={`bl-poster-sizechip${selected ? " is-selected" : ""}`}
                    style={{
                      ...S.sizeChip,
                      ...(selected
                        ? { border: `1.5px solid ${POSTER.cream}`, background: POSTER.cream, color: "var(--bl-background)" }
                        : { border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: POSTER.cream }),
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{opt}</span>
                    <span
                      style={{
                        fontFamily: POSTER.anton,
                        fontSize: 16,
                        letterSpacing: ".02em",
                        color: selected ? deep(85) : POSTER.goldSoft,
                      }}
                    >
                      {fmt(product.price + delta)}
                    </span>
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        {/* ── Lleva incluido ── */}
        {includedAttr && includedAttr.options.length > 0 && (
          <Section title="Lleva incluido" hint="Toca para quitar">
            <div style={S.chipWrap}>
              {includedAttr.options.map((opt) => {
                const removed = removedIncluded.has(opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={!removed}
                    onClick={() => toggleIncluded(opt)}
                    style={{
                      ...S.includedChip,
                      ...(removed
                        ? {
                            border: "1.5px solid rgba(255,255,255,.15)",
                            background: "transparent",
                            color: cream(50),
                            textDecoration: "line-through",
                          }
                        : {
                            border: `1.5px solid color-mix(in srgb, ${POSTER.green} 50%, transparent)`,
                            background: `color-mix(in srgb, ${POSTER.green} 15%, transparent)`,
                            color: POSTER.cream,
                          }),
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        ...S.checkCircle,
                        ...(removed
                          ? { background: "rgba(255,255,255,.15)" }
                          : { background: POSTER.green, color: "var(--bl-background)" }),
                      }}
                    >
                      {!removed && <Check style={{ width: 12, height: 12 }} strokeWidth={3} />}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        {/* ── Súmale extras ── */}
        {extrasAttr && extrasAttr.options.length > 0 && (
          <Section title="Súmale extras" hint="Cuantos quieras">
            <div style={S.chipWrap}>
              {extrasAttr.options.map((opt) => {
                const selected = selectedExtras.has(opt)
                const delta = extrasAttr.optionsMeta?.[opt]?.priceDelta
                return (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleExtra(opt)}
                    className={`bl-poster-extrachip${selected ? " is-selected" : ""}`}
                    style={{
                      ...S.extraChip,
                      ...(selected
                        ? {
                            border: "1.5px solid var(--bl-secondary)",
                            background: POSTER.gold,
                            fontWeight: 700,
                            color: "var(--bl-background)",
                            boxShadow: "0 6px 14px -4px rgba(244,162,58,.6)",
                          }
                        : {
                            border: `1.5px solid ${gold(30)}`,
                            background: gold(10),
                            fontWeight: 500,
                            color: POSTER.cream,
                          }),
                    }}
                  >
                    {opt}
                    {typeof delta === "number" && (
                      <span
                        style={{
                          ...S.deltaPill,
                          ...(selected
                            ? { background: deep(15), color: "var(--bl-background)" }
                            : { background: gold(25), color: POSTER.goldSoft }),
                        }}
                      >
                        {delta > 0 ? `+${fmt(delta)}` : fmt(delta)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        {/* ── Cantidad ── */}
        <Section title="Cantidad">
          <div style={S.qtyGroup} role="group" aria-label="Seleccionar cantidad">
            <button
              type="button"
              className="bl-poster-qtybtn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity === 1}
              style={{ ...S.qtyBtn, opacity: quantity === 1 ? 0.4 : 1 }}
              aria-label="Quitar uno"
            >
              <Minus style={{ width: 16, height: 16 }} aria-hidden="true" />
            </button>
            <span style={S.qtyValue} aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="bl-poster-qtybtn"
              onClick={() => setQuantity((q) => q + 1)}
              style={S.qtyBtn}
              aria-label="Agregar uno"
            >
              <Plus style={{ width: 16, height: 16 }} aria-hidden="true" />
            </button>
          </div>
        </Section>
      </div>

      {/* Sticky bottom — total en vivo */}
      <div style={S.stickyBottom}>
        <div style={S.totalCard}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={S.totalLabel}>Total</span>
            {/* key={totalPrice}: re-monta el monto y dispara el pulso CSS al cambiar (HTML aprobado: GSAP scale 1.08 yoyo) */}
            <strong key={totalPrice} className="bl-poster-pulse" style={S.totalAmount}>
              {fmt(totalPrice)}
            </strong>
          </div>
          <button
            type="button"
            className="bl-poster-addbtn"
            onClick={handleAdd}
            disabled={!cart}
            style={S.addBtn}
            aria-label={`Agregar al carrito — ${fmt(totalPrice)}`}
          >
            {added ? (
              <>
                <Check style={{ width: 18, height: 18 }} strokeWidth={2.5} />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart style={{ width: 18, height: 18 }} strokeWidth={2.2} />
                <span>
                  Agregar<span className="bl-poster-cart-suffix"> al carrito</span>
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section style={{ maxWidth: 540, margin: "0 auto", padding: "24px 20px 0" }}>
      <div style={{ marginBottom: 14, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h3 style={S.sectionTitle}>{title}</h3>
        {hint && <span style={S.sectionHint}>{hint}</span>}
      </div>
      {children}
    </section>
  )
}

const S: Record<string, CSSProperties> = {
  // z 400: mismo plano que los sheets genéricos (por encima del modal de
  // preview, 300); el cart drawer va después en el DOM y queda arriba.
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 400,
    overflowY: "auto",
    paddingBottom: 130,
    background: POSTER.pageBackground,
    color: POSTER.cream,
    fontFamily: POSTER.inter,
    containerType: "inline-size",
    containerName: "bl-poster-sheet",
  },
  topbar: {
    position: "sticky", top: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,.05)",
    padding: "14px 20px",
    background: POSTER.topbarGradient,
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
  },
  backBtn: {
    display: "grid", placeItems: "center", width: 40, height: 40,
    borderRadius: 999, border: "none", background: "rgba(255,255,255,.1)",
    color: POSTER.cream, cursor: "pointer",
  },
  topbarName: {
    fontFamily: POSTER.anton, fontSize: 16, letterSpacing: ".04em",
    lineHeight: 1, textTransform: "uppercase",
  },
  topbarSub: {
    display: "block", marginTop: 2, lineHeight: 1,
    fontFamily: POSTER.allura, fontSize: 14, color: POSTER.goldSoft,
  },
  heroSection: {
    position: "relative", display: "grid", placeItems: "center",
    overflow: "hidden", height: "clamp(260px, 56cqw, 360px)",
  },
  echo: {
    pointerEvents: "none", position: "absolute", inset: 0,
    display: "grid", placeItems: "center", userSelect: "none",
    color: "transparent",
    fontFamily: POSTER.anton,
    fontSize: "clamp(76px, 20cqw, 140px)",
    letterSpacing: "-.02em", lineHeight: 1,
    WebkitTextStroke: "2px rgba(255,255,255,.09)",
  },
  dish: {
    position: "relative", zIndex: 1,
    aspectRatio: "1 / 1", width: "62%", maxWidth: 280,
    borderRadius: "50%", backgroundSize: "cover", backgroundPosition: "center",
    transform: "rotate(-3deg)",
    boxShadow: "0 24px 50px -12px rgba(0,0,0,.7), inset 0 0 0 6px rgba(255,255,255,.1)",
  },
  buildBadge: {
    position: "absolute", left: 16, top: 14, zIndex: 5,
    display: "inline-flex", alignItems: "center", gap: 6,
    borderRadius: 999, padding: "6px 12px 6px 8px",
    fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em",
    color: "#4a0a0a",
    background: POSTER.goldGradient,
    boxShadow: "0 6px 14px -4px rgba(244,162,58,.7)",
  },
  titleKicker: { margin: 0, lineHeight: 1, fontFamily: POSTER.allura, fontSize: 32, color: POSTER.goldSoft },
  title: {
    margin: "4px 0 0",
    fontFamily: POSTER.anton, fontWeight: 400,
    fontSize: "clamp(30px, 7.5cqw, 48px)",
    lineHeight: 0.95, textTransform: "uppercase",
    backgroundImage: POSTER.titleGradient,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  description: {
    margin: "12px auto 0", maxWidth: 380,
    fontSize: 13.5, lineHeight: 1.6, opacity: 0.75,
  },
  sectionTitle: {
    margin: 0, fontFamily: POSTER.anton, fontWeight: 400, fontSize: 20,
    letterSpacing: ".04em", textTransform: "uppercase",
  },
  sectionHint: { fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", opacity: 0.55 },
  sizes: { display: "flex", flexDirection: "column", gap: 8 },
  sizeChip: {
    display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
    borderRadius: 999, padding: "12px 18px",
    fontFamily: "inherit", fontSize: 14, cursor: "pointer",
  },
  chipWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  includedChip: {
    display: "inline-flex", alignItems: "center", gap: 8,
    borderRadius: 999, padding: "10px 14px",
    fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer",
    transition: "all .2s ease",
  },
  checkCircle: {
    display: "grid", placeItems: "center", width: 18, height: 18,
    borderRadius: 999, flexShrink: 0,
  },
  extraChip: {
    display: "inline-flex", alignItems: "center", gap: 8,
    borderRadius: 999, padding: "10px 14px",
    fontFamily: "inherit", fontSize: 14, cursor: "pointer",
  },
  deltaPill: { borderRadius: 6, padding: "2px 6px", fontSize: 11 },
  qtyGroup: {
    display: "inline-flex", alignItems: "center", gap: 12,
    borderRadius: 999, border: "1px solid rgba(255,255,255,.1)",
    background: "rgba(255,255,255,.06)", padding: 4,
  },
  qtyBtn: {
    display: "grid", placeItems: "center", width: 40, height: 40,
    borderRadius: 999, border: "none", background: "transparent",
    color: POSTER.cream, cursor: "pointer", transition: "background .2s ease",
  },
  qtyValue: {
    minWidth: 24, textAlign: "center", lineHeight: 1,
    fontFamily: POSTER.anton, fontSize: 22, fontVariantNumeric: "tabular-nums",
  },
  stickyBottom: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
    padding: "24px 16px 20px",
    background: POSTER.stickyGradient,
  },
  totalCard: {
    margin: "0 auto", maxWidth: 540,
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    borderRadius: 24, background: POSTER.cream, color: "var(--bl-background)",
    padding: "12px 12px 12px 20px",
    boxShadow: "0 18px 40px -8px rgba(0,0,0,.6)",
  },
  totalLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", opacity: 0.65 },
  totalAmount: { fontFamily: POSTER.anton, fontWeight: 400, fontSize: 26, lineHeight: 1 },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
    borderRadius: 999, border: "none",
    background: "var(--bl-background)", color: POSTER.cream,
    padding: "12px 20px",
    fontFamily: "inherit", fontSize: 13, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: ".05em", cursor: "pointer",
  },
}
