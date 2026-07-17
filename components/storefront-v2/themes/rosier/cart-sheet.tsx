"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { MessageCircle, Minus, Plus, ShoppingBag, X } from "lucide-react"
import type { ThemeCartSheetProps } from "../registry"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import { ROSIER_STYLES, RS, fmtRosierPrice, inkA } from "./shared"

/**
 * RosierCartSheet — drawer PROPIO "Tu bolsa" (spec §5, legacy cart-drawer.tsx).
 * Sheet derecho max-w-md sobre bg crema: header "Tu bolsa" Fraunces 22 + (n),
 * empty con círculo bgSoft + ShoppingBag, items con thumb 78×96, X para
 * quitar, qty pill chica con borde y precio tabular; footer Subtotal /
 * Envío Gratis / Total Fraunces 22 y CTA rose pill "Finalizar por WhatsApp".
 * Mismo contrato que los cart-sheets de menu/estate: useCart + trackEvent
 * CHECKOUT_START → paymentProvider.checkout con result.success → clearCart
 * + cierra. Sin form de cliente (el legacy rosier no lo tenía). Tokens
 * --bl-* vía RS (rose=primary, ink=secondary) — sin hex fuera de identidad.
 */
export function RosierCartSheet({ store, paymentProvider }: ThemeCartSheetProps) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  const fmt = (n: number) => fmtRosierPrice(n, store.currency)

  async function handleCheckout() {
    if (items.length === 0 || loading) return
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
          quantity: i.quantity,
          image: i.image,
          variant: i.variant,
        })),
        total: totalPrice,
        currency: store.currency ?? "USD",
        storeSlug: store.slug,
      })
      if (result.success) {
        clearCart()
        setIsOpen(false)
      } else {
        setError(result.message ?? "No se pudo completar el pedido")
      }
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.overlay} onClick={() => setIsOpen(false)}>
      <style dangerouslySetInnerHTML={{ __html: ROSIER_STYLES }} />
      <div
        style={S.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tu bolsa"
      >
        {/* Header */}
        <div style={S.header}>
          <h2 style={S.headerTitle}>
            Tu bolsa
            {items.length > 0 && <span style={S.headerCount}>({items.length})</span>}
          </h2>
          <button
            type="button"
            className="bl-rosier-roundbtn"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar bolsa"
            style={S.closeBtn}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {items.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyCircle}>
              <ShoppingBag size={28} strokeWidth={1.5} style={{ color: RS.muted }} aria-hidden="true" />
            </div>
            <div>
              <p style={S.emptyTitle}>Tu bolsa está vacía</p>
              <p style={S.emptyHint}>Explora la nueva colección</p>
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <ul style={S.items}>
              {items.map((item) => (
                <li key={item.id} style={S.item}>
                  <div style={S.thumb}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <h3 style={S.itemName}>{item.name}</h3>
                        <button
                          type="button"
                          className="bl-rosier-rosehover"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Quitar ${item.name} de la bolsa`}
                          style={S.removeBtn}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {item.variant && <p style={S.itemVariant}>{item.variant}</p>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      {/* Qty pill chica */}
                      <div style={S.qtyPill}>
                        <button
                          type="button"
                          className="bl-rosier-rosehover"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Reducir cantidad"
                          style={S.qtyBtn}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={S.qtyValue}>{item.quantity}</span>
                        <button
                          type="button"
                          className="bl-rosier-rosehover"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                          style={S.qtyBtn}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span style={S.itemPrice}>{fmt(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div style={S.footer}>
              <div style={S.footerRow}>
                <span>Subtotal</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(totalPrice)}</span>
              </div>
              <div style={S.footerRow}>
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div style={S.totalRow}>
                <span style={{ fontSize: 16 }}>Total</span>
                <span style={S.totalAmount}>{fmt(totalPrice)}</span>
              </div>
              {error && <div style={S.error}>{error}</div>}
              <button
                type="button"
                className="bl-rosier-cta-rose"
                onClick={handleCheckout}
                disabled={loading}
                style={{ ...S.checkoutBtn, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                <MessageCircle size={16} aria-hidden="true" />
                {loading ? "Enviando…" : "Finalizar por WhatsApp"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const S: Record<string, CSSProperties> = {
  // z 401: capa superior — por encima del product sheet propio (400).
  overlay: {
    position: "fixed", inset: 0, zIndex: 401,
    display: "flex", justifyContent: "flex-end",
    background: inkA(55),
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
  },
  drawer: {
    display: "flex", flexDirection: "column",
    width: "100%", maxWidth: 448, height: "100%",
    background: RS.bg, color: RS.ink, fontFamily: RS.sans,
    borderLeft: `1px solid ${RS.line}`,
    boxShadow: "-20px 0 50px -20px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    padding: "16px 24px",
    borderBottom: `1px solid ${RS.line}`,
  },
  headerTitle: {
    fontFamily: RS.serif, fontSize: 22, fontWeight: 500,
    letterSpacing: "-0.02em", color: RS.ink, margin: 0,
  },
  headerCount: {
    fontSize: 12, color: RS.muted, marginLeft: 6,
    fontWeight: 400, fontFamily: RS.sans, letterSpacing: 0,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "transparent", border: "none", cursor: "pointer",
    color: RS.inkSoft,
  },
  empty: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "0 24px", gap: 16,
  },
  emptyCircle: {
    width: 64, height: 64, borderRadius: "50%",
    background: RS.bgSoft, display: "grid", placeItems: "center",
  },
  emptyTitle: {
    fontFamily: RS.serif, fontWeight: 500, fontSize: 17,
    letterSpacing: "-0.01em", color: RS.ink, margin: 0,
  },
  emptyHint: { fontSize: 14, color: RS.muted, margin: "4px 0 0" },
  items: {
    flex: 1, overflowY: "auto", overscrollBehavior: "contain",
    listStyle: "none", margin: 0, padding: "16px 24px",
    display: "flex", flexDirection: "column", gap: 18,
  },
  item: { display: "flex", gap: 14 },
  thumb: {
    position: "relative", width: 78, height: 96, flexShrink: 0,
    borderRadius: 4, overflow: "hidden", background: RS.bgSoft,
  },
  itemName: {
    fontSize: 14, fontWeight: 500, color: RS.ink, margin: 0, lineHeight: 1.4,
    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  removeBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 0,
    color: RS.muted, display: "flex", alignItems: "center", flexShrink: 0,
  },
  itemVariant: { fontSize: 12, color: RS.muted, margin: "2px 0 0" },
  qtyPill: {
    display: "inline-flex", alignItems: "center",
    border: `1px solid ${RS.line}`, borderRadius: 999, fontSize: 12,
  },
  qtyBtn: {
    width: 26, height: 26, display: "grid", placeItems: "center",
    background: "none", border: "none", cursor: "pointer", padding: 0,
    color: RS.inkSoft,
  },
  qtyValue: {
    minWidth: 20, textAlign: "center", fontWeight: 500,
    fontVariantNumeric: "tabular-nums", color: RS.ink,
  },
  itemPrice: {
    fontSize: 14, fontWeight: 600, color: RS.ink,
    fontVariantNumeric: "tabular-nums",
  },
  footer: {
    padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8,
    borderTop: `1px solid ${RS.line}`,
  },
  footerRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    fontSize: 13, color: RS.inkSoft,
  },
  totalRow: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    paddingTop: 8, fontWeight: 600, color: RS.ink,
  },
  totalAmount: {
    fontFamily: RS.serif, fontSize: 22, fontWeight: 500,
    fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
  },
  error: { fontSize: 12, color: RS.rose },
  checkoutBtn: {
    width: "100%", height: 50, marginTop: 8,
    background: RS.rose, color: "#fff",
    borderRadius: 999, border: "none",
    fontSize: 14, fontWeight: 600, fontFamily: RS.sans,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
}
