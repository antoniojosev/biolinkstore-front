'use client'

import { useState, useEffect, useId } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, X } from 'lucide-react'
import type { DashboardStore } from '@/lib/stores-api/types'
import { getProfileSteps, getCompletionPercent } from './profile-completion-card'

// ─── Large circular ring ──────────────────────────────────────────────────────

function LargeRing({ percent }: { percent: number }) {
  const id = useId()
  const gradId = `modal-grad-${id.replace(/:/g, '')}`
  const size = 140
  const strokeWidth = 8
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - percent / 100)

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#33b380" />
            <stop offset="100%" stopColor="#327be2" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white leading-none">{percent}%</span>
        <span className="text-[11px] text-white/40 mt-0.5">completo</span>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  store: DashboardStore
}

export function ProfileCompletionModal({ store }: Props) {
  const [visible, setVisible] = useState(false)
  const flagKey = `bls-profile-modal-${store.id}`

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem(flagKey)
    if (dismissed) return

    const steps = getProfileSteps(store)
    const percent = getCompletionPercent(steps)
    if (percent === 100) return

    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [store, flagKey])

  const dismiss = () => {
    localStorage.setItem(flagKey, '1')
    setVisible(false)
  }

  if (!visible) return null

  const steps = getProfileSteps(store)
  const percent = getCompletionPercent(steps)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={dismiss}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md bg-[#0d1218] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 pointer-events-auto animate-in zoom-in-95 fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-8">
            {/* Ring */}
            <LargeRing percent={percent} />

            {/* Heading */}
            <div className="text-center mt-6 mb-6">
              <h2 className="text-xl font-black text-white leading-tight">
                ¡Bienvenido a tu tienda!
              </h2>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                Completá tu perfil para que tu catálogo luzca profesional y llegue a más clientes.
              </p>
            </div>

            {/* Checklist */}
            <ul className="space-y-2.5 mb-7">
              {steps.map((step) => (
                <li key={step.label} className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      step.done
                        ? 'bg-[#33b380] text-white'
                        : 'border border-white/15 bg-white/5'
                    }`}
                  >
                    {step.done && <Check className="w-3 h-3" strokeWidth={3} />}
                  </span>
                  <span
                    className={`text-sm ${
                      step.done ? 'text-white/40 line-through' : 'text-white/80'
                    }`}
                  >
                    {step.label}
                  </span>
                  {!step.done && (
                    <step.icon className="w-3.5 h-3.5 text-white/30 ml-auto shrink-0" />
                  )}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <Link
                href="/dashboard/configuracion"
                onClick={dismiss}
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-gradient-to-r from-[#33b380] to-[#327be2] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Completar ahora
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={dismiss}
                className="w-full h-10 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Más tarde
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
