import { cn } from "@/lib/utils"

export type IconName =
  | "home" | "package" | "layout" | "store" | "chart" | "credit" | "users"
  | "msg" | "settings" | "search" | "bell" | "plus" | "chevron-down"
  | "chevron-right" | "menu" | "globe" | "share" | "tag" | "command"
  | "external" | "edit" | "copy" | "grid" | "list" | "upload" | "grip"
  | "image" | "instagram" | "eye" | "undo" | "trash" | "smartphone"
  | "monitor" | "palette" | "text" | "sparkles" | "check" | "x"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <use href={`#ic-${name}`} />
    </svg>
  )
}
