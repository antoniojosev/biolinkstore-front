"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { LogoFull } from "@/components/brand/logo";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <LogoFull iconSize={38} dark />

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#casos"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Casos de uso
            </Link>
            <Link
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Funciones
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Precios
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button
                size="sm"
                className="bg-[var(--bylink-primary)] hover:bg-[var(--bylink-primary-hover)] text-white"
              >
                Crear mi tienda gratis
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-lg">
          <nav className="flex flex-col px-4 py-4 gap-4">
            <Link
              href="#casos"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Casos de uso
            </Link>
            <Link
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Funciones
            </Link>
            <Link
              href="#pricing"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Precios
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="text-gray-600 w-full">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/registro" onClick={() => setIsMenuOpen(false)}>
                <Button
                  size="sm"
                  className="bg-[var(--bylink-primary)] hover:bg-[var(--bylink-primary-hover)] text-white w-full"
                >
                  Crear mi tienda gratis
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
