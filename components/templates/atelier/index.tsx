'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, MessageCircle, Instagram, Mail } from 'lucide-react'
import { useStore } from '@/lib/store-context'
import type { Product } from '@/lib/types'

const SERIF = { fontFamily: 'var(--font-fraunces)' }

function buildWaHref(phone: string | undefined, message: string): string {
  if (!phone) return '#contacto'
  const clean = phone.replace(/\D/g, '')
  if (!clean) return '#contacto'
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

function monogramFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
  if (parts.length === 0) return 'AT'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function formatPrice(n: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

const GALLERY_LAYOUT: Array<{ colSpan: number; aspect: string }> = [
  { colSpan: 7, aspect: '7/5' },
  { colSpan: 5, aspect: '5/5' },
  { colSpan: 4, aspect: '4/5' },
  { colSpan: 4, aspect: '4/5' },
  { colSpan: 4, aspect: '4/5' },
  { colSpan: 8, aspect: '8/5' },
  { colSpan: 4, aspect: '4/5' },
]

function gatherGalleryImages(products: Product[]): string[] {
  const out: string[] = []
  for (const p of products) {
    if (p.images && p.images.length > 0) {
      for (const img of p.images) {
        if (!out.includes(img)) out.push(img)
        if (out.length >= GALLERY_LAYOUT.length) return out
      }
    } else if (p.image && !out.includes(p.image)) {
      out.push(p.image)
      if (out.length >= GALLERY_LAYOUT.length) return out
    }
  }
  return out
}

export function AtelierTemplate() {
  const { store, products } = useStore()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')

  const waPhone = store.whatsappNumbers?.[0]
  const waMain = buildWaHref(
    waPhone,
    `Hola ${store.name}, me gustaría conversar sobre un proyecto.`,
  )

  const services = products
  const featured = services.find((p) => p.featured) ?? services[0]
  const galleryImages = gatherGalleryImages(services)

  const monogram = monogramFromName(store.name)
  const metaLine = store.bio ? store.bio.split(/[.·\n]/)[0].trim() : 'Servicios creativos'
  const heroSubject = metaLine
    .split(/\s+/)
    .slice(0, 2)
    .join(' ')
    .toLowerCase()
  const pillars = Array.from(
    new Set(
      services
        .map((p) => p.category)
        .filter((c): c is string => Boolean(c)),
    ),
  ).slice(0, 4)

  const detailHref = (slug?: string) =>
    slug ? `/${store.slug}/${slug}${preview ? `?preview=${preview}` : ''}` : '#contacto'

  return (
    <div className="min-h-[100dvh] text-[#1f1b18]" style={{
      background:
        'radial-gradient(1100px 700px at 100% 0%, #f0e9dd 0%, transparent 60%), radial-gradient(800px 500px at 0% 100%, #d8d0c0 0%, transparent 60%), linear-gradient(180deg, #ece6dd 0%, #e2dccf 100%)',
    }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[200] focus:bg-[#1f1b18] focus:text-[#fbf8f2] focus:px-3 focus:py-2 focus:text-xs focus:rounded"
      >
        Saltar al contenido
      </a>

      {/* Nav */}
      <nav
        aria-label="Principal"
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between border-b border-[rgba(31,27,24,.12)] bg-[rgba(236,230,221,.55)] backdrop-blur-[18px] [backdrop-filter:saturate(120%)_blur(18px)] px-5 sm:px-8 py-4 sm:py-5"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top))',
        }}
      >
        <a
          href="#main"
          translate="no"
          aria-label={`${store.name} — inicio`}
          className="inline-flex items-center gap-3 text-[#1f1b18] no-underline leading-none"
        >
          <span
            aria-hidden="true"
            className="w-[34px] h-[34px] grid place-items-center border border-[#1f1b18] rounded-full text-sm -tracking-[.01em] italic font-medium pb-[1px]"
            style={SERIF}
          >
            {monogram}
          </span>
          <span className="flex flex-col items-start gap-[3px]">
            <span
              className="text-[15px] font-medium tracking-[.01em] leading-none"
              style={SERIF}
            >
              {store.name}
            </span>
            <span className="text-[9px] uppercase tracking-[.24em] text-[rgba(31,27,24,.55)] leading-none">
              {metaLine}
            </span>
          </span>
        </a>
        <div className="hidden md:flex gap-8 text-[13px] text-[#4a423b]">
          <a href="#servicios" className="no-underline hover:text-[#1f1b18] transition-colors">
            Servicios
          </a>
          <a href="#manifesto" className="no-underline hover:text-[#1f1b18] transition-colors">
            Filosofía
          </a>
          {galleryImages.length > 0 && (
            <a href="#portafolio" className="no-underline hover:text-[#1f1b18] transition-colors">
              Portafolio
            </a>
          )}
          <a href="#contacto" className="no-underline hover:text-[#1f1b18] transition-colors">
            Contacto
          </a>
        </div>
        <a
          href="#contacto"
          className="text-[11px] sm:text-xs font-medium uppercase tracking-[.14em] text-[#1f1b18] no-underline border-b border-[#1f1b18] pb-0.5 whitespace-nowrap"
        >
          Conversemos
        </a>
      </nav>

      <main id="main">
        {/* Hero */}
        <header className="relative isolate overflow-hidden min-h-[100dvh] scroll-mt-20">
          <div
            aria-hidden="true"
            className="absolute -inset-8 -z-[2] bg-cover bg-center"
            style={{
              backgroundImage: `url('${store.coverImage ?? '/cover.webp'}')`,
              backgroundPosition: 'center 25%',
              filter: 'blur(14px) saturate(.85)',
              transform: 'scale(1.1)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-[2]"
            style={{
              background:
                'radial-gradient(900px 600px at 30% 40%, rgba(236,230,221,.4) 0%, rgba(236,230,221,.62) 60%, rgba(236,230,221,.7) 100%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-[1] pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(236,230,221,.65) 0%, rgba(236,230,221,0) 18%, rgba(236,230,221,0) 70%, rgba(236,230,221,.9) 100%)',
            }}
          />
          <div className="relative min-h-[100dvh] flex flex-col justify-center max-w-[1400px] mx-auto px-5 sm:px-8 pt-28 pb-[180px] sm:pt-32 sm:pb-[200px]">
            <h1
              className="text-[clamp(44px,8.5vw,112px)] font-normal leading-[1] -tracking-[.02em] text-[#1f1b18] max-w-[1100px] text-balance"
              style={{
                ...SERIF,
                textShadow: '0 1px 0 rgba(255,255,255,.15)',
              }}
            >
              {store.bio ? `Tu ${heroSubject}` : 'Cada proyecto'}
              <br />
              <em className="italic font-normal text-[#4a423b]">es un ritual</em>
            </h1>
            {pillars.length > 0 && (
              <ul
                role="list"
                className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 max-w-[760px] border-t border-[rgba(31,27,24,.12)] pt-5"
              >
                {pillars.map((pillar) => (
                  <li
                    key={pillar}
                    className="text-[11px] sm:text-xs uppercase tracking-[.14em] text-[#4a423b] font-medium list-none"
                  >
                    {pillar}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <aside className="absolute left-4 sm:left-8 max-w-[220px] sm:max-w-[280px] z-[2]" style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
            <h3
              className="text-[21px] sm:text-[26px] italic leading-[1.05] text-[#1f1b18] mb-2.5 font-normal"
              style={SERIF}
            >
              La cámara
              <br />
              como pausa
            </h3>
            <p className="text-xs sm:text-[13px] text-[#4a423b] leading-[1.55] text-pretty">
              {store.bio ?? 'Estudio creativo independiente. Proyectos con alma, no con plantilla.'}
            </p>
          </aside>
          {featured && (
            <aside
              className="hidden md:flex absolute right-8 z-[2] items-center gap-3 bg-[#fbf8f2] pl-2 pr-4 py-2 rounded-[4px] shadow-[0_14px_30px_-12px_rgba(0,0,0,.2)]"
              style={{ bottom: 'calc(32px + env(safe-area-inset-bottom))' }}
            >
              <div
                role="img"
                aria-label={`Foto destacada: ${featured.name}`}
                className="w-14 h-14 bg-center bg-cover rounded-[2px] bg-[#d8d0c0]"
                style={{
                  backgroundImage: `url('${featured.images?.[0] ?? featured.image ?? ''}')`,
                }}
              />
              <div className="text-[11px]">
                <strong
                  className="block text-sm font-medium -tracking-[.005em]"
                  style={SERIF}
                >
                  {featured.name}
                </strong>
                <span className="text-[rgba(31,27,24,.55)] uppercase tracking-[.1em] text-[10px]">
                  Trabajo destacado
                </span>
              </div>
            </aside>
          )}
        </header>

        {/* Manifesto */}
        <section
          id="manifesto"
          aria-labelledby="manifesto-h"
          className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 sm:py-[140px] grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center scroll-mt-20"
        >
          <div
            role="img"
            aria-label="Detalle del estudio"
            className="aspect-[4/5] bg-center bg-cover rounded-[2px] bg-[#d8d0c0]"
            style={{
              backgroundImage: `url('${store.avatar ?? galleryImages[0] ?? store.coverImage ?? '/cover.webp'}')`,
            }}
          />
          <div className="max-w-[460px] min-w-0">
            <p className="text-[11px] uppercase tracking-[.18em] text-[rgba(31,27,24,.55)] mb-6">
              Filosofía · <span translate="no">{store.name}</span>
            </p>
            <h2
              id="manifesto-h"
              className="text-[clamp(32px,4.5vw,56px)] font-normal leading-[1.05] -tracking-[.02em] text-balance mb-8"
              style={SERIF}
            >
              El instante <em className="italic text-[#4a423b]">es la obra.</em>
            </h2>
            <p className="text-[15px] text-[#4a423b] leading-[1.7] mb-4 text-pretty">
              {store.bio ??
                'Trabajo con cada cliente como un proyecto único. Conversación larga, ritmo propio, sin guiones prestados.'}
            </p>
            <p className="text-[15px] text-[#4a423b] leading-[1.7] text-pretty">
              Proceso pequeño, cuidado, con tiempo. El resultado son trabajos que se
              sienten tuyos — no nuestros.
            </p>
          </div>
        </section>

        {/* Servicios */}
        {services.length > 0 && (
          <section
            id="servicios"
            aria-labelledby="servicios-h"
            className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-20 sm:pt-24 pb-14 sm:pb-16 scroll-mt-20"
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-[rgba(31,27,24,.12)] pb-6 mb-12 sm:mb-[60px]">
              <h2
                id="servicios-h"
                className="text-[clamp(32px,5vw,52px)] font-normal leading-none -tracking-[.02em] min-w-0"
                style={SERIF}
              >
                Servicios
              </h2>
              <span className="text-xs uppercase tracking-[.14em] text-[rgba(31,27,24,.55)] tabular-nums shrink-0">
                {String(services.length).padStart(2, '0')} · disponibles
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 sm:gap-y-[60px] gap-x-10">
              {services.map((service) => {
                const image =
                  service.images?.[0] ?? service.image ?? '/placeholder.svg'
                const isQuote = service.price === 0
                const priceLabel = isQuote
                  ? 'Cotizar'
                  : `desde ${formatPrice(service.price, store.currency)}`
                const isContact = !service.slug
                const href = isContact ? '#contacto' : detailHref(service.slug)
                const CardTag = isContact ? 'a' : Link

                return (
                  <CardTag
                    key={service.id}
                    href={href}
                    className="block text-inherit no-underline group focus-visible:outline-offset-[6px]"
                  >
                    <div className="aspect-[5/4] overflow-hidden mb-5 sm:mb-6 bg-[#d8d0c0]">
                      <img
                        src={image}
                        alt={service.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                      <h3
                        className="text-[22px] sm:text-[26px] font-normal leading-[1.1] -tracking-[.01em] min-w-0 [overflow-wrap:anywhere]"
                        style={SERIF}
                      >
                        {service.name}
                      </h3>
                      <span
                        className={`text-sm italic tabular-nums whitespace-nowrap shrink-0 ${
                          isQuote ? 'text-[#8a4f2a]' : 'text-[#4a423b]'
                        }`}
                        style={SERIF}
                      >
                        {priceLabel}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-[#4a423b] leading-[1.65] mb-4 max-w-[460px] text-pretty line-clamp-3">
                        {service.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[.14em] text-[#1f1b18] font-medium border-b border-[#1f1b18] pb-1 group-hover:[&_svg]:translate-x-1.5">
                      {isContact ? 'Solicitar info' : 'Ver servicio'}
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-transform duration-[250ms] [transition-timing-function:cubic-bezier(.2,.7,.3,1)]"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                  </CardTag>
                )
              })}
            </div>
          </section>
        )}

        {/* Portafolio */}
        {galleryImages.length > 0 && (
          <section
            id="portafolio"
            aria-labelledby="portafolio-h"
            className="max-w-[1400px] mx-auto pt-20 sm:pt-24 scroll-mt-20"
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-[rgba(31,27,24,.12)] pb-6 mb-12 sm:mb-[60px] px-5 sm:px-8">
              <h2
                id="portafolio-h"
                className="text-[clamp(32px,5vw,52px)] font-normal leading-none -tracking-[.02em] min-w-0"
                style={SERIF}
              >
                Trabajos recientes
              </h2>
              <span className="text-xs uppercase tracking-[.14em] text-[rgba(31,27,24,.55)] tabular-nums shrink-0">
                Portafolio
              </span>
            </div>
            <ul className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-3.5 px-2 md:px-3.5 list-none">
              {galleryImages.map((img, idx) => {
                const layout = GALLERY_LAYOUT[idx] ?? GALLERY_LAYOUT[GALLERY_LAYOUT.length - 1]
                return (
                  <li
                    key={`${img}-${idx}`}
                    className="relative overflow-hidden bg-[#d8d0c0] col-span-1 group"
                    style={{
                      gridColumn: `span ${layout.colSpan}`,
                      aspectRatio: layout.aspect,
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.02]"
                    />
                  </li>
                )
              })}
            </ul>
            <style jsx>{`
              @media (max-width: 768px) {
                ul li { grid-column: span 1 !important; aspect-ratio: 4/5 !important; }
              }
            `}</style>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer id="contacto" className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-20 sm:pt-[140px] pb-10 scroll-mt-20">
        <div className="text-center mb-16 sm:mb-24">
          <p className="text-[11px] uppercase tracking-[.18em] text-[rgba(31,27,24,.55)] mb-5">
            Hablemos
          </p>
          <h2
            className="text-[clamp(40px,7vw,84px)] font-normal leading-[1] -tracking-[.02em] mb-8 text-balance"
            style={SERIF}
          >
            Capturemos algo
            <br />
            <em className="italic text-[#4a423b]">juntos.</em>
          </h2>
          {waPhone && (
            <a
              href={waMain}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Escribir por WhatsApp a ${store.name}`}
              className="inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[.14em] text-[#fbf8f2] bg-[#1f1b18] no-underline px-7 sm:px-8 py-4 sm:py-[18px] rounded-full hover:bg-[#8a4f2a] hover:-translate-y-[1px] transition-[background-color,transform]"
            >
              Escribir por <span translate="no">WhatsApp</span>
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
        </div>
        <div
          className="pt-10 border-t border-[rgba(31,27,24,.12)] flex flex-col sm:flex-row items-center sm:justify-between gap-6 text-xs text-[rgba(31,27,24,.55)] flex-wrap text-center"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <span>
            © {new Date().getFullYear()}{' '}
            <span translate="no">{store.name}</span>
          </span>
          <div className="flex gap-3.5 items-center">
            {store.instagramUrl && (
              <a
                href={store.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid place-items-center w-9 h-9 rounded-full border border-[rgba(31,27,24,.12)] hover:bg-[#1f1b18] hover:text-[#fbf8f2] hover:border-[#1f1b18] hover:-translate-y-0.5 transition-[background-color,color,border-color,transform]"
              >
                <Instagram className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
              </a>
            )}
            {waPhone && (
              <a
                href={waMain}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid place-items-center w-9 h-9 rounded-full border border-[rgba(31,27,24,.12)] hover:bg-[#1f1b18] hover:text-[#fbf8f2] hover:border-[#1f1b18] hover:-translate-y-0.5 transition-[background-color,color,border-color,transform]"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
            <a
              href={`mailto:${store.slug}@ejemplo.com`}
              aria-label="Enviar correo"
              className="grid place-items-center w-9 h-9 rounded-full border border-[rgba(31,27,24,.12)] hover:bg-[#1f1b18] hover:text-[#fbf8f2] hover:border-[#1f1b18] hover:-translate-y-0.5 transition-[background-color,color,border-color,transform]"
            >
              <Mail className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
            </a>
          </div>
          <span>
            Creado con <span translate="no">ByLink</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
