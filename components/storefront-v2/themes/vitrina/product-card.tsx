"use client"

import { useState, type CSSProperties } from "react"
import { Check, Plus, Share2 } from "lucide-react"
import { useCartOptional } from "@/lib/cart-context"
import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"
import { mix, useShare } from "../shared/catalog-shell/support"
import { productInStock } from "../shared/catalog-shell/variants"
import { V, VRX } from "./shared"

/**
 * VitrinaProductCard — port fiel de la card legacy (spec vitrina §3): card
 * con borde y fondo card, zoom 1.07 al hover, badges -N%/Destacado, share
 * hover-only, overlay Agotado, categoría + nombre + precio/compare y botón
 * quick-add cuadrado (Plus→Check 1800ms) que abre el carrito.
 * Wishlist del legacy OMITIDA (plan-gated, fuera de alcance del port).
 */
export function VitrinaProductCard({
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
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null

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
    <div className="bl-vitrina-card" style={S.card}>
      {/* Imagen */}
      <div style={S.imgBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.name} className="bl-vitrina-photo" style={S.img} />

        {/* Badges top-left */}
        <div style={S.badges}>
          {discount != null && <span style={S.discountBadge}>-{discount}%</span>}
          {product.featured && <span style={S.featuredBadge}>Destacado</span>}
        </div>

        {/* Share hover-only top-right */}
        {href && (
          <div style={S.actions}>
            <button type="button" className="bl-vitrina-share" onClick={handleShare} aria-label="Compartir" style={S.shareBtn}>
              {copied ? (
                <Check style={{ width: 14, height: 14, color: V.primary }} strokeWidth={2.5} />
              ) : (
                <Share2 style={{ width: 14, height: 14 }} />
              )}
            </button>
          </div>
        )}

        {!inStock && (
          <div style={S.soldOut}>
            <span style={S.soldOutText}>Agotado</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={S.info}>
        <div>
          {product.category && <p style={S.category}>{product.category}</p>}
          <h3 style={S.name}>{product.name}</h3>
        </div>
        <div style={S.bottomRow}>
          {showPrice ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={S.price}>{fmt(product.price)}</span>
              {product.compareAtPrice && (
                <span style={S.compare}>{fmt(product.compareAtPrice)}</span>
              )}
            </div>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="bl-vitrina-primarybtn"
            onClick={handleAdd}
            disabled={!inStock || !cart}
            aria-label="Agregar al carrito"
            style={{ ...S.addBtn, opacity: !inStock || !cart ? 0.5 : 1, cursor: !inStock || !cart ? "not-allowed" : "pointer" }}
          >
            {added ? (
              <Check style={{ width: 16, height: 16 }} strokeWidth={2.5} />
            ) : (
              <Plus style={{ width: 16, height: 16 }} strokeWidth={2.5} />
            )}
          </button>
        </div>
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
  card: {
    position: "relative", display: "flex", flexDirection: "column",
    overflow: "hidden", borderRadius: VRX.xl,
    background: V.card,
    border: `1px solid ${mix(V.border, 50)}`,
  },
  imgBox: { position: "relative", aspectRatio: "1 / 1", overflow: "hidden", background: V.muted },
  img: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  badges: { position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 },
  discountBadge: {
    background: V.primary, color: V.primaryFg,
    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, lineHeight: 1.4,
  },
  featuredBadge: {
    background: V.secondary, color: V.text,
    fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 6, lineHeight: 1.4,
  },
  actions: { position: "absolute", top: 8, right: 8, display: "flex", flexDirection: "column", gap: 6 },
  shareBtn: {
    width: 28, height: 28, borderRadius: "50%",
    background: mix(V.bg, 70), backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "none", cursor: "pointer", color: mix(V.text, 70), padding: 0,
  },
  soldOut: {
    position: "absolute", inset: 0,
    background: mix(V.bg, 75), backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  soldOutText: { fontSize: 12, fontWeight: 500, color: V.mutedFg, letterSpacing: "0.05em", textTransform: "uppercase" },
  info: { display: "flex", flexDirection: "column", gap: 8, padding: 12, flex: 1 },
  category: { margin: "0 0 2px", fontSize: 11, color: mix(V.mutedFg, 70), textTransform: "uppercase", letterSpacing: "0.05em" },
  name: {
    margin: 0, fontSize: 14, fontWeight: 500, lineHeight: 1.375, color: V.text,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  bottomRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4, marginTop: "auto" },
  price: { fontWeight: 700, color: V.primary, lineHeight: 1 },
  compare: { fontSize: 11, color: V.mutedFg, textDecoration: "line-through", lineHeight: 1.3, marginTop: 2 },
  addBtn: {
    height: 32, width: 32, flexShrink: 0, borderRadius: VRX.lg,
    background: V.primary, color: V.primaryFg, border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
}
