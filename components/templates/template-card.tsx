"use client"

import { Check, Lock, ShoppingBag, Search, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TemplateData } from "./template-data"

// ── Product data for mock previews ────────────────────────────────────────────

const V_PRODUCTS = [
  { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=80', name: 'Air Max Pro', price: '$12.900' },
  { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80', name: 'Urban Watch', price: '$38.500' },
  { img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&q=80', name: 'Noir Parfum', price: '$9.200' },
  { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=80', name: 'City Bag', price: '$22.400' },
]

const L_PRODUCTS = [
  { img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop&q=80', name: 'Vestido Flora', price: '$8.400' },
  { img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=300&h=300&fit=crop&q=80', name: 'Gold Drops', price: '$3.200' },
  { img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&q=80', name: 'Linen Mule', price: '$5.900' },
  { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop&q=80', name: 'Tote Classic', price: '$4.600' },
]

const N_HERO = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=700&h=350&fit=crop&q=80'
const N_PRODUCTS = [
  { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop&q=80', name: 'CUIR TABAC', price: '$89.000' },
  { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&q=80', name: 'TOURBILLON', price: '$145.000' },
  { img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop&q=80', name: 'NUIT DORÉE', price: '$62.000' },
]

// ── Phone frame wrapper ───────────────────────────────────────────────────────

function PhoneFrame({ children, frameColor, isModal }: {
  children: React.ReactNode
  frameColor?: string
  isModal?: boolean
}) {
  const w = isModal ? 226 : 200
  const h = isModal ? 352 : 382

  return (
    <div style={{
      width: w,
      height: h,
      borderRadius: 32,
      background: frameColor ?? '#1c1c1e',
      padding: 5,
      boxShadow: '0 0 0 1px rgba(255,255,255,0.09), 0 32px 64px rgba(0,0,0,0.7)',
      flexShrink: 0,
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  )
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({ light }: { light?: boolean }) {
  const color = light ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 14, paddingRight: 14, height: 18, flexShrink: 0 }}>
      <span style={{ fontSize: 7, fontWeight: 700, color, letterSpacing: 0.2 }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="10" height="7" viewBox="0 0 10 8"><path d="M5 6.5a1 1 0 110 2 1 1 0 010-2zm0-3a4 4 0 013 1.3l-1 1A2.5 2.5 0 005 5a2.5 2.5 0 00-2 .8l-1-1A4 4 0 015 3.5zm0-3a7 7 0 015.2 2.3l-1 1A5.5 5.5 0 005 2.5 5.5 5.5 0 00-.2 3.8l-1-1A7 7 0 015.5 0z" fill={color} /></svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <div style={{ width: 14, height: 7, borderRadius: 2, border: `0.8px solid ${color}`, padding: 1.2 }}>
            <div style={{ width: '75%', height: '100%', borderRadius: 0.8, background: color }} />
          </div>
          <div style={{ width: 1.8, height: 3.5, borderRadius: 0.5, background: color }} />
        </div>
      </div>
    </div>
  )
}

// ── Vitrina Preview ───────────────────────────────────────────────────────────

export function VitrinaPreview({ scale = 1 }: { scale?: number }) {
  const isModal = scale > 1
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#060d16', height: isModal ? 400 : 430 }}>
      <PhoneFrame isModal={isModal}>
        <div style={{ flex: 1, background: '#0d1a2d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Status bar */}
          <div style={{ background: '#0a1220', flexShrink: 0 }}>
            <StatusBar />
          </div>
          {/* Header */}
          <div style={{ background: '#0a1220', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px 7px', flexShrink: 0, borderBottom: '1px solid rgba(45,212,191,0.15)' }}>
            <ShoppingBag style={{ width: 12, height: 12, color: '#2dd4bf' }} />
            <span style={{ fontSize: 8, fontWeight: 700, color: '#e2e8f0', letterSpacing: 1.5 }}>MODA LATINA</span>
            <Search style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.4)' }} />
          </div>
          {/* Category chips */}
          <div style={{ display: 'flex', gap: 5, padding: '7px 10px 6px', flexShrink: 0 }}>
            {['Todo', 'Ropa', 'Zapatillas', 'Acces'].map((c, i) => (
              <div key={c} style={{ borderRadius: 10, padding: '3px 7px', background: i === 0 ? '#2dd4bf' : 'rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <span style={{ fontSize: 6, fontWeight: 600, color: i === 0 ? '#0a1220' : 'rgba(255,255,255,0.5)' }}>{c}</span>
              </div>
            ))}
          </div>
          {/* Product grid 2×2 */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: '0 10px 6px', overflow: 'hidden' }}>
            {V_PRODUCTS.map((p) => (
              <div key={p.name} style={{ borderRadius: 10, background: '#132030', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 0 }} />
                <div style={{ padding: '4px 7px 5px', flexShrink: 0 }}>
                  <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.85)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 7, color: '#2dd4bf', fontWeight: 700, marginTop: 2 }}>{p.price}</div>
                </div>
              </div>
            ))}
          </div>
          {/* WhatsApp FAB */}
          <div style={{ position: 'absolute', bottom: 18, right: 12, width: 24, height: 24, borderRadius: 12, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(37,211,102,0.6)' }}>
            <MessageCircle style={{ width: 13, height: 13, color: 'white' }} />
          </div>
          {/* Home indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 7, flexShrink: 0 }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
          </div>
        </div>
      </PhoneFrame>
    </div>
  )
}

// ── Luxora Preview ────────────────────────────────────────────────────────────

export function LuxoraPreview({ scale = 1 }: { scale?: number }) {
  const isModal = scale > 1
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#e5e0d9', height: isModal ? 400 : 430 }}>
      <PhoneFrame frameColor="#ddd8d0" isModal={isModal}>
        <div style={{ flex: 1, background: '#FAFAF8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: '#F0EFEC', flexShrink: 0 }}>
            <StatusBar light />
          </div>
          {/* Header */}
          <div style={{ background: '#F0EFEC', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 0 8px', flexShrink: 0, borderBottom: '1px solid #e5e3de' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14, marginBottom: 4,
              backgroundImage: 'url(https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=80&h=80&fit=crop)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: '1.5px solid #d5d0c9'
            }} />
            <span style={{ fontSize: 8, fontWeight: 700, color: '#1a1a1a', letterSpacing: 2, textTransform: 'uppercase' }}>Luxora Studio</span>
            <span style={{ fontSize: 5.5, color: '#999', marginTop: 2, letterSpacing: 0.5 }}>Moda Atemporal</span>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e8e6e1', flexShrink: 0 }}>
            {['Todo', 'Ropa', 'Acces'].map((t, i) => (
              <div key={t} style={{ flex: 1, padding: '6px 0', textAlign: 'center', borderBottom: i === 0 ? '2px solid #2563EB' : 'none', marginBottom: -1 }}>
                <span style={{ fontSize: 6.5, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#2563EB' : '#999' }}>{t}</span>
              </div>
            ))}
          </div>
          {/* Product list */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '2px 12px 0' }}>
            {L_PRODUCTS.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < L_PRODUCTS.length - 1 ? '1px solid #f0eeeb' : 'none' }}>
                <div style={{ width: 44, height: 44, borderRadius: 9, flexShrink: 0, backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 7, fontWeight: 600, color: '#1a1a1a', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 7.5, fontWeight: 700, color: '#2563EB' }}>{p.price}</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: 11, background: '#F0EFEC', border: '1px solid #e0ddd8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: '#555', lineHeight: 1 }}>+</span>
                </div>
              </div>
            ))}
          </div>
          {/* WhatsApp button */}
          <div style={{ margin: '6px 12px 8px', background: '#25D366', borderRadius: 10, padding: '7px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, flexShrink: 0 }}>
            <MessageCircle style={{ width: 9, height: 9, color: 'white' }} />
            <span style={{ fontSize: 7, fontWeight: 700, color: 'white' }}>Pedir por WhatsApp</span>
          </div>
          {/* Home indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 6, flexShrink: 0 }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.18)' }} />
          </div>
        </div>
      </PhoneFrame>
    </div>
  )
}

// ── Noir Preview ──────────────────────────────────────────────────────────────

export function NoirPreview({ scale = 1 }: { scale?: number }) {
  const isModal = scale > 1
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#040404', height: isModal ? 400 : 430 }}>
      <PhoneFrame frameColor="#111" isModal={isModal}>
        <div style={{ flex: 1, background: '#0A0A0A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <StatusBar />
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '5px 14px 6px', flexShrink: 0 }}>
            <div style={{ flex: 1, height: 0.5, background: 'linear-gradient(to right, transparent, rgba(201,168,108,0.8))' }} />
            <span style={{ fontSize: 8, fontWeight: 700, color: '#F5F0E8', letterSpacing: 3.5 }}>NOIR</span>
            <div style={{ flex: 1, height: 0.5, background: 'linear-gradient(to left, transparent, rgba(201,168,108,0.8))' }} />
          </div>
          {/* Hero image */}
          <div style={{
            margin: '0 10px 8px', borderRadius: 6, overflow: 'hidden',
            height: isModal ? 88 : 112, flexShrink: 0,
            backgroundImage: `url(${N_HERO})`, backgroundSize: 'cover', backgroundPosition: 'center top',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(5,5,5,0.85) 100%)', display: 'flex', alignItems: 'flex-end', padding: '0 9px 8px' }}>
              <div>
                <div style={{ fontSize: 5.5, color: '#C9A86C', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Nueva Colección</div>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: '#F5F0E8', letterSpacing: 0.5 }}>Otoño 2025</div>
              </div>
            </div>
          </div>
          {/* Products */}
          <div style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            {N_PRODUCTS.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < N_PRODUCTS.length - 1 ? 8 : 0, borderBottom: i < N_PRODUCTS.length - 1 ? '0.5px solid rgba(201,168,108,0.1)' : 'none' }}>
                <div style={{ width: 40, height: 40, flexShrink: 0, backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 3 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 6, letterSpacing: 2, color: '#F5F0E8', fontWeight: 600, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 7.5, color: '#C9A86C', fontWeight: 700, marginTop: 2 }}>{p.price}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Gold divider */}
          <div style={{ height: 0.5, margin: '6px 10px', background: 'linear-gradient(to right, transparent, #C9A86C, transparent)', flexShrink: 0 }} />
          {/* Contact button */}
          <div style={{ margin: '0 10px 8px', border: '0.5px solid rgba(201,168,108,0.5)', borderRadius: 5, padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, flexShrink: 0 }}>
            <MessageCircle style={{ width: 8, height: 8, color: '#C9A86C' }} />
            <span style={{ fontSize: 6.5, letterSpacing: 1.5, color: '#C9A86C', textTransform: 'uppercase', fontWeight: 600 }}>Contactar</span>
          </div>
          {/* Home indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 7, flexShrink: 0 }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
          </div>
        </div>
      </PhoneFrame>
    </div>
  )
}

const PREVIEW_MAP: Record<string, ({ scale }: { scale?: number }) => React.JSX.Element> = {
  vitrina: VitrinaPreview,
  luxora: LuxoraPreview,
  noir: NoirPreview,
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: TemplateData
  isSelected: boolean
  isLocked: boolean
  onClick: () => void
}

export function TemplateCard({ template, isSelected, isLocked: locked, onClick }: TemplateCardProps) {
  const Preview = PREVIEW_MAP[template.id]

  return (
    <button
      onClick={locked ? undefined : onClick}
      className={cn(
        "relative flex flex-col rounded-2xl overflow-hidden border-2 text-left w-full transition-all duration-200",
        isSelected
          ? "border-[#33b380] shadow-[0_0_0_4px_rgba(51,179,128,0.15)]"
          : locked
          ? "border-white/10 opacity-60 cursor-not-allowed"
          : "border-white/10 hover:border-white/30 cursor-pointer hover:shadow-xl hover:-translate-y-1"
      )}
    >
      {/* Phone preview */}
      <div className="relative overflow-hidden">
        {Preview && <Preview scale={1} />}

        {/* PRO badge */}
        {template.plan !== 'free' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm">
            {locked && <Lock className="w-2.5 h-2.5" />}
            PRO
          </div>
        )}

        {/* Selected check */}
        {isSelected && (
          <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[#33b380] flex items-center justify-center shadow-lg">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}

        {/* Locked overlay */}
        {locked && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-white/60" />
            <span className="text-xs text-white/50 font-medium">Plan PRO</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 bg-[#0d1218] flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">{template.name}</p>
            <p className="text-xs text-white/50 mt-0.5">{template.tagline}</p>
          </div>
          {isSelected && (
            <span className="shrink-0 text-[10px] font-semibold text-[#33b380] bg-[#33b380]/10 px-2 py-0.5 rounded-full border border-[#33b380]/20">
              Activo
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
