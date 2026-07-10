"use client"

import { useState } from "react"
import type { ProductAttributeDto } from "@/lib/products-api/types"

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

interface AttributesEditorProps {
  attributes: ProductAttributeDto[]
  onChange: (attributes: ProductAttributeDto[]) => void
}

export function AttributesEditor({ attributes, onChange }: AttributesEditorProps) {
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
        </div>
      ))}
      <button type="button" className="btn btn-secondary" onClick={addAttribute}>+ Agregar atributo</button>
    </div>
  )
}
