'use client'

// Servicios template uses direct WhatsApp inquiry per service.
// This is a minimal cart drawer kept for structural compatibility.

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCart } from '@/lib/cart-context'
import { MessageCircle } from 'lucide-react'

export function ServiciosCartDrawer() {
  const { isOpen, setIsOpen } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 py-4 border-b border-gray-200">
          <SheetTitle className="text-gray-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Servicios
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
          <p className="text-sm text-gray-500">
            Usa el botón de WhatsApp en cada servicio para agendar directamente.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
