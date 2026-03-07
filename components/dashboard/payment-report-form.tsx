"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, CheckCircle2, FileText, X, Copy, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const BANK_INFO = {
  bankDisplay: 'Banco Mercantil · 0105',
  bankCopy: '0105',
  cedula: '26850126',
  account: '041258349984',
}

const BANK_COPY_ALL = `0105\n${BANK_INFO.cedula}\n${BANK_INFO.account}`

function CopyField({ label, display, copyValue }: { label: string; display: string; copyValue: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(copyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-[10px] text-[#f59e0b]/60 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-white font-mono">{display}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
        title="Copiar"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#33b380]" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

function CopyAllButton() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(BANK_COPY_ALL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-[#f59e0b]/20 hover:border-[#f59e0b]/40 text-[#f59e0b]/70 hover:text-[#f59e0b] transition-all"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copiado' : 'Copiar todo'}
    </button>
  )
}

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
    } catch (err: unknown) {
      setUploading(false)
      setError(err instanceof Error ? err.message : 'Error al enviar el reporte')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#33b380]/15 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-[#33b380]" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">¡Reporte recibido!</p>
          <p className="text-sm text-white/50 mt-1.5 leading-relaxed max-w-xs">
            Revisaremos tu comprobante y activaremos el servicio en las próximas <span className="text-white/70 font-medium">24 horas</span>. Te notificaremos por email.
          </p>
        </div>
        <button
          onClick={onSuccess}
          className="mt-2 px-6 py-2.5 rounded-xl bg-[#33b380] hover:bg-[#2a9a6d] text-white text-sm font-semibold transition-all"
        >
          Entendido
        </button>
      </div>
    )
  }

  const isValid = name.trim() && phone.trim() && bank.trim() && transferDate && file

  return (
    <div className="space-y-3">
      {/* Bank info card */}
      <div className="rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wide">Datos para la transferencia</p>
          <CopyAllButton />
        </div>
        <CopyField label="Banco" display={BANK_INFO.bankDisplay} copyValue={BANK_INFO.bankCopy} />
        <div className="h-px bg-white/5" />
        <CopyField label="Cédula" display={BANK_INFO.cedula} copyValue={BANK_INFO.cedula} />
        <div className="h-px bg-white/5" />
        <CopyField label="Número de cuenta" display={BANK_INFO.account} copyValue={BANK_INFO.account} />
      </div>

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
