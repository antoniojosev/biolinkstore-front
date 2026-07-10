"use client"

import { useMemo } from "react"
import type { ProductAttributeDto } from "@/lib/products-api/types"

export interface VariantDraft {
  combination: Record<string, string>
  priceAdjustment: number
  stock: string
}

interface VariantsEditorProps {
  basePrice: number
  attributes: ProductAttributeDto[]
  variants: VariantDraft[]
  onChange: (variants: VariantDraft[]) => void
}

function comboKey(combo: Record<string, string>): string {
  return Object.entries(combo).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join("|")
}

function generateCombinations(attrs: ProductAttributeDto[]): Record<string, string>[] {
  const valid = attrs.filter((a) => (a.role ?? "variant") === "variant" && a.name.trim() && a.options.length > 0)
  if (valid.length === 0) return []
  let result: Record<string, string>[] = [{}]
  for (const attr of valid) {
    const next: Record<string, string>[] = []
    for (const combo of result) {
      for (const option of attr.options) next.push({ ...combo, [attr.name]: option })
    }
    result = next
  }
  return result
}

export function VariantsEditor({ basePrice, attributes, variants, onChange }: VariantsEditorProps) {
  const combinations = useMemo(() => generateCombinations(attributes), [attributes])
  const byKey = useMemo(() => new Map(variants.map((v) => [comboKey(v.combination), v])), [variants])

  if (combinations.length === 0) return null

  function patch(combo: Record<string, string>, p: Partial<VariantDraft>) {
    const key = comboKey(combo)
    const existing = byKey.get(key)
    const draft: VariantDraft = existing
      ? { ...existing, ...p }
      : { combination: combo, priceAdjustment: 0, stock: "", ...p }
    const others = variants.filter((v) => comboKey(v.combination) !== key)
    onChange([...others, draft])
  }

  return (
    <div>
      <label className="label" style={{ marginBottom: 8, display: "block" }}>Variantes · {combinations.length} combinaciones</label>
      <div style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
        {combinations.map((combo, i) => {
          const key = comboKey(combo)
          const draft = byKey.get(key)
          const adjustment = draft?.priceAdjustment ?? 0
          const finalPrice = basePrice + adjustment
          const label = Object.values(combo).join(" / ")
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderTop: i > 0 ? "1px solid var(--line)" : "none" }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
              <input
                className="input"
                type="number"
                step="0.01"
                value={adjustment || ""}
                onChange={(e) => patch(combo, { priceAdjustment: e.target.value === "" ? 0 : Number(e.target.value) })}
                placeholder="+0"
                style={{ width: 90 }}
                title="Ajuste de precio"
              />
              <input
                className="input"
                type="number"
                min="0"
                value={draft?.stock ?? ""}
                onChange={(e) => patch(combo, { stock: e.target.value })}
                placeholder="Stock"
                style={{ width: 80 }}
              />
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)", width: 70, textAlign: "right" }}>{finalPrice.toFixed(2)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
