"use client"

import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { createPortal } from "react-dom"

// Reset mínimo dentro del iframe: los temas asumen sin margin de UA y usan
// minHeight:100vh en su root (que acá = alto del iframe = viewport real).
const RESET_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { height: 100%; }
body { min-height: 100%; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; }
/* Scrollbar fina y sutil (la default gruesa se ve mal en el teléfono). */
html { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.22) transparent; }
::-webkit-scrollbar { width: 7px; height: 7px; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.22); border-radius: 7px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.35); }
::-webkit-scrollbar-track { background: transparent; }
`

/**
 * Renderiza `children` DENTRO de un iframe real vía createPortal — le da a los
 * temas un viewport aislado: position:fixed se fija al iframe (como en un
 * browser de verdad), el scroll es nativo y nada se escapa. Los eventos y el
 * contexto de React siguen funcionando porque el portal preserva el árbol de
 * React. Las fuentes se inyectan en el <head> del iframe (fontHref) porque el
 * hoisting de <link precedence> de React 19 las mandaría al documento padre.
 */
export function IframePreview({
  children,
  fontHref,
  style,
  title = "Vista previa",
}: {
  children: ReactNode
  fontHref?: string
  style?: CSSProperties
  title?: string
}) {
  const [el, setEl] = useState<HTMLIFrameElement | null>(null)
  const [mount, setMount] = useState<HTMLElement | null>(null)

  // El documento del iframe src-less está listo al montar; el listener 'load'
  // cubre un eventual re-navigate a about:blank en algunos browsers.
  useEffect(() => {
    if (!el) return
    let cancelled = false
    const setup = () => {
      const doc = el.contentDocument
      if (!doc || cancelled) return
      doc.documentElement.lang = "es"
      if (!doc.getElementById("bl-iframe-reset")) {
        const s = doc.createElement("style")
        s.id = "bl-iframe-reset"
        s.textContent = RESET_CSS
        doc.head.appendChild(s)
      }
      setMount(doc.body)
    }
    setup()
    el.addEventListener("load", setup)
    return () => {
      cancelled = true
      el.removeEventListener("load", setup)
      setMount(null)
    }
  }, [el])

  // Link de fuentes en el <head> del iframe, actualizado cuando cambia el tema.
  useEffect(() => {
    const doc = el?.contentDocument
    if (!doc || !mount || !fontHref) return
    let link = doc.getElementById("bl-iframe-fonts") as HTMLLinkElement | null
    if (!link) {
      link = doc.createElement("link")
      link.id = "bl-iframe-fonts"
      link.rel = "stylesheet"
      doc.head.appendChild(link)
    }
    if (link.href !== fontHref) link.href = fontHref
  }, [el, mount, fontHref])

  return (
    <iframe ref={setEl} title={title} style={{ border: 0, ...style }}>
      {mount ? createPortal(children, mount) : null}
    </iframe>
  )
}
