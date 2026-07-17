"use client"

import type { CSSProperties } from "react"
import { MessageCircle, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { ThemeCartSheetProps } from "@/components/storefront-v2/themes/registry"

/**
 * Cart drawer PROPIO de persona/servicios (spec §5) — informacional, sin
 * items ni checkout: el tema no usa carrito, cada servicio se agenda con
 * WhatsApp directo. Existe por compatibilidad estructural (algo tiene que
 * abrirse si un flujo genérico dispara onOpenCart) y se parametriza solo
 * por el título ("Persona" / "Servicios", único diff legacy entre temas).
 *
 * paymentProvider llega por contrato ThemeCartSheetProps pero no se usa —
 * acá no hay checkout.
 */
export function createProfileCartSheet(title: string) {
  function ProfileCartSheet(_props: ThemeCartSheetProps) {
    const { isOpen, setIsOpen } = useCart()
    if (!isOpen) return null

    return (
      <div style={S.overlay} onClick={() => setIsOpen(false)}>
        <div style={S.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
          <div style={S.header}>
            <h2 style={S.title}>
              <MessageCircle size={20} />
              {title}
            </h2>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar" style={S.closeBtn}>
              <X size={16} />
            </button>
          </div>
          <div style={S.body}>
            <p style={S.message}>Usa el botón de WhatsApp en cada servicio para agendar directamente.</p>
          </div>
        </div>
      </div>
    )
  }
  ProfileCartSheet.displayName = `ProfileCartSheet(${title})`
  return ProfileCartSheet
}

const S: Record<string, CSSProperties> = {
  // z 400: por encima del modal de preview (300) — misma capa que el genérico
  overlay: { position: "fixed", inset: 0, background: "rgba(10,15,31,0.5)", zIndex: 400, display: "flex", justifyContent: "flex-end" },
  // Sheet w-full sm:max-w-md p-0 del legacy (448px)
  sheet: {
    background: "var(--bl-background)", color: "var(--bl-text)", fontFamily: "var(--bl-body-font)",
    width: "100%", maxWidth: 448, height: "100%",
    display: "flex", flexDirection: "column",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 24px",
    borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "var(--bl-border)",
  },
  title: {
    display: "flex", alignItems: "center", gap: 8, margin: 0,
    fontFamily: "var(--bl-heading-font)", fontSize: 16, fontWeight: 600, color: "var(--bl-text)",
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8, border: "none",
    background: "var(--bl-surface)", color: "var(--bl-text)",
    cursor: "pointer", display: "grid", placeItems: "center",
  },
  body: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "0 24px", gap: 16,
  },
  message: { fontSize: 14, color: "var(--bl-text-muted)", margin: 0, lineHeight: 1.55 },
}
