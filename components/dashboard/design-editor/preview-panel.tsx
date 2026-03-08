'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { StoreProvider } from '@/lib/store-context'
import { VitrinaTemplate } from '@/components/templates/vitrina'
import { LuxoraTemplate } from '@/components/templates/luxora'
import { NoirTemplate } from '@/components/templates/noir'
import { MockCartProvider, MockWishlistProvider, MockPaymentProvider } from './mock-providers'
import type { StoreProfile, Product, Category } from '@/lib/types'

interface PreviewPanelProps {
  store: StoreProfile
  products: Product[]
  categories: Category[]
}

const TEMPLATE_WIDTH = 1280

// Each template's root background color — used to fill any gap below min-h-screen
const TEMPLATE_BG: Record<string, string> = {
  vitrina: 'oklch(0.13 0.01 250)',
  luxora: '#FAFAF8',
  noir: '#0A0A0A',
}

export function PreviewPanel({ store, products, categories }: PreviewPanelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  const paymentProvider = useMemo(() => new MockPaymentProvider(), [])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scale = dims.w > 0 ? dims.w / TEMPLATE_WIDTH : 1
  // How tall the inner template needs to be so that after scaling it fills dims.h
  const innerH = dims.h > 0 ? Math.ceil(dims.h / scale) : 900

  const cssVars = {
    '--primary': store.primaryColor,
    '--ring': store.primaryColor,
  } as React.CSSProperties

  const storeUrl = `biolinkstore.com/${store.slug}`

  return (
    <div className="flex flex-col h-full">
      {/* ── Browser chrome ─────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#1a1f27] border-b border-white/5 px-3 py-2.5 flex items-center gap-3 rounded-t-xl">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 bg-[#0d1218] rounded-md px-3 py-1.5 min-w-0">
          <div className="w-3 h-3 shrink-0 text-white/20">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="5" r="3" />
              <path d="M6 8v3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xs text-white/40 truncate font-mono">{storeUrl}</span>
        </div>
        <div className="shrink-0">
          <span className="text-[10px] font-medium text-white/20 uppercase tracking-wide">Preview</span>
        </div>
      </div>

      {/* ── Template viewport ──────────────────────────────────────── */}
      <div
        ref={wrapperRef}
        className="flex-1 overflow-hidden relative"
        style={{ minHeight: 0 }}
      >
        {dims.w > 0 && (
          <>
            {/* Click intercept — prevents navigation / product detail errors */}
            <div
              style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'default' }}
              onClick={(e) => e.preventDefault()}
            />

            {/* Template rendered at native width, scaled to fit */}
            <div
              style={{
                width: TEMPLATE_WIDTH,
                height: innerH,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                overflow: 'hidden',
                pointerEvents: 'none',
                // Fill any gap below min-h-screen with the template's own bg color
                backgroundColor: TEMPLATE_BG[store.template] ?? 'oklch(0.13 0.01 250)',
                ...cssVars,
              }}
            >
              <MockCartProvider>
                <MockWishlistProvider>
                  <StoreProvider
                    store={store}
                    products={products}
                    categories={categories}
                    paymentProvider={paymentProvider}
                  >
                    {store.template === 'vitrina' && <VitrinaTemplate />}
                    {store.template === 'luxora' && <LuxoraTemplate />}
                    {store.template === 'noir' && <NoirTemplate />}
                  </StoreProvider>
                </MockWishlistProvider>
              </MockCartProvider>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
