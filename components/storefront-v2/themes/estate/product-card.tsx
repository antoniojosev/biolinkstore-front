"use client"

import { useState, type CSSProperties } from "react"
import { Bath, Bed, Bookmark, Check, MapPin, Ruler } from "lucide-react"
import type { TemplateProduct } from "@/components/storefront-v2/template/template-renderer"
import { useCartOptional } from "@/lib/cart-context"
import { ESTATE, GRAY, RADIUS, inStock, navy, specsOf, tagsOf } from "./shared"

/**
 * EstatePropertyCard — la card del catálogo (spec §3): foto 3/2 con skeleton
 * y zoom en hover, badges Disponible/Destacada/"1/N fotos", botón guardar
 * (bookmark → carrito de guardadas, sin navegar) y body con precio navy,
 * fila de specs Bed/Bath/Ruler, título, tags (máx 3) y categoría con MapPin.
 */
export function EstatePropertyCard({
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
  const [imgLoaded, setImgLoaded] = useState(false)

  const image = product.images?.[0] ?? product.image ?? "/placeholder.svg"
  const imageCount = product.images?.length ?? 1
  const stocked = inStock(product)
  const specs = specsOf(product)
  const tags = tagsOf(product)
  const isSaved = cart?.items.some((i) => i.productId === product.id) ?? false

  const handleSave = (e: React.MouseEvent) => {
    // No navega: el guardado vive en el overlay de la card (spec §3).
    e.preventDefault()
    e.stopPropagation()
    if (!cart) return
    if (isSaved) {
      const item = cart.items.find((i) => i.productId === product.id)
      if (item) cart.removeItem(item.id)
    } else {
      cart.addItem({ id: product.id, productId: product.id, name: product.name, price: product.price, image })
    }
  }

  const card = (
    <article className="bl-estate-card" style={S.card}>
      {/* Imagen */}
      <div style={S.imageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.name}
          className="bl-estate-card-img"
          onLoad={() => setImgLoaded(true)}
          style={{ ...S.image, opacity: imgLoaded ? 1 : 0 }}
        />
        {!imgLoaded && <div className="bl-estate-skeleton" style={S.skeleton} />}

        {/* Contador de fotos */}
        {imageCount > 1 && <div style={S.photoCount}>1/{imageCount} fotos</div>}

        {/* Estado */}
        <div style={{ ...S.statusBadge, background: stocked ? ESTATE.emerald : ESTATE.red }}>
          {stocked ? "Disponible" : "No disponible"}
        </div>

        {/* Destacada (debajo del estado) */}
        {product.featured && (
          <div style={{ ...S.statusBadge, top: 36, background: ESTATE.gold, color: ESTATE.navy }}>
            Destacada
          </div>
        )}

        {/* Guardar */}
        <button
          type="button"
          className={`bl-estate-savebtn${isSaved ? " is-saved" : ""}`}
          onClick={handleSave}
          disabled={!cart}
          aria-label={isSaved ? "Quitar de guardados" : "Guardar propiedad"}
          aria-pressed={isSaved}
          style={{
            ...S.saveBtn,
            ...(isSaved
              ? { background: ESTATE.gold, color: "#fff", boxShadow: "0 4px 10px -2px rgba(0,0,0,.2)" }
              : { background: "rgba(255,255,255,.8)", color: GRAY.g600, backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }),
          }}
        >
          {isSaved ? (
            <Check style={{ width: 16, height: 16 }} strokeWidth={2.5} />
          ) : (
            <Bookmark style={{ width: 16, height: 16 }} />
          )}
        </button>
      </div>

      {/* Body */}
      <div style={S.body}>
        {/* Precio */}
        {showPrice && (
          <div style={S.priceRow}>
            <span style={S.price}>{fmt(product.price)}</span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <span style={S.compare}>{fmt(product.compareAtPrice)}</span>
            )}
          </div>
        )}

        {/* Fila de specs — la firma del tema */}
        {(specs.hab || specs.bath || specs.m2) && (
          <div style={S.specsRow}>
            {specs.hab && (
              <span style={S.spec}>
                <Bed style={S.specIcon} aria-hidden="true" />
                {specs.hab}
              </span>
            )}
            {specs.bath && (
              <span style={S.spec}>
                <Bath style={S.specIcon} aria-hidden="true" />
                {specs.bath}
              </span>
            )}
            {specs.m2 && (
              <span style={S.spec}>
                <Ruler style={S.specIcon} aria-hidden="true" />
                {specs.m2}m²
              </span>
            )}
          </div>
        )}

        {/* Título */}
        <h3 style={S.title}>{product.name}</h3>

        {/* Tags (máx 3) */}
        {tags.length > 0 && (
          <div style={S.tags}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} style={S.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Categoría / ubicación */}
        {product.category && (
          <p style={S.category}>
            <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} aria-hidden="true" />
            {product.category}
          </p>
        )}
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
    // Wrapper div (no <button>): la card trae botones internos y un boton no
    // puede anidar botones — rompia hidratacion en el canvas del editor.
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(product)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onOpen(product)
          }
        }}
        style={{ ...S.linkBtn, cursor: "pointer" }}
      >
        {card}
      </div>
    )
  }
  return card
}

