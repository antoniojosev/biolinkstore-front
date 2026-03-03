'use client'

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { DollarSign } from 'lucide-react'

interface VariantPricingTableProps {
  basePrice: number
  combinations: Record<string, string>[]
  colorMeta?: Record<string, { hex?: string }>
  pricing: Record<string, number>
  onChange: (pricing: Record<string, number>) => void
}

function comboKey(combo: Record<string, string>): string {
  return Object.entries(combo)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .join(' / ')
}

export function VariantPricingTable({
  basePrice,
  combinations,
  colorMeta,
  pricing,
  onChange,
}: VariantPricingTableProps) {
  const colorAttrName = useMemo(() => {
    if (!colorMeta || combinations.length === 0) return null
    // Find which key in the combination corresponds to a color attribute
    const firstCombo = combinations[0]
    for (const key of Object.keys(firstCombo)) {
      if (key.toLowerCase() === 'color') return key
    }
    return null
  }, [colorMeta, combinations])

  if (combinations.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-white/40 uppercase tracking-wider">
          Variante
        </span>
        <div className="flex items-center gap-8">
          <span className="text-[11px] text-white/40 uppercase tracking-wider w-24 text-center">
            Ajuste
          </span>
          <span className="text-[11px] text-white/40 uppercase tracking-wider w-20 text-right">
            Final
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-white/5 overflow-hidden max-h-[360px] overflow-y-auto">
        {combinations.map((combo, i) => {
          const key = comboKey(combo)
          const adjustment = pricing[key] ?? 0
          const finalPrice = basePrice + adjustment
          const colorValue = colorAttrName ? combo[colorAttrName] : null
          const hex = colorValue ? colorMeta?.[colorValue]?.hex : null

          return (
            <div
              key={key}
              className={`flex items-center justify-between px-3 py-2.5 ${
                i > 0 ? 'border-t border-white/[0.03]' : ''
              } hover:bg-white/[0.02] transition-colors`}
            >
              {/* Combo label */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {hex && (
                  <span
                    className="w-4 h-4 rounded-full shrink-0 border border-white/10"
                    style={{ backgroundColor: hex }}
                  />
                )}
                <span className="text-sm text-white/70 truncate">{key}</span>
              </div>

              {/* Price adjustment input */}
              <div className="flex items-center gap-3">
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/25">
                    +$
                  </span>
                  <Input
                    type="number"
                    value={adjustment || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value)
                      onChange({ ...pricing, [key]: val })
                    }}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="h-8 pl-7 pr-2 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#33b380]/50 focus:ring-[#33b380]/20"
                  />
                </div>

                {/* Final price */}
                <span className="text-sm font-medium text-white/50 w-20 text-right tabular-nums">
                  ${finalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {combinations.length > 0 && (
        <p className="text-[10px] text-white/25 px-1">
          Precio base: ${basePrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })} + ajuste por variante
        </p>
      )}
    </div>
  )
}
