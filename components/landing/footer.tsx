import Link from "next/link"
import { ShoppingBag, Instagram, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 glass-panel">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-8 w-8 text-[#33b380]" />
              <span className="text-xl font-bold text-white">InstaOrder</span>
            </div>
            <p className="text-sm text-white/70 mb-4">
              La plataforma para convertir tu Instagram en una tienda profesional.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-white/60 hover:text-[#33b380] transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/60 hover:text-[#327be2] transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/60 hover:text-[#6ee490] transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Producto</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
                  Funciones
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Integraciones
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Actualizaciones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Recursos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Tutoriales
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Términos de uso
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">© 2026 InstaOrder. Todos los derechos reservados.</p>
          <p className="text-sm text-white/60">Hecho con amor para vendedores de Instagram</p>
        </div>
      </div>
    </footer>
  )
}
