"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import {
  TeamHttpRepository,
  type StoreInvitation,
  type StoreMember,
  type StoreMemberRole,
} from "@/lib/team-api"

type Plan = "FREE" | "PRO" | "BUSINESS"

const ROLE_LABEL: Record<StoreMemberRole, string> = {
  OWNER: "Propietario",
  ADMIN: "Admin",
  STAFF: "Equipo",
}

const ROLE_LIMIT: Record<Plan, number> = {
  FREE: 1,
  PRO: 3,
  BUSINESS: Infinity,
}

function initials(name: string | null, email: string): string {
  const source = (name?.trim() || email).split(/[ @]+/).filter(Boolean)
  return ((source[0]?.[0] || "") + (source[1]?.[0] || "")).toUpperCase() || "??"
}

export function TeamMembersCard() {
  const { http, store, user } = useAuth()
  const storeId = store?.id
  const storePlan = (store?.subscription?.plan ?? "FREE") as Plan
  const limit = ROLE_LIMIT[storePlan]
  const currentUserId = user?.id

  const repo = useMemo(() => new TeamHttpRepository(http), [http])
  const [members, setMembers] = useState<StoreMember[]>([])
  const [pending, setPending] = useState<StoreInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<StoreMemberRole>("STAFF")
  const [inviting, setInviting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    try {
      const [membersData, pendingData] = await Promise.all([
        repo.listMembers(storeId),
        repo.listPendingInvitations(storeId).catch(() => []), // solo OWNER puede verlas
      ])
      setMembers(membersData)
      setPending(pendingData)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar los miembros")
    } finally {
      setLoading(false)
    }
  }, [repo, storeId])

  useEffect(() => {
    void load()
  }, [load])

  const currentMember = members.find((m) => m.userId === currentUserId)
  const isOwner = currentMember?.role === "OWNER"
  // El limite del plan cuenta miembros aceptados + invitaciones pendientes (igual que el backend) —
  // si no, se podria mandar invitaciones sin limite mientras ninguna se acepte todavia.
  const atLimit = members.length + pending.length >= limit

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!storeId || !inviteEmail.trim()) return
    setInviting(true)
    try {
      const invitation = await repo.invite(storeId, inviteEmail.trim().toLowerCase(), inviteRole)
      setPending((ps) => [invitation, ...ps])
      setInviteEmail("")
      setShowInvite(false)
      toast.success(`Invitación enviada a ${inviteEmail.trim().toLowerCase()}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo enviar la invitación")
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(member: StoreMember, role: StoreMemberRole) {
    if (!storeId) return
    setBusyId(member.id)
    try {
      const updated = await repo.updateRole(storeId, member.id, role)
      setMembers((ms) => ms.map((m) => (m.id === member.id ? { ...m, ...updated } : m)))
      toast.success("Rol actualizado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el rol")
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemove(member: StoreMember) {
    if (!storeId) return
    const label = member.user?.name || member.user?.email || "este miembro"
    if (!confirm(`¿Quitar a ${label} de la tienda?`)) return
    setBusyId(member.id)
    try {
      await repo.remove(storeId, member.id)
      setMembers((ms) => ms.filter((m) => m.id !== member.id))
      toast.success("Miembro removido")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo remover el miembro")
    } finally {
      setBusyId(null)
    }
  }

  if (!storeId) return null

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div>
          <h3 style={S.title}>Equipo</h3>
          <p style={S.subtitle}>
            {limit === Infinity
              ? "Invitá a tu equipo sin límite."
              : `Tu plan ${storePlan} permite hasta ${limit} ${limit === 1 ? "miembro" : "miembros"}.`}
          </p>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={() => setShowInvite((v) => !v)}
            disabled={atLimit}
            style={{ ...S.btnPrimary, opacity: atLimit ? 0.5 : 1 }}
            title={atLimit ? `Alcanzaste el límite del plan ${storePlan}` : "Invitar"}
          >
            {showInvite ? "Cancelar" : "+ Invitar"}
          </button>
        )}
      </div>

      {isOwner && showInvite && (
        <form onSubmit={handleInvite} style={S.inviteForm}>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            required
            style={S.input}
            disabled={inviting}
            spellCheck={false}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as StoreMemberRole)}
            style={S.select}
            disabled={inviting}
          >
            <option value="STAFF">Equipo</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" disabled={inviting || !inviteEmail.trim()} style={S.btnPrimary}>
            {inviting ? "Enviando…" : "Enviar invitación"}
          </button>
        </form>
      )}

      {loading ? (
        <div style={S.muted}>Cargando miembros…</div>
      ) : members.length === 0 ? (
        <div style={S.muted}>No hay miembros aún.</div>
      ) : (
        <ul style={S.list}>
          {members.map((m) => {
            const isMe = m.userId === currentUserId
            const isOwnerRow = m.role === "OWNER"
            return (
              <li key={m.id} style={S.row}>
                <div style={S.avatar}>{initials(m.user?.name ?? null, m.user?.email ?? "?")}</div>
                <div style={S.identity}>
                  <div style={S.name}>
                    {m.user?.name || m.user?.email || "Usuario"} {isMe && <span style={S.youBadge}>vos</span>}
                  </div>
                  {m.user?.name && m.user.email && <div style={S.email}>{m.user.email}</div>}
                </div>
                {isOwner && !isOwnerRow ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m, e.target.value as StoreMemberRole)}
                    disabled={busyId === m.id}
                    style={S.roleSelect}
                  >
                    <option value="STAFF">Equipo</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : (
                  <span style={S.rolePill}>{ROLE_LABEL[m.role]}</span>
                )}
                {(isOwner && !isOwnerRow) || (!isOwner && isMe) ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(m)}
                    disabled={busyId === m.id}
                    style={S.btnGhost}
                    title={isMe ? "Dejar la tienda" : "Quitar miembro"}
                  >
                    {isMe ? "Salir" : "Quitar"}
                  </button>
                ) : (
                  <span style={{ width: 64 }} />
                )}
              </li>
            )
          })}
        </ul>
      )}

      {isOwner && pending.length > 0 && (
        <ul style={S.list}>
          {pending.map((inv) => (
            <li key={inv.id} style={{ ...S.row, opacity: 0.7 }}>
              <div style={{ ...S.avatar, background: "var(--bg-2)", color: "var(--ink-3)" }}>✉</div>
              <div style={S.identity}>
                <div style={S.name}>{inv.email}</div>
                <div style={S.email}>Invitación enviada · expira {new Date(inv.expiresAt).toLocaleDateString("es-VE")}</div>
              </div>
              <span style={S.rolePill}>Pendiente</span>
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
  subtitle: { margin: "4px 0 0", color: "var(--ink-2)", fontSize: 13 },
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
  inviteForm: {
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
  select: {
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
    borderRadius: 999,
    background: "linear-gradient(135deg, var(--brand), var(--brand-2, #7C3AED))",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  identity: { flex: 1, minWidth: 0 },
  name: { fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 },
  email: { fontSize: 11, color: "var(--ink-3)", marginTop: 1 },
  youBadge: {
    fontSize: 10,
    padding: "1px 6px",
    borderRadius: 999,
    background: "var(--brand-soft, rgba(30,58,138,0.1))",
    color: "var(--brand)",
    fontWeight: 700,
  },
  roleSelect: {
    padding: "6px 8px",
    border: "1px solid var(--line)",
    borderRadius: 7,
    background: "var(--bg)",
    color: "var(--ink)",
    fontSize: 12,
    fontFamily: "inherit",
  },
  rolePill: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "var(--bg-2)",
    color: "var(--ink-2)",
    fontSize: 11,
    fontWeight: 600,
  },
}
