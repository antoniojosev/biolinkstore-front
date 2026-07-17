"use client"

import type { CSSProperties, ReactNode } from "react"
import { Bath, Bed, MessageCircle, Square } from "lucide-react"
import type { TemplateProduct, TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import {
  INM,
  buildWaHref,
  detectBadge,
  detectOperation,
  isRental,
  isSold,
  specsOf,
  waInquiryMessage,
} from "./shared"

interface Props {
  product: TemplateProduct
  store: TemplateStore
  fmt: (n: number) => string
  currency: string
  href?: string | null
  onOpen?: (p: TemplateProduct) => void
  showPrice?: boolean
}

/**
 * Property card del tema inmuebles (spec §3). 🔶 Manda el HTML aprobado:
 * card CONTENIDA (radio 20, borde suave, sombra 0 10px 32px -12px, body con
 * padding) en lugar de la imagen suelta del React legacy; se conserva la fila
 * de specs Bed/Bath/Square (feature aprobada del tema) y el badge por tag.
 * El bloque imagen+texto navega al detalle (a href / botón según contrato);
 * el CTA es un <a> de WhatsApp aparte (pill negra → hover verde #25d366).
 */
export function InmueblesPropertyCard({ product, store, fmt, currency, href, onOpen, showPrice = true }: Props) {
  const specs = specsOf(product)
  const image = product.images?.[0] ?? product.image ?? "/placeholder.svg"
  const hab = specs["Habitaciones"] ?? specs["Hab"]
  const bath = specs["Baños"] ?? specs["Banos"]
  const m2 = specs["m²"] ?? specs["m2"]
  const rental = isRental(product)
  const badge = detectBadge(product)
  const sold = isSold(product)

  const priceLabel = fmt(product.price)
  const waHref = buildWaHref(
    store.whatsappNumber,
    waInquiryMessage(store.name, product, priceLabel, currency),
  )

  const media = (
    <>
      <div className="bl-inm-card-img" style={S.imgWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.name} loading="lazy" style={S.img} />
        {badge && (
          <span
            style={{
              ...S.badge,
              ...(sold
                ? { background: INM.ink, color: INM.paper }
                : { background: "rgba(255,255,255,.95)", color: "#0a0a0a" }),
            }}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div style={S.body}>
        {showPrice && (
          <div style={S.priceRow}>
            <span style={S.price}>
              {priceLabel}
              {rental && <span style={S.priceSuffix}> /mes</span>}
            </span>
            <span style={S.currency}>{rental ? "Alquiler" : currency}</span>
          </div>
        )}
        <p style={S.name}>{product.name}</p>
        {product.category && <p style={S.category}>{product.category}</p>}
        {(hab || bath || m2) && (
          <div style={S.specsRow}>
            {hab && (
              <span style={S.spec}>
                <Bed style={S.specIcon} strokeWidth={1.6} aria-hidden="true" />
                <span className="bl-inm-skip">Habitaciones:</span>
                {hab}
              </span>
            )}
            {bath && (
              <span style={S.spec}>
                <Bath style={S.specIcon} strokeWidth={1.6} aria-hidden="true" />
                <span className="bl-inm-skip">Baños:</span>
                {bath}
              </span>
            )}
            {m2 && (
              <span style={S.spec}>
                <Square style={S.specIcon} strokeWidth={1.6} aria-hidden="true" />
                <span className="bl-inm-skip">Superficie:</span>
                {m2} m²
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )

  // Tienda real: <a href> (SEO/middle-click); editor/previews: botón + onOpenProduct.
  const clickable: ReactNode = href ? (
    <a href={href} style={S.link}>
      {media}
    </a>
  ) : (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onOpen?.(product)
      }}
      style={{ ...S.link, ...S.linkBtn }}
      aria-label={`Ver detalle de ${product.name}`}
    >
      {media}
    </button>
  )

  const ctaLabel = sold ? "Pedir similar" : "Contactar"

  return (
    <li className="bl-inm-card" style={S.card} data-operation={detectOperation(product)}>
      {clickable}
      <div style={{ padding: "0 20px 22px" }}>
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contactar por WhatsApp sobre ${product.name}`}
            onClick={(e) => e.stopPropagation()}
            className={sold ? "bl-inm-cta-sold" : "bl-inm-cta-wa"}
            style={{ ...S.cta, ...(sold ? S.ctaSold : S.ctaDark) }}
          >
            <MessageCircle style={{ width: 14, height: 14 }} aria-hidden="true" />
            {ctaLabel}
          </a>
        ) : (
          /* Sin teléfono: el CTA abre el detalle (la consulta agrupada vive en el drawer). */
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpen?.(product)
            }}
            className={sold ? "bl-inm-cta-sold" : "bl-inm-cta-wa"}
            style={{ ...S.cta, ...(sold ? S.ctaSold : S.ctaDark), width: "100%" }}
          >
            <MessageCircle style={{ width: 14, height: 14 }} aria-hidden="true" />
            {ctaLabel}
          </button>
        )}
      </div>
    </li>
  )
}

const S: Record<string, CSSProperties> = {
  // 🔶 Card contenida del HTML: radio 20, borde #f0f0f0, sombra suave.
  card: {
    display: "flex",
    flexDirection: "column",
    background: INM.paper,
    borderRadius: 20,
    overflow: "hidden",
    border: `1px solid color-mix(in srgb, var(--bl-border) 55%, var(--bl-background))`,
    boxShadow: "0 10px 32px -12px rgba(0,0,0,.12)",
  },
  link: { display: "block", color: "inherit", textDecoration: "none", flex: 1 },
  linkBtn: {
    background: "none",
    border: "none",
    padding: 0,
    textAlign: "left",
    cursor: "pointer",
    font: "inherit",
    width: "100%",
  },
  imgWrap: {
    position: "relative",
    aspectRatio: "4 / 3",
    overflow: "hidden",
    background: INM.imgPh,
  },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    padding: "5px 10px",
    borderRadius: 3,
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  },
  body: { padding: "19px 20px 0" },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  price: {
    fontSize: 20,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-.01em",
    color: INM.text,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  priceSuffix: { fontSize: 12, fontWeight: 500, color: INM.muted },
  currency: {
    fontSize: 12,
    fontWeight: 500,
    color: INM.muted,
    textTransform: "uppercase",
    letterSpacing: ".1em",
    flexShrink: 0,
  },
  name: {
    margin: "0 0 4px",
    fontSize: 14,
    lineHeight: 1.4,
    color: INM.text,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  category: {
    margin: "0 0 14px",
    fontSize: 12,
    color: INM.muted,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  specsRow: {
    display: "flex",
    gap: 14,
    fontSize: 12,
    color: INM.body,
    borderTop: `1px solid ${INM.border}`,
    paddingTop: 12,
    paddingBottom: 14,
    fontVariantNumeric: "tabular-nums",
  },
  spec: { display: "inline-flex", alignItems: "center", gap: 5 },
  specIcon: { width: 14, height: 14, flexShrink: 0 },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "11px 16px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    textDecoration: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  ctaDark: { background: INM.ink, color: INM.paper, border: "1px solid transparent" },
  ctaSold: {
    background: "transparent",
    color: INM.body,
    border: `1px solid ${INM.border}`,
  },
}
