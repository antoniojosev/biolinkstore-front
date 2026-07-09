"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { useAuth } from "@/contexts/auth-context"

export function ShareStoreModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { store } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const url = store?.slug ? `https://bylink.app/${store.slug}` : ""

  useEffect(() => {
    if (!open || !url || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: 200,
      margin: 1,
      color: { dark: "#0A0F1F", light: "#FFFFFF" },
    }).catch(() => {})
  }, [open, url])

  if (!open) return null

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  function downloadQr() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `bylink-${store?.slug ?? "tienda"}-qr.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.head}>
          <h3 style={S.title}>Compartir tienda</h3>
          <button type="button" onClick={onClose} style={S.closeBtn} aria-label="Cerrar">✕</button>
        </div>
        <div style={S.qrWrap}>
          <canvas ref={canvasRef} width={200} height={200} style={S.canvas} />
        </div>
        <div style={S.linkRow}>
          <code style={S.linkText}>{url}</code>
          <button type="button" onClick={copyLink} style={S.btnGhost}>{copied ? "✓ Copiado" : "Copiar"}</button>
        </div>
        <button type="button" onClick={downloadQr} style={S.btnPrimary}>Descargar QR</button>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(10,15,31,0.5)", backdropFilter: "blur(4px)",
    display: "grid", placeItems: "center", zIndex: 200, padding: 20,
  },
  modal: {
    background: "var(--bg-elev)", borderRadius: 18, padding: 24, width: "100%", maxWidth: 340,
    display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 30px 60px -12px rgba(0,0,0,0.35)",
  },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  closeBtn: { background: "var(--bg-2)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", color: "var(--ink-2)", fontSize: 13 },
  qrWrap: { display: "flex", justifyContent: "center", padding: 12, background: "#fff", borderRadius: 12, border: "1px solid var(--line)" },
  canvas: { width: 200, height: 200 },
  linkRow: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--bg-2)", borderRadius: 10 },
  linkText: { flex: 1, fontSize: 12, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  btnGhost: {
    padding: "7px 12px", border: "1px solid var(--line)", background: "var(--bg-elev)", borderRadius: 7,
    fontSize: 12, color: "var(--ink)", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
  },
  btnPrimary: {
    padding: "12px 16px", border: "1px solid var(--brand)", background: "var(--brand)", color: "#fff",
    borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
}
