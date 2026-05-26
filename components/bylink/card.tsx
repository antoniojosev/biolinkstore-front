import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  hoverable?: boolean
  padded?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, hoverable = false, padded = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("card", elevated && "card-elev", hoverable && "card-hover", padded && "card-padded", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("card-header", className)} {...props} />
)
CardHeader.displayName = "CardHeader"

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("card-body", className)} {...props} />
)
CardBody.displayName = "CardBody"

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("card-footer", className)} {...props} />
)
CardFooter.displayName = "CardFooter"
