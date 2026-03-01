import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="gradient-background min-h-screen flex items-center justify-center p-4">
      {children}
    </div>
  )
}
