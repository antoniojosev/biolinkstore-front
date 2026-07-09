"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import {
  CustomDomainHttpRepository,
  type StoreDomainResponse,
  type StoreDomainStatus,
} from "@/lib/custom-domain-api"

const STATUS_LABEL: Record<StoreDomainStatus, string> = {
  PENDING: "Pendiente",
  VERIFIED: "Verificado",
  FAILED: "Falló",
}

const STATUS_COLOR: Record<StoreDomainStatus, string> = {
  PENDING: "#ECA200",
  VERIFIED: "#0E6940",
  FAILED: "#C53030",
}

type Plan = "FREE" | "PRO" | "BUSINESS"

export function CustomDomainCard() {
  const { http, store } = useAuth()
  const storeId = store?.id
  const storePlan = (store?.subscription?.plan ?? "FREE") as Plan
  const isGated = storePlan === "FREE"

  const repo = useMemo(() => new CustomDomainHttpRepository(http), [http])
  const [domain, setDomain] = useState<StoreDomainResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [domainInput, setDomainInput] = useState("")
  const [busyOp, setBusyOp] = useState<"register" | "verify" | "remove" | null>(null)

  const load = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    try {
      const data = await repo.get(storeId)
      setDomain(data)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo cargar el dominio")
    } finally {
      setLoading(false)
    }
  }, [repo, storeId])

  useEffect(() => {
    void load()
  }, [load])

  async function handleRegister() {
    if (!storeId || !domainInput.trim()) return
    setBusyOp("register")
    try {
      const data = await repo.register(storeId, domainInput.trim().toLowerCase())
      setDomain(data)
      setDomainInput("")
      toast.success("Dominio registrado. Ahora configura el TXT record.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo registrar el dominio")
    } finally {
      setBusyOp(null)
    }
  }

  async function handleVerify() {
    if (!storeId) return
    setBusyOp("verify")
    try {
      const data = await repo.verify(storeId)
      setDomain(data)
      if (data.status === "VERIFIED") {
        toast.success("Dominio verificado")
      } else {
        toast.error(
          "El TXT record aún no se encontró. Esperá unos minutos y volvé a intentar.",
        )
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo verificar")
    } finally {
      setBusyOp(null)
    }
  }

  async function handleRemove() {
    if (!storeId) return
    if (!confirm("¿Quitar el dominio? El catálogo volverá a estar disponible solo en bylink.app.")) {
      return
    }
    setBusyOp("remove")
    try {
      await repo.remove(storeId)
      setDomain(null)
      toast.success("Dominio quitado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo quitar el dominio")
    } finally {
      setBusyOp(null)
    }
  }

  if (!storeId) return null

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div>
          <h3 style={S.title}>Dominio personalizado</h3>
          <p style={S.subtitle}>
            Conectá tu propio dominio (por ejemplo <code style={S.code}>tienda.tumarca.com</code>) en
            lugar de <code style={S.code}>bylink.app/{store?.slug}</code>.
          </p>
        </div>
        {isGated && <span style={S.lockBadge}>Plan PRO o superior</span>}
      </div>

      {loading ? (
        <div style={S.muted}>Cargando…</div>
      ) : isGated && !domain ? (
        <div style={S.gatedBox}>
          Esta función requiere el plan <strong>PRO</strong> o <strong>BUSINESS</strong>. Mejorá tu plan
          para conectar un dominio propio.
        </div>
      ) : !domain ? (
        <div style={S.formRow}>
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="tienda.tumarca.com"
            style={S.input}
            disabled={busyOp !== null}
            spellCheck={false}
          />
          <button
            type="button"
            onClick={handleRegister}
            disabled={!domainInput.trim() || busyOp !== null}
            style={{ ...S.btnPrimary, opacity: !domainInput.trim() || busyOp !== null ? 0.5 : 1 }}
          >
            {busyOp === "register" ? "Registrando…" : "Registrar dominio"}
          </button>
        </div>
      ) : (
        <div style={S.domainBox}>
          <div style={S.domainHead}>
            <div>
              <div style={S.domainName}>{domain.domain}</div>
              <div style={S.domainMeta}>
                <span style={{ ...S.statusDot, background: STATUS_COLOR[domain.status] }} />
                <span style={{ color: STATUS_COLOR[domain.status], fontWeight: 600 }}>
                  {STATUS_LABEL[domain.status]}
                </span>
                {domain.verifiedAt && (
                  <span style={S.metaText}>
                    · verificado {new Date(domain.verifiedAt).toLocaleDateString("es-VE")}
                  </span>
                )}
                {domain.lastCheckedAt && !domain.verifiedAt && (
                  <span style={S.metaText}>
                    · último intento {new Date(domain.lastCheckedAt).toLocaleString("es-VE")}
                  </span>
                )}
              </div>
            </div>
            <div style={S.opsRow}>
              {domain.status !== "VERIFIED" && (
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={busyOp !== null}
                  style={S.btnPrimary}
                >
                  {busyOp === "verify" ? "Verificando…" : "Verificar ahora"}
                </button>
              )}
              <button
                type="button"
                onClick={handleRemove}
                disabled={busyOp !== null}
                style={S.btnGhost}
              >
                Quitar
              </button>
            </div>
          </div>

          {domain.status !== "VERIFIED" && (
            <div style={S.dnsBox}>
              <div style={S.dnsTitle}>Configurá este registro DNS en tu proveedor</div>
              <DnsRow label="Tipo" value="TXT" />
              <DnsRow label="Host / Name" value={domain.verificationHost} copyable />
              <DnsRow label="Valor / Content" value={domain.verificationToken} copyable />
              <div style={S.dnsHint}>
                Los cambios DNS pueden tardar hasta 48h en propagarse. Generalmente se propagan en
                10-30 minutos. Cuando estén listos, pulsá <strong>Verificar ahora</strong>.
              </div>
            </div>
          )}

          {domain.status === "VERIFIED" && (
            <div style={S.verifiedBox}>
              <strong>¡Listo!</strong> Tu catálogo ya está disponible en{" "}
              <a
                href={`https://${domain.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                style={S.verifiedLink}
              >
                https://{domain.domain}
              </a>
              .
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DnsRow({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div style={S.dnsRow}>
      <span style={S.dnsLabel}>{label}</span>
      <code style={S.dnsValue}>{value}</code>
      {copyable && (
        <button type="button" onClick={copy} style={S.dnsCopy}>
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
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
  code: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    padding: "1px 5px",
    borderRadius: 4,
    background: "var(--bg-2)",
  },
  lockBadge: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(15,23,42,0.08)",
    color: "var(--ink-2)",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  muted: { color: "var(--ink-3)", fontSize: 13, padding: "8px 0" },
  gatedBox: {
    padding: 14,
    background: "var(--bg-2)",
    borderRadius: 10,
    color: "var(--ink-2)",
    fontSize: 13,
    lineHeight: 1.55,
  },
  formRow: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid var(--line)",
    borderRadius: 8,
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    background: "var(--bg)",
    color: "var(--ink)",
  },
  btnPrimary: {
    padding: "10px 18px",
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
    padding: "10px 14px",
    border: "1px solid var(--line)",
    background: "transparent",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--ink)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  domainBox: { display: "flex", flexDirection: "column", gap: 14 },
  domainHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
  domainName: { fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)" },
  domainMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    marginTop: 4,
    flexWrap: "wrap",
  },
  statusDot: { width: 8, height: 8, borderRadius: 999 },
  metaText: { color: "var(--ink-3)" },
  opsRow: { display: "flex", gap: 8 },
  dnsBox: {
    background: "var(--bg-2)",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  dnsTitle: { fontSize: 12, fontWeight: 700, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: 0.06 },
  dnsRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  dnsLabel: { fontSize: 11, color: "var(--ink-3)", width: 90, flexShrink: 0 },
  dnsValue: {
    flex: 1,
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    padding: "6px 10px",
    background: "var(--bg)",
    border: "1px solid var(--line)",
    borderRadius: 6,
    wordBreak: "break-all",
  },
  dnsCopy: {
    padding: "6px 10px",
    border: "1px solid var(--line)",
    background: "var(--bg)",
    borderRadius: 6,
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
    color: "var(--ink-2)",
    flexShrink: 0,
  },
  dnsHint: {
    fontSize: 12,
    color: "var(--ink-3)",
    lineHeight: 1.55,
    paddingTop: 4,
  },
  verifiedBox: {
    padding: 14,
    background: "rgba(14,105,64,0.08)",
    border: "1px solid rgba(14,105,64,0.2)",
    borderRadius: 10,
    fontSize: 13,
    color: "var(--ink)",
    lineHeight: 1.55,
  },
  verifiedLink: { color: "var(--brand)", textDecoration: "none", fontWeight: 600 },
}
