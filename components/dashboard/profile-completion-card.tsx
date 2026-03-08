'use client'

import { useId } from 'react'
import Link from 'next/link'
import { Store, AtSign, Phone, Image, Wallpaper, ChevronRight } from 'lucide-react'
import type { DashboardStore } from '@/lib/stores-api/types'

// ─── Step definitions ────────────────────────────────────────────────────────

interface Step {
  label: string
  done: boolean
  icon: React.ElementType
  href: string
}

export function getProfileSteps(store: DashboardStore): Step[] {
  return [
    {
      label: 'Nombre de tu tienda',
      done: !!store.name?.trim(),
      icon: Store,
      href: '/dashboard/configuracion',
    },
    {
      label: 'Username / URL',
      done: !!store.username?.trim(),
      icon: AtSign,
      href: '/dashboard/configuracion',
    },
    {
      label: 'Número de WhatsApp',
      done: store.whatsappNumbers?.length > 0,
      icon: Phone,
      href: '/dashboard/configuracion',
    },
    {
      label: 'Logo de tu tienda',
      done: !!(store.avatar || store.logo),
      icon: Image,
      href: '/dashboard/diseno',
    },
    {
      label: 'Banner / portada',
      done: !!(store.coverImage || store.banner),
      icon: Wallpaper,
      href: '/dashboard/diseno',
    },
  ]
}

export function getCompletionPercent(steps: Step[]): number {
  const done = steps.filter((s) => s.done).length
  return Math.round((done / steps.length) * 100)
}

// ─── Circular SVG ring ───────────────────────────────────────────────────────

interface CircularRingProps {
  percent: number
  size?: number
  strokeWidth?: number
}

export function CircularRing({ percent, size = 64, strokeWidth = 5 }: CircularRingProps) {
  const id = useId()
  const gradId = `ring-grad-${id.replace(/:/g, '')}`
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - percent / 100)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#33b380" />
          <stop offset="100%" stopColor="#327be2" />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
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
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

// ─── Dashboard card ───────────────────────────────────────────────────────────

interface Props {
  store: DashboardStore
}

export function ProfileCompletionCard({ store }: Props) {
  const steps = getProfileSteps(store)
  const percent = getCompletionPercent(steps)
  const pending = steps.filter((s) => !s.done)

  if (percent === 100) return null

  return (
    <div className="rounded-xl bg-[#0d1218] border border-white/5 p-5 flex gap-5 items-center">
      {/* Ring */}
      <div className="relative shrink-0">
        <CircularRing percent={percent} size={72} strokeWidth={6} />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white rotate-0">
          {percent}%
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white mb-0.5">Completá tu perfil</p>
        <p className="text-xs text-white/40 mb-3">
          Tu tienda se verá mejor con toda la info completa.
        </p>

        <div className="flex flex-wrap gap-2">
          {pending.slice(0, 3).map((step) => (
            <Link
              key={step.label}
              href={step.href}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[11px] text-white/60 hover:text-white"
            >
              <step.icon className="w-3 h-3 shrink-0" />
              {step.label}
            </Link>
          ))}
          {pending.length > 3 && (
            <span className="px-2.5 py-1 rounded-full bg-white/5 text-[11px] text-white/40">
              +{pending.length - 3} más
            </span>
          )}
        </div>
      </div>

      <Link
        href="/dashboard/configuracion"
        className="shrink-0 text-white/30 hover:text-white transition-colors"
        aria-label="Ir a configuracion"
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  )
}
