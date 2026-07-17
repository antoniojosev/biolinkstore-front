"use client"

import { useState } from "react"

/**
 * Utilidades compartidas de los temas de catálogo boutique (vitrina/luxora).
 * Port de components/templates/shared/ del legacy (color-swatch, use-share)
 * tokenizado: nada de paleta propia salvo lo documentado en las specs.
 */

/** Alpha/mezcla sobre un color CSS (var o literal) sin hardcodear hex. */
export function mix(color: string, pct: number, base = "transparent"): string {
  return `color-mix(in srgb, ${color} ${pct}%, ${base})`
}

/**
 * Formato de precio del legacy (vitrina §1 / luxora §1): Intl es-AR currency
 * sin decimales. Fallback manual para monedas no-ISO de data demo.
 */
export function catalogFmt(currency?: string | null): (n: number) => string {
  const c = currency ?? "USD"
  try {
    const nf = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: c,
      minimumFractionDigits: 0,
    })
    return (n: number) => nf.format(n)
  } catch {
    return (n: number) => `$${n.toLocaleString("es")}`
  }
}

/** Port de shared/use-share.ts: navigator.share con fallback clipboard. */
export function useShare(): { share: (url: string, title: string) => void; copied: boolean } {
  const [copied, setCopied] = useState(false)
  const share = async (url: string, title: string) => {
    try {
      if (typeof navigator !== "undefined" && "share" in navigator && navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // usuario canceló el share nativo — no-op
    }
  }
  return { share, copied }
}

/**
 * Port fiel de shared/color-swatch.tsx: círculo 32px del hex, seleccionado
 * con doble ring `0 0 0 2px #fff, 0 0 0 4px {hex}` (blanco literal documentado
 * en ambas specs §4.1), no disponible → opacity .3 + raya roja diagonal 45°
 * (red-500/70 literal del legacy), label 10px debajo.
 */
export function ColorSwatch({
  hex,
  label,
  isSelected,
  isAvailable,
  onClick,
  labelColor,
  labelSelectedColor,
}: {
  hex: string
  label: string
  isSelected: boolean
  isAvailable: boolean
  onClick: () => void
  /** Color del label sin seleccionar (muted del tema). */
  labelColor: string
  /** Color del label seleccionado (texto del tema). */
  labelSelectedColor: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      title={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        padding: 0,
        fontFamily: "inherit",
        cursor: isAvailable ? "pointer" : "not-allowed",
      }}
    >
      <span
        style={{
          position: "relative",
          display: "block",
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: hex,
          overflow: "hidden",
          opacity: isAvailable ? 1 : 0.3,
          transition: "all .2s ease",
          boxShadow: isSelected ? `0 0 0 2px #fff, 0 0 0 4px ${hex}` : undefined,
        }}
      >
        {!isAvailable && (
          <span
            style={{
              position: "absolute",
              left: "-20%",
              top: "50%",
              width: "140%",
              height: 2,
              background: "rgba(239,68,68,0.7)", // red-500/70 — literal del legacy
              transform: "rotate(45deg)",
            }}
          />
        )}
      </span>
      <span
        style={{
          fontSize: 10,
          transition: "color .2s ease",
          color: isSelected ? labelSelectedColor : labelColor,
          fontWeight: isSelected ? 500 : 400,
          textDecoration: isAvailable ? undefined : "line-through",
        }}
      >
        {label}
      </span>
    </button>
  )
}
