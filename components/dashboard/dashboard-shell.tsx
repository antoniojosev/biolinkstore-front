"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  ClipboardList,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Crown,
  Sparkles,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
  { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { label: "Productos", href: "/dashboard/productos", icon: Package },
  { label: "Pedidos", href: "/dashboard/pedidos", icon: ClipboardList },
  { label: "Estadisticas", href: "/dashboard/estadisticas", icon: BarChart3 },
  { label: "Diseño", href: "/dashboard/diseno", icon: Palette },
  { label: "Configuracion", href: "/dashboard/configuracion", icon: Settings },
  { label: "Mi plan", href: "/dashboard/plan", icon: Crown },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, store, isLoading, logout } = useAuth()

  // Cuenta huérfana: usuario existe pero no tiene tienda → recuperar
  useEffect(() => {
    if (!isLoading && !store) {
      router.replace('/onboarding/create-store')
    }
  }, [isLoading, store, router])

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??'

  const storeSlug = store?.slug ?? null

  return (
    <div className="min-h-screen bg-[#0a0f14] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0d1218] border-r border-white/5 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#33b380]">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">InstaOrder</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/50 hover:text-white"
            aria-label="Cerrar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-[#33b380]/15 text-[#6ee490]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-[#33b380]" : ""}`} />
                {item.label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Upgrade banner */}
        <div className="px-3 py-2">
          <Link href="/dashboard/plan" className="block">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#33b380]/20 to-[#327be2]/20 border border-[#33b380]/20 hover:border-[#33b380]/40 transition-all group">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6ee490]" />
                <span className="text-xs font-semibold text-[#6ee490]">Mejorar plan</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Desbloquea productos ilimitados y mas funciones.
              </p>
            </div>
          </Link>
        </div>

        {/* Store preview link */}
        <div className="px-3 py-2">
          {storeSlug ? (
            <Link
              href={`/${storeSlug}`}
              target="_blank"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <ExternalLink className="w-[18px] h-[18px]" />
              Ver mi tienda
            </Link>
          ) : (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/30 cursor-default">
              <ExternalLink className="w-[18px] h-[18px]" />
              Ver mi tienda
            </div>
          )}
        </div>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-8 h-8">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.name ?? ''} />}
              <AvatarFallback className="bg-[#327be2]/20 text-[#327be2] text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {store?.name ?? user?.name ?? 'Mi tienda'}
              </p>
              <p className="text-xs text-white/40 truncate">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={logout}
              className="text-white/50 hover:text-red-400 transition-colors"
              aria-label="Cerrar sesion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0a0f14]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/60 hover:text-white"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-white/80">
              {navItems.find((item) => item.href === pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {!pathname.startsWith('/dashboard/diseno') && (
              <Button
                size="sm"
                className="bg-[#33b380] hover:bg-[#2a9a6d] text-white text-xs h-8"
                asChild
              >
                <Link href="/dashboard/productos/crear">Agregar producto</Link>
              </Button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
