'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CreditCard,
  Smartphone,
  Mail,
  Bitcoin,
  Landmark,
  Banknote,
  MoreHorizontal,
  Crown,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import {
  PaymentMethodsHttpRepository,
  VE_BANKS,
  type PaymentMethod,
  type PaymentMethodType,
  type CreatePaymentMethodInput,
} from '@/lib/payment-methods'

const FREE_MAX = 1

type Plan = 'FREE' | 'PRO' | 'BUSINESS'

const TYPE_META: Record<PaymentMethodType, { label: string; icon: typeof CreditCard; color: string }> = {
  PAGO_MOVIL: { label: 'PagoMovil', icon: Smartphone, color: '#6ee490' },
  ZELLE: { label: 'Zelle', icon: Mail, color: '#327be2' },
  BINANCE: { label: 'Binance', icon: Bitcoin, color: '#f0b90b' },
  TRANSFER: { label: 'Transferencia', icon: Landmark, color: '#89b5f0' },
  CASH: { label: 'Efectivo', icon: Banknote, color: '#33b380' },
  OTHER: { label: 'Otro', icon: MoreHorizontal, color: '#8888aa' },
}

export default function PagosPage() {
  const { http, store } = useAuth()
  const plan: Plan = store?.subscription?.plan ?? 'FREE'
  const isPro = plan === 'PRO' || plan === 'BUSINESS'

  const repo = useMemo(() => new PaymentMethodsHttpRepository(http), [http])

  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PaymentMethod | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!store?.id) return
    try {
      setMethods(await repo.list(store.id))
    } catch {
      toast.error('Error al cargar metodos')
    } finally {
      setLoading(false)
    }
  }, [store?.id, repo])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const atFreeLimit = !isPro && methods.length >= FREE_MAX

  const toggleEnabled = async (m: PaymentMethod) => {
    if (!store?.id) return
    try {
      const updated = await repo.update(store.id, m.id, { enabled: !m.enabled })
      setMethods((prev) => prev.map((p) => (p.id === m.id ? updated : p)))
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const confirmDelete = async () => {
    if (!store?.id || !deleteTarget) return
    setDeleting(true)
    try {
      await repo.remove(store.id, deleteTarget.id)
      setMethods((prev) => prev.filter((m) => m.id !== deleteTarget.id))
      toast.success('Metodo eliminado')
      setDeleteTarget(null)
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-[#33b380]" />
          Metodos de pago
        </h1>
        <p className="text-white/60 mt-1">
          Configura como tus clientes pueden pagarte. Se mostraran en el checkout.
        </p>
      </div>

      {!isPro && (
        <div className="p-3 rounded-lg border border-[#33b380]/20 bg-[#33b380]/5 flex items-start gap-3">
          <Crown className="w-4 h-4 text-[#6ee490] shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-white/80">
            <span className="text-[#6ee490] font-semibold">Pro:</span> metodos de
            pago ilimitados. En FREE estas limitado a {FREE_MAX} metodo.
          </div>
        </div>
      )}

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">
              Tus metodos {!isPro && `(${methods.length}/${FREE_MAX})`}
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Arrastra para reordenar (proximamente). Desactiva sin eliminar con el ojo.
            </p>
          </div>
          <Button
            onClick={() => {
              if (atFreeLimit) {
                toast.error(`Plan FREE permite solo ${FREE_MAX} metodo. Mejora a Pro.`)
                return
              }
              setEditing(null)
              setDialogOpen(true)
            }}
            disabled={atFreeLimit}
            size="sm"
            className="bg-[#33b380] hover:bg-[#2a9669] text-white border-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo
          </Button>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-white/30" />
          </div>
        ) : methods.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-white/40">Aun no configuraste metodos de pago.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {methods.map((m) => (
              <MethodRow
                key={m.id}
                method={m}
                onToggle={() => toggleEnabled(m)}
                onEdit={() => {
                  setEditing(m)
                  setDialogOpen(true)
                }}
                onDelete={() => setDeleteTarget(m)}
              />
            ))}
          </div>
        )}
      </section>

      <MethodDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        storeId={store?.id ?? ''}
        repo={repo}
        onSaved={(saved) => {
          setMethods((prev) => {
            const idx = prev.findIndex((m) => m.id === saved.id)
            if (idx >= 0) {
              const copy = [...prev]
              copy[idx] = saved
              return copy
            }
            return [...prev, saved]
          })
          setDialogOpen(false)
        }}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar metodo</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `Se eliminara "${deleteTarget.label}" permanentemente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MethodRow({
  method,
  onToggle,
  onEdit,
  onDelete,
}: {
  method: PaymentMethod
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const meta = TYPE_META[method.type]
  const Icon = meta.icon

  return (
    <div
      className={cn(
        'p-3 rounded-lg border bg-[#0d1218] flex items-center gap-3 transition-all',
        method.enabled ? 'border-white/5' : 'border-white/5 opacity-50',
      )}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{method.label}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 font-medium">
            {meta.label}
          </span>
        </div>
        <p className="text-xs text-white/40 truncate mt-0.5">
          {renderSummary(method)}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          aria-label={method.enabled ? 'Desactivar' : 'Activar'}
          title={method.enabled ? 'Desactivar' : 'Activar'}
        >
          {method.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
          aria-label="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function renderSummary(m: PaymentMethod): string {
  const d = m.details as Record<string, string>
  switch (m.type) {
    case 'PAGO_MOVIL': {
      const bank = VE_BANKS.find((b) => b.code === d.bank)?.name ?? d.bank ?? ''
      return `${d.phone ?? ''} · ${d.idNumber ?? ''} · ${bank}`
    }
    case 'ZELLE':
      return `${d.email ?? ''} · ${d.holderName ?? ''}`
    case 'BINANCE':
      return d.binanceId ?? d.email ?? ''
    case 'TRANSFER': {
      const bank = VE_BANKS.find((b) => b.code === d.bank)?.name ?? d.bank ?? ''
      return `${bank} · ${d.accountType ?? ''} · ${d.accountNumber ?? ''}`
    }
    case 'CASH':
      return `Moneda: ${d.currency ?? ''}`
    default:
      return Object.entries(d)
        .slice(0, 2)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ')
  }
}

function MethodDialog({
  open,
  onClose,
  editing,
  storeId,
  repo,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  editing: PaymentMethod | null
  storeId: string
  repo: PaymentMethodsHttpRepository
  onSaved: (m: PaymentMethod) => void
}) {
  const [type, setType] = useState<PaymentMethodType>('PAGO_MOVIL')
  const [label, setLabel] = useState('')
  const [details, setDetails] = useState<Record<string, string>>({})
  const [instructions, setInstructions] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (editing) {
      setType(editing.type)
      setLabel(editing.label)
      setDetails((editing.details ?? {}) as Record<string, string>)
      setInstructions(editing.instructions ?? '')
    } else {
      setType('PAGO_MOVIL')
      setLabel('')
      setDetails({})
      setInstructions('')
    }
    setError('')
  }, [open, editing])

  const detailsValid = validateDetails(type, details)

  const handleSave = async () => {
    if (!storeId || !label.trim() || !detailsValid) return
    setSaving(true)
    setError('')
    try {
      const payload: CreatePaymentMethodInput = {
        type,
        label: label.trim(),
        details: cleanDetails(type, details),
        instructions: instructions.trim() || undefined,
      }
      const saved = editing
        ? await repo.update(storeId, editing.id, payload)
        : await repo.create(storeId, payload)
      toast.success(editing ? 'Metodo actualizado' : 'Metodo creado')
      onSaved(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar metodo' : 'Nuevo metodo de pago'}</DialogTitle>
          <DialogDescription>
            Los datos se mostraran al comprador en el checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_META) as PaymentMethodType[]).map((t) => {
                const meta = TYPE_META[t]
                const Icon = meta.icon
                const active = type === t
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!!editing}
                    onClick={() => {
                      setType(t)
                      setDetails({})
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 py-2.5 rounded-lg border transition-all',
                      active
                        ? 'border-[#33b380] bg-[#33b380]/10 text-white'
                        : 'border-white/10 text-white/50 hover:border-white/20',
                      editing && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={active ? { color: meta.color } : undefined}
                    />
                    <span className="text-[10px] font-medium">{meta.label}</span>
                  </button>
                )
              })}
            </div>
            {editing && (
              <p className="text-[10px] text-white/30">
                No se puede cambiar el tipo despues de crear. Elimina y crea uno nuevo.
              </p>
            )}
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Etiqueta</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={TYPE_META[type].label + ' principal'}
              maxLength={80}
            />
          </div>

          {/* Type-specific fields */}
          <TypeFields type={type} details={details} setDetails={setDetails} />

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">
              Instrucciones <span className="text-white/25">(opcional)</span>
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Ej. Enviar comprobante al WhatsApp. Reserva de 15 min para confirmar pago."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#33b380]/50 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs p-2 rounded bg-red-500/10 text-red-400">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !label.trim() || !detailsValid}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#33b380] hover:bg-[#2a9669] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editing ? (
                'Guardar'
              ) : (
                'Crear'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TypeFields({
  type,
  details,
  setDetails,
}: {
  type: PaymentMethodType
  details: Record<string, string>
  setDetails: (d: Record<string, string>) => void
}) {
  const set = (key: string, value: string) => setDetails({ ...details, [key]: value })

  switch (type) {
    case 'PAGO_MOVIL':
      return (
        <>
          <Field label="Telefono">
            <Input
              value={details.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="0424 1234567"
            />
          </Field>
          <Field label="Cedula">
            <Input
              value={details.idNumber ?? ''}
              onChange={(e) => set('idNumber', e.target.value)}
              placeholder="V12345678"
            />
          </Field>
          <Field label="Banco">
            <BankSelect value={details.bank ?? ''} onChange={(v) => set('bank', v)} />
          </Field>
        </>
      )
    case 'ZELLE':
      return (
        <>
          <Field label="Email">
            <Input
              type="email"
              value={details.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
              placeholder="tu@email.com"
            />
          </Field>
          <Field label="Nombre del titular">
            <Input
              value={details.holderName ?? ''}
              onChange={(e) => set('holderName', e.target.value)}
              placeholder="Juan Perez"
            />
          </Field>
        </>
      )
    case 'BINANCE':
      return (
        <>
          <Field label="Binance ID (o email)">
            <Input
              value={details.binanceId ?? ''}
              onChange={(e) => set('binanceId', e.target.value)}
              placeholder="123456789"
            />
          </Field>
          <Field label="Email (opcional)">
            <Input
              type="email"
              value={details.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
              placeholder="opcional"
            />
          </Field>
        </>
      )
    case 'TRANSFER':
      return (
        <>
          <Field label="Banco">
            <BankSelect value={details.bank ?? ''} onChange={(v) => set('bank', v)} />
          </Field>
          <Field label="Numero de cuenta">
            <Input
              value={details.accountNumber ?? ''}
              onChange={(e) => set('accountNumber', e.target.value)}
              placeholder="0102 0000 0000 0000 0000"
            />
          </Field>
          <Field label="Tipo de cuenta">
            <div className="grid grid-cols-2 gap-2">
              {(['ahorros', 'corriente'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('accountType', t)}
                  className={cn(
                    'py-2 rounded-lg text-sm font-medium border transition-all capitalize',
                    details.accountType === t
                      ? 'border-[#33b380] bg-[#33b380]/10 text-white'
                      : 'border-white/10 text-white/50 hover:border-white/20',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Cedula del titular">
            <Input
              value={details.idNumber ?? ''}
              onChange={(e) => set('idNumber', e.target.value)}
              placeholder="V12345678"
            />
          </Field>
          <Field label="Nombre del titular">
            <Input
              value={details.holderName ?? ''}
              onChange={(e) => set('holderName', e.target.value)}
              placeholder="Juan Perez"
            />
          </Field>
        </>
      )
    case 'CASH':
      return (
        <Field label="Moneda">
          <div className="grid grid-cols-2 gap-2">
            {(['USD', 'VES'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('currency', c)}
                className={cn(
                  'py-2 rounded-lg text-sm font-medium border transition-all',
                  details.currency === c
                    ? 'border-[#33b380] bg-[#33b380]/10 text-white'
                    : 'border-white/10 text-white/50 hover:border-white/20',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
      )
    case 'OTHER':
      return (
        <Field label="Datos del metodo">
          <textarea
            value={details.data ?? ''}
            onChange={(e) => set('data', e.target.value)}
            rows={2}
            placeholder="Describe los datos del metodo"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#33b380]/50 resize-none"
          />
        </Field>
      )
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/50 font-medium">{label}</label>
      {children}
    </div>
  )
}

function BankSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#33b380]/50"
    >
      <option value="" className="bg-[#0d1218]">
        Selecciona un banco
      </option>
      {VE_BANKS.map((b) => (
        <option key={b.code} value={b.code} className="bg-[#0d1218]">
          {b.code} - {b.name}
        </option>
      ))}
    </select>
  )
}

function validateDetails(type: PaymentMethodType, d: Record<string, string>): boolean {
  const has = (k: string) => !!d[k]?.trim()
  switch (type) {
    case 'PAGO_MOVIL':
      return has('phone') && has('idNumber') && has('bank')
    case 'ZELLE':
      return has('email') && has('holderName')
    case 'BINANCE':
      return has('binanceId') || has('email')
    case 'TRANSFER':
      return (
        has('bank') &&
        has('accountNumber') &&
        has('accountType') &&
        has('idNumber') &&
        has('holderName')
      )
    case 'CASH':
      return has('currency')
    case 'OTHER':
      return has('data')
  }
}

function cleanDetails(type: PaymentMethodType, d: Record<string, string>): Record<string, string> {
  const clean = { ...d }
  Object.keys(clean).forEach((k) => {
    if (!clean[k]?.trim()) delete clean[k]
  })
  // Drop keys not relevant to the type
  const allowed: Record<PaymentMethodType, string[]> = {
    PAGO_MOVIL: ['phone', 'idNumber', 'bank'],
    ZELLE: ['email', 'holderName'],
    BINANCE: ['binanceId', 'email'],
    TRANSFER: ['bank', 'accountNumber', 'accountType', 'idNumber', 'holderName'],
    CASH: ['currency'],
    OTHER: ['data'],
  }
  Object.keys(clean).forEach((k) => {
    if (!allowed[type].includes(k)) delete clean[k]
  })
  return clean
}
