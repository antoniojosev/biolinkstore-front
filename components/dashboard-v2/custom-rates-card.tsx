"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import { RatesHttpRepository } from "@/lib/rates-api/rates.http-repository"
import type {
  CustomRate,
  CustomRateMode,
  OfficialRate,
  CreateCustomRateDto,
  UpdateCustomRateDto,
} from "@/lib/rates-api/types"

type Plan = "FREE" | "PRO" | "BUSINESS"

const MODE_LABEL: Record<CustomRateMode, string> = {
  MANUAL: "Manual",
  FORMULA: "Fórmula",
  API: "API externa",
}

const MODE_DESCRIPTION: Record<CustomRateMode, string> = {
  MANUAL: "Vos fijás un valor en Bs y lo actualizás manualmente cuando cambia.",
  FORMULA:
    "Calculá la tasa a partir de otras tasas oficiales con + - * / y paréntesis. Por ejemplo: USD_BCV * 1.05",
  API: "ByLink consulta un JSON tuyo cada vez que un comprador entra y extrae el valor de la ruta que indiques.",
}

interface FormState {
  mode: CustomRateMode
  label: string
  baseCurrency: string
  valueVes: string
  formula: string
  sourceUrl: string
  sourcePath: string
}

const EMPTY_FORM: FormState = {
  mode: "MANUAL",
  label: "",
  baseCurrency: "USD",
  valueVes: "",
  formula: "",
  sourceUrl: "",
  sourcePath: "",
}

