"use client"

import { useState, type CSSProperties } from "react"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import type { ThemeCartSheetProps } from "../registry"
import { useCart } from "@/lib/cart-context"
import { trackEvent } from "@/lib/analytics"
import { POSTER, POSTER_STYLES, cream, makeFmt } from "./shared"

/**
 * PosterCartSheet — carrito PROPIO del tema (spec §5). Drawer lateral rojo
 * oscuro (comportamiento shipping) estilizado con la pantalla checkout del
 * HTML aprobado: item cards con foto y stepper pill, bloque de totales sobre
 * negro translúcido, bloque "Cliente" (form nombre/teléfono/notas del
 * CartSheet genérico) y CTA WhatsApp verde gradiente #25d366→#128c7e.
 * El trigger es la cart bar flotante del renderer (onOpenCart → isOpen).
 */
export function PosterCartSheet({ store, paymentProvider }: ThemeCartSheetProps) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fmt = makeFmt(store.currency)

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
    <div className="bl-poster-root" style={S.overlay} onClick={() => setIsOpen(false)}>
      <style dangerouslySetInnerHTML={{ __html: POSTER_STYLES }} />
      <div
        style={S.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
      >
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerTitle}>
            <ShoppingBag style={{ width: 20, height: 20, color: POSTER.gold }} aria-hidden="true" />
            <span style={S.headerText}>Tu pedido</span>
          </div>
          <button
            type="button"
            className="bl-poster-iconbtn"
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
              <ShoppingBag style={{ width: 28, height: 28, color: cream(40) }} aria-hidden="true" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 500 }}>Tu pedido está vacío</p>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: cream(60) }}>
                Agrega platos del menú para hacer tu pedido
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Items — cards estilo checkout del HTML */}
            <div style={S.items}>
              {items.map((item) => (
                <div key={item.id} style={S.item}>
                  <div
                    style={{
                      ...S.itemImg,
                      backgroundImage: item.image ? `url(${item.image})` : undefined,
                    }}
                    role="img"
                    aria-label={item.name}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={S.itemTitle}>{item.name}</div>
                    {item.variant && <div style={S.itemVariants}>{item.variant}</div>}
                    <div style={S.itemPrice}>{fmt(item.price)}</div>
                    <div style={S.itemActions}>
                      <div style={S.qtyPill}>
                        <button
                          type="button"
                          className="bl-poster-ghostbtn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={S.qtyBtn}
                          aria-label="Quitar uno"
                        >
                          <Minus style={{ width: 12, height: 12 }} />
                        </button>
                        <span style={S.qtyValue}>{item.quantity}</span>
                        <button
                          type="button"
                          className="bl-poster-ghostbtn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={S.qtyBtn}
                          aria-label="Agregar uno"
                        >
                          <Plus style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="bl-poster-trash"
                        onClick={() => removeItem(item.id)}
                        style={S.trashBtn}
                        aria-label="Quitar del pedido"
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Totales — bloque negro translúcido del checkout HTML */}
              <div style={S.totals}>
                <div style={S.totalsRow}>
                  <span style={S.totalsLabel}>Total</span>
                  <span style={S.totalsAmount}>{fmt(totalPrice)}</span>
                </div>
              </div>

              {/* Cliente — form del CartSheet genérico con skin del bloque HTML */}
              <div style={S.customer}>
                <span style={S.customerLabel}>Cliente</span>
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
                  style={{ ...S.input, resize: "none", minHeight: 60 }}
                  placeholder="Notas (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {error && <div style={S.error}>{error}</div>}
            </div>

            {/* Footer — CTA WhatsApp verde gradiente */}
            <div style={S.footer}>
              <button
                type="button"
                className="bl-poster-wa-btn"
                onClick={handleCheckout}
                disabled={loading}
                style={{ ...S.waBtn, opacity: loading ? 0.7 : 1 }}
              >
                <WhatsAppIcon />
                {loading ? "Enviando..." : "Pedir por WhatsApp"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

const S: Record<string, CSSProperties> = {
  // z 400: capa superior — por encima del product sheet y del modal de preview.
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
    background: POSTER.drawerGradient,
    color: POSTER.cream,
    fontFamily: POSTER.inter,
    borderLeft: "1px solid rgba(255,255,255,.1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,.1)",
    padding: "16px 24px",
  },
  headerTitle: { display: "flex", alignItems: "center", gap: 8 },
  headerText: {
    fontFamily: POSTER.anton,
    fontSize: 18,
    letterSpacing: ".03em",
    textTransform: "uppercase",
  },
  closeBtn: {
    display: "grid", placeItems: "center", width: 32, height: 32,
    borderRadius: 999, border: "none", background: "rgba(255,255,255,.1)",
    color: POSTER.cream, cursor: "pointer",
  },
  empty: {
    display: "flex", flex: 1, flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 16, padding: "0 24px", textAlign: "center",
  },
  emptyCircle: {
    display: "grid", placeItems: "center", width: 64, height: 64,
    borderRadius: 999, background: "rgba(255,255,255,.05)",
  },
  items: { flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 },
  item: {
    display: "flex", gap: 12, padding: 12,
    borderRadius: 13,
    border: "1px solid rgba(255,255,255,.08)",
    background: "rgba(255,255,255,.06)",
  },
  itemImg: {
    width: 90, height: 90, flexShrink: 0,
    borderRadius: 11, background: "rgba(0,0,0,.3)",
    backgroundSize: "cover", backgroundPosition: "center",
    boxShadow: "0 8px 15px -5px rgba(0,0,0,.6)",
  },
  itemTitle: {
    fontFamily: POSTER.anton, fontSize: 16, letterSpacing: ".01em",
    lineHeight: 1.1, textTransform: "uppercase", color: "#fff",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  itemVariants: { marginTop: 4, fontSize: 11, lineHeight: 1.4, opacity: 0.7 },
  itemPrice: {
    marginTop: 4, fontFamily: POSTER.anton, fontSize: 15,
    letterSpacing: ".02em", color: POSTER.gold,
  },
  itemActions: { marginTop: 8, display: "flex", alignItems: "center", gap: 6 },
  qtyPill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    borderRadius: 999, background: "rgba(255,255,255,.08)", padding: 3,
  },
  qtyBtn: {
    display: "grid", placeItems: "center", width: 22, height: 22,
    borderRadius: 999, border: "none", background: "rgba(255,255,255,.1)",
    color: POSTER.cream, cursor: "pointer",
  },
  qtyValue: {
    minWidth: 20, textAlign: "center",
    fontFamily: POSTER.anton, fontSize: 14, color: POSTER.cream,
  },
  trashBtn: {
    marginLeft: "auto", display: "grid", placeItems: "center",
    width: 24, height: 24, border: "none", background: "none",
    color: cream(50), cursor: "pointer", transition: "color .2s ease",
  },
  totals: {
    marginTop: 4, padding: 16, borderRadius: 13,
    background: "rgba(0,0,0,.22)",
  },
  totalsRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  totalsLabel: {
    fontFamily: POSTER.anton, fontSize: 16, letterSpacing: ".02em",
    textTransform: "uppercase",
  },
  totalsAmount: {
    fontFamily: POSTER.anton, fontSize: 21, letterSpacing: ".02em",
    color: POSTER.gold,
  },
  customer: {
    display: "flex", flexDirection: "column", gap: 8,
    padding: 16, borderRadius: 13,
    background: "rgba(0,0,0,.18)",
    border: "1px solid rgba(255,255,255,.06)",
  },
  customerLabel: {
    fontSize: 11, fontWeight: 500, textTransform: "uppercase",
    letterSpacing: ".08em", color: cream(55),
  },
  input: {
    padding: "10px 12px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,.1)",
    background: "rgba(255,255,255,.06)",
    color: POSTER.cream, fontSize: 13, fontFamily: "inherit",
  },
  error: { fontSize: 12, color: "#f87171" },
  footer: { borderTop: "1px solid rgba(255,255,255,.1)", padding: "16px 24px 20px" },
  waBtn: {
    display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 999, border: "none", padding: "16px 20px",
    background: POSTER.waGradient, color: "#fff",
    fontFamily: POSTER.anton, fontSize: 19, fontWeight: 400,
    textTransform: "uppercase", letterSpacing: ".06em", cursor: "pointer",
    boxShadow: "0 12px 30px -8px rgba(37,211,102,.5)",
  },
}
