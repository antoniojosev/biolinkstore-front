"use client"

import { useState } from "react"
import { AlertCircle, ExternalLink } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { TEMPLATES, isTemplateLocked } from "./template-data"
import { TemplateCard } from "./template-card"
import { TemplatePreviewModal } from "./template-preview-modal"
import type { TemplateData, TemplatePlan } from "./template-data"
import type { TemplateId } from "@/lib/types"
import type { IStoreRepository } from "@/lib/stores-api/store.repository"

interface TemplateGalleryProps {
  mode: 'onboarding' | 'dashboard'
  storeId: string
  currentTemplate: TemplateId
  storeRepo: IStoreRepository
  onSuccess: () => void
}

export function TemplateGallery({
  mode,
  storeId,
  currentTemplate,
  storeRepo,
  onSuccess,
}: TemplateGalleryProps) {
  const { store: authStore } = useAuth()
  const userPlan: TemplatePlan = (authStore?.subscription?.plan?.toLowerCase() as TemplatePlan) ?? 'free'
  const storeSlug = authStore?.slug
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>(currentTemplate)
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isPicking, setIsPicking] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleCardClick = (template: TemplateData) => {
    setSaveError(null)
    setPreviewTemplate(template)
    setModalOpen(true)
  }

  const handleSelect = async (templateId: TemplateId) => {
    setSaveError(null)
    setIsPicking(true)
    try {
      await storeRepo.update(storeId, { template: templateId })
      setActiveTemplate(templateId)
      setModalOpen(false)
      onSuccess()
    } catch {
      setSaveError('No se pudo guardar el diseño. Intenta de nuevo.')
    } finally {
      setIsPicking(false)
    }
  }

  const handleSkip = () => {
    handleSelect('vitrina')
  }

  const closeModal = () => {
    setModalOpen(false)
    setPreviewTemplate(null)
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {saveError && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {saveError}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => {
          const locked = isTemplateLocked(template.plan, userPlan)
          return (
            <div key={template.id} className="space-y-2">
              <TemplateCard
                template={template}
                isSelected={activeTemplate === template.id}
                isLocked={locked}
                onClick={() => handleCardClick(template)}
              />
              {storeSlug && (
                <button
                  onClick={() => window.open(`/${storeSlug}?preview=${template.id}`, '_blank')}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Previsualizar
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Onboarding skip link */}
      {mode === 'onboarding' && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleSkip}
            disabled={isPicking}
            className="text-sm text-white/30 hover:text-white/60 transition-colors underline underline-offset-4 disabled:opacity-50"
          >
            Omitir por ahora (usar Vitrina)
          </button>
        </div>
      )}

      {/* Preview modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={modalOpen}
        onClose={closeModal}
        isSelected={previewTemplate ? activeTemplate === previewTemplate.id : false}
        isLocked={previewTemplate ? isTemplateLocked(previewTemplate.plan, userPlan) : false}
        onSelect={() => previewTemplate && handleSelect(previewTemplate.id)}
        isLoading={isPicking}
      />
    </div>
  )
}
