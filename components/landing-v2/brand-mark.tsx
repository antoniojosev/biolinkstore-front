interface BrandMarkProps {
  size?: number
  withAccent?: boolean
}

export function BrandMark({ size = 30, withAccent = true }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--brand)" />
      <path
        d="M10 10v12M10 10c3.5 0 5.5 1.3 5.5 3.2S14 16 12.2 16H10M12.2 16c2.3 0 4.3 1 4.3 2.6S14.5 22 11.5 22H10"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {withAccent && <circle cx="22" cy="21" r="2" fill="var(--accent)" />}
    </svg>
  )
}
