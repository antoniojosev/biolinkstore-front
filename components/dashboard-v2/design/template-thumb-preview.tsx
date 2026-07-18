"use client"

import { useEffect, useRef, useState } from "react"
import { fetchTemplatePreview, type TemplatePreviewData } from "@/lib/page-builder-api"
import { ThemeRenderer } from "@/components/storefront-v2/themes/registry"
import { mapPreview } from "./theme-preview-modal"

// Carátula viva de la galería de Temas: el tema real renderizado con su demo
// data, escalado para caber en la card. Sustituye al screenshot mientras
// previewImage sea null (pendiente pipeline a R2) — y de paso nunca queda
// desactualizado respecto al seed.

// Ancho virtual al que se renderiza el tema antes de escalar: ancho de
// teléfono, por debajo del breakpoint del container query → la carátula
// muestra el layout móvil real dentro del marco de teléfono de la card.
const VIRTUAL_WIDTH = 390

// Un fetch por template por sesión de página, compartido entre re-mounts
// (cambiar de chip de nicho desmonta/monta las cards).
const previewCache = new Map<string, Promise<TemplatePreviewData | null>>()

function getPreview(key: string): Promise<TemplatePreviewData | null> {
  let p = previewCache.get(key)
  if (!p) {
    p = fetchTemplatePreview(key)
    previewCache.set(key, p)
  }
  return p
}

interface Props {
  templateKey: string
  /** Se muestra mientras carga o si el fetch falla (las iniciales de siempre). */
  fallback: React.ReactNode
}

export function TemplateThumbPreview({ templateKey, fallback }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<TemplatePreviewData | null>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    let alive = true
    getPreview(templateKey).then((res) => {
      if (alive && res) setData(res)
    })
    return () => {
      alive = false
    }
  }, [templateKey])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(w / VIRTUAL_WIDTH)
    })
    ro.observe(host)
    return () => ro.disconnect()
  }, [])

  const mapped = data ? mapPreview(data) : null

  return (
    <div ref={hostRef} style={S.host}>
      {!mapped && <div style={S.fallback}>{fallback}</div>}
      {mapped && scale > 0 && (
        <div style={{ ...S.stage, width: VIRTUAL_WIDTH, transform: `scale(${scale})` }} aria-hidden>
          <ThemeRenderer
            store={mapped.store}
            products={mapped.products}
            categories={mapped.categories}
            theme={mapped.theme}
          />
        </div>
      )}
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  host: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    // clip-path (además de overflow) porque los temas traen elementos
    // position:fixed compositados que pintan por fuera del clip redondeado
    // del marco de teléfono; el radio replica el de thumbScreen.
    clipPath: "inset(0 round 24px)",
    // La card entera es clickeable (abre el modal); el mini-render es puro decorado.
    pointerEvents: "none",
  },
  fallback: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
  },
  stage: {
    transformOrigin: "top left",
    background: "#fff",
    // Contiene el paint (y el containing block de los fixed) al stage: las
    // bottom-navs/barras de carrito fixed de los temas quedan dentro del
    // teléfono en vez de escaparse de la carátula.
    contain: "paint",
  },
}
