"use client"

import { useState, type CSSProperties } from "react"
import { Check, Plus, Share2 } from "lucide-react"
import { useCartOptional } from "@/lib/cart-context"
import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"
import { useShare } from "../shared/catalog-shell/support"
import { productInStock } from "../shared/catalog-shell/variants"
import { L, LRX } from "./shared"

/**
 * LuxoraProductCard — port fiel de la card legacy (spec luxora §3): card
 * DESNUDA sin borde ni fondo, imagen protagonista rounded-2xl con zoom 1.05,
 * badge "SALE" fijo (sin %), share hover-only con iconos desnudos sobre la
 * foto, overlay Agotado blanco, quick-add circular flotante que aparece al
 * hover (Plus→Check 1800ms, escala 1.1) y abre el carrito. Info minimal:
 * nombre + precio/compare, sin categoría ni botón visible.
 * Wishlist del legacy OMITIDA (plan-gated, fuera de alcance del port).
 */
export function LuxoraProductCard({
  product,
  fmt,
  href,
  onOpen,
  showPrice,
  onOpenCart,
}: {
  product: TemplateProduct
  fmt: (n: number) => string
  href: string | null
  onOpen?: (p: TemplateProduct) => void
  showPrice: boolean
  onOpenCart: () => void
}) {
  const cart = useCartOptional()
  const { share, copied } = useShare()
  const [added, setAdded] = useState(false)

  const image = product.images?.[0] ?? product.image ?? "/placeholder.svg"
  const inStock = productInStock(product)
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!href) return
    share(`${window.location.origin}${href}`, product.name)
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock || !cart) return
    cart.addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image,
    })
    setAdded(true)
    onOpenCart()
    setTimeout(() => setAdded(false), 1800)
  }

  const card = (
    <div className="bl-luxora-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Imagen protagonista */}
      <div style={S.imgBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.name} className="bl-luxora-photo" style={S.img} />

        {/* Share hover-only — icono desnudo sobre la foto */}
        {href && (
          <div style={S.actions}>
            <button type="button" className="bl-luxora-share" onClick={handleShare} aria-label="Compartir" style={S.nakedBtn}>
              {copied ? (
                <Check style={{ width: 16, height: 16, color: L.ink, background: "#fff", borderRadius: 999, padding: 2 }} strokeWidth={2.5} />
              ) : (
                <Share2 style={{ width: 16, height: 16, color: "rgba(255,255,255,.8)", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.15))" }} strokeWidth={1.5} />
              )}
            </button>
          </div>
        )}

        {/* Badge SALE — texto fijo, sin porcentaje */}
        {onSale && <div style={S.saleBadge}>SALE</div>}

        {!inStock && (
          <div style={S.soldOut}>
            <span style={S.soldOutText}>Agotado</span>
          </div>
        )}

        {/* Quick-add flotante */}
        {inStock && cart && (
          <button
            type="button"
            className="bl-luxora-quickadd"
            data-added={added}
            onClick={handleAdd}
            aria-label="Agregar al carrito"
            style={{
              ...S.quickAdd,
              ...(added
                ? { background: L.ink, color: L.bg }
                : { background: "rgba(255,255,255,.9)", color: L.ink }),
            }}
          >
            {added ? (
              <Check style={{ width: 14, height: 14 }} strokeWidth={2.5} />
            ) : (
              <Plus style={{ width: 14, height: 14 }} strokeWidth={2.5} />
            )}
          </button>
        )}
      </div>

      {/* Info minimal */}
      <div style={{ padding: "0 2px" }}>
        <p style={S.name}>{product.name}</p>
        {showPrice && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: L.ink }}>{fmt(product.price)}</span>
            {onSale && (
              <span style={{ fontSize: 12, color: L.muted, textDecoration: "line-through" }}>
                {fmt(product.compareAtPrice!)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
        {card}
      </a>
    )
  }
  return (
    <button
      type="button"
      onClick={() => onOpen?.(product)}
      style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: onOpen ? "pointer" : "default" }}
    >
      {card}
    </button>
  )
}

const S: Record<string, CSSProperties> = {
  imgBox: {
    position: "relative", aspectRatio: "1 / 1",
    borderRadius: LRX.xl2, overflow: "hidden", background: L.imageBg,
  },
  img: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  actions: { position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 6, zIndex: 5 },
  nakedBtn: { background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" },
  saleBadge: {
    position: "absolute", top: 10, left: 10,
    background: L.ink, color: L.bg,
    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, lineHeight: 1.5,
  },
  soldOut: {
    position: "absolute", inset: 0,
    background: "rgba(255,255,255,.7)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    borderRadius: LRX.xl2,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  soldOutText: { fontSize: 12, fontWeight: 600, color: L.ink, letterSpacing: "0.1em", textTransform: "uppercase" },
  quickAdd: {
    position: "absolute", bottom: 10, right: 10,
    height: 32, width: 32, borderRadius: 999, border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)",
  },
  name: {
    margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.375, color: L.ink,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
}
