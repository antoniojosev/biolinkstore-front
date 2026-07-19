"use client"

import { useEffect, useState } from "react"
import { fetchTemplatePreview, type TemplatePreviewData } from "@/lib/page-builder-api"
import type { TemplateProduct, TemplateCategory, TemplateStore, TemplateVariant } from "@/components/storefront-v2/template/template-renderer"
import { PreviewStorefront } from "@/components/storefront-v2/template/preview-storefront"
import { resolveTokens } from "@/components/storefront-v2/template/tokens"
import { googleFontsHref } from "@/lib/google-fonts"
import { useStoreCatalogPreview } from "@/lib/hooks/use-store-catalog-preview"
import { DeviceToggle, type PreviewDevice } from "./device-toggle"
import { IframePreview } from "./iframe-preview"

type DataSource = "demo" | "mine"

interface Props {
  templateKey: string | null
  onClose: () => void
}

// Los productos demo traen ejes de atributos (Talla/Color…) igual que las
// tiendas demo reales; acá se materializan como variantes (cartesiano
// completo) para que el detalle del preview muestre los selectores y el flujo
// funcione como en prod. Roles no-seleccionables (spec/tag/ingredient-*)
// quedan fuera — los consumen los renderers por tema.
function demoVariants(p: TemplatePreviewData["demoData"]["products"][number]): TemplateVariant[] | undefined {
  const axes = (p.attributes ?? []).filter((a) => !a.role || a.role === "variant")
  if (axes.length === 0) return undefined
  let combos: Record<string, string>[] = [{}]
  for (const axis of axes) {
    combos = combos.flatMap((c) => axis.options.map((opt) => ({ ...c, [axis.name]: opt })))
  }
  return combos.map((combination, i) => ({
    id: `${p.id}-v${i + 1}`,
    combination,
    priceAdjustment: 0,
    isAvailable: true,
  }))
}

export function mapPreview(data: TemplatePreviewData) {
  const store: TemplateStore = {
    name: data.demoData.store.name,
    slug: data.demoData.store.slug,
    bio: data.demoData.store.aboutShort,
    avatar: data.demoData.store.logo,
    address: data.demoData.store.address,
    email: data.demoData.store.email,
    phone: data.demoData.store.phone,
    // Checkout de muestra: el carrito del preview arma el pedido de WhatsApp
    // contra el número demo, igual que el flujo real.
    whatsappNumber: data.demoData.store.phone,
    currency: "USD",
    // Sin esto, las secciones socials/footer de los temas renderizaban
    // vacías (solo padding + fondo) — el "bloque muerto" al final del preview.
    socials: data.demoData.store.socials,
  }

  const products: TemplateProduct[] = data.demoData.products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category ?? "",
    price: p.basePrice,
    image: p.images?.[0],
    images: p.images,
    description: p.description,
    sku: p.sku,
    variants: demoVariants(p),
    compareAtPrice: p.compareAtPrice,
    tagline: p.tagline,
    featured: p.featured,
    attributes: p.attributes,
  }))

  const categories: TemplateCategory[] = data.demoData.categories.map((c) => ({ id: c.id, name: c.name }))

  return {
    store,
    products,
    categories,
    theme: {
      template: data.template,
      templateVersion: data.templateVersion,
      publishedAt: "",
      version: 0,
      tree: data.tree,
      tokens: data.tokens,
    },
  }
}

