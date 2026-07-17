"use client"

// Drawer del pedido PROPIO del tema menu — port fiel de MenuCartDrawer
// (legacy components/templates/menu/cart-drawer.tsx) con el contrato del
// CartSheet genérico: useCart + paymentProvider.checkout (con form opcional
// nombre/teléfono/notas, contrato de producto vigente que el legacy no
// tenía) y trackEvent CHECKOUT_START al iniciar. Colores por tokens --bl-*.

import { useState, type CSSProperties } from "react"
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import type { ThemeCartSheetProps } from "../registry"
import { GRAY_400, SURFACE_DIM, fmtMenuPrice } from "./format"

export function MenuCartSheet({ store, paymentProvider }: ThemeCartSheetProps) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const fmt = (n: number) => fmtMenuPrice(n, store.currency)

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
    <div style={S.overlay} onClick={() => setIsOpen(false)}>
      <style dangerouslySetInnerHTML={{ __html: DRAWER_STYLES }} />
      <div
        style={S.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
      >
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerTitle}>
            <ShoppingBag size={20} style={{ color: "var(--bl-primary)" }} aria-hidden="true" />
            Tu pedido
          </div>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar" style={S.closeBtn}>
            <X size={16} />
          </button>
        </div>

        {items.length === 0 ? (
          <div style={S.emptyWrap}>
            <div style={S.emptyCircle}>
              <ShoppingBag size={28} style={{ color: GRAY_400 }} aria-hidden="true" />
            </div>
            <div>
              <p style={{ fontWeight: 500, color: "var(--bl-text)", margin: 0 }}>Tu pedido está vacío</p>
              <p style={{ fontSize: 14, color: "var(--bl-text-muted)", margin: "4px 0 0" }}>
                Agrega platos del menú para hacer tu pedido
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div style={S.items}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {items.map((item) => (
                  <div key={item.id} style={S.item}>
                    <div style={S.itemImgWrap}>
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
                      <p style={S.itemPrice}>{fmt(item.price)}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={S.qtyBtn}
                        >
                          <Minus size={12} aria-hidden="true" />
                        </button>
                        <span style={S.qtyValue}>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={S.qtyBtn}
                        >
                          <Plus size={12} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label="Quitar del pedido"
                          className="bl-menucart-trash"
                          onClick={() => removeItem(item.id)}
                          style={S.trashBtn}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={S.footer}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--bl-text-muted)", fontSize: 14 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: "var(--bl-text)" }}>{fmt(totalPrice)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  style={S.input}
                  placeholder="Tu nombre (opcional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  style={S.input}
                  placeholder="Tu teléfono (opcional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <textarea
                  style={{ ...S.input, resize: "none", minHeight: 52 }}
                  placeholder="Notas (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              {error && <div style={S.error}>{error}</div>}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                style={{ ...S.checkoutBtn, opacity: loading ? 0.6 : 1, cursor: loading ? "wait" : "pointer" }}
              >
                <MessageCircle size={20} aria-hidden="true" />
                {loading ? "Enviando..." : "Hacer pedido por WhatsApp"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const DRAWER_STYLES = `
.bl-menucart-trash:hover { color: #EF4444 !important; }
`

const S: Record<string, CSSProperties> = {
  // z 400: por encima del modal de preview (300), igual que el CartSheet genérico.
  overlay: { position: "fixed", inset: 0, background: "rgba(10,15,31,0.5)", zIndex: 400, display: "flex", justifyContent: "flex-end" },
  sheet: {
    background: "var(--bl-background)", width: "100%", maxWidth: 448, height: "100%",
    display: "flex", flexDirection: "column", fontFamily: "var(--bl-body-font)", color: "var(--bl-text)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 24px", flexShrink: 0,
    borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "var(--bl-border)",
  },
  headerTitle: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 16, fontWeight: 600, color: "var(--bl-text)",
    fontFamily: "var(--bl-heading-font)",
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8, border: "none",
    background: "var(--bl-surface)", color: "var(--bl-text-muted)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  emptyWrap: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "0 24px", gap: 16,
  },
  emptyCircle: {
    width: 64, height: 64, borderRadius: "50%", background: "var(--bl-surface)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  items: { flex: 1, overflowY: "auto", padding: "16px 24px" },
  item: { display: "flex", gap: 12, background: "var(--bl-surface)", borderRadius: 12, padding: 12 },
  itemImgWrap: {
    position: "relative", width: 64, height: 64, flexShrink: 0,
    borderRadius: 8, overflow: "hidden", background: SURFACE_DIM,
  },
  itemName: {
    fontSize: 14, fontWeight: 500, color: "var(--bl-text)", margin: 0,
    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  itemVariant: { fontSize: 12, color: "var(--bl-text-muted)", margin: "2px 0 0" },
  itemPrice: { fontSize: 14, fontWeight: 700, color: "var(--bl-primary)", margin: "2px 0 0" },
  qtyBtn: {
    width: 24, height: 24, borderRadius: 6, border: "none",
    background: SURFACE_DIM, color: "var(--bl-text)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  qtyValue: { fontSize: 14, width: 20, textAlign: "center", fontVariantNumeric: "tabular-nums" },
  trashBtn: {
    width: 24, height: 24, marginLeft: "auto", border: "none", background: "none",
    color: GRAY_400, cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", transition: "color .15s ease",
  },
  footer: {
    padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12, flexShrink: 0,
    borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--bl-border)",
  },
  input: {
    padding: "10px 12px", borderRadius: 12,
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--bl-border)",
    fontSize: 13, fontFamily: "inherit",
    background: "var(--bl-surface)", color: "var(--bl-text)",
  },
  error: { color: "#EF4444", fontSize: 12 },
  checkoutBtn: {
    width: "100%", height: 48, display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 12, border: "none",
    background: "var(--bl-primary)", color: "#fff",
    fontSize: 16, fontWeight: 600, fontFamily: "inherit",
  },
}
