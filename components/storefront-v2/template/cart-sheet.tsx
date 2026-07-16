"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import type { PaymentProvider } from "@/lib/payment-providers/types"
import type { TemplateStore } from "./template-renderer"

function formatPrice(amount: number, currency?: string | null): string {
  const c = currency ?? "USD"
  const symbol = c === "USD" ? "$" : c === "EUR" ? "€" : c === "VES" ? "Bs. " : ""
  return `${symbol}${amount.toLocaleString("es")}`
}

export function CartSheet({ store, paymentProvider }: { store: TemplateStore; paymentProvider: PaymentProvider }) {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, isOpen, setIsOpen } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleCheckout() {
    if (items.length === 0) return
    setSending(true); setError(null)
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
        customer: name.trim() ? { name: name.trim(), phone: phone.trim(), notes: notes.trim() || undefined } : undefined,
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
      setSending(false)
    }
  }

  return (
    <div style={S.overlay} onClick={() => setIsOpen(false)}>
      <div style={S.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Carrito">
        <div style={S.header}>
          <h2 style={S.title}>Tu carrito</h2>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar" style={S.closeBtn}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={S.empty}>Tu carrito está vacío.</div>
        ) : (
          <>
            <div style={S.items}>
              {items.map((item) => (
                <div key={item.id} style={S.item}>
                  <div style={{ ...S.itemImg, backgroundImage: item.image ? `url(${item.image})` : undefined }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.itemName}>{item.name}</div>
                    {item.variant && <div style={S.itemVariant}>{item.variant}</div>}
                    <div style={S.itemPrice}>{formatPrice(item.price, store.currency)}</div>
                  </div>
                  <div style={S.qtyControl}>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} style={S.qtyBtn}>−</button>
                    <span style={S.qtyValue}>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={S.qtyBtn}>+</button>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} aria-label="Quitar" style={S.removeBtn}>×</button>
                </div>
              ))}
            </div>

            <div style={S.total}>
              <span>Total</span>
              <span>{formatPrice(totalPrice, store.currency)}</span>
            </div>

            <div style={S.form}>
              <input className="bl-cart-input" style={S.input} placeholder="Tu nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="bl-cart-input" style={S.input} placeholder="Tu teléfono (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <textarea className="bl-cart-input" style={{ ...S.input, resize: "none", minHeight: 60 }} placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {error && <div style={S.error}>{error}</div>}

            <button type="button" onClick={handleCheckout} disabled={sending} style={{ ...S.checkoutBtn, opacity: sending ? 0.6 : 1 }}>
              {sending ? "Enviando…" : "Pedir por WhatsApp"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  // z 400: por encima del modal de preview (300) — el carrito siempre es la capa superior
  overlay: { position: "fixed", inset: 0, background: "rgba(10,15,31,0.5)", zIndex: 400, display: "flex", justifyContent: "flex-end" },
  sheet: { background: "var(--bl-background)", width: "100%", maxWidth: 420, height: "100%", overflowY: "auto", padding: 24, display: "flex", flexDirection: "column" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  title: { fontFamily: "var(--bl-heading-font)", fontSize: 20, margin: 0, color: "var(--bl-text)" },
  closeBtn: { width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--bl-surface)", cursor: "pointer", fontSize: 14, color: "var(--bl-text)" },
  empty: { color: "var(--bl-text-muted)", padding: "40px 0", textAlign: "center" },
  items: { display: "flex", flexDirection: "column", gap: 12, flex: 1 },
  item: { display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "1px solid var(--bl-border)" },
  itemImg: { width: 52, height: 52, borderRadius: 8, background: "var(--bl-surface)", backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 },
  itemName: { fontSize: 13, fontWeight: 600, color: "var(--bl-text)" },
  itemVariant: { fontSize: 11, color: "var(--bl-text-muted)" },
  itemPrice: { fontSize: 12, fontFamily: "var(--bl-mono-font)", color: "var(--bl-primary)", marginTop: 2 },
  qtyControl: { display: "flex", alignItems: "center", border: "1px solid var(--bl-border)", borderRadius: 8, flexShrink: 0 },
  qtyBtn: { width: 26, height: 30, border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "var(--bl-text)" },
  qtyValue: { width: 24, textAlign: "center", fontSize: 12, fontWeight: 700 },
  removeBtn: { width: 24, height: 24, border: "none", background: "none", color: "var(--bl-text-muted)", cursor: "pointer", fontSize: 16, flexShrink: 0 },
  total: { display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, padding: "16px 0", borderTop: "1.5px solid var(--bl-border)", marginTop: 8, color: "var(--bl-text)" },
  form: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid var(--bl-border)", fontSize: 13, fontFamily: "inherit", background: "var(--bl-surface)", color: "var(--bl-text)" },
  error: { color: "var(--bl-accent)", fontSize: 12, marginBottom: 10 },
  checkoutBtn: { height: 46, borderRadius: 10, border: "none", background: "var(--bl-primary)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" },
}
