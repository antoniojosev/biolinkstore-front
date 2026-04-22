'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Bed, Bath, Square, MessageCircle } from 'lucide-react'
import { useStore } from '@/lib/store-context'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  compact?: boolean
}

const TAG_LABEL: Record<string, string> = {
  nuevo: 'Nuevo',
  preventa: 'Preventa',
  alquiler: 'Alquiler',
  vendido: 'Vendido',
}

function detectTag(tags?: string[]): string | null {
  if (!tags) return null
  const lowered = tags.map((t) => t.toLowerCase())
  for (const key of Object.keys(TAG_LABEL)) {
    if (lowered.includes(key)) return key
  }
  return null
}

export function InmueblesPropertyCard({ product }: Props) {
  const { store } = useStore()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')

  const image = product.images?.[0] ?? product.image ?? '/placeholder.svg'
  const hab = product.specs?.['Habitaciones'] ?? product.specs?.['Hab']
  const bath = product.specs?.['Baños'] ?? product.specs?.['Banos']
  const m2 = product.specs?.['m²'] ?? product.specs?.['m2']
  const isRental = product.specs?.['Operación']?.toLowerCase() === 'alquiler'

  const tagKey = detectTag(product.tags)
  const tagLabel = tagKey ? TAG_LABEL[tagKey] : null
  const isSold = tagKey === 'vendido' || !product.inStock

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  const waPhone = store.whatsappNumbers?.[0]?.replace(/\D/g, '')
  const waMsg = `Hola ${store.name}, me interesa ${product.name} (${fmt(product.price)} ${store.currency}). ¿Podemos coordinar una visita?`
  const waHref = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`
    : '#'

  const detailHref = product.slug
    ? `/${store.slug}/${product.slug}${preview ? `?preview=${preview}` : ''}`
    : '#'

  return (
    <li className="flex flex-col transition-transform duration-[250ms] hover:-translate-y-[3px] [transition-timing-function:cubic-bezier(.2,.7,.3,1)]">
      <Link
        href={detailHref}
        className="block text-inherit no-underline group focus-visible:outline-offset-[4px]"
      >
        <div className="relative aspect-[4/3] rounded overflow-hidden bg-[#ebe9e4] mb-4">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] [transition-timing-function:cubic-bezier(.2,.7,.3,1)]"
          />
          {tagLabel && (
            <span
              className={`absolute top-3 left-3 text-[10px] font-semibold tracking-[.12em] uppercase px-2.5 py-[5px] rounded-[3px] backdrop-blur-sm ${
                isSold
                  ? 'bg-[#0a0a0a] text-white'
                  : 'bg-white/95 text-[#0a0a0a]'
              }`}
            >
              {tagLabel}
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <span className="text-[20px] font-semibold tabular-nums -tracking-[.01em] min-w-0 truncate">
            {fmt(product.price)}
            {isRental && (
              <span className="text-xs text-[#8a8a8a] font-medium"> /mes</span>
            )}
          </span>
          <span className="text-xs font-medium text-[#8a8a8a] uppercase tracking-[.1em] flex-shrink-0">
            {isRental ? 'Alquiler' : store.currency}
          </span>
        </div>
        <p className="text-sm text-[#0a0a0a] leading-[1.4] mb-1 line-clamp-2">
          {product.name}
        </p>
        {product.category && (
          <p className="text-xs text-[#8a8a8a] mb-[14px] line-clamp-1">
            {product.category}
          </p>
        )}
        {(hab || bath || m2) && (
          <div className="flex gap-[14px] text-xs text-[#4a4a4a] border-t border-[#e5e3df] pt-3 tabular-nums">
            {hab && (
              <span className="inline-flex items-center gap-[5px]">
                <Bed className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
                <span className="sr-only">Habitaciones:</span>
                {hab}
              </span>
            )}
            {bath && (
              <span className="inline-flex items-center gap-[5px]">
                <Bath className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
                <span className="sr-only">Baños:</span>
                {bath}
              </span>
            )}
            {m2 && (
              <span className="inline-flex items-center gap-[5px]">
                <Square className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
                <span className="sr-only">Superficie:</span>
                {m2} m²
              </span>
            )}
          </div>
        )}
      </Link>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Contactar por WhatsApp sobre ${product.name}`}
        className={`mt-[14px] inline-flex items-center justify-center gap-2 px-4 py-[11px] rounded-full text-[13px] font-medium transition-[background-color,transform,color,border-color] active:scale-[0.98] ${
          isSold
            ? 'bg-transparent text-[#4a4a4a] border border-[#e5e3df] hover:bg-[#f6f5f3] hover:text-[#0a0a0a] hover:border-[#0a0a0a]'
            : 'bg-[#0a0a0a] text-white hover:bg-[#25d366]'
        }`}
      >
        <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
        {isSold ? 'Pedir similar' : 'Contactar'}
      </a>
    </li>
  )
}