export function ThemePreviewModal({ templateKey, onClose }: Props) {
  const [data, setData] = useState<TemplatePreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [device, setDevice] = useState<PreviewDevice>("desktop")
  const [source, setSource] = useState<DataSource>("demo")
  const [fullscreen, setFullscreen] = useState(false)
  const real = useStoreCatalogPreview()

  useEffect(() => {
    if (!templateKey) return
    setData(null)
    setError(false)
    setSource("demo")
    setFullscreen(false)
    setLoading(true)
    fetchTemplatePreview(templateKey)
      .then((res) => (res ? setData(res) : setError(true)))
      .finally(() => setLoading(false))
  }, [templateKey])

  if (!templateKey) return null
  const demoMapped = data ? mapPreview(data) : null
  // "Mi tienda": mismo tree/tokens default del template, pero con tu tienda,
  // catálogo y categorías reales — el contenido editado de TU tema actual
  // (headline, etc.) no viaja, porque pertenece a un árbol distinto.
  const shown =
    source === "mine" && demoMapped && real.store && real.hasProducts
      ? { store: real.store, products: real.products, categories: real.categories, theme: demoMapped.theme }
      : demoMapped

  // Fuentes del tema para inyectar en el <head> del iframe (el hoisting de
  // <link precedence> de React 19 no llega al documento del iframe).
  const fontHref = shown
    ? (() => {
        const r = resolveTokens(shown.theme.tokens)
        return googleFontsHref([r.headingFontName, r.bodyFontName, r.monoFontName])
      })()
    : undefined

  const iframe =
    shown && !loading && !error ? (
      <IframePreview
        key={`${templateKey}-${source}`}
        fontHref={fontHref}
        title={data ? `Vista previa — ${data.name}` : "Vista previa"}
        // Redondeo solo en móvil (28 del bezel − 8 de padding = 20); en desktop
        // el modal ya recorta con su propio radio.
        style={{ ...S.iframe, borderRadius: device === "mobile" ? 20 : 0 }}
      >
        <PreviewStorefront store={shown.store} products={shown.products} categories={shown.categories} theme={shown.theme} />
      </IframePreview>
    ) : null

  return (
    <div style={fullscreen ? S.overlayFull : S.overlay} onClick={fullscreen ? undefined : onClose}>
      <div style={fullscreen ? S.modalFull : S.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header solo en modo ventana; en fullscreen es una pantalla completa
            de ejemplo de verdad, con controles flotantes mínimos. */}
        {!fullscreen && (
          <div style={S.head}>
            <div style={S.headTitle}>{data ? `Vista previa — ${data.name}` : "Vista previa"}</div>
            <div style={S.headRight}>
              <div style={S.sourceToggle} role="group" aria-label="Datos de ejemplo o de mi tienda">
                <button
                  type="button"
                  onClick={() => setSource("demo")}
                  style={{ ...S.sourceBtn, ...(source === "demo" ? S.sourceBtnActive : null) }}
                >
                  Ejemplo
                </button>
                <button
                  type="button"
                  onClick={() => real.hasProducts && setSource("mine")}
                  disabled={!real.hasProducts}
                  title={real.hasProducts ? undefined : "Cargá productos para probarte el tema con tu catálogo"}
                  style={{
                    ...S.sourceBtn,
                    ...(source === "mine" ? S.sourceBtnActive : null),
                    opacity: real.hasProducts ? 1 : 0.45,
                    cursor: real.hasProducts ? "pointer" : "not-allowed",
                  }}
                >
                  Mi tienda
                </button>
              </div>
              <DeviceToggle device={device} onChange={setDevice} />
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                style={S.closeBtn}
                aria-label="Ver en pantalla completa"
                title="Ver en pantalla completa"
              >
                ⛶
              </button>
              <button type="button" onClick={onClose} style={S.closeBtn} aria-label="Cerrar">
                ✕
              </button>
            </div>
          </div>
        )}
        {!fullscreen && source === "mine" && shown === demoMapped && demoMapped && (
          <div style={S.notice}>Mostrando datos de ejemplo — tu tienda todavía no tiene productos cargados.</div>
        )}
        {!fullscreen && source === "mine" && shown !== demoMapped && (
          <div style={S.notice}>
            Tu tienda y catálogo real con la estética de este tema. Los textos que editaste en tu tema actual (títulos,
            subtítulos) no se muestran acá — cada tema trae los suyos.
          </div>
        )}

        {/* El iframe es un viewport real y aislado: los position:fixed del tema
            se fijan a él y el scroll es nativo — sin hacks de containment. */}
        <div style={S.body}>
          {loading && <div style={S.state}>Cargando preview…</div>}
          {error && <div style={S.state}>No se pudo cargar la vista previa.</div>}
          {/* Wrapper estable: cambiar mobile/desktop solo re-estila (no remonta
              el iframe → sin recarga), el key del iframe solo cambia por tema.
              El bezel de teléfono aplica también en fullscreen (móvil centrado). */}
          {iframe && <div style={device === "mobile" ? S.phoneBezel : S.fillWrap}>{iframe}</div>}
        </div>

        {/* Controles flotantes de fullscreen (edge-to-edge, sin header). */}
        {fullscreen && (
          <div style={S.fsControls}>
            <DeviceToggle device={device} onChange={setDevice} />
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              style={S.fsBtn}
              aria-label="Salir de pantalla completa"
              title="Salir de pantalla completa"
            >
              ⤡
            </button>
            <button type="button" onClick={onClose} style={S.fsBtn} aria-label="Cerrar">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,15,31,0.6)",
    backdropFilter: "blur(4px)",
    display: "grid",
    placeItems: "center",
    zIndex: 300,
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 18,
    width: "100%",
    maxWidth: 1100,
    // Altura FIJA (no solo max): el iframe usa height:100% y sin una altura
    // definida en la cadena el viewport colapsaba (preview diminuto).
    height: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 40px 80px -20px rgba(0,0,0,0.4)",
  },
  // Pantalla completa: mismo componente, sin el marco de modal — ocupa todo
  // el viewport en vez de abrir una ruta nueva (que heredaría el sidebar
  // legacy de /dashboard/layout.tsx).
  overlayFull: {
    position: "fixed",
    inset: 0,
    background: "#fff",
    zIndex: 300,
    padding: 0,
  },
  modalFull: {
    position: "relative", // ancla los controles flotantes de fullscreen
    background: "#fff",
    borderRadius: 0,
    width: "100%",
    height: "100%",
    maxWidth: "none",
    maxHeight: "none",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "none",
  },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid var(--line)",
    flexShrink: 0,
  },
  headTitle: { fontSize: 14, fontWeight: 700, color: "var(--ink)" },
  headRight: { display: "flex", alignItems: "center", gap: 10 },
  sourceToggle: {
    display: "flex",
    gap: 2,
    padding: 2,
    background: "var(--bg-2)",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--line)",
  },
  sourceBtn: {
    padding: "5px 10px",
    border: "none",
    background: "transparent",
    borderRadius: 6,
    fontSize: 11.5,
    fontWeight: 600,
    cursor: "pointer",
    color: "var(--ink-3)",
    fontFamily: "inherit",
  },
  sourceBtnActive: {
    background: "var(--bg-elev)",
    color: "var(--ink)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  closeBtn: { background: "var(--bg-2)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "var(--ink-2)", fontSize: 13 },
  // Contenedor del iframe: centra el bezel en móvil-ventana; llena en el resto.
  body: { flex: 1, minHeight: 0, display: "flex", justifyContent: "center", alignItems: "stretch", background: "var(--bg-2)", overflow: "hidden" },
  // El iframe llena su contenedor — el scroll y los fixed son internos y reales.
  iframe: { width: "100%", height: "100%", display: "block", background: "#fff" },
  // Wrapper que llena (desktop/fullscreen); el iframe adentro ocupa todo.
  fillWrap: { flex: 1, minWidth: 0, display: "flex" },
  // Marco de teléfono para móvil-ventana; el iframe (390 virtual) dispara el
  // container query móvil de los temas.
  phoneBezel: {
    alignSelf: "center", // centra vertical sin estirar (body sigue en stretch)
    width: 390,
    maxWidth: "100%",
    height: "min(860px, calc(100% - 24px))",
    background: "#111",
    borderRadius: 28,
    padding: 8,
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
    overflow: "hidden",
    display: "flex",
  },
  notice: {
    padding: "8px 18px",
    fontSize: 12,
    color: "var(--ink-2)",
    background: "var(--bg-2)",
    borderBottom: "1px solid var(--line)",
    flexShrink: 0,
  },
  state: { margin: "auto", padding: 60, textAlign: "center", color: "var(--ink-3)", fontSize: 13 },
  // Controles flotantes del modo fullscreen (sin header).
  fsControls: {
    position: "absolute",
    top: 14,
    right: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 6,
    background: "rgba(20,20,22,0.55)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderRadius: 12,
    zIndex: 10,
  },
  fsBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: 8,
    width: 34,
    height: 34,
    cursor: "pointer",
    color: "#fff",
    fontSize: 14,
  },
}
