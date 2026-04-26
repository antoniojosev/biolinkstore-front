"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Coins,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { RatesHttpRepository } from "@/lib/rates-api"
import type {
  CustomRate,
  OfficialRate,
  StoreCurrencyConfig,
} from "@/lib/rates-api"
import { toast } from "sonner"

const SUPPORTED_PUBLIC = [
  { code: "USD_BCV", label: "Dolar BCV" },
  { code: "EUR_BCV", label: "Euro BCV" },
] as const

export function RatesConfigCard() {
  const { store, http, refreshStore } = useAuth()
  const ratesRepo = useMemo(() => new RatesHttpRepository(http), [http])
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])

  const plan = store?.subscription?.plan ?? "FREE"
  const isFree = plan === "FREE"

  const [official, setOfficial] = useState<OfficialRate[]>([])
  const [customs, setCustoms] = useState<CustomRate[]>([])
  const [loading, setLoading] = useState(false)

  const [visibleRates, setVisibleRates] = useState<string[]>(["USD_BCV"])
  const [defaultRate, setDefaultRate] = useState<string>("USD_BCV")
  const [savingPublic, setSavingPublic] = useState(false)

  // Custom rate form state
  const [editing, setEditing] = useState<CustomRate | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [formLabel, setFormLabel] = useState("")
  const [formValueVes, setFormValueVes] = useState<string>("")
  const [formBase, setFormBase] = useState("USD")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!store) return
    const cfg = (store.currencyConfig ?? {}) as StoreCurrencyConfig
    if (Array.isArray(cfg.visibleRates) && cfg.visibleRates.length > 0) {
      setVisibleRates(cfg.visibleRates.filter((r) => typeof r === "string"))
    }
    if (cfg.defaultRate) setDefaultRate(cfg.defaultRate)
  }, [store])

  useEffect(() => {
    if (!store?.id) return
    setLoading(true)
    Promise.all([
      ratesRepo.listOfficial().catch(() => [] as OfficialRate[]),
      ratesRepo.listCustom(store.id).catch(() => [] as CustomRate[]),
    ])
      .then(([off, cus]) => {
        setOfficial(off)
        setCustoms(cus)
      })
      .finally(() => setLoading(false))
  }, [store?.id, ratesRepo])

  const toggleVisible = (code: string) => {
    if (isFree) return
    setVisibleRates((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
      // Garantizar al menos 1 visible
      if (next.length === 0) return prev
      // Si el default queda fuera, ajustar al primero
      if (!next.includes(defaultRate)) setDefaultRate(next[0])
      return next
    })
  }

  const handleSavePublic = async () => {
    if (!store) return
    setSavingPublic(true)
    try {
      const cfg: StoreCurrencyConfig = {
        ...(store.currencyConfig ?? {}),
        visibleRates,
        defaultRate,
      }
      await storeRepo.update(store.id, { currencyConfig: cfg })
      await refreshStore()
      toast.success("Tasas publicas actualizadas")
    } catch (err: any) {
      toast.error("Error al guardar", { description: err?.message })
    } finally {
      setSavingPublic(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setFormLabel("")
    setFormValueVes("")
    setFormBase("USD")
    setCreateOpen(true)
  }

  const openEdit = (r: CustomRate) => {
    setEditing(r)
    setFormLabel(r.label)
    setFormValueVes(r.valueVes != null ? String(r.valueVes) : "")
    setFormBase(r.baseCurrency)
    setCreateOpen(true)
  }

  const handleSubmitCustom = async () => {
    if (!store) return
    const value = Number(formValueVes)
    if (!formLabel.trim() || !Number.isFinite(value) || value <= 0) {
      toast.error("Completa label y valor en Bs (> 0)")
      return
    }
    setSubmitting(true)
    try {
      if (editing) {
        const updated = await ratesRepo.updateCustom(store.id, editing.id, {
          label: formLabel.trim(),
          baseCurrency: formBase,
          valueVes: value,
        })
        setCustoms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
        toast.success("Tasa actualizada")
      } else {
        const created = await ratesRepo.createCustom(store.id, {
          label: formLabel.trim(),
          baseCurrency: formBase,
          mode: "MANUAL",
          valueVes: value,
        })
        setCustoms((prev) => [...prev, created])
        toast.success("Tasa creada")
      }
      setCreateOpen(false)
    } catch (err: any) {
      const msg = err?.message ?? "Error"
      if (msg.toLowerCase().includes("plan") || msg.toLowerCase().includes("limit")) {
        toast.error("Limite de plan alcanzado", { description: msg })
      } else {
        toast.error("Error al guardar", { description: msg })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (r: CustomRate) => {
    if (!store) return
    if (!confirm(`Eliminar tasa "${r.label}"?`)) return
    try {
      await ratesRepo.deleteCustom(store.id, r.id)
      setCustoms((prev) => prev.filter((x) => x.id !== r.id))
      toast.success("Tasa eliminada")
    } catch (err: any) {
      toast.error("Error al eliminar", { description: err?.message })
    }
  }

  return (
    <>
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#6ee490]" />
            <CardTitle className="text-base font-semibold text-white">
              Moneda y tasas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tasas visibles al publico */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-white/70">
                Tasas visibles al cliente
              </Label>
              <p className="text-[11px] text-white/40">
                Los compradores ven la conversion a Bs usando la tasa marcada como predeterminada.
                {isFree && " Plan FREE solo USD BCV."}
              </p>
            </div>
            <div className="space-y-2">
              {SUPPORTED_PUBLIC.map((opt) => {
                const active = visibleRates.includes(opt.code)
                const isDefault = defaultRate === opt.code
                const officialNow = official.find((o) => o.code === opt.code)
                const disabled = isFree && opt.code !== "USD_BCV"
                return (
                  <div
                    key={opt.code}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      active
                        ? "border-[#33b380]/40 bg-[#33b380]/5"
                        : "border-white/5 bg-white/[0.02]"
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    <label className="flex items-center gap-3 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        disabled={disabled}
                        onChange={() => toggleVisible(opt.code)}
                        className="accent-[#33b380]"
                      />
                      <div>
                        <p className="text-sm text-white font-medium">{opt.label}</p>
                        {officialNow ? (
                          <p className="text-[11px] text-white/40">
                            {officialNow.valueVes.toFixed(2)} Bs
                          </p>
                        ) : (
                          <p className="text-[11px] text-white/30">sin valor</p>
                        )}
                      </div>
                    </label>
                    {active && (
                      <button
                        type="button"
                        onClick={() => !isFree && setDefaultRate(opt.code)}
                        disabled={disabled}
                        className={`text-[11px] px-2 py-1 rounded ${
                          isDefault
                            ? "bg-[#33b380] text-white"
                            : "text-white/50 hover:text-white"
                        }`}
                      >
                        {isDefault ? "Predeterminada" : "Marcar default"}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            {isFree && (
              <p className="text-xs text-amber-400/80 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Mostrar Euro BCV requiere plan PRO
              </p>
            )}
            <Button
              onClick={handleSavePublic}
              disabled={savingPublic || isFree}
              size="sm"
              className="bg-[#33b380] hover:bg-[#2a9a6d] text-white"
            >
              {savingPublic && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Guardar tasas publicas
            </Button>
          </div>

          {/* Custom rates */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-white/70">
                  Mis tasas internas (margen)
                </Label>
                <p className="text-[11px] text-white/40">
                  Solo visibles para ti — para calcular margen vs tasa publica.
                </p>
              </div>
              <Button
                onClick={openCreate}
                size="sm"
                variant="outline"
                className="border-white/10 text-white/70 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Nueva
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-3">
                <Loader2 className="w-4 h-4 animate-spin text-white/40" />
              </div>
            ) : customs.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-3">
                No hay tasas internas configuradas.
              </p>
            ) : (
              <div className="space-y-2">
                {customs.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{r.label}</p>
                      <p className="text-[11px] text-white/40">
                        {r.baseCurrency} → {r.valueVes != null ? r.valueVes.toFixed(2) : "—"} Bs
                        <span className="ml-2 text-white/30">[{r.mode}]</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        disabled={r.mode !== "MANUAL"}
                        className="p-1.5 text-white/50 hover:text-white disabled:opacity-30"
                        title={r.mode !== "MANUAL" ? "FORMULA/API editable proximamente" : "Editar"}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="p-1.5 text-white/50 hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0d1218] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar tasa" : "Nueva tasa interna"}</DialogTitle>
            <DialogDescription className="text-white/50">
              Modo MANUAL — valor fijo en Bs. (FORMULA / API proximamente)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Etiqueta</Label>
              <Input
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="ej. Tasa paralelo"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Moneda base</Label>
                <select
                  value={formBase}
                  onChange={(e) => setFormBase(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Valor en Bs</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formValueVes}
                  onChange={(e) => setFormValueVes(e.target.value)}
                  placeholder="40.50"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
              className="border-white/10 text-white/70 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitCustom}
              disabled={submitting}
              className="bg-[#33b380] hover:bg-[#2a9a6d] text-white"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
