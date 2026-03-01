"use client"

import { Palette, MessageCircle } from "lucide-react"

const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola, me interesa un diseño personalizado para mi tienda en InstaOrder.'
)
const WHATSAPP_URL = `https://wa.me/message/contact?text=${WHATSAPP_MESSAGE}`

export function CustomTemplateCard() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col rounded-2xl overflow-hidden border-2 border-dashed border-white/15 hover:border-[#25D366]/50 transition-all duration-200 group cursor-pointer hover:-translate-y-0.5"
    >
      {/* Preview area */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: 180,
          background: 'linear-gradient(135deg, #0d1218 0%, #0e1c2e 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#25D366]/20 transition-all duration-200">
            <Palette className="w-7 h-7 text-[#25D366]" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-white/60">Diseño exclusivo</p>
            <p className="text-[10px] text-white/30">Hecho para tu marca</p>
          </div>
        </div>
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, #25D366 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
      </div>

      {/* Info */}
      <div className="p-3 bg-[#0d1218] flex-1">
        <p className="text-sm font-semibold text-white">Diseño personalizado</p>
        <p className="text-xs text-white/50 mt-0.5">Hecho a medida para tu marca</p>
        <div className="mt-2 flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
          <span className="text-[11px] text-[#25D366] font-medium">Contactar por WhatsApp</span>
        </div>
      </div>
    </a>
  )
}
