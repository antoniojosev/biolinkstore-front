"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { ArrowLeft, ChevronDown, ChevronUp, Minus, Plus, Share2, ShoppingCart } from "lucide-react"
import type { ThemeProductSheetProps } from "@/components/storefront-v2/themes/registry"
import type { TemplateProduct, TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import { trackEvent } from "@/lib/analytics"
import { WhatsAppPaymentProvider } from "@/lib/payment-providers/whatsapp"
import { ATELIER, ATELIER_STYLES, LINE, MUTED, pdPriceFmt } from "./shared"

/**
 * AtelierProductSheet — detail PROPIO del tema (spec §4, screen2 del HTML
 * aprobado; el legacy caía a Vitrina, así que el HTML es la única fuente).
 * "Ficha de reserva": página forest oscura con tarjeta crema flotante y
 * acento azul petróleo. Sin carrito (spec §5): "Reservar sesión" = checkout
 * WhatsApp directo de 1 item con la qty del stepper (patrón bookService de
 * profile-theme) + trackEvent CHECKOUT_START.
 *
 * Forest/crema/azul hardcoded por spec (identidad del detail, fuera de la
 * paleta de 8 tokens — ver shared.ts). El resto (ink, line, muted) por tokens.
 */
export function AtelierProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  if (!product) return null
  // key: re-monta la ficha (qty, thumb, descripción) al cambiar de servicio.
  return <AtelierDetail key={product.id} product={product} store={store} onClose={onClose} />
}

function AtelierDetail({
  product,
  store,
  onClose,
}: {
  product: TemplateProduct
  store: TemplateStore
  onClose: () => void
}) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showDesc, setShowDesc] = useState(true)
  const [loading, setLoading] = useState(false)

  const fmt = useMemo(() => pdPriceFmt(store.currency ?? "USD"), [store.currency])
  const provider = useMemo(
    () => new WhatsAppPaymentProvider(store.whatsappNumber ?? "", store.currency ?? "USD"),
    [store.whatsappNumber, store.currency],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const images = product.images?.length ? product.images : product.image ? [product.image] : []
  const total = product.price * quantity

  /** Reserva directa: checkout de 1 item con la qty del stepper (spec §4/§5). */
  async function handleReserve() {
    if (!store.whatsappNumber || loading) return
    setLoading(true)
    trackEvent(store.slug, "CHECKOUT_START", product.id)
    try {
      await provider.checkout({
        items: [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: images[0],
          },
        ],
        total,
        currency: store.currency ?? "USD",
        storeSlug: store.slug,
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else await navigator.clipboard.writeText(url)
    } catch {
      // compartir cancelado — no-op
    }
  }

  return (
    <div style={S.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={product.name}>
      <style dangerouslySetInnerHTML={{ __html: ATELIER_STYLES }} />
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        {/* Topbar (spec §4): Volver + Share/Cart. El icono de carrito existe
            en el HTML aprobado pero el tema no tiene carrito — decorativo. */}
        <div style={S.topbar}>
          <button type="button" onClick={onClose} className="bl-at-pd-back" style={S.backBtn}>
            <ArrowLeft style={{ width: 20, height: 20 }} strokeWidth={2} aria-hidden="true" />
            Volver
          </button>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button type="button" onClick={handleShare} className="bl-at-pd-back" aria-label="Compartir" style={S.iconBtn}>
              <Share2 style={{ width: 24, height: 24 }} strokeWidth={1.8} />
            </button>
            <span aria-hidden="true" style={{ ...S.iconBtn, cursor: "default" }}>
              <ShoppingCart style={{ width: 24, height: 24 }} strokeWidth={1.8} />
            </span>
          </div>
        </div>

        {/* Imagen principal + badge */}
        <div style={S.imageWrap}>
          {images[selectedImage] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={images[selectedImage]}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "color-mix(in srgb, var(--bl-background) 92%, var(--bl-text))" }} />
          )}
          {product.featured && <span style={S.badge}>Destacado</span>}
        </div>

        {/* Thumbs — seleccionada con borde azul + doble ring (spec §4) */}
        {images.length > 1 && (
          <div style={S.thumbRow}>
            {images.map((img, idx) => {
              const active = idx === selectedImage
              return (
                <button
                  key={idx}
                  type="button"
                  className="bl-at-pd-thumb"
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`Foto ${idx + 1}`}
                  aria-pressed={active}
                  style={{
                    ...S.thumb,
                    borderColor: active ? ATELIER.pdBlue : "transparent",
                    boxShadow: active ? `0 0 0 2px ${ATELIER.pdBg}, 0 0 0 4px ${ATELIER.pdBlue}` : "none",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              )
            })}
          </div>
        )}

        {/* Cuerpo — voz "ficha funcional": Inter bold, NO Fraunces (spec §4) */}
        <div style={S.body}>
          <h1 style={S.title}>{product.name}</h1>
          <p style={S.price}>{fmt(product.price)}</p>

          <p style={S.label}>Cantidad</p>
          <div style={S.qtyRow} role="group" aria-label="Seleccionar cantidad">
            <button
              type="button"
              className="bl-at-pd-qty"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity === 1}
              aria-label="Quitar uno"
              style={{ ...S.qtyBtn, opacity: quantity === 1 ? 0.5 : 1 }}
            >
              <Minus style={{ width: 18, height: 18 }} strokeWidth={2} aria-hidden="true" />
            </button>
            <span style={S.qtyVal} aria-live="polite">
              {quantity}
            </span>
            <button type="button" className="bl-at-pd-qty" onClick={() => setQuantity((q) => q + 1)} aria-label="Agregar uno" style={S.qtyBtn}>
              <Plus style={{ width: 18, height: 18 }} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {product.description && (
            <>
              <button type="button" className="bl-at-pd-back" onClick={() => setShowDesc((v) => !v)} style={S.descToggle}>
                Descripción
                {showDesc ? (
                  <ChevronUp style={{ width: 14, height: 14 }} strokeWidth={2.2} aria-hidden="true" />
                ) : (
                  <ChevronDown style={{ width: 14, height: 14 }} strokeWidth={2.2} aria-hidden="true" />
                )}
              </button>
              {showDesc && <p style={S.desc}>{product.description}</p>}
            </>
          )}
        </div>

        {/* CTA sticky dentro de la tarjeta — reserva directa por WhatsApp,
            precio en vivo × qty (spec §4). Sin carrito. */}
        {store.whatsappNumber && (
          <button
            type="button"
            className="bl-at-pd-cta"
            onClick={handleReserve}
            disabled={loading}
            aria-label={`Reservar sesión — ${fmt(total)}`}
            style={{ ...S.cta, opacity: loading ? 0.75 : 1 }}
          >
            <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, letterSpacing: "-0.005em" }}>
              {loading ? "Abriendo WhatsApp…" : "Reservar sesión"}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>{fmt(total)}</span>
          </button>
        )}
      </div>
    </div>
  )
}

