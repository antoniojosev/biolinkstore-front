import * as React from "react"
import { cn } from "@/lib/utils"

type BadgeTone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info"

const toneClass: Record<BadgeTone, string> = {
  neutral: "",
  brand: "badge-brand",
  accent: "badge-accent",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
}

export function Badge({ className, tone = "neutral", dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn("badge", toneClass[tone], className)} {...props}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}
