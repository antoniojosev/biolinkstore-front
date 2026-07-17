"use client"

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react"
import { Check, Plus, Star } from "lucide-react"
import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import { RS, ratingFor, rosierDiscount, rosierInStock, swatchesFor } from "./shared"

/**
 * RosierProductCard (spec §3): imagen 3/4 crema con hover scale + easing
 * firma, badges −%/Nuevo/Agotado, swatches reales de optionsMeta (fallback
 * pool), rating decorativo estable por producto (estrella rose, cifras del
 * HTML), precio rose-en-sale y CTA pill full-width "Añadir a la bolsa"
 * (ink→rose, added 1.4s). Wishlist legacy omitida (no existe en v2).
 */
export function RosierProductCard({
  product,
  fmt,
  showPrice,
  showSwatches,
  href,
  onOpen,
  cart,
  openCart,
}: {
  product: TemplateProduct
  fmt: (n: number) => string
  showPrice: boolean
  showSwatches: boolean
  href: string | null
  onOpen?: (p: TemplateProduct) => void
  cart: ReturnType<typeof useCartOptional>
  openCart: () => void
}) {
  const [added, setAdded] = useState(false)
  const inStock = rosierInStock(product)
  const image = product.images?.[0] ?? product.image ?? "/placeholder.svg"
  const discount = rosierDiscount(product.price, product.compareAtPrice)
  const isOnSale = discount != null
  const rating = ratingFor(product.id)
  const swatches = swatchesFor(product)

  function handleAdd(e: MouseEvent) {
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
    openCart()
    setTimeout(() => setAdded(false), 1400)
  }

  const media = (
    <div className="bl-rosier-imghover" style={S.imgWrap}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={product.name} loading="lazy" style={S.img} />
      {isOnSale && <span style={{ ...S.badge, background: RS.rose }}>−{discount}%</span>}
      {!isOnSale && product.featured && <span style={{ ...S.badge, background: RS.ink }}>Nuevo</span>}
      {!inStock && (
        <span style={{ ...S.badge, background: "color-mix(in srgb, var(--bl-secondary) 70%, transparent)" }}>
          Agotado
        </span>
      )}
      {showSwatches && swatches.length > 0 && (
        <div aria-hidden="true" style={S.swatches}>
          {swatches.map((c, i) => (
            <span key={`${c}-${i}`} style={{ ...S.swatch, background: c }} />
          ))}
        </div>
      )}
    </div>
  )

  function wrapMedia(children: ReactNode) {
    if (href) {
      return (
        <a href={href} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
          {children}
        </a>
      )
    }
    if (onOpen) {
      return (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onOpen(product)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onOpen(product)
          }}
          style={{ cursor: "pointer" }}
        >
          {children}
        </div>
      )
    }
    return children
  }

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
      {wrapMedia(
        <>
          {media}
          <h3 style={S.name}>{product.name}</h3>
        </>,
      )}

      <p style={S.rating}>
        <Star size={11} style={{ color: RS.rose }} fill="currentColor" strokeWidth={0} aria-hidden="true" />
        {rating.score} <span style={{ color: RS.muted }}>({rating.count})</span>
      </p>

      {showPrice && (
        <div style={S.priceRow}>
          <span style={{ fontSize: 16, fontWeight: 600, color: isOnSale ? RS.rose : RS.ink }}>
            {fmt(product.price)}
          </span>
          {isOnSale && (
            <span style={{ fontSize: 13, color: RS.muted, textDecoration: "line-through" }}>
              {fmt(product.compareAtPrice!)}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        className={added ? undefined : "bl-rosier-cta-ink"}
        onClick={handleAdd}
        disabled={!inStock}
        style={{
          ...S.cta,
          background: added ? RS.rose : RS.ink,
          opacity: inStock ? 1 : 0.5,
          cursor: inStock ? "pointer" : "not-allowed",
        }}
      >
        {added ? (
          <>
            <Check size={13} strokeWidth={2.2} aria-hidden="true" />
            Añadido
          </>
        ) : (
          <>
            <Plus size={13} strokeWidth={1.8} aria-hidden="true" />
            Añadir a la bolsa
          </>
        )}
      </button>
    </div>
  )
}

const S: Record<string, CSSProperties> = {
  imgWrap: {
    position: "relative", aspectRatio: "3/4", borderRadius: 4,
    overflow: "hidden", background: RS.bgSoft, marginBottom: 10,
  },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  badge: {
    position: "absolute", top: 10, left: 10,
    color: "#fff", fontSize: 10, fontWeight: 700,
    padding: "4px 8px", borderRadius: 3, letterSpacing: "0.025em",
    fontFamily: RS.sans,
  },
  swatches: { position: "absolute", left: 10, bottom: 10, display: "flex", gap: 4 },
  swatch: {
    width: 14, height: 14, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,.95)",
    boxShadow: "0 1px 4px rgba(0,0,0,.18)",
  },
  name: {
    fontSize: 13.5, fontWeight: 500, color: RS.ink, lineHeight: 1.375,
    margin: "0 0 4px", fontFamily: RS.sans,
    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  rating: {
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 11, color: RS.muted, margin: "0 0 6px", fontFamily: RS.sans,
  },
  priceRow: {
    display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10,
    fontVariantNumeric: "tabular-nums",
  },
  cta: {
    alignSelf: "stretch", display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: 6,
    padding: "10px 14px", borderRadius: 999, border: "none",
    fontSize: 12.5, fontWeight: 500, color: "#fff",
    fontFamily: RS.sans,
  },
}