const S: Record<string, CSSProperties> = {
  // z 400: mismo plano que los sheets genéricos (por encima del modal de
  // preview, 300). Fondo forest de página (HTML: padding 60/48 ÷3 ≈ 20/16).
  overlay: {
    position: "fixed", inset: 0, zIndex: 400,
    background: ATELIER.forest,
    overflowY: "auto",
    padding: "20px 16px",
    display: "flex", flexDirection: "column",
    fontFamily: "var(--bl-body-font)",
    containerType: "inline-size",
    containerName: "bl-atelier-pd",
  },
  // Sin overflow hidden/clip: rompería el sticky del CTA (el scrollport es el
  // overlay); los hijos ya traen sus propios radios/márgenes.
  card: {
    flex: 1, width: "100%", maxWidth: 520, margin: "0 auto",
    background: ATELIER.pdBg, color: "var(--bl-text)",
    borderRadius: 16,
    display: "flex", flexDirection: "column",
    boxShadow: "0 40px 80px -30px rgba(0,0,0,0.5)",
    position: "relative",
  },
  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px 8px", flexShrink: 0,
  },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontSize: 14, fontWeight: 500, color: "var(--bl-text)",
    background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
  },
  iconBtn: {
    display: "grid", placeItems: "center", width: 28, height: 28,
    background: "none", border: "none", cursor: "pointer", padding: 0,
    color: "var(--bl-text)",
  },
  imageWrap: {
    position: "relative", margin: "0 12px", borderRadius: 8, overflow: "hidden",
    aspectRatio: "1 / 1", background: "color-mix(in srgb, var(--bl-background) 92%, var(--bl-text))",
    flexShrink: 0,
  },
  badge: {
    position: "absolute", top: 10, left: 10, padding: "6px 12px",
    borderRadius: 999, background: "rgba(250,246,239,0.96)",
    fontSize: 12, fontWeight: 500, color: "var(--bl-text)",
  },
  thumbRow: { display: "flex", gap: 8, padding: "12px 12px 6px", overflowX: "auto", flexShrink: 0 },
  thumb: {
    flexShrink: 0, width: 44, height: 44, borderRadius: 6, overflow: "hidden",
    borderWidth: 1.5, borderStyle: "solid", padding: 0,
    background: "color-mix(in srgb, var(--bl-background) 92%, var(--bl-text))", cursor: "pointer",
  },
  body: {
    padding: "16px 20px 12px", marginTop: 8,
    borderTop: `1px solid ${LINE}`,
    flex: 1,
  },
  title: { margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.1, color: "var(--bl-text)" },
  price: { margin: "8px 0 0", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: ATELIER.pdBlue },
  label: {
    margin: "16px 0 0", fontSize: 11, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.18em", color: MUTED,
  },
  qtyRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 8, border: "none",
    background: ATELIER.pdChip, color: "var(--bl-text)",
    display: "grid", placeItems: "center", cursor: "pointer",
  },
  qtyVal: { fontSize: 15, fontWeight: 600, minWidth: 28, textAlign: "center", fontVariantNumeric: "tabular-nums" },
  descToggle: {
    display: "inline-flex", alignItems: "center", gap: 6,
    margin: "16px 0 0", padding: 0,
    fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em",
    color: MUTED, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
  },
  desc: { margin: "8px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--bl-secondary)", whiteSpace: "pre-line" },
  cta: {
    position: "sticky", bottom: 16, zIndex: 3,
    margin: "8px 20px 16px",
    display: "flex", alignItems: "center", gap: 12,
    background: ATELIER.pdBlue, color: "#fff",
    border: "none", borderRadius: 8, padding: "12px 16px",
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: `0 18px 36px -12px ${ATELIER.pdBlueDark}80`,
  },
}
