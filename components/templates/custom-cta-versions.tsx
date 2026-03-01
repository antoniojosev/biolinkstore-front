"use client"

import { useState } from "react"
import { MessageCircle, Mail, Sparkles, ArrowRight, X, Send, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const WA_DESIGN_NUMBER = '5491100000000'   // número del equipo InstaOrder
const DESIGN_EMAIL     = 'diseno@instaorder.com'

type ContactMethod = 'whatsapp' | 'email'

// ── Modal de contacto ─────────────────────────────────────────────────────────

function ContactModal({
  open,
  onClose,
  storeName,
  defaultWhatsapp,
  defaultEmail,
}: {
  open: boolean
  onClose: () => void
  storeName: string
  defaultWhatsapp: string
  defaultEmail: string
}) {
  const [method, setMethod]     = useState<ContactMethod>('whatsapp')
  const [whatsapp, setWhatsapp] = useState(defaultWhatsapp)
  const [email, setEmail]       = useState(defaultEmail)

  const handleSend = () => {
    if (method === 'whatsapp') {
      const msg = encodeURIComponent(
        `Hola! Soy "${storeName}" y me interesa un diseño exclusivo para mi tienda.\nMe pueden contactar al: ${whatsapp}`
      )
      window.open(`https://wa.me/${WA_DESIGN_NUMBER}?text=${msg}`, '_blank')
    } else {
      const subject = encodeURIComponent(`Diseño exclusivo — ${storeName}`)
      const body = encodeURIComponent(
        `Hola!\n\nSoy "${storeName}" y me interesa un diseño exclusivo para mi tienda en InstaOrder.\n\nPueden contactarme al email: ${email}`
      )
      window.open(`mailto:${DESIGN_EMAIL}?subject=${subject}&body=${body}`, '_blank')
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#25D366]" />
            </div>
            <DialogTitle>Solicitar diseño exclusivo</DialogTitle>
          </div>
          <DialogDescription>
            Elegí cómo querés que te contactemos para coordinar tu diseño.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Selector de método */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMethod('whatsapp')}
              className={cn(
                "flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all",
                method === 'whatsapp'
                  ? "border-[#25D366] bg-[#25D366]/8 text-white"
                  : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
              )}
            >
              <MessageCircle className={cn("w-5 h-5", method === 'whatsapp' ? "text-[#25D366]" : "")} />
              <span className="text-xs font-medium">WhatsApp</span>
            </button>
            <button
              onClick={() => setMethod('email')}
              className={cn(
                "flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all",
                method === 'email'
                  ? "border-[#327be2] bg-[#327be2]/8 text-white"
                  : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
              )}
            >
              <Mail className={cn("w-5 h-5", method === 'email' ? "text-[#327be2]" : "")} />
              <span className="text-xs font-medium">Email</span>
            </button>
          </div>

          {/* Campo editable */}
          {method === 'whatsapp' ? (
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium">
                Tu número de WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+54 9 11 XXXX XXXX"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#25D366]/50 focus:bg-white/8 transition-all"
              />
              <p className="text-[11px] text-white/25">
                Te contactaremos a este número para coordinar el diseño.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium">
                Tu email de contacto
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#327be2]/50 focus:bg-white/8 transition-all"
              />
              <p className="text-[11px] text-white/25">
                Te escribiremos a este email para coordinar el diseño.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={method === 'whatsapp' ? !whatsapp.trim() : !email.trim()}
              className={cn(
                "flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
                method === 'whatsapp'
                  ? "bg-[#25D366] hover:bg-[#20bb5a] disabled:opacity-40 disabled:cursor-not-allowed"
                  : "bg-[#327be2] hover:bg-[#2a6acc] disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <Send className="w-3.5 h-3.5" />
              Enviar solicitud
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Barra fija CTA ────────────────────────────────────────────────────────────

export function CustomDesignBar({
  storeName,
  defaultWhatsapp = '',
  defaultEmail = '',
  noSidebar = false,
}: {
  storeName: string
  defaultWhatsapp?: string
  defaultEmail?: string
  noSidebar?: boolean
}) {
  const [dismissed, setDismissed]   = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)

  if (dismissed) return null

  return (
    <>
      {/* Espaciador */}
      <div className="h-20" />

      {/* Barra fixed */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 cta-slide${noSidebar ? '' : ' lg:left-64'}`}>
        {/* Borde superior gradiente animado */}
        <div className="cta-grad-bar" />

        {/* Contenido — inner con overflow:hidden para el shimmer */}
        <div
          className="cta-shimmer-inner flex items-center justify-between gap-3 px-5 py-3"
          style={{
            background: 'rgba(8, 13, 18, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Ícono + copy */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#25D366] animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                ¿Quieres algo único para{' '}
                <span className="text-[#25D366]">{storeName}</span>?
              </p>
              <p className="text-[11px] text-white/35 truncate hidden sm:block">
                Diseño exclusivo — ninguna otra tienda lo tendrá
              </p>
            </div>
          </div>

          {/* CTA + cerrar */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              {/* Ping ring */}
              <span
                className="absolute -inset-1 rounded-xl animate-ping"
                style={{ background: '#25D366', opacity: 0.2, pointerEvents: 'none' }}
              />
              <button
                onClick={() => setModalOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20bb5a] transition-colors"
              >
                Solicitar diseño
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-all"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        storeName={storeName}
        defaultWhatsapp={defaultWhatsapp}
        defaultEmail={defaultEmail}
      />
    </>
  )
}
