"use client"

export type PreviewDevice = "desktop" | "mobile"

interface Props {
  device: PreviewDevice
  onChange: (d: PreviewDevice) => void
}

export function DeviceToggle({ device, onChange }: Props) {
  return (
    <div style={S.wrap} role="group" aria-label="Vista previa: escritorio o móvil">
      <button
        type="button"
        onClick={() => onChange("desktop")}
        style={{ ...S.btn, ...(device === "desktop" ? S.btnActive : null) }}
        title="Vista escritorio"
      >
        🖥
      </button>
      <button
        type="button"
        onClick={() => onChange("mobile")}
        style={{ ...S.btn, ...(device === "mobile" ? S.btnActive : null) }}
        title="Vista móvil"
      >
        📱
      </button>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    gap: 2,
    padding: 2,
    background: "var(--bg-2)",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--line)",
  },
  btn: {
    width: 28,
    height: 26,
    display: "grid",
    placeItems: "center",
    border: "none",
    background: "transparent",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    color: "var(--ink-3)",
    lineHeight: 1,
  },
  btnActive: {
    background: "var(--bg-elev)",
    color: "var(--ink)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
}
