"use client"

import { useState } from "react"
import { MessageCircle, Mail, Sparkles, X, Send, ChevronRight, Loader2, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

// ── Modal de contacto ─────────────────────────────────────────────────────────

function ContactModal({
  open,
  onClose,
  storeName,
  storeId,
  defaultWhatsapp,
  defaultEmail,
}: {
  open: boolean
  onClose: () => void
  storeName: string
  storeId: string
  defaultWhatsapp: string
  defaultEmail: string
}) {
  const { http } = useAuth()
  const [method, setMethod]           = useState<'whatsapp' | 'email'>('whatsapp')
  const [whatsapp, setWhatsapp]       = useState(defaultWhatsapp)
  const [email, setEmail]             = useState(defaultEmail)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState('')

  const handleSend = async () => {
    setError('')
    setSubmitting(true)
    try {
      await http.post('/api/contact/inquiry', {
        type: 'DESIGN',
        storeId,
        storeName,
        method,
        contact: method === 'whatsapp' ? whatsapp.trim() : email.trim(),
        description: description.trim() || undefined,
      })
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#25D366]/15 to-[#33b380]/15 border border-[#25D366]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#25D366]" />
            </div>
            <DialogTitle>Solicitar diseño exclusivo</DialogTitle>
          </div>
          <DialogDescription>
            Contanos qué necesitas y te armamos un diseño a medida.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#33b380]/15 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[#33b380]" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">¡Solicitud recibida!</p>
                <p className="text-sm text-white/50 mt-1.5 leading-relaxed max-w-xs">
                  Te contactaremos en las próximas <span className="text-white/70 font-medium">24 horas</span> con una propuesta de diseño.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-1 px-6 py-2.5 rounded-xl bg-[#33b380] hover:bg-[#2a9a6d] text-white text-sm font-semibold transition-all"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              {/* Selector de método */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethod('whatsapp')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    method === 'whatsapp'
                      ? "border-[#25D366] bg-[#25D366]/8 text-white"
                      : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
                  )}
                >
                  <MessageCircle className={cn("w-5 h-5", method === 'whatsapp' ? "text-[#25D366]" : "")} />
                  <span className="text-[11px] font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={() => setMethod('email')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    method === 'email'
                      ? "border-[#327be2] bg-[#327be2]/8 text-white"
                      : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
                  )}
                >
                  <Mail className={cn("w-5 h-5", method === 'email' ? "text-[#327be2]" : "")} />
                  <span className="text-[11px] font-medium">Email</span>
                </button>
              </div>

              {/* Campo de contacto */}
              {method === 'whatsapp' ? (
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Tu número de WhatsApp</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+54 9 11 XXXX XXXX"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#25D366]/50 focus:bg-white/8 transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Tu email de contacto</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#327be2]/50 focus:bg-white/8 transition-all"
                  />
                </div>
              )}

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium">
                  ¿Qué diseño necesitas? <span className="text-white/20">(opcional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Quiero algo elegante en colores oscuros, con foco en fotos grandes..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#33b380]/50 focus:bg-white/8 transition-all resize-none"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

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
                  disabled={submitting || (method === 'whatsapp' ? !whatsapp.trim() : !email.trim())}
                  className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#25D366] to-[#33b380] hover:from-[#20bb5a] hover:to-[#2a9669] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {submitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>

              <p className="text-[11px] text-white/25 text-center">
                Te contactaremos en menos de 24 horas con una propuesta.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Barra fija CTA ────────────────────────────────────────────────────────────

export function CustomDesignBar({
  storeName,
  storeId,
  defaultWhatsapp = '',
  defaultEmail = '',
  noSidebar = false,
}: {
  storeName: string
  storeId: string
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
        storeId={storeId}
        defaultWhatsapp={defaultWhatsapp}
        defaultEmail={defaultEmail}
      />
    </>
  )
}
