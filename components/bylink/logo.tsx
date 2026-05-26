import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  as?: "span" | "div"
}

export function Logo({ className, size = 21, as: Tag = "span" }: LogoProps) {
  return (
    <Tag
      className={cn("font-extrabold leading-none tracking-[-0.025em] text-ink", className)}
      style={{ fontSize: size }}
    >
      bylink<span className="text-brand">.</span>
    </Tag>
  )
}
