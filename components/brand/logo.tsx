interface LogoIconProps {
  className?: string
  size?: number
}

/**
 * ByLink icon — shopping bag with awning and interlocked chain links
 * representing the "link in bio" concept. Turquoise primary, coral accent.
 */
export function LogoIcon({ className, size = 62 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bag body */}
      <rect x="10" y="20" width="44" height="38" rx="8" fill="url(#bag-grad)" />
      {/* Awning scallops */}
      <path
        d="M10 22c0-3 2-6 5-6h34c3 0 5 3 5 6"
        stroke="url(#awning-grad)"
        strokeWidth="0"
        fill="none"
      />
      <ellipse cx="18" cy="18" rx="8" ry="5" fill="#0A5285" />
      <ellipse cx="32" cy="18" rx="8" ry="5" fill="#0F6BA8" />
      <ellipse cx="46" cy="18" rx="8" ry="5" fill="#2B8CC7" />
      {/* Handle */}
      <path
        d="M24 16V12a8 8 0 0 1 16 0v4"
        stroke="#072F4A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Interlocked chain links — "by" + "link" */}
      <g>
        {/* Left link — turquoise (by) */}
        <path
          d="M25 36a6 6 0 1 1 0 8 6 6 0 0 1 0-8z"
          stroke="#6FC2E8"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Right link — coral accent (link) */}
        <path
          d="M33 36a6 6 0 1 1 0 8 6 6 0 0 1 0-8z"
          stroke="#FF6B4A"
          strokeWidth="2.5"
          fill="none"
        />
      </g>
      <defs>
        <linearGradient id="bag-grad" x1="10" y1="20" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#072F4A" />
          <stop offset="1" stopColor="#0F6BA8" />
        </linearGradient>
        <linearGradient id="awning-grad" x1="10" y1="16" x2="54" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A5285" />
          <stop offset="1" stopColor="#2B8CC7" />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface LogoFullProps {
  className?: string
  iconSize?: number
  dark?: boolean
}

/**
 * Full ByLink logo — icon + wordmark "by|link".
 * "by" uses the base text color (white on dark, gray-900 on light surfaces).
 * "link" is always coral for memorability and name recall.
 */
export function LogoFull({ className, iconSize = 32, dark = false }: LogoFullProps) {
  const textColor = dark ? '#1F2937' : '#ffffff'
  const accentColor = '#FF6B4A'

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoIcon size={iconSize} />
      <span
        className="font-bold text-xl leading-none tracking-tight"
        style={{ color: textColor }}
      >
        by<span style={{ color: accentColor }}>link</span>
      </span>
    </div>
  )
}
