"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle } from "lucide-react"
import type { ThemeProductSheetProps } from "@/components/storefront-v2/themes/registry"
import { bookService, profilePriceFmt, useProfileWhatsAppProvider } from "./index"

/**
 * Detalle de producto PROPIO de persona/servicios (spec §4), como sheet
 * lateral para los previews (el registry lo monta vía slot ProductSheet).
 * Port fiel del product-detail.tsx legacy: imagen 4:3 + thumbs, categoría
 * accent, specs role='spec', tags role='tag', descripción colapsable
 * (line-clamp-4), card del profesional y CTA sticky verde "Agendar por
 * WhatsApp" con checkout directo de 1 item. Sin variantes, sin qty, sin
 * stock, sin share — el tema agenda, no vende por carrito.
 *
 * #25D366 hardcoded por spec (identidad WhatsApp). Todo lo demás por tokens.
 */
export function ProfileProductSheet({ product, store, onClose }: ThemeProductSheetProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [loading, setLoading] = useState(false)

  const paymentProvider = useProfileWhatsAppProvider(store)
  const fmt = useMemo(() => profilePriceFmt(store.currency ?? "USD"), [store.currency])

  // El sheet queda montado entre productos: resetear estado al cambiar.
  useEffect(() => {
    setSelectedImage(0)
    setShowFullDesc(false)
    setLoading(false)
  }, [product?.id])

  if (!product) return null

  const images = product.images?.length ? product.images : product.image ? [product.image] : []
  const specs = (product.attributes ?? []).filter((a) => a.role === "spec")
  const tags = (product.attributes ?? []).filter((a) => a.role === "tag").flatMap((a) => a.options)

  async function handleBook() {
    if (!product || !store.whatsappNumber || loading) return
    setLoading(true)
    try {
      await bookService(store, paymentProvider, product, images[0])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={product.name}>
        <style dangerouslySetInnerHTML={{ __html: SHEET_STYLES }} />

        {/* Sticky nav "Volver" (bg-white/95 + blur del legacy) */}
        <div style={S.nav}>
          <button type="button" onClick={onClose} className="bl-profile-back" style={S.backBtn}>
            <ArrowLeft size={16} />
            Volver
          </button>
        </div>

        {/* Imagen principal 4:3 */}
        <div style={S.imageWrap}>
          {images[selectedImage] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={images[selectedImage]} alt={product.name} style={S.image} />
          ) : (
            <div style={{ ...S.image, background: "var(--bl-border)" }} />
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={S.thumbRow}>
            {images.map((img, idx) => {
              const active = idx === selectedImage
              return (
                <button
                  key={idx}
                  type="button"
                  className="bl-profile-pd-thumb"
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    ...S.thumb,
                    borderColor: active ? "var(--bl-primary)" : "transparent",
                    opacity: active ? 1 : 0.6,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              )
            })}
          </div>
        )}

        {/* Info del servicio */}
        <div style={S.info}>
          {product.category && <p style={S.category}>{product.category}</p>}

          <div>
            <h1 style={S.title}>{product.name}</h1>
            <p style={S.price}>{fmt(product.price)}</p>
          </div>

          {specs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {specs.map((attr) => (
                <div key={attr.name} style={S.specRow}>
                  <span style={{ color: "var(--bl-text-muted)" }}>{attr.name}</span>
                  <span style={{ fontWeight: 500, color: "var(--bl-text)" }}>{attr.options[0]}</span>
                </div>
              ))}
            </div>
          )}

          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tags.map((tag) => (
                <span key={tag} style={S.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {product.description && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                className="bl-profile-back"
                onClick={() => setShowFullDesc((v) => !v)}
                style={S.descToggle}
              >
                Descripción
                {showFullDesc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <p style={{ ...S.desc, ...(showFullDesc ? {} : S.descClamped) }}>{product.description}</p>
            </div>
          )}

          {/* Card del profesional */}
          <div style={S.proCard}>
            {store.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={store.avatar} alt={store.name} style={S.proAvatar} />
            ) : (
              <div style={{ ...S.proAvatar, background: "var(--bl-primary)", display: "grid", placeItems: "center", color: "#fff", fontSize: 16, fontWeight: 800 }}>
                {store.name[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={S.proName}>{store.name}</p>
              {store.bio && <p style={S.proBio}>{store.bio}</p>}
            </div>
          </div>
        </div>

        {/* CTA sticky inferior — verde WhatsApp */}
        {store.whatsappNumber && (
          <div style={S.ctaBar}>
            <button type="button" onClick={handleBook} disabled={loading} style={{ ...S.ctaBtn, opacity: loading ? 0.7 : 1 }}>
              <MessageCircle size={20} />
              {loading ? "Abriendo WhatsApp..." : "Agendar por WhatsApp"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const SHEET_STYLES = `
.bl-profile-back { transition: color .2s ease; }
.bl-profile-back:hover { color: var(--bl-text) !important; }
.bl-profile-pd-thumb { transition: opacity .2s ease, border-color .2s ease; }
.bl-profile-pd-thumb:hover { opacity: 1 !important; }
`

const S: Record<string, CSSProperties> = {
  // z 400: por encima del modal de preview (300), como los sheets genéricos
  overlay: { position: "fixed", inset: 0, background: "rgba(10,15,31,0.5)", zIndex: 400, display: "flex", justifyContent: "flex-end" },
  sheet: { background: "var(--bl-background)", color: "var(--bl-text)", fontFamily: "var(--bl-body-font)", width: "100%", maxWidth: 480, height: "100%", overflowY: "auto", position: "relative" },
  nav: {
    position: "sticky", top: 0, zIndex: 3,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px",
    background: "color-mix(in srgb, var(--bl-background) 95%, transparent)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "var(--bl-border)",
  },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 14, color: "var(--bl-text-muted)",
    background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
  },
  imageWrap: { position: "relative", aspectRatio: "4 / 3", overflow: "hidden", background: "var(--bl-surface)" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  thumbRow: { display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto" },
  thumb: {
    flexShrink: 0, width: 56, height: 56, borderRadius: 8, overflow: "hidden",
    borderWidth: 2, borderStyle: "solid", padding: 0,
    background: "var(--bl-surface)", cursor: "pointer",
  },
  // pb-36 (144px) del legacy: aire para el CTA sticky
  info: { padding: "20px 16px 144px", display: "flex", flexDirection: "column", gap: 20 },
  category: { fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--bl-primary)", margin: 0 },
  title: { fontFamily: "var(--bl-heading-font)", fontSize: 24, fontWeight: 700, lineHeight: 1.25, margin: 0, color: "var(--bl-text)" },
  price: { fontSize: 24, fontWeight: 700, color: "var(--bl-primary)", margin: "8px 0 0" },
  specRow: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 },
  tag: {
    fontSize: 12, padding: "4px 10px", borderRadius: 999, fontWeight: 500,
    background: "color-mix(in srgb, var(--bl-primary) 6%, transparent)",
    color: "var(--bl-primary)",
  },
  descToggle: {
    display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
    fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500,
    color: "var(--bl-text-muted)", background: "none", border: "none", cursor: "pointer",
    padding: 0, fontFamily: "inherit",
  },
  desc: {
    fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line", margin: 0,
    color: "color-mix(in srgb, var(--bl-text) 62%, var(--bl-text-muted))",
  },
  descClamped: { display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" },
  proCard: {
    display: "flex", alignItems: "center", gap: 12,
    background: "var(--bl-surface)", borderRadius: "var(--bl-radius)", padding: 16,
  },
  proAvatar: { width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  proName: { fontSize: 14, fontWeight: 700, margin: 0, color: "var(--bl-text)" },
  proBio: {
    fontSize: 12, color: "var(--bl-text-muted)", margin: "2px 0 0",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  ctaBar: {
    position: "sticky", bottom: 0, zIndex: 3, padding: 16,
    background: "color-mix(in srgb, var(--bl-background) 90%, transparent)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--bl-border)",
  },
  // h-13 del legacy era no-op; 52px es la intención de diseño (spec §4.5)
  ctaBtn: {
    width: "100%", height: 52, borderRadius: 12, border: "none",
    background: "#25D366", color: "#fff", fontWeight: 600, fontSize: 16,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  },
}
