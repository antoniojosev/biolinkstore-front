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

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const close = () => setIsMenuOpen(false);
  const linkCls =
    "text-sm text-gray-600 hover:text-gray-900 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--bylink-primary)]";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow] duration-200 pt-[env(safe-area-inset-top)] ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            aria-label="ByLink inicio"
            className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--bylink-primary)]"
          >
            <LogoFull iconSize={38} dark />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#casos" className={linkCls}>
              Casos de uso
            </Link>
            <Link href="#features" className={linkCls}>
              Funciones
            </Link>
            <Link href="#pricing" className={linkCls}>
              Precios
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[var(--bylink-primary)] hover:bg-[var(--bylink-primary-hover)] text-white"
            >
              <Link href="/registro">Montar mi tienda gratis</Link>
            </Button>
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="md:hidden p-2 text-gray-700 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bylink-primary)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-b border-gray-100 shadow-lg"
        >
          <nav className="flex flex-col px-4 py-4 gap-4">
            <Link href="#casos" onClick={close} className={linkCls}>
              Casos de uso
            </Link>
            <Link href="#features" onClick={close} className={linkCls}>
              Funciones
            </Link>
            <Link href="#pricing" onClick={close} className={linkCls}>
              Precios
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-600 w-full"
              >
                <Link href="/login" onClick={close}>
                  Iniciar sesión
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-[var(--bylink-primary)] hover:bg-[var(--bylink-primary-hover)] text-white w-full"
              >
                <Link href="/registro" onClick={close}>
                  Montar mi tienda gratis
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
