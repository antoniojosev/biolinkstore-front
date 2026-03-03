"use client"

import { Check, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VitrinaPreview, LuxoraPreview, NoirPreview } from "./template-card"
import type { TemplateData } from "./template-data"

const LARGE_PREVIEW_MAP: Record<string, React.FC<{ scale?: number }>> = {
  vitrina: VitrinaPreview,
  luxora: LuxoraPreview,
  noir: NoirPreview,
}

interface TemplatePreviewModalProps {
  template: TemplateData | null
  open: boolean
  onClose: () => void
  isSelected: boolean
  isLocked: boolean
  onSelect: () => void
  isLoading: boolean
}

export function TemplatePreviewModal({
  template,
  open,
  onClose,
  isSelected,
  isLocked,
  onSelect,
  isLoading,
}: TemplatePreviewModalProps) {
  if (!template) return null

  const Preview = LARGE_PREVIEW_MAP[template.id]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Large preview */}
        <div className="relative overflow-hidden" style={{ height: 400 }}>
          {template.preview ? (
            <img src={template.preview} alt={template.name} className="w-full h-full object-cover object-top" />
          ) : (
            Preview && <Preview scale={1.55} />
          )}

          {/* Locked overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Plan PRO requerido</p>
                <p className="text-xs text-white/50 mt-0.5">Actualiza tu plan para usar este diseño</p>
              </div>
            </div>
          )}

          {/* Selected badge */}
          {isSelected && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#33b380] text-white text-xs font-semibold shadow-lg">
              <Check className="w-3 h-3" />
              Activo
            </div>
          )}

          {/* Plan badge */}
          {template.plan !== 'free' && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm">
              <Lock className="w-3 h-3" />
              PRO
            </div>
          )}
        </div>

        <div className="p-6">
          <DialogHeader className="p-0 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xl">{template.name}</DialogTitle>
                <p className="text-sm text-[#33b380] font-medium mt-0.5">{template.tagline}</p>
              </div>
              {/* Color palette dots */}
              <div className="flex gap-1.5 shrink-0 pt-1">
                <div
                  className="w-4 h-4 rounded-full border border-white/10"
                  style={{ background: template.colors.bg }}
                  title="Fondo"
                />
                <div
                  className="w-4 h-4 rounded-full border border-white/10"
                  style={{ background: template.colors.card }}
                  title="Tarjetas"
                />
                <div
                  className="w-4 h-4 rounded-full border border-white/10"
                  style={{ background: template.colors.accent }}
                  title="Acento"
                />
              </div>
            </div>
          </DialogHeader>

          <DialogDescription className="text-sm text-white/60 leading-relaxed mb-4">
            {template.description}
          </DialogDescription>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50 border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>

          <DialogFooter className="p-0">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white/50 hover:text-white hover:bg-white/5"
            >
              Cancelar
            </Button>
            {isLocked ? (
              <Button
                className="bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
              >
                <Lock className="w-4 h-4 mr-2" />
                Requiere plan PRO
              </Button>
            ) : isSelected ? (
              <Button
                disabled
                className="bg-[#33b380]/20 text-[#33b380] border border-[#33b380]/30"
              >
                <Check className="w-4 h-4 mr-2" />
                Ya es tu diseño activo
              </Button>
            ) : (
              <Button
                onClick={onSelect}
                disabled={isLoading}
                className="bg-[#33b380] hover:bg-[#2a9a6d] text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Aplicando...
                  </span>
                ) : (
                  'Seleccionar este diseño'
                )}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
