"use client"

import { useState } from "react"
import { ThemeEditor } from "./design/theme-editor"

type View = "hub" | "editor"

function I({ id }: { id: string }) {
  return <svg><use href={`#ic-${id}`} /></svg>
}

export function DesignBoard() {
  const [view, setView] = useState<View>("hub")

  if (view === "editor") {
    return <ThemeEditor onClose={() => setView("hub")} />
  }

  return (
    <div className="design-hub">
      <div className="dh-head">
        <div>
          <h1>
            Diseño de tu <em>tienda</em>
          </h1>
          <p>Editor visual, biblioteca de temas e identidad de marca.</p>
        </div>
      </div>

      <div className="dh-top">
        <button type="button" className="dh-card" onClick={() => setView("editor")} style={S.cardButton}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div className="dh-icon">
              <I id="layout" />
            </div>
            <div style={{ flex: 1 }}>
              <h3>
                Editor de <em>páginas</em>
              </h3>
              <p style={{ marginTop: 4 }}>
                Cambia template, paleta y tipografía con preview en vivo. Publicá cuando estés listo.
              </p>
            </div>
          </div>
          <div className="dh-thumb">
            <div className="dh-thumb-builder">
              <div className="col">
                <div className="ln brand" />
                <div className="ln" />
                <div className="ln" style={{ width: "70%" }} />
                <div className="ln" style={{ width: "60%" }} />
                <div className="ln" style={{ width: "80%" }} />
              </div>
              <div className="preview">
                <div className="row" style={{ width: "50%", margin: "0 auto" }} />
                <div className="row" style={{ width: "70%", margin: "0 auto", height: 5 }} />
                <div className="grid">
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              </div>
            </div>
          </div>
          <div className="dh-meta-row">
            <span>
              <strong>9 templates</strong> · 8 paletas
            </span>
            <span className="dh-go">Abrir editor →</span>
          </div>
        </button>

        <button type="button" className="dh-card alt" onClick={() => setView("editor")} style={S.cardButton}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div className="dh-icon">
              <I id="sparkles" />
            </div>
            <div style={{ flex: 1 }}>
              <h3>
                Galería de <em>temas</em>
              </h3>
              <p style={{ marginTop: 4 }}>
                9 templates editoriales por nicho. Switch en un clic, sin perder tus productos.
              </p>
            </div>
          </div>
          <div className="dh-thumb">
            <div className="dh-thumb-themes">
              <div className="tt a" />
              <div className="tt b" />
              <div className="tt c" />
            </div>
          </div>
          <div className="dh-meta-row">
            <span>
              Vitrina · Luxora · Noir · Menu · Poster · Atelier <strong>+3</strong>
            </span>
            <span className="dh-go">Explorar temas →</span>
          </div>
        </button>

        <a className="dh-card dh-card-premium" href="mailto:hola@bylink.app?subject=ByLink%20Studio">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div className="dh-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l2 5 5 1-3.5 3.5L17 18l-5-3-5 3 1.5-5.5L5 9l5-1z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h3>
                Te lo hacemos <em>a medida</em>
              </h3>
              <p style={{ marginTop: 4 }}>
                Un diseñador del equipo bylink trabaja con tu marca. Entrega en 7 días.
              </p>
            </div>
          </div>
          <div className="dh-thumb dh-thumb-premium">
            <div className="pm-glow" />
            <div className="pm-content">
              <div className="pm-tag">bylink studio</div>
              <div className="pm-stars">★ ★ ★ ★ ★</div>
            </div>
          </div>
          <div className="dh-meta-row">
            <span>
              Desde <strong style={{ color: "#E8C07A" }}>$199</strong> · pago único
            </span>
            <span className="dh-go" style={{ color: "#E8C07A" }}>
              Hablar con un diseñador →
            </span>
          </div>
        </a>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  cardButton: {
    border: "1px solid var(--line)",
    textAlign: "left",
    fontFamily: "inherit",
  },
}
