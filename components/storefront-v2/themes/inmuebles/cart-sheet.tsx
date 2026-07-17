"use client"

import { useState, type CSSProperties } from "react"
import { Building2, MessageCircle, Trash2, X } from "lucide-react"
import type { ThemeCartSheetProps } from "../registry"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import { INM, INM_STYLES, makeFmt } from "./shared"

/**
 * InmueblesCartSheet — drawer PROPIO "Propiedades de interés" (spec §5).
 * NO es un carrito de compra: es la lista de propiedades GUARDADAS
 * (bookmark) para consultar por todas en un solo mensaje de WhatsApp.
 * Sin cantidades, sin variantes, sin total visible. El envío agrupa los
 * ítems (quantity fija en 1) vía paymentProvider.checkout + CHECKOUT_START,
 * luego limpia la lista y cierra. El trigger es la barra "Ver propiedades
 * guardadas" del renderer / botón flotante del detalle (onOpenCart).
 */
export function InmueblesCartSheet({ store, paymentProvider }: ThemeCartSheetProps) {
  const { items, isOpen, setIsOpen, removeItem, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fmt = makeFmt(store.currency)

  if (!isOpen) return null

  const handleInquiry = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError(null)
    trackEvent(store.slug, "CHECKOUT_START")
    try {
      const result = await paymentProvider.checkout({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          price: i.price,
          quantity: 1,
          image: i.image,
        })),
        total: totalPrice,
        currency: store.currency ?? "USD",
        storeSlug: store.slug,
      })
      if (result.success) {
        clearCart()
        setIsOpen(false)
      } else {
        setError(result.message ?? "No se pudo enviar la consulta")
      }
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bl-inm-root" style={S.overlay} onClick={() => setIsOpen(false)}>
      <style dangerouslySetInnerHTML={{ __html: INM_STYLES }} />
      <div
        style={S.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Propiedades de interés"
      >
        {/* Header */}
        <div style={S.header}>
          <Building2 style={{ width: 16, height: 16, color: INM.navy, flexShrink: 0 }} aria-hidden="true" />
          <span style={S.headerTitle}>Propiedades de interés</span>
          {items.length > 0 && <span style={S.headerCount}>{items.length}</span>}
          <button
            type="button"
            className="bl-inm-btn-outline"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar"
            style={S.closeBtn}
          >
            <X style={{ width: 14, height: 14 }} aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyCircle}>
              <Building2 style={{ width: 28, height: 28, color: INM.muted }} aria-hidden="true" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: INM.text }}>
                Aún no guardaste propiedades
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: INM.muted }}>
                Guarda las que te interesen y consulta por todas en un mensaje.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bookmarks — sin qty, sin variantes, sin total */}
            <ul style={S.items}>
              {items.map((item) => (
                <li key={item.id} style={S.item}>
                  <div style={S.itemImgWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={S.itemName}>{item.name}</p>
                    <p style={S.itemPrice}>{fmt(item.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Quitar ${item.name} de propiedades guardadas`}
                    className="bl-inm-trash"
                    style={S.trashBtn}
                  >
                    <Trash2 style={{ width: 16, height: 16 }} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer — consulta agrupada */}
            <div style={S.footer}>
              <p style={S.footerNote}>
                Se enviará una consulta con{" "}
                {items.length === 1 ? "esta propiedad" : `estas ${items.length} propiedades`}.
              </p>
              {error && <p style={S.error}>{error}</p>}
              <button
                type="button"
                onClick={handleInquiry}
                disabled={loading}
                className="bl-inm-btn-dark"
                style={{ ...S.inquiryBtn, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                <MessageCircle style={{ width: 16, height: 16 }} aria-hidden="true" />
                {loading ? "Enviando…" : "Consultar por WhatsApp"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const S: Record<string, CSSProperties> = {
  // z 400: capa superior — por encima del detalle propio y del modal de preview.
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 400,
    display: "flex",
    justifyContent: "flex-end",
    background: "rgba(0,0,0,.5)",
  },
  drawer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 448,
    height: "100%",
    background: INM.paper,
    color: INM.text,
    fontFamily: INM.bodyFont,
    borderLeft: `1px solid ${INM.border}`,
    boxShadow: "-20px 0 50px -20px rgba(0,0,0,.3)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderBottom: `1px solid ${INM.border}`,
    padding: "16px 24px",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "-.01em",
    fontFamily: INM.heading,
  },
  headerCount: {
    marginLeft: "auto",
    background: INM.navy,
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 999,
    fontVariantNumeric: "tabular-nums",
  },
  closeBtn: {
    display: "grid",
    placeItems: "center",
    width: 32,
    height: 32,
    marginLeft: 8,
    borderRadius: 999,
    border: `1px solid ${INM.border}`,
    background: "transparent",
    color: INM.text,
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "0 24px",
    textAlign: "center",
  },
  emptyCircle: {
    display: "grid",
    placeItems: "center",
    width: 64,
    height: 64,
    borderRadius: 999,
    background: INM.surface,
  },
  items: {
    flex: 1,
    overflowY: "auto",
    listStyle: "none",
    margin: 0,
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  item: {
    display: "flex",
    gap: 12,
    padding: 12,
    background: INM.paper,
    border: `1px solid ${INM.border}`,
    borderRadius: 8,
  },
  itemImgWrap: {
    width: 112,
    height: 80,
    borderRadius: 4,
    overflow: "hidden",
    background: INM.imgPh,
    flexShrink: 0,
  },
  itemName: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  itemPrice: {
    margin: "4px 0 0",
    fontSize: 14,
    fontWeight: 600,
    color: INM.navy,
    fontVariantNumeric: "tabular-nums",
  },
  trashBtn: {
    flexShrink: 0,
    width: 32,
    height: 32,
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    border: "none",
    background: "transparent",
    color: INM.muted,
    cursor: "pointer",
  },
  footer: {
    borderTop: `1px solid ${INM.border}`,
    background: INM.surface,
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  footerNote: { margin: 0, fontSize: 12, color: INM.muted, textAlign: "center" },
  error: { margin: 0, fontSize: 12, color: "#ef4444", textAlign: "center" },
  inquiryBtn: {
    display: "flex",
    width: "100%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    border: "none",
    background: INM.ink,
    color: INM.paper,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "inherit",
  },
}
