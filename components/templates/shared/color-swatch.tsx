'use client'

interface ColorSwatchProps {
  hex: string
  label: string
  isSelected: boolean
  isAvailable: boolean
  onClick: () => void
  size?: 'sm' | 'md'
}

export function ColorSwatch({
  hex,
  label,
  isSelected,
  isAvailable,
  onClick,
  size = 'md',
}: ColorSwatchProps) {
  const px = size === 'sm' ? 20 : 32

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      className="flex flex-col items-center gap-1 group"
      title={label}
    >
      <span
        className={`rounded-full transition-all duration-200 ${
          isSelected
            ? 'ring-2 ring-offset-2 ring-offset-background'
            : 'ring-0'
        } ${
          !isAvailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          width: px,
          height: px,
          backgroundColor: hex,
          ...(isSelected ? { boxShadow: `0 0 0 2px var(--tw-ring-offset-color, #fff), 0 0 0 4px ${hex}` } : {}),
        }}
      >
        {!isAvailable && (
          <span
            className="block w-full h-full rounded-full relative overflow-hidden"
          >
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className="block w-[140%] h-0.5 bg-red-500/70 rotate-45 -translate-x-[3%]"
              />
            </span>
          </span>
        )}
      </span>
      {size === 'md' && (
        <span className={`text-[10px] transition-colors ${
          isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'
        } ${!isAvailable ? 'line-through' : ''}`}>
          {label}
        </span>
      )}
    </button>
  )
}
