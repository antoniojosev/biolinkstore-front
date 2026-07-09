"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { MultiStoreHttpRepository, type MyStoreItem } from "@/lib/multi-store-api"

const PLAN_LIMIT: Record<MyStoreItem["plan"], number> = {
  FREE: 1,
  PRO: 3,
  BUSINESS: Infinity,
}

export function MultiStoreCard() {
  const { http, store, refreshStore } = useAuth()
  const storeId = store?.id
  const storePlan = store?.subscription?.plan ?? "FREE"
  const limit = PLAN_LIMIT[storePlan]

  const repo = useMemo(() => new MultiStoreHttpRepository(http), [http])
  const [stores, setStores] = useState<MyStoreItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    try {
      const res = await repo.listMine()
      setStores(res.stores)
      setActiveId(res.activeStoreId)
    } catch {
      // silent — la tarjeta simplemente no muestra la lista
    } finally {
      setLoading(false)
    }
  }, [repo, storeId])

  useEffect(() => {
    void load()
  }, [load])

  const atLimit = stores.length >= limit

  async function handleSwitch(id: string) {
    if (id === activeId || switching) return
    setSwitching(id)
    try {
      await repo.switchActive({ storeId: id })
      await refreshStore()
      setActiveId(id)
      toast.success("Tienda activa cambiada")
    } catch (err: any) {
      toast.error("No se pudo cambiar de tienda", { description: err?.message })
    } finally {
      setSwitching(null)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const created = await repo.createAdditional(name)
      setNewName("")
      setShowCreate(false)
      await load()
      toast.success(`Tienda "${created.name}" creada`)
    } catch (err: any) {
      toast.error("No se pudo crear la tienda", { description: err?.message })
    } finally {
      setCreating(false)
    }
  }

  if (!storeId) return null

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div>
          <h3 style={S.title}>Mis tiendas</h3>
          <p style={S.subtitle}>
            Cambia entre tus tiendas o crea una nueva. Tu plan {storePlan} permite hasta{" "}
            {limit === Infinity ? "tiendas ilimitadas" : `${limit} ${limit === 1 ? "tienda" : "tiendas"}`}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          disabled={atLimit}
          style={{ ...S.btnPrimary, opacity: atLimit ? 0.5 : 1 }}
          title={atLimit ? `Alcanzaste el límite del plan ${storePlan}` : "Crear tienda"}
        >
          {showCreate ? "Cancelar" : "+ Nueva tienda"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={S.createForm}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la nueva tienda"
            style={S.input}
            disabled={creating}
            maxLength={80}
          />
          <button type="submit" disabled={creating || !newName.trim()} style={S.btnPrimary}>
            {creating ? "Creando…" : "Crear"}
          </button>
        </form>
      )}

      {loading ? (
        <div style={S.muted}>Cargando tiendas…</div>
      ) : (
        <ul style={S.list}>
          {stores.map((s) => (
            <li key={s.id} style={{ ...S.row, borderColor: s.id === activeId ? "var(--brand)" : "var(--line)" }}>
              <div style={{ ...S.avatar, background: s.logo ? `#fff url(${s.logo}) center/cover no-repeat` : "linear-gradient(135deg, var(--brand), var(--brand-2, #7C3AED))" }}>
                {!s.logo && s.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={S.identity}>
                <div style={S.name}>{s.name}</div>
                <div style={S.email}>bylink.app/{s.slug} · {s.plan}</div>
              </div>
              {s.id === activeId ? (
                <span style={S.activePill}>✓ Activa</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSwitch(s.id)}
                  disabled={switching !== null}
                  style={S.btnGhost}
                >
                  {switching === s.id ? "Cambiando…" : "Activar"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
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
    padding: "8px 12px",
    border: "1px solid var(--line)",
    background: "transparent",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  createForm: {
    display: "flex",
    gap: 8,
    padding: 12,
    background: "var(--bg-2)",
    borderRadius: 10,
    border: "1px solid var(--line)",
  },
  input: {
    flex: 1,
    padding: "9px 12px",
    border: "1px solid var(--line)",
    borderRadius: 7,
    background: "var(--bg)",
    color: "var(--ink)",
    fontSize: 13,
    fontFamily: "inherit",
  },
  muted: { color: "var(--ink-3)", fontSize: 13, padding: "8px 0" },
  list: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    background: "var(--bg)",
    border: "1px solid var(--line)",
    borderRadius: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  identity: { flex: 1, minWidth: 0 },
  name: { fontWeight: 600, fontSize: 14 },
  email: { fontSize: 11, color: "var(--ink-3)", marginTop: 1 },
  activePill: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(16,185,129,0.12)",
    color: "#047857",
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
}
