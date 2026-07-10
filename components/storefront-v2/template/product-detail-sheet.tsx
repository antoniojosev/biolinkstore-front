"use client"

import { useMemo, useState } from "react"
import type { TemplateProduct, TemplateStore } from "./template-renderer"
import { useCart } from "@/lib/cart-context"

function comboKey(combo: Record<string, string>): string {
  return Object.entries(combo).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join("|")
}

function formatPrice(amount: number, currency?: string | null): string {
  const c = currency ?? "USD"
  const symbol = c === "USD" ? "$" : c === "EUR" ? "€" : c === "VES" ? "Bs. " : ""
  return `${symbol}${amount.toLocaleString("es")}`
}

export function ProductDetailSheet({
  product,
  store,
  onClose,
}: {
  product: TemplateProduct | null
  store: TemplateStore
  onClose: () => void
}) {
  const { addItem, setIsOpen } = useCart()
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  // Axes available on this product (from its variants' combination keys)
  const axes = useMemo(() => {
    if (!product?.variants?.length) return []
    const names = new Set<string>()
    for (const v of product.variants) Object.keys(v.combination).forEach((k) => names.add(k))
    const options = new Map<string, Set<string>>()
    for (const name of names) {
      const set = new Set<string>()
      for (const v of product.variants) if (v.combination[name]) set.add(v.combination[name])
      options.set(name, set)
    }
    return Array.from(options.entries()).map(([name, set]) => ({ name, options: Array.from(set) }))
  }, [product])

  const needsSelection = axes.length > 0
  const fullySelected = axes.every((a) => selected[a.name])
  const matchedVariant = useMemo(() => {
    if (!product?.variants?.length || !fullySelected) return null
    const key = comboKey(selected)
    return product.variants.find((v) => comboKey(v.combination) === key) ?? null
  }, [product, selected, fullySelected])

  if (!product) return null

  const finalPrice = product.price + (matchedVariant?.priceAdjustment ?? 0)
  const image = matchedVariant?.image || product.images?.[0] || product.image
  const outOfStock = needsSelection ? matchedVariant?.isAvailable === false : (product.stock != null && product.stock <= 0)
  const canAdd = (!needsSelection || fullySelected) && !outOfStock

  function handleAdd() {
    if (!canAdd) return
    const variantLabel = Object.values(selected).join(" / ") || undefined
    for (let i = 0; i < qty; i++) {
      addItem({
        id: matchedVariant ? `${product!.id}-${matchedVariant.id}` : product!.id,
        productId: product!.id,
        variantId: matchedVariant?.id,
        name: product!.name,
        price: finalPrice,
        image: image ?? "",
        variant: variantLabel,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={product.name}>
        <button type="button" onClick={onClose} aria-label="Cerrar" style={S.closeBtn}>✕</button>
        <div style={S.imageWrap}>
          {image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={image} alt={product.name} style={S.image} />
          ) : (
            <div style={{ ...S.image, background: "var(--bl-border)" }} />
          )}
        </div>
        <div style={S.body}>
          <h2 style={S.title}>{product.name}</h2>
          {product.category && <div style={S.category}>{product.category}</div>}
          <div style={S.price}>{formatPrice(finalPrice, store.currency)}</div>
          {product.description && <p style={S.description}>{product.description}</p>}

          {axes.map((axis) => (
            <div key={axis.name} style={{ marginBottom: 14 }}>
              <div style={S.axisLabel}>{axis.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {axis.options.map((opt) => {
                  const active = selected[axis.name] === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelected((s) => ({ ...s, [axis.name]: opt }))}
                      style={{ ...S.optionBtn, ...(active ? S.optionBtnActive : {}) }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {needsSelection && !fullySelected && (
            <div style={S.hint}>Elige {axes.map((a) => a.name.toLowerCase()).join(" y ")} para continuar.</div>
          )}
          {outOfStock && <div style={S.outOfStock}>Sin stock disponible.</div>}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <div style={S.qtyControl}>
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} style={S.qtyBtn}>−</button>
              <span style={S.qtyValue}>{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} style={S.qtyBtn}>+</button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              style={{ ...S.addBtn, opacity: canAdd ? 1 : 0.5, cursor: canAdd ? "pointer" : "not-allowed" }}
            >
              {added ? "✓ Agregado" : "Agregar al carrito"}
            </button>
          </div>
          {added && (
            <button type="button" onClick={() => { setIsOpen(true); onClose() }} style={S.viewCartLink}>
              Ver carrito →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(10,15,31,0.5)", zIndex: 100, display: "flex", justifyContent: "flex-end" },
  sheet: { background: "var(--bl-background)", width: "100%", maxWidth: 480, height: "100%", overflowY: "auto", position: "relative" },
  closeBtn: { position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, zIndex: 2 },
  imageWrap: { width: "100%", aspectRatio: "1/1", background: "var(--bl-surface)" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  body: { padding: 24 },
  title: { fontFamily: "var(--bl-heading-font)", fontSize: 22, margin: "0 0 4px", color: "var(--bl-text)" },
  category: { fontSize: 12, color: "var(--bl-text-muted)", marginBottom: 10 },
  price: { fontFamily: "var(--bl-mono-font)", fontSize: 20, fontWeight: 700, color: "var(--bl-primary)", marginBottom: 14 },
  description: { fontSize: 14, lineHeight: 1.6, color: "var(--bl-text-muted)", marginBottom: 18 },
  axisLabel: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.06, color: "var(--bl-text-muted)", marginBottom: 8 },
  optionBtn: { padding: "8px 14px", borderRadius: 8, border: "1.5px solid var(--bl-border)", background: "transparent", color: "var(--bl-text)", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  optionBtnActive: { borderColor: "var(--bl-primary)", background: "var(--bl-primary)", color: "#fff" },
  hint: { fontSize: 13, color: "var(--bl-accent)", marginBottom: 12 },
  outOfStock: { fontSize: 13, color: "var(--bl-accent)", fontWeight: 600, marginBottom: 12 },
  qtyControl: { display: "flex", alignItems: "center", border: "1.5px solid var(--bl-border)", borderRadius: 10 },
  qtyBtn: { width: 36, height: 44, border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: "var(--bl-text)" },
  qtyValue: { width: 32, textAlign: "center", fontWeight: 700 },
  addBtn: { flex: 1, height: 44, borderRadius: 10, border: "none", background: "var(--bl-primary)", color: "#fff", fontWeight: 700, fontSize: 14 },
  viewCartLink: { marginTop: 12, background: "none", border: "none", color: "var(--bl-primary)", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0 },
}
