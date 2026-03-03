import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { LogoFull } from "@/components/brand/logo"

export const metadata: Metadata = {
  title: "Configura tu tienda - biolinkstore",
  description: "Configura tu tienda y empieza a vender.",
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0f14] flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-white/5 flex items-center px-6 shrink-0">
        <Link href="/dashboard">
          <LogoFull iconSize={34} />
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  )
}
