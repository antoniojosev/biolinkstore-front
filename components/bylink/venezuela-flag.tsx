interface Props {
  size?: number
  className?: string
}

/**
 * Inline SVG flag — Unicode flag emoji (🇻🇪) render inconsistently across
 * OS/browsers (Windows in particular often falls back to plain "VE" glyphs),
 * so UI chrome that needs a real flag icon uses this instead of the emoji.
 */
export function VenezuelaFlag({ size = 18, className }: Props) {
  const w = size
  const h = Math.round((size * 2) / 3)
  const stars = Array.from({ length: 7 }, (_, i) => {
    const angle = -55 + i * (110 / 6)
    const rad = (angle * Math.PI) / 180
    const cx = 10 + 5.5 * Math.sin(rad)
    const cy = 7 - 2.2 * Math.cos(rad)
    return <circle key={i} cx={cx} cy={cy} r={0.55} fill="#fff" />
  })

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 20 14"
      className={className}
      style={{ borderRadius: 2, flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect width="20" height="14" fill="#FCD116" />
      <rect y="4.67" width="20" height="4.67" fill="#00247D" />
      <rect y="9.33" width="20" height="4.67" fill="#CF142B" />
      {stars}
    </svg>
  )
}
