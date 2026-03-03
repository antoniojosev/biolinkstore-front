'use client'

import type { VariantDetail } from '@/lib/types'

interface CartVariantBadgeProps {
  details: VariantDetail[]
}

export function CartVariantBadge({ details }: CartVariantBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      {details.map((d) => (
        <span key={d.attribute} className="inline-flex items-center gap-1 text-xs">
          {d.type === 'color' && d.colorHex && (
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 border border-white/20"
              style={{ backgroundColor: d.colorHex }}
            />
          )}
          <span>{d.type === 'color' ? d.value : `${d.attribute}: ${d.value}`}</span>
        </span>
      ))}
    </div>
  )
}
