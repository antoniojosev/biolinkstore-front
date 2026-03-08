'use client'

import { useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const COLOR_PRESETS = [
  '#2dd4bf', // teal
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // violet
]

// Templates that actually respond to primaryColor changes
const TEMPLATES_WITH_COLOR = new Set(['vitrina'])

export interface DraftStoreState {
  name: string
  username: string
  bio: string
  primaryColor: string
  avatarUrl: string | null
  avatarFile: File | null
  bannerUrl: string | null
  bannerFile: File | null
  useDemoProducts: boolean
}

interface EditorPanelProps {
  draft: DraftStoreState
  onChange: (patch: Partial<DraftStoreState>) => void
  currentTemplate: string
}

export function EditorPanel({ draft, onChange, currentTemplate }: EditorPanelProps) {
  const supportsColor = TEMPLATES_WITH_COLOR.has(currentTemplate)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (type: 'avatar' | 'banner') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (type === 'avatar') {
      onChange({ avatarFile: file, avatarUrl: url })
    } else {
      onChange({ bannerFile: file, bannerUrl: url })
    }
    e.target.value = ''
  }

  const removeImage = (type: 'avatar' | 'banner') => {
    if (type === 'avatar') {
      onChange({ avatarFile: null, avatarUrl: null })
    } else {
      onChange({ bannerFile: null, bannerUrl: null })
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Portada (banner) ─────────────────────────────────────── */}
      <section className="space-y-2">
        <Label className="text-sm font-semibold text-white">Foto de portada</Label>
        <div
          className="relative h-28 rounded-xl overflow-hidden bg-white/5 border border-dashed border-white/10 hover:border-[#33b380]/40 transition-colors cursor-pointer group"
          onClick={() => bannerInputRef.current?.click()}
        >
          {draft.bannerUrl ? (
            <>
              <img src={draft.bannerUrl} alt="Portada" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="px-2.5 py-1 bg-white/20 text-white text-xs rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1.5"
                  onClick={(e) => { e.stopPropagation(); bannerInputRef.current?.click() }}
                >
                  <Upload className="w-3 h-3" /> Cambiar
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-red-500/70 text-white text-xs rounded-lg hover:bg-red-500/90 transition-colors flex items-center gap-1.5"
                  onClick={(e) => { e.stopPropagation(); removeImage('banner') }}
                >
                  <X className="w-3 h-3" /> Quitar
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1.5 text-white/30">
              <Upload className="w-5 h-5" />
              <span className="text-xs">Portada (1200×400 recomendado)</span>
            </div>
          )}
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect('banner')} />
        </div>
      </section>

      {/* ── Logo / Avatar ────────────────────────────────────────── */}
      <section className="space-y-2">
        <Label className="text-sm font-semibold text-white">Logo / Avatar</Label>
        <div className="flex items-center gap-4">
          <div
            className="relative w-16 h-16 rounded-full overflow-hidden bg-white/5 border-2 border-dashed border-white/10 hover:border-[#33b380]/40 transition-colors cursor-pointer group shrink-0"
            onClick={() => avatarInputRef.current?.click()}
          >
            {draft.avatarUrl ? (
              <>
                <img src={draft.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30">
                <Upload className="w-4 h-4" />
              </div>
            )}
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect('avatar')} />
          </div>
          <div className="text-xs text-white/40 space-y-1">
            <p>Imagen cuadrada (200×200)</p>
            {draft.avatarUrl && (
              <button
                type="button"
                className="text-red-400/80 hover:text-red-400 transition-colors"
                onClick={() => removeImage('avatar')}
              >
                Quitar imagen
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Nombre ───────────────────────────────────────────────── */}
      <section className="space-y-2">
        <Label className="text-sm font-semibold text-white">Nombre de la tienda</Label>
        <Input
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
          placeholder="Mi Tienda"
        />
      </section>

      {/* ── Username ─────────────────────────────────────────────── */}
      <section className="space-y-2">
        <Label className="text-sm font-semibold text-white">
          Username <span className="text-white/30 font-normal">(URL de tu tienda)</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
          <Input
            value={draft.username}
            onChange={(e) =>
              onChange({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })
            }
            className="h-10 pl-7 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
            placeholder="mi-tienda"
          />
        </div>
        {draft.username && (
          <p className="text-xs text-white/30">biolinkstore.com/{draft.username}</p>
        )}
      </section>

      {/* ── Bio ──────────────────────────────────────────────────── */}
      <section className="space-y-2">
        <Label className="text-sm font-semibold text-white">Descripción / Bio</Label>
        <Textarea
          value={draft.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={3}
          className="bg-white/5 border-white/10 text-white focus:border-[#33b380] resize-none"
          placeholder="Describe tu tienda..."
        />
      </section>

      {/* ── Color primario (solo plantillas que lo soportan) ────── */}
      {supportsColor && (
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-white">Color primario</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={draft.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg border-2 border-white/10 cursor-pointer bg-transparent p-0.5"
              style={{ colorScheme: 'dark' }}
            />
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChange({ primaryColor: color })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    draft.primaryColor === color
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-white/40'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-white/30 font-mono">{draft.primaryColor}</p>
        </section>
      )}

      {/* ── Productos demo ───────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Productos de muestra</p>
            <p className="text-xs text-white/40 mt-0.5">Reemplazar tus productos con ejemplos en el preview</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.useDemoProducts}
            onClick={() => onChange({ useDemoProducts: !draft.useDemoProducts })}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              draft.useDemoProducts ? 'bg-[#33b380]' : 'bg-white/20'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                draft.useDemoProducts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  )
}