export function CustomRatesCard() {
  const { http, store } = useAuth()
  const storeId = store?.id
  const storePlan = (store?.subscription?.plan ?? "FREE") as Plan
  const repo = useMemo(() => new RatesHttpRepository(http), [http])

  const [officials, setOfficials] = useState<OfficialRate[]>([])
  const [customs, setCustoms] = useState<CustomRate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CustomRate | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    try {
      const [off, cus] = await Promise.all([repo.listOfficial(), repo.listCustom(storeId)])
      setOfficials(off)
      setCustoms(cus)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar las tasas")
    } finally {
      setLoading(false)
    }
  }, [repo, storeId])

  useEffect(() => {
    void load()
  }, [load])

  const isFreeWithRate = storePlan === "FREE" && customs.length >= 1
  const isFormulaGated = storePlan === "FREE" && form.mode !== "MANUAL"

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(r: CustomRate) {
    setEditing(r)
    setForm({
      mode: r.mode,
      label: r.label,
      baseCurrency: r.baseCurrency,
      valueVes: r.valueVes != null ? String(r.valueVes) : "",
      formula: r.formula ?? "",
      sourceUrl: r.sourceUrl ?? "",
      sourcePath: r.sourcePath ?? "",
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function buildPayload(): CreateCustomRateDto | UpdateCustomRateDto | null {
    const label = form.label.trim()
    if (!label) {
      toast.error("Falta el nombre de la tasa")
      return null
    }
    if (form.mode === "MANUAL") {
      const n = Number(form.valueVes)
      if (!Number.isFinite(n) || n <= 0) {
        toast.error("El valor en Bs debe ser > 0")
        return null
      }
      return editing
        ? { label, baseCurrency: form.baseCurrency, valueVes: n }
        : { label, baseCurrency: form.baseCurrency, mode: "MANUAL", valueVes: n }
    }
    if (form.mode === "FORMULA") {
      const formula = form.formula.trim()
      if (!formula) {
        toast.error("Falta la fórmula")
        return null
      }
      return editing
        ? { label, baseCurrency: form.baseCurrency, formula }
        : { label, baseCurrency: form.baseCurrency, mode: "FORMULA", formula }
    }
    // API
    const sourceUrl = form.sourceUrl.trim()
    const sourcePath = form.sourcePath.trim()
    if (!sourceUrl || !sourcePath) {
      toast.error("API requiere sourceUrl y sourcePath")
      return null
    }
    return editing
      ? { label, baseCurrency: form.baseCurrency, sourceUrl, sourcePath }
      : { label, baseCurrency: form.baseCurrency, mode: "API", sourceUrl, sourcePath }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!storeId) return
    const payload = buildPayload()
    if (!payload) return
    setSaving(true)
    try {
      if (editing) {
        const updated = await repo.updateCustom(storeId, editing.id, payload as UpdateCustomRateDto)
        setCustoms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
        toast.success("Tasa actualizada")
      } else {
        const created = await repo.createCustom(storeId, payload as CreateCustomRateDto)
        setCustoms((prev) => [...prev, created])
        toast.success("Tasa creada")
      }
      closeForm()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Error al guardar"
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(r: CustomRate) {
    if (!storeId) return
    if (!confirm(`¿Eliminar tasa "${r.label}"?`)) return
    setBusyId(r.id)
    try {
      await repo.deleteCustom(storeId, r.id)
      setCustoms((prev) => prev.filter((x) => x.id !== r.id))
      toast.success("Tasa eliminada")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al eliminar")
    } finally {
      setBusyId(null)
    }
  }

  if (!storeId) return null

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div>
          <h3 style={S.title}>Tasas personalizadas</h3>
          <p style={S.subtitle}>
            Mostrá tasas propias además del BCV oficial. Útil para markup, conversión a otra moneda
            o pricing dinámico.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={isFreeWithRate || showForm}
          style={{ ...S.btnPrimary, opacity: isFreeWithRate ? 0.5 : 1 }}
          title={isFreeWithRate ? "Plan FREE permite 1 tasa MANUAL. Mejorá a PRO para más." : "Crear tasa"}
        >
          + Nueva tasa
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={S.form}>
          <ModeSelector
            value={form.mode}
            onChange={(m) => patchForm("mode", m)}
            disabledModes={
              storePlan === "FREE" && !editing ? (["FORMULA", "API"] as CustomRateMode[]) : []
            }
            disabled={!!editing}
          />

          <p style={S.modeDescription}>{MODE_DESCRIPTION[form.mode]}</p>

          {isFormulaGated && (
            <div style={S.gatedRow}>
              FÓRMULA y API requieren plan <strong>PRO</strong> o <strong>BUSINESS</strong>.
            </div>
          )}

          <div style={S.fieldsGrid}>
            <Field label="Nombre">
              <input
                type="text"
                value={form.label}
                onChange={(e) => patchForm("label", e.target.value)}
                placeholder="Ej: USD efectivo"
                style={S.input}
                required
              />
            </Field>
            <Field label="Moneda base">
              <select
                value={form.baseCurrency}
                onChange={(e) => patchForm("baseCurrency", e.target.value)}
                style={S.input}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="VES">VES</option>
              </select>
            </Field>

            {form.mode === "MANUAL" && (
              <Field label="Valor en Bs">
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={form.valueVes}
                  onChange={(e) => patchForm("valueVes", e.target.value)}
                  placeholder="Ej: 105.50"
                  style={S.input}
                  required
                />
              </Field>
            )}

            {form.mode === "FORMULA" && (
              <Field
                label="Fórmula"
                hint={
                  officials.length > 0 ? (
                    <span style={S.hint}>
                      Tasas disponibles:{" "}
                      {officials.map((o, i) => (
                        <span key={o.code}>
                          <code style={S.codeMini}>{o.code}</code>
                          {i < officials.length - 1 && ", "}
                        </span>
                      ))}
                    </span>
                  ) : undefined
                }
                full
              >
                <input
                  type="text"
                  value={form.formula}
                  onChange={(e) => patchForm("formula", e.target.value)}
                  placeholder="USD_BCV * 1.05"
                  style={{ ...S.input, fontFamily: "var(--font-mono)" }}
                  spellCheck={false}
                  required
                />
              </Field>
            )}

            {form.mode === "API" && (
              <>
                <Field label="sourceUrl" full>
                  <input
                    type="url"
                    value={form.sourceUrl}
                    onChange={(e) => patchForm("sourceUrl", e.target.value)}
                    placeholder="https://api.ejemplo.com/rates"
                    style={{ ...S.input, fontFamily: "var(--font-mono)" }}
                    required
                  />
                </Field>
                <Field
                  label="sourcePath"
                  hint={<span style={S.hint}>Ruta dentro del JSON. Ej: <code style={S.codeMini}>data.usd.value</code></span>}
                  full
                >
                  <input
                    type="text"
                    value={form.sourcePath}
                    onChange={(e) => patchForm("sourcePath", e.target.value)}
                    placeholder="data.usd.value"
                    style={{ ...S.input, fontFamily: "var(--font-mono)" }}
                    required
                  />
                </Field>
              </>
            )}
          </div>

          <div style={S.formActions}>
            <button type="button" onClick={closeForm} disabled={saving} style={S.btnGhost}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={S.btnPrimary}>
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear tasa"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={S.muted}>Cargando tasas…</div>
      ) : customs.length === 0 ? (
        <div style={S.muted}>Aún no creaste ninguna tasa personalizada.</div>
      ) : (
        <ul style={S.list}>
          {customs.map((r) => (
            <li key={r.id} style={S.row}>
              <div style={S.rowMain}>
                <div style={S.rowHead}>
                  <span style={S.rowLabel}>{r.label}</span>
                  <span style={S.modePill}>{MODE_LABEL[r.mode]}</span>
                </div>
                <div style={S.rowDetail}>
                  {r.mode === "MANUAL" && (
                    <>
                      <code style={S.codeMini}>1 {r.baseCurrency}</code> = {" "}
                      <strong>Bs. {r.valueVes ?? "—"}</strong>
                    </>
                  )}
                  {r.mode === "FORMULA" && (
                    <>
                      <code style={S.codeMini}>{r.formula}</code>
                      {r.resolvedValueVes != null && (
                        <span style={{ marginLeft: 8 }}>
                          → <strong>Bs. {r.resolvedValueVes.toFixed(2)}</strong>
                        </span>
                      )}
                    </>
                  )}
                  {r.mode === "API" && (
                    <>
                      <code style={S.codeMini}>{r.sourceUrl}</code>
                      <span style={{ marginLeft: 6, color: "var(--ink-3)" }}>
                        ({r.sourcePath})
                      </span>
                      {r.lastFetchedAt && (
                        <div style={{ marginTop: 4, fontSize: 11, color: "var(--ink-3)" }}>
                          último fetch: {new Date(r.lastFetchedAt).toLocaleString("es-VE")}
                          {r.lastValue != null && <> · valor: Bs. {r.lastValue.toFixed(2)}</>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div style={S.rowOps}>
                <button
                  type="button"
                  onClick={() => openEdit(r)}
                  disabled={busyId === r.id || showForm}
                  style={S.btnGhost}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
                  disabled={busyId === r.id || showForm}
                  style={S.btnGhost}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ModeSelector({
  value,
  onChange,
  disabledModes,
  disabled,
}: {
  value: CustomRateMode
  onChange: (m: CustomRateMode) => void
  disabledModes: CustomRateMode[]
  disabled: boolean
}) {
  const modes: CustomRateMode[] = ["MANUAL", "FORMULA", "API"]
  return (
    <div style={S.modeRow}>
      {modes.map((m) => {
        const isDisabled = disabled || disabledModes.includes(m)
        const isActive = value === m
        return (
          <button
            key={m}
            type="button"
            onClick={() => !isDisabled && onChange(m)}
            disabled={isDisabled}
            style={{
              ...S.modeBtn,
              ...(isActive ? S.modeBtnActive : null),
              opacity: isDisabled ? 0.5 : 1,
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
            title={disabled ? "El modo no se puede cambiar al editar" : undefined}
          >
            {MODE_LABEL[m]}
            {disabledModes.includes(m) && <span style={S.modeLock}> 🔒</span>}
          </button>
        )
      })}
    </div>
  )
}

function Field({
  label,
  children,
  hint,
  full,
}: {
  label: string
  children: React.ReactNode
  hint?: React.ReactNode
  full?: boolean
}) {
  return (
    <label style={{ ...S.field, gridColumn: full ? "1 / -1" : undefined }}>
      <span style={S.fieldLabel}>{label}</span>
      {children}
      {hint}
    </label>
  )
}

const S: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    borderRadius: 14,
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  subtitle: { margin: "4px 0 0", color: "var(--ink-2)", fontSize: 13, lineHeight: 1.5 },
  btnPrimary: {
    padding: "9px 16px",
    border: "1px solid var(--brand)",
    background: "var(--brand)",
    borderRadius: 8,
    fontSize: 13,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  btnGhost: {
    padding: "7px 12px",
    border: "1px solid var(--line)",
    background: "transparent",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  form: {
    border: "1px solid var(--line)",
    background: "var(--bg-2)",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  modeRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  modeBtn: {
    padding: "8px 14px",
    border: "1px solid var(--line)",
    background: "var(--bg)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--ink-2)",
    fontWeight: 500,
    fontFamily: "inherit",
  },
  modeBtnActive: {
    background: "var(--brand)",
    color: "#fff",
    borderColor: "var(--brand)",
    fontWeight: 600,
  },
  modeLock: { marginLeft: 4 },
  modeDescription: { margin: 0, fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 },
  gatedRow: {
    padding: 10,
    background: "rgba(15,23,42,0.04)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--ink-2)",
  },
  fieldsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 11, color: "var(--ink-2)", fontWeight: 600 },
  input: {
    padding: "9px 12px",
    border: "1px solid var(--line)",
    borderRadius: 7,
    background: "var(--bg)",
    color: "var(--ink)",
    fontSize: 13,
    fontFamily: "inherit",
    width: "100%",
  },
  hint: { fontSize: 11, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 },
  codeMini: {
    fontFamily: "var(--font-mono)",
    fontSize: 11.5,
    padding: "1px 5px",
    borderRadius: 4,
    background: "rgba(15,23,42,0.06)",
  },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  muted: { color: "var(--ink-3)", fontSize: 13, padding: "12px 0" },
  list: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    background: "var(--bg)",
    border: "1px solid var(--line)",
    borderRadius: 10,
  },
  rowMain: { flex: 1, minWidth: 0 },
  rowHead: { display: "flex", alignItems: "center", gap: 8 },
  rowLabel: { fontWeight: 600, fontSize: 14 },
  modePill: {
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 999,
    background: "var(--bg-2)",
    color: "var(--ink-2)",
    letterSpacing: 0.04,
    textTransform: "uppercase",
  },
  rowDetail: { fontSize: 12, color: "var(--ink-2)", marginTop: 4 },
  rowOps: { display: "flex", gap: 6 },
}
