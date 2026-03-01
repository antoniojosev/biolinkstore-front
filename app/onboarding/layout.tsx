import type React from "react"
import type { Metadata } from "next"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Configura tu tienda - InstaOrder",
  description: "Configura tu tienda y empieza a vender.",
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0f14] flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-white/5 flex items-center px-6 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#33b380]">
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-white">InstaOrder</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  )
}
