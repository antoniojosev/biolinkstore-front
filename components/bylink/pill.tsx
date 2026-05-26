import * as React from "react"
import { cn } from "@/lib/utils"

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const Pill = React.forwardRef<HTMLButtonElement, PillProps>(
  ({ className, active = false, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn("chip", active && "active", className)} {...props} />
  )
)
Pill.displayName = "Pill"
