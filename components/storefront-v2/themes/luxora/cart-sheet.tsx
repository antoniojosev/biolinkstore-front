"use client"

import { useMemo, useState, type CSSProperties } from "react"
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import type { ThemeCartSheetProps } from "../registry"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import { catalogFmt } from "../shared/catalog-shell/support"
import { L, LRX, LUXORA_CSS } from "./shared"

/**
 * LuxoraCartSheet — carrito PROPIO del tema (spec luxora §5): drawer lateral
 * BLANCO PURO (no #FAFAF8), título "Mi carrito" sin icono + chip "N
 * artículo(s)", líneas separadas por divide-y con imagen 64px, trash arriba a
 * la derecha (muted3 → muted), stepper unido REDONDO (rounded-full) y TOTAL DE
 * LÍNEA precio×qty (vitrina muestra unitario), footer con Total bold y botón
 * negro rounded-2xl "Enviar cotización por WhatsApp". Se conserva el
 * formulario nombre/teléfono/notas del sistema nuevo (decisión de port §9)
 * estilizado monocromo (inputs surface, rounded-xl). Checkout: trackEvent
 * CHECKOUT_START → paymentProvider con manejo de result.success.
 */
export function LuxoraCartSheet({ store, paymentProvider }: ThemeCartSheetProps) {
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
    <div className="bl-luxora-root" style={S.overlay} onClick={() => setIsOpen(false)}>
      <style dangerouslySetInnerHTML={{ __html: LUXORA_CSS }} />
      <div style={S.drawer} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Mi carrito">
        {/* Header: título sin icono + chip "N artículos" (spec §5) */}
        <div style={S.header}>
          <span style={{ fontSize: 16, fontWeight: 700, color: L.ink }}>Mi carrito</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {items.length > 0 && (
              <span style={S.countChip}>
                {items.length} {items.length === 1 ? "artículo" : "artículos"}
              </span>
            )}
            <button type="button" className="bl-luxora-iconbtn" onClick={() => setIsOpen(false)} aria-label="Cerrar" style={S.closeBtn}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyCircle}>
              <ShoppingBag style={{ width: 28, height: 28, color: L.muted }} aria-hidden="true" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: L.ink }}>Tu carrito está vacío</p>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: L.muted }}>Agrega productos para continuar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Items — divide-y (no space-y) */}
            <div style={S.items}>
              {items.map((item, idx) => (
                <div key={item.id} style={{ display: "flex", gap: 12, padding: "16px 0", borderTop: idx > 0 ? `1px solid ${L.surface}` : "none" }}>
                  <div style={S.itemImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image || "/placeholder.svg"} alt={item.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
                      <p style={S.itemName}>{item.name}</p>
                      <button type="button" className="bl-luxora-trash" onClick={() => removeItem(item.id)} aria-label="Quitar del carrito" style={S.trashBtn}>
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                    {item.variant && <p style={S.itemVariant}>{item.variant}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      {/* Stepper unido REDONDO (rounded-full) */}
                      <div style={S.roundStepper}>
                        <button type="button" className="bl-luxora-roundstepbtn" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Quitar uno" style={S.roundStepBtn}>
                          <Minus style={{ width: 12, height: 12 }} />
                        </button>
                        <span style={{ width: 24, textAlign: "center", fontSize: 12, fontWeight: 600, color: L.ink }}>{item.quantity}</span>
                        <button type="button" className="bl-luxora-roundstepbtn" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Agregar uno" style={S.roundStepBtn}>
                          <Plus style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                      {/* Total de LÍNEA — precio×qty (spec §5) */}
                      <span style={{ fontSize: 14, fontWeight: 700, color: L.ink }}>{fmt(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={S.footer}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: L.ink }}>
                <span>Total</span>
                <span>{fmt(totalPrice)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input className="bl-luxora-input" style={S.input} placeholder="Tu nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="bl-luxora-input" style={S.input} placeholder="Tu teléfono (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <textarea className="bl-luxora-input" style={{ ...S.input, resize: "none", minHeight: 60 }} placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              {error && <div style={S.error}>{error}</div>}
              <button
                type="button"
                className="bl-luxora-inkbtn bl-luxora-scale98"
                onClick={handleCheckout}
                disabled={loading}
                style={{ ...S.checkoutBtn, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                <MessageCircle style={{ width: 16, height: 16 }} />
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
  // Scrim negro sobre el contenido (overlay rgba documentado — spec §9 shell).
  overlay: {
    position: "fixed", inset: 0, zIndex: 400,
    display: "flex", justifyContent: "flex-end",
    background: "rgba(0,0,0,0.5)",
    fontFamily: "var(--bl-body-font)",
  },
  // Blanco puro documentado (spec §5): el carrito NO es #FAFAF8.
  drawer: {
    display: "flex", flexDirection: "column",
    width: "100%", maxWidth: 448, height: "100%",
    background: L.cartBg, color: L.ink,
    borderLeft: `1px solid ${L.borderStrong}`,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 24px", borderBottom: `1px solid ${L.borderStrong}`,
  },
  countChip: {
    fontSize: 12, color: L.muted, background: L.cartChip,
    padding: "4px 8px", borderRadius: 999, whiteSpace: "nowrap",
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: LRX.xl,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", cursor: "pointer", color: L.muted,
  },
  empty: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "0 24px", gap: 16,
  },
  emptyCircle: {
    width: 64, height: 64, borderRadius: "50%", background: L.cartChip,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  items: {
    flex: 1, overflowY: "auto", padding: "8px 24px",
    display: "flex", flexDirection: "column",
  },
  itemImg: {
    position: "relative", height: 64, width: 64, flexShrink: 0,
    borderRadius: LRX.xl, overflow: "hidden", background: L.cartChip,
  },
  itemName: {
    margin: 0, fontSize: 14, fontWeight: 600, color: L.ink,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  itemVariant: { margin: "2px 0 0", fontSize: 12, color: L.muted },
  trashBtn: {
    flexShrink: 0, background: "none", border: "none", padding: 0,
    cursor: "pointer", color: L.muted3, display: "flex",
  },
  roundStepper: {
    display: "flex", alignItems: "center",
    border: `1px solid ${L.borderStrong}`, borderRadius: 999, overflow: "hidden",
  },
  roundStepBtn: {
    width: 28, height: 28, background: "transparent", border: "none",
    cursor: "pointer", color: L.muted,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  footer: {
    padding: "20px 24px", borderTop: `1px solid ${L.borderStrong}`,
    display: "flex", flexDirection: "column", gap: 16,
  },
  input: {
    padding: "10px 12px", borderRadius: LRX.xl,
    border: "none", background: L.surface,
    color: L.ink, fontSize: 13, fontFamily: "inherit", outline: "none",
  },
  // Error monocromo: sin rojo destructive documentado en la spec luxora.
  error: {
    fontSize: 12, fontWeight: 600, color: L.ink,
    background: L.surface, padding: "8px 12px", borderRadius: LRX.xl,
  },
  checkoutBtn: {
    width: "100%", height: 48, borderRadius: LRX.xl2, border: "none",
    background: L.ink, color: L.bg,
    fontSize: 14, fontWeight: 600, fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
}
