"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { TEMPLATES, isTemplateLocked } from "./template-data"
import { TemplateCard } from "./template-card"
import { TemplatePreviewModal } from "./template-preview-modal"
import type { TemplateData, TemplatePlan } from "./template-data"
import type { TemplateId } from "@/lib/types"
import type { IStoreRepository } from "@/lib/stores-api/store.repository"

// Hardcoded for MVP — swap for store.subscription?.plan when available
const USER_PLAN: TemplatePlan = 'free'

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
          const locked = isTemplateLocked(template.plan, USER_PLAN)
          return (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={activeTemplate === template.id}
              isLocked={locked}
              onClick={() => handleCardClick(template)}
            />
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
        isLocked={previewTemplate ? isTemplateLocked(previewTemplate.plan, USER_PLAN) : false}
        onSelect={() => previewTemplate && handleSelect(previewTemplate.id)}
        isLoading={isPicking}
      />
    </div>
  )
}
