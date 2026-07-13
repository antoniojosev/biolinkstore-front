"use client"

import { useEffect, useState } from "react"
import { fetchTemplatePreview, type TemplatePreviewData } from "@/lib/page-builder-api"
import { TemplateRenderer, type TemplateProduct, type TemplateCategory, type TemplateStore } from "@/components/storefront-v2/template/template-renderer"
import { DeviceToggle, type PreviewDevice } from "./device-toggle"

interface Props {
  templateKey: string | null
  onClose: () => void
}

function mapPreview(data: TemplatePreviewData) {
  const store: TemplateStore = {
    name: data.demoData.store.name,
    slug: data.demoData.store.slug,
    bio: data.demoData.store.aboutShort,
    avatar: data.demoData.store.logo,
    address: data.demoData.store.address,
    email: data.demoData.store.email,
    phone: data.demoData.store.phone,
    currency: "USD",
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

  useEffect(() => {
    if (!templateKey) return
    setData(null)
    setError(false)
    setLoading(true)
    fetchTemplatePreview(templateKey)
      .then((res) => (res ? setData(res) : setError(true)))
      .finally(() => setLoading(false))
  }, [templateKey])

  if (!templateKey) return null
  const mapped = data ? mapPreview(data) : null

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.head}>
          <div style={S.headTitle}>{data ? `Vista previa — ${data.name}` : "Vista previa"}</div>
          <div style={S.headRight}>
            <DeviceToggle device={device} onChange={setDevice} />
            <button type="button" onClick={onClose} style={S.closeBtn} aria-label="Cerrar">
              ✕
            </button>
          </div>
        </div>
        <div style={S.body}>
          {loading && <div style={S.state}>Cargando preview…</div>}
          {error && <div style={S.state}>No se pudo cargar la vista previa.</div>}
          {mapped && (
            <div style={device === "mobile" ? S.deviceFrameMobile : S.deviceFrameDesktop}>
              <TemplateRenderer store={mapped.store} products={mapped.products} categories={mapped.categories} theme={mapped.theme} />
            </div>
          )}
        </div>
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
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 40px 80px -20px rgba(0,0,0,0.4)",
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
  closeBtn: { background: "var(--bg-2)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "var(--ink-2)", fontSize: 13 },
  body: { overflowY: "auto", flex: 1 },
  state: { padding: 60, textAlign: "center", color: "var(--ink-3)", fontSize: 13 },
  // Desktop: sin cap propio (el modal mismo, maxWidth 1100, ya supera el
  // breakpoint móvil del renderer). Móvil: marco fijo de iPhone, por debajo
  // del breakpoint — dispara el container query de verdad.
  deviceFrameDesktop: {},
  deviceFrameMobile: {
    width: 390,
    margin: "20px auto",
    background: "#fff",
    borderRadius: 24,
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
    overflow: "hidden",
    borderWidth: 8,
    borderStyle: "solid",
    borderColor: "#111",
  },
}
