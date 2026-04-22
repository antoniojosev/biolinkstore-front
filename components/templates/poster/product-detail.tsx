'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Minus, Plus, Star, ShoppingCart, Check } from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { PosterCartDrawer } from './cart-drawer'
import type { ProductDetail, VariantDetail } from '@/lib/types'

interface Props {
  product: ProductDetail
}

function echoFrom(name: string): string {
  const words = name.split(/\s+/).filter((w) => w.length > 3)
  const pick = words[0] ?? name
  return pick.toUpperCase().slice(0, 10)
}

export function PosterProductDetail({ product }: Props) {
  const { store } = useStore()
  const { addItem, updateQuantity, items, setIsOpen } = useCart()
  const searchParams = useSearchParams()
  const preview = searchParams.get('preview')
  const backHref = `/${store.slug}${preview ? `?preview=${preview}` : ''}`

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: store.currency,
      minimumFractionDigits: 0,
    }).format(n)

  // ─── Attribute splitting by role ──────────────────────────────────────
  const sizeAttr = product.attributes.find(
    (a) => a.role === 'variant' && a.name.toLowerCase().includes('tama'),
  ) ?? product.attributes.find((a) => a.role === 'variant')

  const includedAttr = product.attributes.find((a) => a.role === 'ingredient-included')
  const extrasAttr = product.attributes.find((a) => a.role === 'ingredient-extra')
  const isCustomizable = Boolean(includedAttr || extrasAttr)

  // ─── Selection state ──────────────────────────────────────────────────
  const defaultSize = sizeAttr?.options[0]
  const [selectedSize, setSelectedSize] = useState<string | undefined>(defaultSize)
  const [removedIncluded, setRemovedIncluded] = useState<Set<string>>(new Set())
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set())
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const selectedVariant = useMemo(() => {
    if (!sizeAttr || !selectedSize) return null
    return (
      product.variants.find((v) => v.combination[sizeAttr.name] === selectedSize) ?? null
    )
  }, [product.variants, sizeAttr, selectedSize])

  const extrasTotal = useMemo(() => {
    if (!extrasAttr) return 0
    let sum = 0
    for (const opt of selectedExtras) {
      const meta = extrasAttr.optionsMeta?.[opt]
      if (meta?.priceDelta) sum += meta.priceDelta
    }
    return sum
  }, [extrasAttr, selectedExtras])

  const unitPrice =
    product.price + (selectedVariant?.priceAdjustment ?? 0) + extrasTotal
  const totalPrice = unitPrice * quantity

  const hero = product.images[0] ?? '/placeholder.svg'
  const echo = echoFrom(product.name)

  const toggleIncluded = (opt: string) => {
    setRemovedIncluded((prev) => {
      const next = new Set(prev)
      if (next.has(opt)) next.delete(opt)
      else next.add(opt)
      return next
    })
  }
  const toggleExtra = (opt: string) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev)
      if (next.has(opt)) next.delete(opt)
      else next.add(opt)
      return next
    })
  }

  const handleAdd = () => {
    const variantDetails: VariantDetail[] = []
    if (sizeAttr && selectedSize) {
      variantDetails.push({
        attribute: sizeAttr.name,
        value: selectedSize,
        type: sizeAttr.type,
      })
    }
    if (removedIncluded.size > 0) {
      variantDetails.push({
        attribute: 'Sin',
        value: Array.from(removedIncluded).join(', '),
        type: 'text',
      })
    }
    if (extrasAttr && selectedExtras.size > 0) {
      variantDetails.push({
        attribute: 'Extras',
        value: Array.from(selectedExtras).join(', '),
        type: 'text',
      })
    }

    const variantLabel = variantDetails
      .map((v) => `${v.attribute}: ${v.value}`)
      .join(' · ')

    const signature = [
      selectedSize ?? '',
      Array.from(removedIncluded).sort().join(','),
      Array.from(selectedExtras).sort().join(','),
    ].join('|')
    const id = `${product.id}-${signature}`

    const existing = items.find((i) => i.id === id)
    addItem({
      id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: unitPrice,
      image: hero,
      variant: variantLabel || undefined,
      variantDetails: variantDetails.length > 0 ? variantDetails : undefined,
    })
    if (quantity > 1) {
      const baseQty = existing ? existing.quantity : 0
      updateQuantity(id, baseQty + quantity)
    }
    setAdded(true)
    setIsOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div
      className="min-h-[100dvh] pb-[130px] text-[#fff4e0]"
      style={{
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        background:
          'radial-gradient(1200px 600px at 10% -20%, #8a1e1e 0%, transparent 60%), radial-gradient(900px 500px at 110% 30%, #6a1414 0%, transparent 55%), linear-gradient(180deg, #4a0a0a 0%, #2c0505 100%)',
      }}
    >
      {/* Topbar */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 px-5 py-3.5 backdrop-blur-xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(30,3,3,.85), rgba(30,3,3,.4))',
        }}
      >
        <Link
          href={backHref}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[#fff4e0] transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a]"
          aria-label="Volver al menú"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <div className="text-center">
          <h1
            className="uppercase leading-none"
            style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: 16,
              letterSpacing: '.04em',
            }}
          >
            {store.name}
          </h1>
          <span
            className="mt-0.5 block leading-none text-[#ffd07a]"
            style={{ fontFamily: 'var(--font-allura), cursive', fontSize: 14 }}
          >
            {isCustomizable ? 'Personalizar pedido' : 'Pedido'}
          </span>
        </div>
        <div className="h-10 w-10" aria-hidden="true" />
      </nav>

      <div className="mx-auto max-w-[560px]">
        {/* Hero — dish */}
        <section
          className="relative grid place-items-center overflow-hidden"
          style={{ height: 'clamp(260px, 56vw, 360px)' }}
        >
          {/* Echo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid select-none place-items-center text-transparent"
            style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: 'clamp(76px, 20vw, 140px)',
              letterSpacing: '-.02em',
              lineHeight: 1,
              WebkitTextStroke: '2px rgba(255,255,255,.09)',
            }}
          >
            {echo}
          </div>

          {/* Dish */}
          <div
            className="relative z-[1] aspect-square w-[62%] max-w-[280px] rounded-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${hero})`,
              transform: 'rotate(-3deg)',
              boxShadow:
                '0 24px 50px -12px rgba(0,0,0,.7), inset 0 0 0 6px rgba(255,255,255,.1)',
            }}
            role="img"
            aria-label={product.name}
          />

          {isCustomizable && (
            <div
              className="absolute left-4 top-3.5 z-[5] inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#f4a23a] to-[#d97a1c] px-3 py-1.5 pl-2 text-[11px] font-extrabold uppercase tracking-wider text-[#4a0a0a] shadow-[0_6px_14px_-4px_rgba(244,162,58,.7)]"
            >
              <Star className="h-[13px] w-[13px]" fill="currentColor" aria-hidden="true" />
              Arma tu {product.name.split(/\s+/)[0].toLowerCase()}
            </div>
          )}
        </section>

      {/* Title block */}
      <div className="px-6 pb-5 pt-2 text-center">
        {(product.tagline ?? product.category) && (
          <p
            className="leading-none text-[#ffd07a]"
            style={{ fontFamily: 'var(--font-allura), cursive', fontSize: 32 }}
          >
            {product.tagline ?? product.category}
          </p>
        )}
        <h2
          className="mt-1 uppercase text-transparent bg-clip-text"
          style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 'clamp(30px, 7.5vw, 48px)',
            lineHeight: 0.95,
            backgroundImage: 'linear-gradient(180deg, #fff 0%, #ffd9a3 100%)',
            WebkitBackgroundClip: 'text',
          }}
        >
          {product.name}
        </h2>
        {product.description && (
          <p className="mx-auto mt-3 max-w-[380px] text-[13.5px] leading-relaxed opacity-75">
            {product.description}
          </p>
        )}
      </div>

      {/* ─── Size ─── */}
      {sizeAttr && sizeAttr.options.length > 0 && (
        <Section title="Tamaño" hint="Elegí 1">
          <div
            role="radiogroup"
            aria-label="Tamaño"
            className="flex flex-col gap-2 sm:flex-row"
          >
            {sizeAttr.options.map((opt) => {
              const variant = product.variants.find(
                (v) => v.combination[sizeAttr.name] === opt,
              )
              const delta = variant?.priceAdjustment ?? 0
              const selected = selectedSize === opt
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSelectedSize(opt)}
                  className={`flex w-full items-center justify-between rounded-full border-[1.5px] px-[18px] py-3 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a] sm:w-auto sm:flex-1 ${
                    selected
                      ? 'border-[#fff4e0] bg-[#fff4e0] text-[#4a0a0a]'
                      : 'border-white/10 bg-white/[.06] text-[#fff4e0] hover:bg-white/10'
                  }`}
                >
                  <span className="font-semibold">{opt}</span>
                  <span
                    className={selected ? 'text-[#4a0a0a]/85' : 'text-[#ffd07a]'}
                    style={{
                      fontFamily: 'var(--font-anton), sans-serif',
                      fontSize: 16,
                      letterSpacing: '.02em',
                    }}
                  >
                    {fmt(product.price + delta)}
                  </span>
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {/* ─── Included ─── */}
      {includedAttr && includedAttr.options.length > 0 && (
        <Section title="Lleva incluido" hint="Toca para quitar">
          <div className="flex flex-wrap gap-2">
            {includedAttr.options.map((opt) => {
              const removed = removedIncluded.has(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={!removed}
                  onClick={() => toggleIncluded(opt)}
                  className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-2.5 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a] ${
                    removed
                      ? 'border-white/15 bg-transparent text-[#fff4e0]/50 line-through'
                      : 'border-[#6cbf6a]/50 bg-[#6cbf6a]/15 text-[#fff4e0]'
                  }`}
                >
                  <span
                    className={`grid h-[18px] w-[18px] place-items-center rounded-full ${
                      removed ? 'bg-white/15' : 'bg-[#6cbf6a] text-[#4a0a0a]'
                    }`}
                    aria-hidden="true"
                  >
                    {!removed && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {/* ─── Extras ─── */}
      {extrasAttr && extrasAttr.options.length > 0 && (
        <Section title="Súmale extras" hint="Cuantos quieras">
          <div className="flex flex-wrap gap-2">
            {extrasAttr.options.map((opt) => {
              const selected = selectedExtras.has(opt)
              const meta = extrasAttr.optionsMeta?.[opt]
              const delta = meta?.priceDelta
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleExtra(opt)}
                  className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-2.5 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a] ${
                    selected
                      ? 'border-[#f4a23a] bg-[#f4a23a] font-bold text-[#4a0a0a] shadow-[0_6px_14px_-4px_rgba(244,162,58,.6)]'
                      : 'border-[#f4a23a]/30 bg-[#f4a23a]/10 text-[#fff4e0] font-medium hover:bg-[#f4a23a]/20'
                  }`}
                >
                  {opt}
                  {typeof delta === 'number' && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] ${
                        selected
                          ? 'bg-[#4a0a0a]/15 text-[#4a0a0a]'
                          : 'bg-[#f4a23a]/25 text-[#ffd07a]'
                      }`}
                    >
                      {delta > 0 ? `+${fmt(delta)}` : fmt(delta)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {/* ─── Quantity ─── */}
      <Section title="Cantidad">
        <div
          className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[.06] p-1"
          role="group"
          aria-label="Seleccionar cantidad"
        >
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity === 1}
            className="grid h-10 w-10 place-items-center rounded-full text-[#fff4e0] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a] disabled:opacity-40"
            aria-label="Quitar uno"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            className="min-w-[24px] text-center leading-none tabular-nums"
            style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: 22,
            }}
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="grid h-10 w-10 place-items-center rounded-full text-[#fff4e0] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4a23a]"
            aria-label="Agregar uno"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </Section>
      </div>

      {/* Sticky bottom */}
      <div
        className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-5 pt-6"
        style={{
          background:
            'linear-gradient(180deg, rgba(30,3,3,0) 0%, #2e0606 30%)',
        }}
      >
        <div className="mx-auto flex max-w-[540px] items-center justify-between gap-3 rounded-[24px] bg-[#fff4e0] py-3 pl-5 pr-3 text-[#4a0a0a] shadow-[0_18px_40px_-8px_rgba(0,0,0,.6)]">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[.08em] opacity-65">
              Total
            </span>
            <strong
              className="leading-none text-[#4a0a0a]"
              style={{ fontFamily: 'var(--font-anton), sans-serif', fontSize: 26 }}
            >
              {fmt(totalPrice)}
            </strong>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#4a0a0a] px-5 py-3 text-[13px] font-bold uppercase tracking-wider text-[#fff4e0] transition-all hover:scale-[1.03] hover:bg-[#962020] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4a0a0a]"
            aria-label={`Agregar al carrito — ${fmt(totalPrice)}`}
          >
            {added ? (
              <>
                <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2.2} />
                <span>
                  Agregar<span className="hidden sm:inline"> al carrito</span>
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      <PosterCartDrawer />
    </div>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-[540px] px-5 pt-6">
      <div className="mb-3.5 flex items-baseline justify-between">
        <h3
          className="uppercase"
          style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 20,
            letterSpacing: '.04em',
          }}
        >
          {title}
        </h3>
        {hint && (
          <span className="text-[11px] uppercase tracking-[.1em] opacity-55">
            {hint}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}