const S: Record<string, CSSProperties> = {
  link: { display: "block", textDecoration: "none", color: "inherit", borderRadius: RADIUS.xxl },
  linkBtn: {
    display: "block", width: "100%", padding: 0, border: "none", background: "none",
    font: "inherit", color: "inherit", textAlign: "inherit", cursor: "pointer", borderRadius: RADIUS.xxl,
  },
  card: {
    position: "relative", display: "flex", flexDirection: "column", overflow: "hidden",
    borderRadius: RADIUS.xxl, background: ESTATE.surface,
    border: `1px solid ${GRAY.border100}`,
    boxShadow: "0 1px 2px rgba(0,0,0,.05)",
  },
  imageWrap: { position: "relative", aspectRatio: "3 / 2", overflow: "hidden", background: GRAY.chip100 },
  image: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  skeleton: { position: "absolute", inset: 0, background: GRAY.skeleton200 },
  photoCount: {
    position: "absolute", bottom: 8, left: 8,
    background: ESTATE.photoOverlay, color: "#fff",
    fontSize: 10, fontWeight: 500, padding: "4px 8px", borderRadius: RADIUS.md,
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
  },
  statusBadge: {
    position: "absolute", top: 8, left: 8,
    color: "#fff", fontSize: 10, fontWeight: 700,
    padding: "4px 10px", borderRadius: RADIUS.md,
    textTransform: "uppercase", letterSpacing: ".025em",
  },
  saveBtn: {
    position: "absolute", top: 8, right: 8,
    display: "grid", placeItems: "center", width: 32, height: 32,
    borderRadius: 999, border: "none", cursor: "pointer",
  },
  body: { display: "flex", flexDirection: "column", gap: 8, padding: 16 },
  priceRow: { display: "flex", alignItems: "baseline", gap: 8 },
  price: { fontSize: 20, fontWeight: 700, color: ESTATE.navy },
  compare: { fontSize: 14, color: GRAY.g400, textDecoration: "line-through" },
  specsRow: { display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: GRAY.g500 },
  spec: { display: "inline-flex", alignItems: "center", gap: 4 },
  specIcon: { width: 14, height: 14, color: navy(60), flexShrink: 0 },
  title: {
    margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.375, color: GRAY.strong,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  tags: { display: "flex", flexWrap: "wrap", gap: 4 },
  tag: {
    fontSize: 10, background: GRAY.chip100, color: GRAY.g500,
    padding: "2px 6px", borderRadius: RADIUS.md,
  },
  category: {
    margin: 0, display: "flex", alignItems: "center", gap: 4,
    fontSize: 12, color: GRAY.g400,
  },
}
