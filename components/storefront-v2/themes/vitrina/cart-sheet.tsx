"use client"

import { useMemo, useState, type CSSProperties } from "react"
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import type { ThemeCartSheetProps } from "../registry"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import { catalogFmt, mix } from "../shared/catalog-shell/support"
import { V, VITRINA_CSS, VRX } from "./shared"

/**
 * VitrinaCartSheet — carrito PROPIO del tema (spec vitrina §5): drawer lateral
 * sobre surface (bg-card del legacy), título con ShoppingBag primary, líneas
 * con imagen 72px + precio unitario primary + steppers `secondary` + trash con
 * hover destructive, y CTA "Enviar cotización por WhatsApp". Se conserva el
 * formulario nombre/teléfono/notas del sistema nuevo (decisión de port §9)
 * estilizado al tema. Checkout: trackEvent CHECKOUT_START → paymentProvider
 * con manejo de result.success como el genérico.
 */
export function VitrinaCartSheet({ store, paymentProvider }: ThemeCartSheetProps) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fmt = useMemo(() => catalogFmt(store.currency), [store.currency])

  if (!isOpen) return null

  const handleCheckout = async () => {
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
        customer: name.trim()
          ? { name: name.trim(), phone: phone.trim(), notes: notes.trim() || undefined }
          : undefined,
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
    <div className="bl-vitrina-root" style={S.overlay} onClick={() => setIsOpen(false)}>
      <style dangerouslySetInnerHTML={{ __html: VITRINA_CSS }} />
      <div style={S.drawer} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Tu carrito">
        {/* Header */}
        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag style={{ width: 20, height: 20, color: V.primary }} aria-hidden="true" />
            <span style={{ fontSize: 16, fontWeight: 600, color: V.text }}>Tu carrito</span>
          </div>
          <button type="button" className="bl-vitrina-iconbtn" onClick={() => setIsOpen(false)} aria-label="Cerrar" style={S.closeBtn}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {items.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyCircle}>
              <ShoppingBag style={{ width: 28, height: 28, color: V.mutedFg }} aria-hidden="true" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: V.text }}>Tu carrito está vacío</p>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: V.mutedFg }}>
                Agrega productos para hacer tu cotización
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div style={S.items}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: 12 }}>
                  <div style={S.itemImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image || "/placeholder.svg"} alt={item.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={S.itemName}>{item.name}</p>
                    {item.variant && <p style={S.itemVariant}>{item.variant}</p>}
                    <p style={S.itemPrice}>{fmt(item.price)}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Quitar uno" style={S.qtyBtn}>
                        <Minus style={{ width: 12, height: 12 }} />
                      </button>
                      <span style={{ fontSize: 14, width: 20, textAlign: "center", color: V.text }}>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Agregar uno" style={S.qtyBtn}>
                        <Plus style={{ width: 12, height: 12 }} />
                      </button>
                      <button type="button" className="bl-vitrina-trash" onClick={() => removeItem(item.id)} aria-label="Quitar del carrito" style={S.trashBtn}>
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={S.footer}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: V.mutedFg }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: V.text }}>{fmt(totalPrice)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input className="bl-vitrina-input" style={S.input} placeholder="Tu nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="bl-vitrina-input" style={S.input} placeholder="Tu teléfono (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <textarea className="bl-vitrina-input" style={{ ...S.input, resize: "none", minHeight: 60 }} placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              {error && <div style={{ fontSize: 12, color: V.destructive }}>{error}</div>}
              <button
                type="button"
                className="bl-vitrina-primarybtn"
                onClick={handleCheckout}
                disabled={loading}
                style={{ ...S.checkoutBtn, opacity: loading ? 0.7 : 1 }}
              >
                <MessageCircle style={{ width: 20, height: 20 }} />
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
  // z 400: capa superior — por encima del product sheet (mismo z, después en DOM).
  overlay: {
    position: "fixed", inset: 0, zIndex: 400,
    display: "flex", justifyContent: "flex-end",
    background: "rgba(10,15,31,0.5)",
    fontFamily: "var(--bl-body-font)",
  },
  drawer: {
    display: "flex", flexDirection: "column",
    width: "100%", maxWidth: 448, height: "100%",
    background: V.card, color: V.text,
    borderLeft: `1px solid ${V.border}`,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 24px", borderBottom: `1px solid ${V.border}`,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: VRX.md,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: V.muted, border: "none", cursor: "pointer", color: V.text,
  },
  empty: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "0 24px", gap: 16,
  },
  emptyCircle: {
    width: 64, height: 64, borderRadius: "50%", background: V.muted,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  items: {
    flex: 1, overflowY: "auto", padding: "16px 24px",
    display: "flex", flexDirection: "column", gap: 16,
  },
  itemImg: {
    position: "relative", height: 72, width: 72, flexShrink: 0,
    borderRadius: VRX.lg, overflow: "hidden", background: V.muted,
  },
  itemName: {
    margin: 0, fontSize: 14, fontWeight: 500, color: V.text,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  itemVariant: { margin: "2px 0 0", fontSize: 12, color: V.mutedFg },
  itemPrice: { margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: V.primary },
  qtyBtn: {
    width: 24, height: 24, borderRadius: VRX.md,
    background: V.secondary, color: V.text, border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  trashBtn: {
    width: 24, height: 24, marginLeft: "auto",
    background: "none", border: "none", cursor: "pointer", color: V.mutedFg,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  footer: {
    padding: "16px 24px", borderTop: `1px solid ${V.border}`,
    display: "flex", flexDirection: "column", gap: 12,
  },
  input: {
    padding: "10px 12px", borderRadius: VRX.md,
    border: "1px solid transparent", background: V.muted,
    color: V.text, fontSize: 13, fontFamily: "inherit", outline: "none",
  },
  checkoutBtn: {
    width: "100%", height: 48, borderRadius: VRX.md, border: "none",
    background: V.primary, color: V.primaryFg,
    fontSize: 16, fontWeight: 500, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
}
