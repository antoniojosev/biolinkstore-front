"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { ApiError } from "@/lib/http/types"
import type { UpdateStoreDto } from "@/lib/stores-api/types"
import { UploadButton } from "./upload-button"
import { CustomDomainCard } from "./custom-domain-card"
import { TeamMembersCard } from "./team-members-card"
import { WhatsappTemplateCard } from "./whatsapp-template-card"

function I({ id }: { id: string }) {
  return <svg><use href={`#ic-${id}`} /></svg>
}

interface FormState {
  name: string
  description: string
  instagramHandle: string
  whatsapp: string
  primaryColor: string
  logo: string
}

const COLOR_SWATCHES = ["#1E3A8A", "#DC4A3D", "#7C3AED", "#10B981", "#F59E0B", "#EC4899", "#0F172A"]

export function StoreSettingsBoard() {
  const { store, http, refreshStore } = useAuth()
  const repo = useMemo(() => new StoreHttpRepository(http), [http])

  const initial: FormState = useMemo(() => ({
    name: store?.name ?? "",
    description: store?.bio ?? "",
    instagramHandle: store?.instagramUrl?.replace(/^https?:\/\/instagram\.com\//, "") ?? "",
    whatsapp: store?.whatsappNumbers?.[0] ?? "",
    primaryColor: store?.primaryColor ?? "#1E3A8A",
    logo: store?.avatar ?? "",
  }), [store])

  const [form, setForm] = useState<FormState>(initial)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(initial)
    setDirty(false)
  }, [initial])

  function patch(p: Partial<FormState>) {
    setForm((f) => ({ ...f, ...p }))
    setDirty(true)
    setError(null)
  }

  async function save() {
    if (!store?.id || !dirty || saving) return
    setSaving(true); setError(null)
    const dto: UpdateStoreDto = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      instagramHandle: form.instagramHandle.trim() || undefined,
      whatsappNumbers: form.whatsapp.trim() ? [form.whatsapp.trim()] : [],
      primaryColor: form.primaryColor,
      logo: form.logo.trim() || undefined,
    }
    try {
      await repo.update(store.id, dto)
      await refreshStore()
      setSavedAt(Date.now())
      setDirty(false)
      setTimeout(() => setSavedAt(null), 2400)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "No se pudieron guardar los cambios"
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setForm(initial)
    setDirty(false)
    setError(null)
  }

  const noSession = !store?.id

  return (
    <div className="cat-wrap" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="cat-header">
        <div>
          <h1>Configuración de tu <em>tienda</em></h1>
          <div className="meta">Datos públicos, branding y feature flags</div>
        </div>
        <div className="h-actions">
          <button type="button" onClick={reset} disabled={!dirty || saving} className="h-btn ghost">Deshacer</button>
          <button type="button" onClick={save} disabled={!dirty || saving || noSession} className="h-btn">{saving ? "Guardando…" : "Guardar cambios"}</button>
        </div>
      </div>

      {noSession && (
        <div className="panel" style={{ background: "var(--bg-2)", border: "1px dashed var(--line-2)", textAlign: "center", padding: 28, color: "var(--ink-2)" }}>
          Inicia sesión para editar tu tienda. <a href="/login" style={{ color: "var(--brand)", fontWeight: 600, marginLeft: 4 }}>Ir a login →</a>
        </div>
      )}

      {error && (
        <div role="alert" style={{ padding: "12px 14px", background: "#FEF2F0", border: "1px solid #FECACA", borderRadius: 10, color: "#991B1B", fontSize: 13 }}>{error}</div>
      )}
      {savedAt && !error && (
        <div role="status" style={{ padding: "12px 14px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 10, color: "#047857", fontSize: 13 }}>✓ Cambios guardados</div>
      )}

      <div className="panel" style={{ padding: 22 }}>
        <h3 style={{ marginBottom: 4 }}>Datos generales</h3>
        <p className="body-sm muted" style={{ margin: "0 0 18px" }}>Lo que ve el público cuando entra a tu link.</p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label className="label">Nombre de la tienda</label>
            <input className="input" value={form.name} onChange={(e) => patch({ name: e.target.value })} placeholder="URBAN STYLE" disabled={noSession} />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="textarea" value={form.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Para mujeres que viven con intención." disabled={noSession} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="label">Instagram</label>
              <div className="input-group">
                <span className="prefix">@</span>
                <input className="input" value={form.instagramHandle} onChange={(e) => patch({ instagramHandle: e.target.value.replace(/^@/, "") })} placeholder="tu.handle" disabled={noSession} />
              </div>
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <div className="input-group">
                <span className="prefix">+58</span>
                <input className="input" value={form.whatsapp} onChange={(e) => patch({ whatsapp: e.target.value })} placeholder="412-1234567" disabled={noSession} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 22 }}>
        <h3 style={{ marginBottom: 4 }}>Branding</h3>
        <p className="body-sm muted" style={{ margin: "0 0 18px" }}>Color principal y logo.</p>

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "start" }}>
          <div>
            <label className="label">Color principal</label>
            <div style={{ display: "flex", gap: 8 }}>
              {COLOR_SWATCHES.map((c) => {
                const on = form.primaryColor.toLowerCase() === c.toLowerCase()
                return (
                  <button key={c} type="button" aria-label={`Color ${c}`} onClick={() => patch({ primaryColor: c })} disabled={noSession} style={{ width: 32, height: 32, borderRadius: 10, background: c, border: on ? "2.5px solid var(--ink)" : "1px solid var(--line)", cursor: noSession ? "not-allowed" : "pointer", padding: 0 }} />
                )
              })}
              <input type="color" value={form.primaryColor} onChange={(e) => patch({ primaryColor: e.target.value })} disabled={noSession} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--line)", cursor: noSession ? "not-allowed" : "pointer", padding: 0, background: "none" }} />
            </div>
          </div>
          <div>
            <label className="label">Logo</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: form.logo ? `#fff url(${form.logo}) center/cover no-repeat` : `linear-gradient(135deg, ${form.primaryColor}, ${form.primaryColor}AA)`, border: "1px solid var(--line)", flexShrink: 0, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 22 }}>
                {form.logo ? "" : (form.name[0]?.toUpperCase() || "B")}
              </div>
              <input className="input" value={form.logo} onChange={(e) => patch({ logo: e.target.value })} placeholder="https://… o subí un archivo →" disabled={noSession} />
            </div>
            <div style={{ marginTop: 8 }}>
              <UploadButton storeId={store?.id} onUploaded={(urls) => patch({ logo: urls[0] })} disabled={noSession} label="Subir logo" />
            </div>
          </div>
        </div>
      </div>

      <CustomDomainCard />

      <WhatsappTemplateCard />

      <TeamMembersCard />

      <div className="panel" style={{ padding: 22, background: "var(--bg-2)", border: "1px dashed var(--line-2)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center", flexShrink: 0 }}><I id="credit" /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>Tasas BCV + custom <span className="badge badge-warning" style={{ marginLeft: 6 }}>próximamente</span></h3>
            <p className="body-sm muted" style={{ margin: "4px 0 0" }}>Disponible cuando se mergeen BE-129 (rates oficiales) y BE-130 (custom rates) en el backend. El componente UI funcional ya existe en <code>components/dashboard/rates-config-card.tsx</code>.</p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 22, background: "var(--bg-2)", border: "1px dashed var(--line-2)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center", flexShrink: 0 }}><I id="store" /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>Multi-tienda <span className="badge badge-warning" style={{ marginLeft: 6 }}>próximamente</span></h3>
            <p className="body-sm muted" style={{ margin: "4px 0 0" }}>Cambiá entre tus tiendas o creá una nueva. Disponible cuando BE-127 esté en main. UI funcional ya en <code>components/dashboard/store-switcher.tsx</code>.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
