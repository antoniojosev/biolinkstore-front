"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import { TeamHttpRepository, type StoreInvitation } from "@/lib/team-api"

interface PageProps {
  params: Promise<{ token: string }>
}

type State =
  | { kind: "loading" }
  | { kind: "needs-login" }
  | { kind: "ready"; invitation: StoreInvitation }
  | { kind: "accepted"; invitation: StoreInvitation }
  | { kind: "declined" }
  | { kind: "error"; message: string }

export default function InviteAcceptPage({ params }: PageProps) {
  const { token } = use(params)
  const { http, user, isLoading: isLoadingSession } = useAuth()
  const router = useRouter()
  const [state, setState] = useState<State>({ kind: "loading" })
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null)

  useEffect(() => {
    if (isLoadingSession) return
    if (!user) {
      setState({ kind: "needs-login" })
      return
    }
    const repo = new TeamHttpRepository(http)
    repo
      .getByToken(token)
      .then((invitation) => {
        if (invitation.acceptedAt !== null || invitation.declinedAt !== null) {
          setState({
            kind: "error",
            message: "Esta invitación ya fue respondida.",
          })
          return
        }
        setState({ kind: "ready", invitation })
      })
      .catch((err) => {
        setState({
          kind: "error",
          message: err instanceof ApiError ? err.message : "No se pudo cargar la invitación",
        })
      })
  }, [http, isLoadingSession, user, token])

  async function handleAccept() {
    if (state.kind !== "ready") return
    setBusy("accept")
    try {
      const updated = await new TeamHttpRepository(http).accept(token)
      setState({ kind: "accepted", invitation: updated })
      toast.success("¡Te uniste al equipo!")
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo aceptar la invitación")
    } finally {
      setBusy(null)
    }
  }

  async function handleDecline() {
    if (state.kind !== "ready") return
    if (!confirm("¿Rechazar esta invitación?")) return
    setBusy("decline")
    try {
      await new TeamHttpRepository(http).decline(token)
      setState({ kind: "declined" })
      toast.success("Invitación rechazada")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo rechazar la invitación")
    } finally {
      setBusy(null)
    }
  }

  return (
    <main style={S.page}>
      <div style={S.card}>
        {state.kind === "loading" && <div style={S.center}>Cargando invitación…</div>}

        {state.kind === "needs-login" && (
          <>
            <h1 style={S.title}>Inicia sesión</h1>
            <p style={S.body}>Inicia sesión para revisar esta invitación.</p>
            <div style={S.actions}>
              <button
                type="button"
                onClick={() => router.push(`/login?next=/invite/${encodeURIComponent(token)}`)}
                style={S.btnPrimary}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => router.push(`/registro?next=/invite/${encodeURIComponent(token)}`)}
                style={S.btnGhost}
              >
                Crear cuenta
              </button>
            </div>
          </>
        )}

        {state.kind === "ready" && (
          <>
            {state.invitation.store?.logo && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={state.invitation.store.logo} alt="" style={S.storeLogo} />
            )}
            <h1 style={S.title}>
              Te invitaron a <em style={S.em}>{state.invitation.store?.name ?? "una tienda"}</em>
            </h1>
            <p style={S.body}>
              Vas a unirte como <strong>{state.invitation.role.toLowerCase()}</strong>. Puedes cambiar
              el rol o salir del equipo más adelante desde la sección Config de la tienda.
            </p>
            <div style={S.actions}>
              <button type="button" onClick={handleAccept} disabled={busy !== null} style={S.btnPrimary}>
                {busy === "accept" ? "Aceptando…" : "Aceptar invitación"}
              </button>
              <button type="button" onClick={handleDecline} disabled={busy !== null} style={S.btnGhost}>
                Rechazar
              </button>
            </div>
          </>
        )}

        {state.kind === "accepted" && (
          <>
            <h1 style={S.title}>¡Bienvenido!</h1>
            <p style={S.body}>
              Te uniste a <strong>{state.invitation.store?.name}</strong>. Redirigiendo al panel…
            </p>
          </>
        )}

        {state.kind === "declined" && (
          <>
            <h1 style={S.title}>Invitación rechazada</h1>
            <p style={S.body}>Listo. Si fue por error, pídele al admin que te invite de nuevo.</p>
            <div style={S.actions}>
              <button type="button" onClick={() => router.push("/dashboard")} style={S.btnGhost}>
                Ir al panel
              </button>
            </div>
          </>
        )}

        {state.kind === "error" && (
          <>
            <h1 style={S.title}>No se pudo cargar</h1>
            <p style={S.body}>{state.message}</p>
            <div style={S.actions}>
              <button type="button" onClick={() => router.push("/dashboard")} style={S.btnGhost}>
                Ir al panel
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "var(--bg)",
    padding: 20,
    fontFamily: "var(--font-sans)",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    borderRadius: 16,
    padding: 32,
    textAlign: "center",
    boxShadow: "0 24px 60px -16px rgba(15,23,42,0.18)",
  },
  storeLogo: { width: 64, height: 64, borderRadius: 16, marginBottom: 16 },
  title: {
    fontFamily: "var(--font-serif, var(--font-sans))",
    fontSize: 26,
    letterSpacing: "-0.02em",
    fontWeight: 700,
    margin: "0 0 12px",
    color: "var(--ink)",
  },
  em: {
    fontFamily: "var(--font-serif)",
    fontStyle: "italic",
    color: "var(--brand)",
    fontWeight: 400,
  },
  body: {
    margin: 0,
    color: "var(--ink-2)",
    fontSize: 15,
    lineHeight: 1.55,
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    marginTop: 26,
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "11px 22px",
    border: "1px solid var(--brand)",
    background: "var(--brand)",
    borderRadius: 10,
    fontSize: 14,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
  },
  btnGhost: {
    padding: "11px 18px",
    border: "1px solid var(--line)",
    background: "transparent",
    borderRadius: 10,
    fontSize: 14,
    color: "var(--ink)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  center: { textAlign: "center", color: "var(--ink-3)" },
}
