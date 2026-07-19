"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { CartProvider, useCart } from "@/lib/cart-context"
import { WhatsAppPaymentProvider } from "@/lib/payment-providers/whatsapp"
import { trackEvent as trackLegacyEvent } from "@/lib/analytics"
import { trackEvent as trackStoreEvent } from "@/lib/storefront-tracking"
import { googleFontsHref } from "@/lib/google-fonts"
import type { PublicStoreTheme } from "@/lib/page-builder-api"
import { useRouter } from "next/navigation"
import { resolveTokens } from "./tokens"
import {
  colorImagesForSelection,
  NavBar,
  type PublicRate,
  type TemplateProduct,
  type TemplateStore,
} from "./template-renderer"
import { CartSheet } from "./cart-sheet"
import { getThemeOverlays } from "@/components/storefront-v2/themes/registry"

interface ProductPageClientProps {
  store: TemplateStore
  product: TemplateProduct
  /** Otros productos de la tienda para el strip "Más de {tienda}". */
  otherProducts: TemplateProduct[]
  theme: PublicStoreTheme
  rate?: PublicRate | null
}

function comboKey(combo: Record<string, string>): string {
  return Object.entries(combo).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join("|")
}

function formatPrice(amount: number, currency?: string | null): string {
  const c = currency ?? "USD"
  const symbol = c === "USD" ? "$" : c === "EUR" ? "€" : c === "VES" ? "Bs. " : ""
  return `${symbol}${amount.toLocaleString("es")}`
}

// La vista de detalle vive UNA vez acá (capa base del framework de temas) y
// se estiliza con los tokens del tema — todos los temas la tienen
// "obligatoria" gratis. Los temas del registry con ProductSheet propio
// despachan a su detalle diseñado (misma URL, mismo OG server-rendered);
// esta capa base queda como fallback.
export function ProductPageClient(props: ProductPageClientProps) {
  const overlays = getThemeOverlays(props.theme.template)
  return (
    <CartProvider storeSlug={props.store.slug}>
      {overlays.ProductSheet ? (
        <ThemedProductPage {...props} ProductSheet={overlays.ProductSheet} ThemeCart={overlays.CartSheet} />
      ) : (
        <ProductPageInner {...props} />
      )}
    </CartProvider>
  )
}

/**
 * Página de producto despachada al tema: renderiza el ProductSheet PROPIO
 * (todos son takeovers de pantalla completa) sobre un fondo con los tokens
 * del tema, más su carrito. "Volver"/cerrar navega a la tienda — el mismo
 * comportamiento del legacy, pero conservando URL propia por producto.
 */
