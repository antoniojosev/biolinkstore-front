interface LogoIconProps {
  className?: string
  size?: number
}

/**
 * BioLinkStore icon — shopping bag with awning and interlocked "b" chain links.
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
      <ellipse cx="18" cy="18" rx="8" ry="5" fill="#1a3a4a" />
      <ellipse cx="32" cy="18" rx="8" ry="5" fill="#1f5c5a" />
      <ellipse cx="46" cy="18" rx="8" ry="5" fill="#2a7d6e" />
      {/* Handle */}
      <path
        d="M24 16V12a8 8 0 0 1 16 0v4"
        stroke="#0d2b3e"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Interlocked chain / double-b */}
      <g>
        {/* Left link */}
        <path
          d="M25 36a6 6 0 1 1 0 8 6 6 0 0 1 0-8z"
          stroke="#5bbf9a"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Right link */}
        <path
          d="M33 36a6 6 0 1 1 0 8 6 6 0 0 1 0-8z"
          stroke="#7de8b8"
          strokeWidth="2.5"
          fill="none"
        />
      </g>
      <defs>
        <linearGradient id="bag-grad" x1="10" y1="20" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d2b3e" />
          <stop offset="1" stopColor="#1a5c52" />
        </linearGradient>
        <linearGradient id="awning-grad" x1="10" y1="16" x2="54" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a3a4a" />
          <stop offset="1" stopColor="#2a7d6e" />
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
 * Full BioLinkStore logo — icon + wordmark.
 */
export function LogoFull({ className, iconSize = 32, dark = false }: LogoFullProps) {
  const textColor = dark ? '#1a1a1a' : '#ffffff'
  const accentColor = '#33b380'
  const fontClass = 'font-[family-name:var(--font-sora)]'

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoIcon size={iconSize} />
      <span
        className={`font-bold text-xl leading-none ${fontClass}`}
        style={{ color: textColor }}
      >
        biolink<span style={{ color: accentColor }}>store</span>
      </span>
    </div>
  )
}
