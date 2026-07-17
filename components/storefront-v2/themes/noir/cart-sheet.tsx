"use client"

import { useState, type CSSProperties } from "react"
import { MessageCircle, Minus, Plus, Trash2 } from "lucide-react"
import type { ThemeCartSheetProps } from "../registry"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import { NOIR, NOIR_STYLES, fmtNoirPrice, ink } from "./shared"

/**
 * NoirCartSheet — carrito PROPIO del tema (spec §5): drawer lateral derecho
 * "Selección" sobre superficie #111 (derivada), items con thumb retrato sin
 * radius, qty minimal SIN bordes, total serif dorado y CTA "Enviar cotización
 * por WhatsApp". Mismo contrato que el CartSheet genérico: useCart +
 * paymentProvider.checkout + trackEvent CHECKOUT_START. Sin form de cliente
 * (el legacy noir no lo tenía).
 */
export function NoirCartSheet({ store, paymentProvider }: ThemeCartSheetProps) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const fmt = (n: number) => fmtNoirPrice(n, store.currency)

  async function handleCheckout() {
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
      <style dangerouslySetInnerHTML={{ __html: NOIR_STYLES }} />
      <div
        style={S.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Selección"
      >
        {/* Header */}
        <div style={S.header}>
          <h2 style={S.headerTitle}>Selección</h2>
          {items.length > 0 && (
            <span style={S.headerCount}>
              {items.length} {items.length === 1 ? "pieza" : "piezas"}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div style={S.empty}>
            <div aria-hidden="true" style={S.emptySymbol}>∅</div>
            <div>
              <p style={S.emptyTitle}>Selección vacía</p>
              <p style={S.emptyHint}>Agrega piezas para comenzar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div style={S.items}>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    ...S.item,
                    borderTop: idx > 0 ? "1px solid var(--bl-border)" : "none",
                  }}
                >
                  <div style={S.thumb}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={S.itemName}>{item.name}</p>
                    {item.variant && <p style={S.itemVariant}>{item.variant}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                      {/* Qty minimal SIN bordes */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, color: ink(33) }}>
                        <button
                          type="button"
                          className="bl-noir-goldhover"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Reducir cantidad"
                          style={S.qtyGhostBtn}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={S.qtyValue}>{item.quantity}</span>
                        <button
                          type="button"
                          className="bl-noir-goldhover"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                          style={S.qtyGhostBtn}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={S.itemPrice}>{fmt(item.price * item.quantity)}</span>
                        <button
                          type="button"
                          className="bl-noir-trash"
                          onClick={() => removeItem(item.id)}
                          aria-label="Quitar de la selección"
                          style={S.trashBtn}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={S.footer}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <span style={S.totalLabel}>Total</span>
                <span style={S.totalAmount}>{fmt(totalPrice)}</span>
              </div>
              {error && <div style={S.error}>{error}</div>}
              <button
                type="button"
                className="bl-noir-goldbtn"
                onClick={handleCheckout}
                disabled={loading}
                style={{ ...S.checkoutBtn, opacity: loading ? 0.4 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                <MessageCircle size={16} aria-hidden="true" />
                {loading ? "Enviando..." : "Enviar cotización por WhatsApp"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const S: Record<string, CSSProperties> = {
  // z 400: capa superior — por encima del product sheet y del modal de preview.
  overlay: {
    position: "fixed", inset: 0, zIndex: 400,
    display: "flex", justifyContent: "flex-end",
    background: "rgba(0,0,0,.5)",
  },
  drawer: {
    display: "flex", flexDirection: "column",
    width: "100%", maxWidth: 448, height: "100%",
    background: NOIR.surfaceDeep,
    borderLeft: `1px solid ${ink(11)}`,
    color: NOIR.text, fontFamily: NOIR.sans,
  },
  header: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "20px 24px",
    borderBottom: `1px solid ${ink(10)}`,
  },
  headerTitle: {
    fontFamily: NOIR.serif, fontSize: 18, fontWeight: 400,
    color: NOIR.text, letterSpacing: "0.025em", margin: 0,
  },
  headerCount: {
    marginLeft: "auto", fontSize: 12, color: ink(33),
    letterSpacing: "0.1em", textTransform: "uppercase",
  },
  empty: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "0 24px", gap: 20,
  },
  emptySymbol: {
    fontSize: 48, fontFamily: NOIR.serif, color: ink(11), userSelect: "none",
  },
  emptyTitle: { fontFamily: NOIR.serif, color: NOIR.text, fontSize: 18, margin: 0 },
  emptyHint: {
    fontSize: 12, color: ink(33), marginTop: 8,
    letterSpacing: "0.05em", textTransform: "uppercase",
  },
  items: { flex: 1, overflowY: "auto", padding: "16px 24px" },
  item: { display: "flex", gap: 16, padding: "20px 0" },
  thumb: {
    position: "relative", height: 80, width: 64, flexShrink: 0,
    overflow: "hidden", background: "var(--bl-border)",
  },
  itemName: {
    fontFamily: NOIR.serif, color: NOIR.text, fontSize: 14,
    lineHeight: 1.375, margin: 0,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  itemVariant: { fontSize: 12, color: ink(33), margin: "2px 0 0" },
  qtyGhostBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 0,
    color: ink(33), display: "flex", alignItems: "center",
  },
  qtyValue: { color: NOIR.text, fontSize: 12, width: 16, textAlign: "center" },
  itemPrice: { color: NOIR.gold, fontSize: 14, fontWeight: 600 },
  trashBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 0,
    color: ink(19), display: "flex", alignItems: "center",
  },
  footer: {
    padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20,
    borderTop: `1px solid ${ink(10)}`,
  },
  totalLabel: { fontSize: 12, color: ink(33), letterSpacing: "0.1em", textTransform: "uppercase" },
  totalAmount: { fontFamily: NOIR.serif, fontSize: 20, color: NOIR.gold },
  error: { fontSize: 12, color: "#f87171" },
  checkoutBtn: {
    width: "100%", height: 48,
    background: NOIR.gold, color: "var(--bl-background)",
    fontWeight: 600, fontSize: 14, fontFamily: NOIR.sans,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 2, border: "none", letterSpacing: "0.025em",
  },
}
