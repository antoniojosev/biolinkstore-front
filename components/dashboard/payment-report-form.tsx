"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, CheckCircle2, FileText, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface PaymentReportFormProps {
  storeId: string
  type: 'PLAN_UPGRADE' | 'DOMAIN' | 'DESIGN'
  targetPlan?: string
  notes?: string
  defaultName?: string
  defaultPhone?: string
  onSuccess: () => void
  onCancel: () => void
}

export function PaymentReportForm({
  storeId,
  type,
  targetPlan,
  notes: externalNotes,
  defaultName = '',
  defaultPhone = '',
  onSuccess,
  onCancel,
}: PaymentReportFormProps) {
  const { http } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(defaultName)
  const [phone, setPhone] = useState(defaultPhone)
  const [bank, setBank] = useState('')
  const [transferDate, setTransferDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(selected.type)) {
      setError('Solo se permiten imagenes (JPG, PNG, WebP) o PDF')
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('El archivo no puede superar 5 MB')
      return
    }
    setError('')
    setFile(selected)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !bank.trim() || !transferDate || !file) return
    setError('')
    setSubmitting(true)

    try {
      // 1. Upload proof file
      setUploading(true)
      const formData = new FormData()
      formData.append('files', file)
      const uploadResult = await http.postFormData<{ url: string }[]>(
        `/api/stores/${storeId}/uploads`,
        formData,
      )
      setUploading(false)

      const proofUrl = uploadResult[0].url

      // 2. Create payment report
      await http.post(`/api/stores/${storeId}/payment-reports`, {
        type,
        targetPlan: targetPlan ?? undefined,
        name: name.trim(),
        phone: phone.trim(),
        bank: bank.trim(),
        transferDate: new Date(transferDate).toISOString(),
        proofUrl,
        notes: externalNotes ?? undefined,
      })

      setSuccess(true)
      setTimeout(onSuccess, 2000)
    } catch (err: unknown) {
      setUploading(false)
      setError(err instanceof Error ? err.message : 'Error al enviar el reporte')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-12 h-12 rounded-full bg-[#33b380]/15 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-[#33b380]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">Reporte enviado</p>
          <p className="text-xs text-white/40 mt-1">
            Revisaremos tu comprobante y activaremos el servicio en menos de 24 hs.
          </p>
        </div>
      </div>
    )
  }

  const isValid = name.trim() && phone.trim() && bank.trim() && transferDate && file

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Nombre completo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/8 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Teléfono de contacto</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+54 9 11 XXXX XXXX"
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/8 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Banco / entidad</label>
        <input
          type="text"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          placeholder="Mercado Pago, Banco Nación, etc."
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/8 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Fecha de transferencia</label>
        <input
          type="date"
          value={transferDate}
          onChange={(e) => setTransferDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/8 transition-all [color-scheme:dark]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Comprobante</label>
        {file ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <FileText className="w-4 h-4 text-[#f59e0b] shrink-0" />
            <span className="text-xs text-white/70 truncate flex-1">{file.name}</span>
            <button
              onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="text-white/30 hover:text-white/60 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-white/15 hover:border-[#f59e0b]/40 bg-white/3 text-white/40 hover:text-white/60 transition-all text-xs"
          >
            <Upload className="w-4 h-4" />
            Subir imagen o PDF del comprobante
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {uploading ? 'Subiendo...' : 'Enviando...'}
            </>
          ) : (
            'Enviar reporte de pago'
          )}
        </button>
      </div>
    </div>
  )
}
