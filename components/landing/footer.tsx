import Link from "next/link"
import { LogoFull } from "@/components/brand/logo"

export function Footer() {
  return (
    <footer className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <LogoFull iconSize={36} />
            <p className="text-sm text-gray-400">Tu tienda, en un link.</p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/home/terminos"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--bylink-primary)]"
            >
              Términos
            </Link>
            <Link
              href="/home/terminos#privacidad"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--bylink-primary)]"
            >
              Privacidad
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-gray-600">
            © 2026 ByLink. Todos los derechos reservados.
          </p>
          <p className="text-sm text-gray-500">
            Hecho por venezolanos, para negocios venezolanos 🇻🇪
          </p>
        </div>
      </div>
    </footer>
  )
}
