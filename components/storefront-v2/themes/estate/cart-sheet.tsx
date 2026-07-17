"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { Building2, MessageCircle, Trash2, X } from "lucide-react"
import type { ThemeCartSheetProps } from "../registry"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import { ESTATE, ESTATE_STYLES, GRAY, RADIUS, makeFmt } from "./shared"

/**
 * EstateCartSheet — drawer PROPIO "Propiedades de interés" (spec §5).
 * NO es un carrito: bookmarks de propiedades + consulta agrupada por
 * WhatsApp — sin cantidades, sin total, sin form de cliente. Header blanco
 * con Building2 dorado y contador navy, ítems foto 112×80 con precio dorado
 * y Trash2, footer con nota + CTA verde WhatsApp. El envío hace trackEvent
 * CHECKOUT_START → paymentProvider.checkout (quantity 1 por propiedad) →
 * clearCart + cierra. Trigger: barra flotante del renderer (onOpenCart).
 */
export function EstateCartSheet({ store, paymentProvider }: ThemeCartSheetProps) {
  const { items, isOpen, setIsOpen, removeItem, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fmt = makeFmt(store.currency)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  const handleInquiry = async () => {
    if (items.length === 0 || loading) return
    setLoading(true)
    setError(null)
    trackEvent(store.slug, "CHECKOUT_START")
    try {
      const result = await paymentProvider.checkout({
        // Consulta, no pedido: cada propiedad va una sola vez (quantity 1).
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
    <div className="bl-estate-root" style={S.overlay} onClick={() => setIsOpen(false)}>
      <style dangerouslySetInnerHTML={{ __html: ESTATE_STYLES }} />
      <div
        style={S.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Propiedades de interés"
      >
        {/* Header */}
        <div style={S.header}>
          <Building2 style={{ width: 20, height: 20, color: ESTATE.gold, flexShrink: 0 }} aria-hidden="true" />
          <span style={S.headerTitle}>Propiedades de interés</span>
          {items.length > 0 && <span style={S.headerCount}>{items.length}</span>}
          <button
            type="button"
            className="bl-estate-navbtn"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar"
            style={S.closeBtn}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {items.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyCircle}>
              <Building2 style={{ width: 28, height: 28, color: GRAY.g400 }} aria-hidden="true" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: GRAY.strong }}>
                No tienes propiedades guardadas
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: GRAY.g500 }}>
                Guarda las propiedades que te interesen para consultar por todas a la vez
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Ítems */}
            <div style={S.items}>
              {items.map((item) => (
                <div key={item.id} style={S.item}>
                  <div style={S.itemImgWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image || "/placeholder.svg"} alt={item.name} style={S.itemImg} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={S.itemName}>{item.name}</p>
                    <p style={S.itemPrice}>{fmt(item.price)}</p>
                  </div>
                  <button
                    type="button"
                    className="bl-estate-trash"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Quitar ${item.name}`}
                    style={S.trashBtn}
                  >
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              ))}
              {error && <div style={S.error}>{error}</div>}
            </div>

            {/* Footer */}
            <div style={S.footer}>
              <p style={S.footerNote}>
                Se enviará una consulta por WhatsApp con{" "}
                {items.length === 1 ? "esta propiedad" : `estas ${items.length} propiedades`}
              </p>
              <button
                type="button"
                className="bl-estate-wabtn"
                onClick={handleInquiry}
                disabled={loading}
                style={{ ...S.waBtn, opacity: loading ? 0.7 : 1 }}
              >
                <MessageCircle style={{ width: 20, height: 20 }} aria-hidden="true" />
                {loading ? "Enviando..." : "Consultar por WhatsApp"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const S: Record<string, CSSProperties> = {
  // z 401: capa superior — por encima del product sheet (400).
  overlay: {
    position: "fixed", inset: 0, zIndex: 401,
    display: "flex", justifyContent: "flex-end",
    background: "rgba(0,0,0,.5)",
  },
  drawer: {
    display: "flex", flexDirection: "column",
    width: "100%", maxWidth: 448, height: "100%",
    background: ESTATE.bg, color: ESTATE.text, fontFamily: ESTATE.body,
  },
  header: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "16px 24px",
    background: ESTATE.surface,
    borderBottom: `1px solid ${GRAY.border200}`,
  },
  headerTitle: { fontSize: 16, fontWeight: 700, color: ESTATE.navy, fontFamily: ESTATE.heading },
  headerCount: {
    marginLeft: "auto",
    background: ESTATE.navy, color: "#fff",
    fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
  },
  closeBtn: {
    display: "grid", placeItems: "center", width: 32, height: 32, marginLeft: 4,
    borderRadius: RADIUS.lg, border: "none", background: "transparent",
    color: GRAY.g500, cursor: "pointer", flexShrink: 0,
  },
  empty: {
    display: "flex", flex: 1, flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 16, padding: "0 24px", textAlign: "center",
  },
  emptyCircle: {
    display: "grid", placeItems: "center", width: 64, height: 64,
    borderRadius: 999, background: ESTATE.surface, boxShadow: "0 1px 2px rgba(0,0,0,.05)",
  },
  items: {
    flex: 1, overflowY: "auto", padding: "16px 24px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  item: {
    display: "flex", gap: 12, padding: 12,
    background: ESTATE.surface, borderRadius: RADIUS.xl,
    border: `1px solid ${GRAY.border100}`, boxShadow: "0 1px 2px rgba(0,0,0,.05)",
  },
  itemImgWrap: {
    position: "relative", width: 112, height: 80, flexShrink: 0,
    borderRadius: RADIUS.lg, overflow: "hidden", background: GRAY.chip100,
  },
  itemImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  itemName: {
    margin: 0, fontSize: 14, fontWeight: 600, color: ESTATE.navy,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  itemPrice: { margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: ESTATE.gold },
  trashBtn: {
    display: "grid", placeItems: "center", flexShrink: 0,
    width: 32, height: 32, border: "none", background: "none",
    color: GRAY.g400, cursor: "pointer", borderRadius: RADIUS.lg,
  },
  error: { fontSize: 12, color: ESTATE.red },
  footer: {
    display: "flex", flexDirection: "column", gap: 12,
    padding: "16px 24px",
    background: ESTATE.surface,
    borderTop: `1px solid ${GRAY.border200}`,
  },
  footerNote: { margin: 0, fontSize: 12, color: GRAY.g500, textAlign: "center" },
  waBtn: {
    display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 8,
    height: 48, borderRadius: RADIUS.xl, border: "none",
    background: ESTATE.waGreen, color: "#fff",
    fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
  },
}
