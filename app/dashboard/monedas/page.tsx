'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, Coins, RefreshCw, Crown, X, AlertCircle, CheckCircle2 } from 'lucide-react'
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
  CustomRatesHttpRepository,
  useOfficialRates,
  formatFetchedDate,
  validateFormula,
  evaluateFormula,
  extractRefs,
  type CustomRate,
  type CustomRateMode,
  type CreateCustomRateInput,
} from '@/lib/currency'

const FREE_MAX_CUSTOM = 1
const BASE_CURRENCIES = ['USD', 'EUR', 'VES'] as const

type Plan = 'FREE' | 'PRO' | 'BUSINESS'

export default function MonedasPage() {
  const { http, store } = useAuth()
  const plan: Plan = store?.subscription?.plan ?? 'FREE'
  const isPro = plan === 'PRO' || plan === 'BUSINESS'

  const repo = useMemo(() => new CustomRatesHttpRepository(http), [http])
  const { rates: officialRates, loading: loadingOfficial, refresh: refreshOfficial } = useOfficialRates()

  const [customs, setCustoms] = useState<CustomRate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CustomRate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomRate | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCustoms = useCallback(async () => {
    if (!store?.id) return
    try {
      const list = await repo.list(store.id)
      setCustoms(list)
    } catch {
      toast.error('Error al cargar tus tasas')
    } finally {
      setLoading(false)
    }
  }, [store?.id, repo])

  useEffect(() => {
    fetchCustoms()
  }, [fetchCustoms])

  const atFreeLimit = !isPro && customs.length >= FREE_MAX_CUSTOM

  const openCreate = () => {
    if (atFreeLimit) {
      toast.error('Plan FREE permite solo 1 tasa manual. Mejora a Pro para mas.')
      return
    }
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (r: CustomRate) => {
    setEditing(r)
    setDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!store?.id || !deleteTarget) return
    setDeleting(true)
    try {
      await repo.remove(store.id, deleteTarget.id)
      setCustoms((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      toast.success('Tasa eliminada')
      setDeleteTarget(null)
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Coins className="w-6 h-6 text-[#33b380]" />
          Monedas y tasas
        </h1>
        <p className="text-white/60 mt-1">
          Gestiona las tasas de cambio que tus compradores veran en tu tienda.
        </p>
      </div>

      {/* Tasas oficiales (read-only) */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">Tasas oficiales</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Dolar y Euro BCV — se actualizan automaticamente cada 4 horas.
            </p>
          </div>
          <button
            onClick={refreshOfficial}
            disabled={loadingOfficial}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loadingOfficial && 'animate-spin')} />
            Actualizar
          </button>
        </div>

        {loadingOfficial && officialRates.length === 0 ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-white/30" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {officialRates.map((r) => (
              <div
                key={r.code}
                className="p-4 rounded-lg border border-white/5 bg-[#0d1218] flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-white/40 font-mono">{r.code}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{r.label}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {formatFetchedDate(r)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#6ee490] tabular-nums">
                    {r.valueVes.toLocaleString('es-VE', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-white/30">Bs por {r.baseCurrency}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mis tasas custom */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">Mis tasas personalizadas</h2>
            <p className="text-xs text-white/50 mt-0.5">
              {isPro
                ? 'Crea tasas manuales, con formulas o desde una API externa.'
                : `Plan FREE: ${customs.length}/${FREE_MAX_CUSTOM} tasa manual.`}
            </p>
          </div>
          <Button
            onClick={openCreate}
            disabled={atFreeLimit}
            size="sm"
            className="bg-[#33b380] hover:bg-[#2a9669] text-white border-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva
          </Button>
        </div>

        {!isPro && (
          <div className="mb-4 p-3 rounded-lg border border-[#33b380]/20 bg-[#33b380]/5 flex items-start gap-3">
            <Crown className="w-4 h-4 text-[#6ee490] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-white/80">
                <span className="text-[#6ee490] font-semibold">Pro:</span> tasas con formulas (ej.{' '}
                <code className="text-[11px] bg-white/5 px-1 py-0.5 rounded">USD_BCV + 0.5</code>) y
                actualizacion desde APIs externas.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-white/30" />
          </div>
        ) : customs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-white/40">Aun no tienes tasas personalizadas.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customs.map((r) => (
              <CustomRateRow
                key={r.id}
                rate={r}
                onEdit={() => openEdit(r)}
                onDelete={() => setDeleteTarget(r)}
              />
            ))}
          </div>
        )}
      </section>

      <CustomRateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        storeId={store?.id ?? ''}
        repo={repo}
        plan={plan}
        officialCodes={officialRates.map((r) => r.code)}
        onSaved={(saved) => {
          setCustoms((prev) => {
            const idx = prev.findIndex((r) => r.id === saved.id)
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
            <AlertDialogTitle>Eliminar tasa</AlertDialogTitle>
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

function CustomRateRow({
  rate,
  onEdit,
  onDelete,
}: {
  rate: CustomRate
  onEdit: () => void
  onDelete: () => void
}) {
  const modeLabel: Record<CustomRateMode, string> = {
    MANUAL: 'Manual',
    FORMULA: 'Formula',
    API: 'API',
  }
  const modeColor: Record<CustomRateMode, string> = {
    MANUAL: 'bg-white/5 text-white/60',
    FORMULA: 'bg-[#33b380]/15 text-[#6ee490]',
    API: 'bg-[#327be2]/15 text-[#89b5f0]',
  }
  return (
    <div className="p-3 rounded-lg border border-white/5 bg-[#0d1218] flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{rate.label}</p>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', modeColor[rate.mode])}>
            {modeLabel[rate.mode]}
          </span>
          <span className="text-[10px] text-white/30 font-mono">{rate.baseCurrency}</span>
        </div>
        {rate.mode === 'MANUAL' && rate.valueVes != null && (
          <p className="text-xs text-white/50 mt-0.5">
            {rate.valueVes.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs
          </p>
        )}
        {rate.mode === 'FORMULA' && rate.formula && (
          <p className="text-xs text-white/50 mt-0.5 font-mono truncate">{rate.formula}</p>
        )}
        {rate.mode === 'API' && rate.sourceUrl && (
          <p className="text-xs text-white/50 mt-0.5 truncate">{rate.sourceUrl}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
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

function CustomRateDialog({
  open,
  onClose,
  editing,
  storeId,
  repo,
  plan,
  officialCodes,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  editing: CustomRate | null
  storeId: string
  repo: CustomRatesHttpRepository
  plan: Plan
  officialCodes: string[]
  onSaved: (r: CustomRate) => void
}) {
  const isPro = plan === 'PRO' || plan === 'BUSINESS'
  const { byCode } = useOfficialRates()

  const [label, setLabel] = useState('')
  const [baseCurrency, setBaseCurrency] = useState<(typeof BASE_CURRENCIES)[number]>('USD')
  const [mode, setMode] = useState<CustomRateMode>('MANUAL')
  const [valueVes, setValueVes] = useState('')
  const [formula, setFormula] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourcePath, setSourcePath] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (editing) {
      setLabel(editing.label)
      setBaseCurrency(editing.baseCurrency as (typeof BASE_CURRENCIES)[number])
      setMode(editing.mode)
      setValueVes(editing.valueVes?.toString() ?? '')
      setFormula(editing.formula ?? '')
      setSourceUrl(editing.sourceUrl ?? '')
      setSourcePath(editing.sourcePath ?? '')
    } else {
      setLabel('')
      setBaseCurrency('USD')
      setMode('MANUAL')
      setValueVes('')
      setFormula('')
      setSourceUrl('')
      setSourcePath('')
    }
    setError('')
  }, [open, editing])

  const formulaCheck = useMemo(() => {
    if (mode !== 'FORMULA' || !formula.trim()) return null
    const v = validateFormula(formula)
    if (!v.ok) return { ok: false as const, message: v.error }
    try {
      const refs = extractRefs(formula)
      const unknown = refs.filter((r) => !officialCodes.includes(r))
      if (unknown.length > 0) {
        return {
          ok: false as const,
          message: `Referencia desconocida: ${unknown.join(', ')}`,
        }
      }
      const vars = new Map<string, number>()
      for (const r of refs) {
        const rate = byCode.get(r)
        if (rate) vars.set(r, rate.valueVes)
      }
      const result = evaluateFormula(formula, vars)
      return { ok: true as const, preview: result, refs }
    } catch (e) {
      return {
        ok: false as const,
        message: e instanceof Error ? e.message : 'Error',
      }
    }
  }, [mode, formula, officialCodes, byCode])

  const canSubmit = (() => {
    if (!label.trim() || saving) return false
    if (mode === 'MANUAL') return Number(valueVes) > 0
    if (mode === 'FORMULA') return !!(formulaCheck && formulaCheck.ok)
    if (mode === 'API') return sourceUrl.trim().length > 0 && sourcePath.trim().length > 0
    return false
  })()

  const handleSave = async () => {
    if (!storeId) return
    setSaving(true)
    setError('')
    try {
      const payload: CreateCustomRateInput = {
        label: label.trim(),
        baseCurrency,
        mode,
        ...(mode === 'MANUAL' && { valueVes: Number(valueVes) }),
        ...(mode === 'FORMULA' && { formula: formula.trim() }),
        ...(mode === 'API' && {
          sourceUrl: sourceUrl.trim(),
          sourcePath: sourcePath.trim(),
        }),
      }
      const saved = editing
        ? await repo.update(storeId, editing.id, payload)
        : await repo.create(storeId, payload)
      toast.success(editing ? 'Tasa actualizada' : 'Tasa creada')
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
          <DialogTitle>{editing ? 'Editar tasa' : 'Nueva tasa'}</DialogTitle>
          <DialogDescription>
            Define una tasa de cambio personalizada para tu tienda.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Nombre</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Paralelo, Interno, etc."
              maxLength={60}
            />
          </div>

          {/* Base currency */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Moneda base</label>
            <div className="grid grid-cols-3 gap-2">
              {BASE_CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBaseCurrency(c)}
                  className={cn(
                    'py-2 rounded-lg text-sm font-medium border transition-all',
                    baseCurrency === c
                      ? 'border-[#33b380] bg-[#33b380]/10 text-white'
                      : 'border-white/10 text-white/50 hover:border-white/20',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {(['MANUAL', 'FORMULA', 'API'] as const).map((m) => {
                const disabled = !isPro && m !== 'MANUAL'
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={disabled}
                    onClick={() => setMode(m)}
                    className={cn(
                      'py-2 rounded-lg text-xs font-medium border transition-all',
                      mode === m
                        ? 'border-[#33b380] bg-[#33b380]/10 text-white'
                        : 'border-white/10 text-white/50 hover:border-white/20',
                      disabled && 'opacity-40 cursor-not-allowed hover:border-white/10',
                    )}
                  >
                    {m === 'MANUAL' ? 'Manual' : m === 'FORMULA' ? 'Formula' : 'API'}
                    {disabled && <Crown className="inline w-3 h-3 ml-1" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mode-specific fields */}
          {mode === 'MANUAL' && (
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Valor en Bs</label>
              <Input
                type="number"
                step="0.01"
                value={valueVes}
                onChange={(e) => setValueVes(e.target.value)}
                placeholder="Ej. 50.25"
              />
              <p className="text-[11px] text-white/30">
                Cuantos bolivares vale 1 {baseCurrency}.
              </p>
            </div>
          )}

          {mode === 'FORMULA' && (
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Formula</label>
              <textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="USD_BCV + 0.5"
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#33b380]/50 resize-none"
              />
              <div className="flex flex-wrap gap-1">
                {officialCodes.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormula((f) => f + (f ? ' + ' : '') + c)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 font-mono"
                  >
                    {c}
                  </button>
                ))}
              </div>
              {formulaCheck && (
                <div
                  className={cn(
                    'flex items-start gap-2 text-xs p-2 rounded',
                    formulaCheck.ok
                      ? 'bg-[#33b380]/10 text-[#6ee490]'
                      : 'bg-red-500/10 text-red-400',
                  )}
                >
                  {formulaCheck.ok ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>
                        Valor actual:{' '}
                        <strong>
                          {formulaCheck.preview.toLocaleString('es-VE', {
                            maximumFractionDigits: 2,
                          })}{' '}
                          Bs
                        </strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{formulaCheck.message}</span>
                    </>
                  )}
                </div>
              )}
              <p className="text-[11px] text-white/30">
                Operadores: + - * / y parentesis. Usa los botones para insertar tasas oficiales.
              </p>
            </div>
          )}

          {mode === 'API' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">URL fuente (JSON)</label>
                <Input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://api.ejemplo.com/rates"
                  maxLength={500}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">Path al valor</label>
                <Input
                  value={sourcePath}
                  onChange={(e) => setSourcePath(e.target.value)}
                  placeholder="monitors.usd.price"
                  maxLength={200}
                />
                <p className="text-[11px] text-white/30">
                  Ruta con puntos dentro del JSON (ej.{' '}
                  <code className="text-white/50">monitors.usd.price</code>).
                </p>
              </div>
            </>
          )}

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
              disabled={!canSubmit}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#33b380] hover:bg-[#2a9669] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editing ? (
                'Guardar cambios'
              ) : (
                'Crear tasa'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
