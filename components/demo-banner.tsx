'use client'

import { FlaskConical } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-2.5">
      <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
      <p className="text-xs text-amber-300">
        <span className="font-semibold">Cuenta demo.</span>{' '}
        Podés explorar el dashboard pero las modificaciones están deshabilitadas.
      </p>
    </div>
  )
}
