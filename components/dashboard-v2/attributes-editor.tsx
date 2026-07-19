"use client"

import { useState } from "react"
import { HexColorPicker } from "react-colorful"
import type { ProductAttributeDto } from "@/lib/products-api/types"
import { UploadButton } from "./upload-button"

const TYPE_LABEL: Record<string, string> = {
  text: "Texto",
  color: "Color",
  size: "Talla",
  "multi-select": "Selección múltiple",
  number: "Número",
}
const TYPES = Object.keys(TYPE_LABEL)

const ROLE_LABEL: Record<string, string> = {
  variant: "Variante (crea combinaciones con precio/stock propio)",
  spec: "Especificación (solo informativo)",
  dietary: "Info dietética (solo informativo)",
  availability: "Disponibilidad (solo informativo)",
}
const ROLES = Object.keys(ROLE_LABEL)

// Paleta de colores frecuentes (nombre + hex) para el select de tipo color.
const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: "Negro", hex: "#1A1A1A" },
  { name: "Blanco", hex: "#FAFAFA" },
  { name: "Gris", hex: "#8A8A8A" },
  { name: "Beige", hex: "#D4C5A9" },
  { name: "Crema", hex: "#F1E4CF" },
  { name: "Marrón", hex: "#5B3A29" },
  { name: "Camel", hex: "#C49A6C" },
  { name: "Rojo", hex: "#C0392B" },
  { name: "Borgoña", hex: "#6B1F2E" },
  { name: "Rosa", hex: "#E8A7B8" },
  { name: "Naranja", hex: "#E67E22" },
  { name: "Amarillo", hex: "#F1C40F" },
  { name: "Dorado", hex: "#D4AF37" },
  { name: "Verde", hex: "#27AE60" },
  { name: "Verde Oliva", hex: "#556B2F" },
  { name: "Celeste", hex: "#7FB3D5" },
  { name: "Azul", hex: "#2E5AAC" },
  { name: "Azul Marino", hex: "#1E2F4A" },
  { name: "Morado", hex: "#7D3C98" },
  { name: "Plateado", hex: "#C0C0C0" },
]

interface AttributesEditorProps {
  attributes: ProductAttributeDto[]
  onChange: (attributes: ProductAttributeDto[]) => void
  /** Para subir imágenes por color (opcional; sin él solo se pega URL). */
  storeId?: string
}

/**
 * Galería por color: las fotos del producto en ese color, que el detalle
 * muestra al seleccionarlo. Sube archivos (UploadButton) o pega URLs.
 */
