"use client"

import { useState, type CSSProperties } from "react"
import { ArrowRight, Check, ShoppingCart, Star } from "lucide-react"
import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import {
  POSTER,
  buildLabel,
  cream,
  echoFrom,
  inStock,
  isCustomizable,
  topBadgeFor,
} from "./shared"

/**
 * PosterProductCard — el "poster" (spec §3): dish circle con ring inset,
 * word echo con stroke, badges (build / marketing / agotado) y panel info
 * Anton/Allura. Customizables navegan ("Personalizar"); normales quick-add.
 */
export function PosterProductCard({
  product,
  fmt,
  href,
  onOpen,
  showPrice = true,
}: {
  product: TemplateProduct
  fmt: (n: number) => string
  href: string | null
  onOpen?: (p: TemplateProduct) => void
  showPrice?: boolean
}) {
  const cart = useCartOptional()
  const [added, setAdded] = useState(false)

  const customizable = isCustomizable(product)
  const stocked = inStock(product)
  const image = product.images?.[0] ?? product.image ?? "/placeholder.svg"
  const echo = echoFrom(product.name)
  const topBadge = topBadgeFor(product)
  const kicker = product.tagline ?? product.category

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!stocked || !cart) return
    cart.addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image,
    })
    setAdded(true)
    cart.setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const card = (
    <article className="bl-poster-card" style={S.card}>
      {/* Zona visual */}
      <div style={S.visual}>
        {/* Word echo — oculto en móvil (container query) */}
        <div aria-hidden="true" className="bl-poster-echo" style={S.echo}>
          {echo}
        </div>

        {/* Dish circle — sello del tema */}
        <div
          className="bl-poster-dish"
          style={{ ...S.dish, backgroundImage: `url(${image})` }}
          role="img"
          aria-label={product.name}
        />

        {/* Badges */}
        {customizable && (
          <div style={S.buildBadge}>
            <Star style={{ width: 12, height: 12 }} fill="currentColor" aria-hidden="true" />
            {buildLabel(product.name)}
          </div>
        )}
        {!customizable && topBadge && <div style={S.topBadge}>{topBadge}</div>}

        {!stocked && (
          <div style={S.soldOutOverlay}>
            <span style={S.soldOutPill}>Agotado</span>
          </div>
        )}
      </div>

      {/* Panel info */}
      <div style={S.panel}>
        {kicker && <div style={S.kicker}>{kicker}</div>}
        <h3 style={S.name}>{product.name}</h3>

        <div style={S.metaRow}>
          {showPrice ? (
            <div style={S.price}>
              {customizable && <span style={S.desde}>desde</span>}
              {fmt(product.price)}
              {product.compareAtPrice != null && product.compareAtPrice > product.price && (
                <small style={S.compare}>{fmt(product.compareAtPrice)}</small>
              )}
            </div>
          ) : (
            <span />
          )}

          {customizable ? (
            <span className="bl-poster-cream-btn" style={S.creamBtn} aria-hidden="true">
              Personalizar
              <ArrowRight style={{ width: 12, height: 12 }} strokeWidth={2.5} />
            </span>
          ) : (
            <button
              type="button"
              className="bl-poster-cream-btn"
              onClick={handleAdd}
              disabled={!stocked || !cart}
              style={{ ...S.creamBtn, opacity: stocked ? 1 : 0.5, cursor: stocked ? "pointer" : "default" }}
              aria-label={added ? "Agregado al pedido" : `Agregar ${product.name} al pedido`}
            >
              {added ? (
                <>
                  <Check style={{ width: 12, height: 12 }} strokeWidth={2.5} />
                  Listo
                </>
              ) : (
                <>
                  Agregar
                  <ShoppingCart style={{ width: 12, height: 12 }} strokeWidth={2.2} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  )

  if (href) {
    return (
      <a href={href} style={S.link}>
        {card}
      </a>
    )
  }
  if (onOpen) {
    return (
      <button type="button" onClick={() => onOpen(product)} style={S.linkBtn}>
        {card}
      </button>
    )
  }
  return card
}

const S: Record<string, CSSProperties> = {
  link: { display: "block", borderRadius: 22, textDecoration: "none", color: "inherit" },
  linkBtn: {
    display: "block", width: "100%", padding: 0, border: "none", background: "none",
    font: "inherit", color: "inherit", textAlign: "inherit", cursor: "pointer", borderRadius: 22,
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,.05)",
    background: POSTER.cardGradient,
    boxShadow: "0 14px 40px -12px rgba(0,0,0,.6)",
  },
  visual: { position: "relative", overflow: "hidden", aspectRatio: "1 / 0.78" },
  echo: {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    placeItems: "center",
    userSelect: "none",
    color: "transparent",
    fontFamily: POSTER.anton,
    fontSize: "clamp(64px, 14cqw, 110px)",
    letterSpacing: "-.02em",
    lineHeight: 1,
    WebkitTextStroke: "1.5px rgba(255,255,255,.09)",
  },
  dish: {
    position: "absolute",
    left: "50%",
    top: "50%",
    zIndex: 1,
    aspectRatio: "1 / 1",
    width: "78%",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 18px 40px -10px rgba(0,0,0,.65), inset 0 0 0 5px rgba(255,255,255,.08)",
  },
  buildBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 3,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    padding: "6px 10px 6px 8px",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".05em",
    color: "#4a0a0a",
    background: POSTER.goldGradient,
    boxShadow: "0 6px 14px -4px rgba(244,162,58,.7)",
  },
  topBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 3,
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".05em",
    color: "var(--bl-background)",
    background: POSTER.gold,
  },
  soldOutOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 4,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,.55)",
  },
  soldOutPill: {
    borderRadius: 999,
    background: POSTER.cream,
    padding: "4px 12px",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".12em",
    color: "var(--bl-background)",
  },
  panel: {
    borderTop: "1px solid rgba(255,255,255,.05)",
    background: `linear-gradient(180deg, color-mix(in srgb, var(--bl-surface) 95%, transparent) 0%, var(--bl-surface) 100%)`,
    padding: "14px 16px 16px",
    textAlign: "center",
  },
  kicker: { fontFamily: POSTER.allura, fontSize: 22, lineHeight: 1, color: POSTER.goldSoft },
  name: {
    margin: 0,
    fontFamily: POSTER.anton,
    fontSize: "clamp(20px, 4.5cqw, 24px)",
    fontWeight: 400,
    letterSpacing: ".01em",
    lineHeight: 1.05,
    textTransform: "uppercase",
    color: "#fff",
  },
  metaRow: {
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  price: {
    textAlign: "left",
    lineHeight: 1,
    fontFamily: POSTER.anton,
    fontSize: 21,
    letterSpacing: ".02em",
    color: POSTER.gold,
  },
  desde: {
    display: "block",
    marginBottom: -2,
    fontFamily: POSTER.inter,
    fontSize: 10,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: ".1em",
    color: cream(70),
  },
  compare: {
    marginLeft: 4,
    fontFamily: POSTER.inter,
    fontSize: 11,
    fontWeight: 400,
    color: cream(70),
    textDecoration: "line-through",
  },
  creamBtn: {
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    border: "none",
    background: POSTER.cream,
    padding: "8px 14px",
    fontFamily: POSTER.inter,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".05em",
    color: "var(--bl-background)",
    cursor: "pointer",
  },
}