function ThemedProductPage({
  store,
  product,
  theme,
  ProductSheet,
  ThemeCart,
}: ProductPageClientProps & {
  ProductSheet: NonNullable<ReturnType<typeof getThemeOverlays>["ProductSheet"]>
  ThemeCart: ReturnType<typeof getThemeOverlays>["CartSheet"]
}) {
  const router = useRouter()
  const resolved = resolveTokens(theme.tokens)

  const paymentProvider = useMemo(
    () => new WhatsAppPaymentProvider(store.whatsappNumber ?? "", store.currency ?? "USD"),
    [store.whatsappNumber, store.currency],
  )

  useEffect(() => {
    trackLegacyEvent(store.slug, "PRODUCT_VIEW", product.id)
    trackStoreEvent(store.slug, "PRODUCT_VIEW", product.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const CartComp = ThemeCart ?? CartSheet

  return (
    <div
      style={{
        ...(resolved.cssVars as CSSProperties),
        minHeight: "100dvh",
        background: "var(--bl-background)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <ProductSheet product={product} store={store} onClose={() => router.push(`/${store.slug}`)} />
      <CartComp store={store} paymentProvider={paymentProvider} />
    </div>
  )
}

const PD_RESPONSIVE = `
@container bl-pd (max-width: 760px) {
  .bl-pd-grid { grid-template-columns: 1fr !important; }
  .bl-pd-body { padding: 20px 16px !important; }
}
`

function ProductPageInner({ store, product, otherProducts, theme, rate }: ProductPageClientProps) {
  const resolved = resolveTokens(theme.tokens)
  const { addItem, totalItems, setIsOpen } = useCart()

  const canToggleCurrency = rate != null && (store.currency ?? "USD") !== "VES"
  const [showBs, setShowBs] = useState(false)
  const convert = (usd: number) => (canToggleCurrency && showBs ? usd * rate!.valueVes : usd)
  const displayCurrency = canToggleCurrency && showBs ? "VES" : store.currency ?? "USD"

  const [selected, setSelected] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [shared, setShared] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  // PRODUCT_VIEW una sola vez por montaje — cubre deep-links de WhatsApp y
  // navegación interna, ambos aterrizan acá.
  useEffect(() => {
    trackLegacyEvent(store.slug, "PRODUCT_VIEW", product.id)
    trackStoreEvent(store.slug, "PRODUCT_VIEW", product.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const axes = useMemo(() => {
    if (!product.variants?.length) return []
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
    if (!product.variants?.length || !fullySelected) return null
    const key = comboKey(selected)
    return product.variants.find((v) => comboKey(v.combination) === key) ?? null
  }, [product, selected, fullySelected])

  const finalPrice = product.price + (matchedVariant?.priceAdjustment ?? 0)
  // Fotos por color: si el color elegido tiene imágenes propias, la galería usa
  // esas; si no aplica, cae a la galería base del producto.
  const colorImgs = colorImagesForSelection(product, selected)
  const gallery = colorImgs ?? (product.images?.length ? product.images : product.image ? [product.image] : [])
  const mainImage = matchedVariant?.image || gallery[activeImage] || gallery[0]

  // Al cambiar las fotos por color, volver al primer thumbnail.
  useEffect(() => {
    setActiveImage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorImgs?.join("|")])
  const outOfStock = needsSelection
    ? matchedVariant?.isAvailable === false
    : product.stock != null && product.stock <= 0
  const canAdd = (!needsSelection || fullySelected) && !outOfStock

  const paymentProvider = useMemo(
    () => new WhatsAppPaymentProvider(store.whatsappNumber ?? "", store.currency ?? "USD"),
    [store.whatsappNumber, store.currency],
  )

  function handleAdd() {
    if (!canAdd) return
    const variantLabel = Object.values(selected).join(" / ") || undefined
    for (let i = 0; i < qty; i++) {
      addItem({
        id: matchedVariant ? `${product.id}-${matchedVariant.id}` : product.id,
        productId: product.id,
        variantId: matchedVariant?.id,
        name: product.name,
        price: finalPrice,
        image: mainImage ?? "",
        variant: variantLabel,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  async function handleShare() {
    const url = `${window.location.origin}/${store.slug}/${product.slug ?? ""}`
    const text = `${product.name} · ${formatPrice(product.price, store.currency)} — ${store.name}`
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url })
        return
      } catch {
        // usuario canceló el share sheet — no es error
        return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 1600)
    } catch {
      // clipboard bloqueado — nada que hacer
    }
  }

  const rootStyle = {
    ...resolved.cssVars,
    background: "var(--bl-background)",
    color: "var(--bl-text)",
    fontFamily: "var(--bl-body-font)",
    minHeight: "100vh",
    containerType: "inline-size",
    containerName: "bl-pd",
  } as CSSProperties

  return (
    <main style={rootStyle}>
      <link
        rel="stylesheet"
        precedence="default"
        href={googleFontsHref([resolved.headingFontName, resolved.bodyFontName, resolved.monoFontName])}
      />
      <style dangerouslySetInnerHTML={{ __html: PD_RESPONSIVE }} />

      <NavBar
        store={store}
        resolved={resolved}
        cartCount={totalItems}
        onOpenCart={() => setIsOpen(true)}
        canToggleCurrency={canToggleCurrency}
        showBs={showBs}
        onToggleCurrency={() => setShowBs((v) => !v)}
      />

      <div className="bl-pd-body" style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 28px 60px" }}>
        <a href={`/${store.slug}`} style={S.backLink}>
          ← {store.name}
        </a>

        <div className="bl-pd-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, marginTop: 18 }}>
          {/* Galería */}
          <div>
            <div style={{ aspectRatio: "1/1", borderRadius: resolved.radiusPx, background: "var(--bl-surface)", overflow: "hidden" }}>
              {mainImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={mainImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "var(--bl-border)" }} />
              )}
            </div>
            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto" }}>
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: 8,
                      overflow: "hidden",
                      padding: 0,
                      cursor: "pointer",
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor: i === activeImage ? "var(--bl-primary)" : "var(--bl-border)",
                      background: "var(--bl-surface)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${product.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalle */}
          <div>
            <h1 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 30, margin: "0 0 6px", lineHeight: 1.15 }}>
              {product.name}
            </h1>
            {product.category && <div style={S.category}>{product.category}</div>}

            <div style={{ margin: "14px 0 4px", fontFamily: "var(--bl-mono-font)", fontSize: 26, fontWeight: 700, color: "var(--bl-primary)" }}>
              {formatPrice(convert(finalPrice), displayCurrency)}
            </div>
            {rate && !showBs && (store.currency ?? "USD") !== "VES" && (
              <div style={S.bsLine}>≈ Bs. {(finalPrice * rate.valueVes).toLocaleString("es", { maximumFractionDigits: 0 })}</div>
            )}

            {product.description && <p style={S.description}>{product.description}</p>}

            {axes.map((axis) => (
              <div key={axis.name} style={{ marginBottom: 16 }}>
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

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
              <div style={S.qtyControl}>
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} style={S.qtyBtn}>−</button>
                <span style={S.qtyValue}>{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} style={S.qtyBtn}>+</button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!canAdd}
                style={{ ...S.addBtn, borderRadius: resolved.radiusPx, opacity: canAdd ? 1 : 0.5, cursor: canAdd ? "pointer" : "not-allowed" }}
              >
                {added ? "✓ Agregado" : "Agregar al carrito"}
              </button>
            </div>
            {added && (
              <button type="button" onClick={() => setIsOpen(true)} style={S.viewCartLink}>
                Ver carrito →
              </button>
            )}

            <button type="button" onClick={handleShare} style={{ ...S.shareBtn, borderRadius: resolved.radiusPx }}>
              {shared ? "✓ Link copiado" : "Compartir este producto"}
            </button>
          </div>
        </div>

        {otherProducts.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: "var(--bl-heading-font)", fontSize: 20, marginBottom: 16 }}>
              Más de {store.name}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
              {otherProducts.slice(0, 4).map((p) => (
                <a key={p.id} href={p.slug ? `/${store.slug}/${p.slug}` : `/${store.slug}`} style={{ ...S.relatedCard, borderRadius: resolved.radiusPx }}>
                  <div style={{ aspectRatio: "1/1", background: "var(--bl-border)" }}>
                    {p.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{ padding: "8px 10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontFamily: "var(--bl-mono-font)", fontSize: 12, color: "var(--bl-primary)", fontWeight: 600, marginTop: 4 }}>
                      {formatPrice(p.price, store.currency)}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <CartSheet store={store} paymentProvider={paymentProvider} />
    </main>
  )
}

const S: Record<string, CSSProperties> = {
  backLink: { fontSize: 13, color: "var(--bl-text-muted)", textDecoration: "none", fontWeight: 600 },
  category: { fontSize: 12, color: "var(--bl-text-muted)" },
  bsLine: { fontFamily: "var(--bl-mono-font)", fontSize: 13, color: "var(--bl-text-muted)" },
  description: { fontSize: 15, lineHeight: 1.65, color: "var(--bl-text-muted)", margin: "16px 0 20px" },
  axisLabel: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.06, color: "var(--bl-text-muted)", marginBottom: 8 },
  optionBtn: { padding: "8px 14px", borderRadius: 8, border: "1.5px solid var(--bl-border)", background: "transparent", color: "var(--bl-text)", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  optionBtnActive: { borderColor: "var(--bl-primary)", background: "var(--bl-primary)", color: "#fff" },
  hint: { fontSize: 13, color: "var(--bl-accent)", marginBottom: 12 },
  outOfStock: { fontSize: 13, color: "var(--bl-accent)", fontWeight: 600, marginBottom: 12 },
  qtyControl: { display: "flex", alignItems: "center", border: "1.5px solid var(--bl-border)", borderRadius: 10 },
  qtyBtn: { width: 38, height: 46, border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: "var(--bl-text)" },
  qtyValue: { width: 32, textAlign: "center", fontWeight: 700 },
  addBtn: { flex: 1, height: 46, border: "none", background: "var(--bl-primary)", color: "#fff", fontWeight: 700, fontSize: 14 },
  viewCartLink: { marginTop: 12, background: "none", border: "none", color: "var(--bl-primary)", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0, display: "block" },
  shareBtn: {
    marginTop: 18,
    width: "100%",
    height: 44,
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: "var(--bl-border)",
    background: "transparent",
    color: "var(--bl-text)",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  relatedCard: {
    display: "block",
    background: "var(--bl-surface)",
    border: "1px solid var(--bl-border)",
    overflow: "hidden",
    textDecoration: "none",
    color: "var(--bl-text)",
  },
}
