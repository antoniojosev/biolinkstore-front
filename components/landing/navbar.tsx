"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingBag } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-[#33b380]" />
            <span className="text-xl font-bold text-white">InstaOrder</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-white/80 hover:text-white transition-colors">
              Funciones
            </Link>
            <Link href="#how-it-works" className="text-sm text-white/80 hover:text-white transition-colors">
              Cómo funciona
            </Link>
            <Link href="#pricing" className="text-sm text-white/80 hover:text-white transition-colors">
              Precios
            </Link>
            <Link href="#testimonials" className="text-sm text-white/80 hover:text-white transition-colors">
              Testimonios
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
              Iniciar sesión
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#33b380] to-[#2a9669] hover:from-[#2a9669] hover:to-[#228055] text-white border-0"
            >
              Comenzar gratis
            </Button>
          </div>

          <button className="md:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10">
          <nav className="flex flex-col px-4 py-4 gap-4">
            <Link href="#features" className="text-sm text-white/80 hover:text-white transition-colors">
              Funciones
            </Link>
            <Link href="#how-it-works" className="text-sm text-white/80 hover:text-white transition-colors">
              Cómo funciona
            </Link>
            <Link href="#pricing" className="text-sm text-white/80 hover:text-white transition-colors">
              Precios
            </Link>
            <Link href="#testimonials" className="text-sm text-white/80 hover:text-white transition-colors">
              Testimonios
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                Iniciar sesión
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#33b380] to-[#2a9669] hover:from-[#2a9669] hover:to-[#228055] text-white border-0"
              >
                Comenzar gratis
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
