"use client"

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

/** Panel deslizable desde abajo, patrón ya usado en panel-official.tsx (quick-actions-sheet) — aquí genérico para el editor móvil (fase2-P5). */
export function BottomSheet({ open, title, onClose, children }: Props) {
  if (!open) return null
  return (
    <>
      <div style={S.backdrop} onClick={onClose} />
      <div role="dialog" aria-modal="true" style={S.sheet}>
        <div style={S.handle} />
        <div style={S.head}>
          <span style={S.title}>{title}</span>
          <button type="button" onClick={onClose} style={S.close} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div style={S.body}>{children}</div>
      </div>
    </>
  )
}

const S: Record<string, React.CSSProperties> = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 90 },
  sheet: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 91,
    background: "var(--bg-elev)",
    borderRadius: "18px 18px 0 0",
    boxShadow: "0 -12px 40px -8px rgba(0,0,0,0.25)",
    maxHeight: "78vh",
    display: "flex",
    flexDirection: "column",
  },
  handle: { width: 36, height: 4, borderRadius: 999, background: "var(--line-2)", margin: "10px auto 4px", flexShrink: 0 },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "4px 16px 10px",
    borderBottom: "1px solid var(--line)",
    flexShrink: 0,
  },
  title: { fontSize: 14, fontWeight: 700 },
  close: { width: 28, height: 28, border: "none", background: "var(--bg-2)", borderRadius: 8, fontSize: 12, color: "var(--ink-2)", cursor: "pointer" },
  body: { flex: 1, overflowY: "auto", padding: 4, paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" },
}