function ColorImagesRow({
  name,
  hex,
  images,
  storeId,
  onChange,
}: {
  name: string
  hex?: string
  images: string[]
  storeId?: string
  onChange: (images: string[]) => void
}) {
  const [url, setUrl] = useState("")
  function addUrl() {
    const u = url.trim()
    if (!u || images.includes(u)) return
    onChange([...images, u])
    setUrl("")
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: hex ?? "#ccc", border: "1px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600 }}>{name}</span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{images.length > 0 ? `· ${images.length} foto${images.length > 1 ? "s" : ""}` : "· sin fotos"}</span>
      </div>
      {images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {images.map((img, idx) => (
            <div key={`${img}-${idx}`} style={{ position: "relative", width: 44, height: 44, borderRadius: 8, background: `#fff url(${img}) center/cover no-repeat`, border: "1px solid var(--line)" }}>
              <button type="button" onClick={() => onChange(images.filter((_, k) => k !== idx))} aria-label="Quitar" style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, lineHeight: 1, display: "grid", placeItems: "center" }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <UploadButton storeId={storeId} multiple label="Subir fotos" onUploaded={(urls) => onChange([...images, ...urls.filter((u) => !images.includes(u))])} />
        <input
          className="input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl() } }}
          placeholder="…o pegá una URL"
          style={{ flex: 1, minWidth: 140 }}
        />
      </div>
    </div>
  )
}

/**
 * Selector de color para agregar opciones a un atributo tipo "color":
 * grilla de swatches con la paleta frecuente (clic = agrega el color con su
 * nombre) + un color picker real (react-colorful) para un color personalizado
 * con su nombre. Cada opción guarda nombre + hex en optionsMeta.
 */
function ColorAdder({ options, onAdd }: { options: string[]; onAdd: (name: string, hex: string) => void }) {
  const [open, setOpen] = useState(false)
  const [hex, setHex] = useState("#C0392B")
  const [name, setName] = useState("")
  const available = COLOR_PRESETS.filter((c) => !options.includes(c.name))

  function addCustom() {
    const n = name.trim()
    if (!n || options.includes(n)) return
    onAdd(n, hex)
    setName("")
    setOpen(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {available.map((c) => (
          <button
            key={c.name}
            type="button"
            title={c.name}
            aria-label={`Agregar ${c.name}`}
            onClick={() => onAdd(c.name, c.hex)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: c.hex,
              border: "1px solid rgba(0,0,0,0.15)",
              boxShadow: "inset 0 0 0 2px #fff",
              cursor: "pointer",
            }}
          />
        ))}
        <button
          type="button"
          title="Color personalizado"
          aria-label="Color personalizado"
          onClick={() => setOpen((o) => !o)}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1.5px dashed var(--line-2)",
            background: "conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            color: "#fff",
            fontSize: 15,
            lineHeight: 1,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            textShadow: "0 0 2px rgba(0,0,0,0.6)",
          }}
        >
          +
        </button>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, border: "1px solid var(--line)", borderRadius: 12, background: "var(--bg-2)" }}>
          <HexColorPicker color={hex} onChange={setHex} style={{ width: "100%", height: 150 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: hex, border: "1px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom() } }}
              placeholder="Nombre del color (ej. Turquesa)"
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={addCustom} disabled={!name.trim()}>Agregar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AttributesEditor({ attributes, onChange, storeId }: AttributesEditorProps) {
  const [draftOption, setDraftOption] = useState<Record<number, string>>({})

  function addAttribute() {
    onChange([...attributes, { name: "", type: "text", role: "variant", options: [] }])
  }
  function removeAttribute(i: number) {
    onChange(attributes.filter((_, idx) => idx !== i))
  }
  function patchAttribute(i: number, p: Partial<ProductAttributeDto>) {
    onChange(attributes.map((a, idx) => (idx === i ? { ...a, ...p } : a)))
  }
  function addOption(i: number) {
    const value = (draftOption[i] ?? "").trim()
    if (!value) return
    const attr = attributes[i]
    if (attr.options.includes(value)) return
    patchAttribute(i, { options: [...attr.options, value] })
    setDraftOption((d) => ({ ...d, [i]: "" }))
  }
  // Agrega una opción de color (nombre + hex) desde el select de presets.
  function addColorOption(i: number, name: string, hex: string) {
    const attr = attributes[i]
    if (attr.options.includes(name)) return
    patchAttribute(i, {
      options: [...attr.options, name],
      optionsMeta: { ...(attr.optionsMeta ?? {}), [name]: { ...(attr.optionsMeta?.[name] ?? {}), hex } },
    })
  }
  function removeOption(i: number, option: string) {
    const attr = attributes[i]
    const nextMeta = attr.optionsMeta ? { ...attr.optionsMeta } : undefined
    if (nextMeta) delete nextMeta[option]
    patchAttribute(i, { options: attr.options.filter((o) => o !== option), optionsMeta: nextMeta })
  }
  function setColorHex(i: number, option: string, hex: string) {
    const attr = attributes[i]
    patchAttribute(i, { optionsMeta: { ...(attr.optionsMeta ?? {}), [option]: { ...(attr.optionsMeta?.[option] ?? {}), hex } } })
  }
  function setOptionImages(i: number, option: string, images: string[]) {
    const attr = attributes[i]
    patchAttribute(i, { optionsMeta: { ...(attr.optionsMeta ?? {}), [option]: { ...(attr.optionsMeta?.[option] ?? {}), images } } })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {attributes.map((attr, i) => (
        <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              value={attr.name}
              onChange={(e) => patchAttribute(i, { name: e.target.value })}
              placeholder="Ej. Talla, Color…"
              style={{ flex: 1 }}
            />
            <button type="button" onClick={() => removeAttribute(i)} aria-label="Quitar atributo" style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-2)", border: "none", cursor: "pointer", fontSize: 16, color: "var(--ink-2)" }}>×</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select className="select" value={attr.type ?? "text"} onChange={(e) => patchAttribute(i, { type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </select>
            <select className="select" value={attr.role ?? "variant"} onChange={(e) => patchAttribute(i, { role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {attr.options.map((opt) => (
              <span key={opt} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {attr.type === "color" && (
                  <input
                    type="color"
                    value={attr.optionsMeta?.[opt]?.hex ?? "#888888"}
                    onChange={(e) => setColorHex(i, opt, e.target.value)}
                    style={{ width: 16, height: 16, border: "none", padding: 0, background: "none" }}
                  />
                )}
                {opt}
                <button type="button" onClick={() => removeOption(i, opt)} aria-label={`Quitar ${opt}`} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 13, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          {attr.type === "color" && attr.options.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>Fotos por color (se muestran al elegir ese color)</span>
              {attr.options.map((opt) => (
                <ColorImagesRow
                  key={opt}
                  name={opt}
                  hex={attr.optionsMeta?.[opt]?.hex}
                  images={(attr.optionsMeta?.[opt] as { images?: string[] } | undefined)?.images ?? []}
                  storeId={storeId}
                  onChange={(images) => setOptionImages(i, opt, images)}
                />
              ))}
            </div>
          )}
          {attr.type === "color" ? (
            <ColorAdder options={attr.options} onAdd={(name, hex) => addColorOption(i, name, hex)} />
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                value={draftOption[i] ?? ""}
                onChange={(e) => setDraftOption((d) => ({ ...d, [i]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(i) } }}
                placeholder="Agregar opción y Enter…"
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addOption(i)}>+ Opción</button>
            </div>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-secondary" onClick={addAttribute}>+ Agregar atributo</button>
    </div>
  )
}
