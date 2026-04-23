'use client'

import { useEffect, useState } from 'react'
import { fetchOfficialRates, fetchStoreVisibleRates } from './api'
import type { Rate, StoreVisibleRates } from './types'

const CACHE_TTL = 1000 * 60 * 30 // 30 min
let officialCache: { at: number; data: Rate[] } | null = null
const storeCache = new Map<string, { at: number; data: StoreVisibleRates }>()

interface OfficialState {
  rates: Rate[]
  byCode: Map<string, Rate>
  loading: boolean
  error: string | null
}

interface StoreState {
  rates: Rate[]
  byCode: Map<string, Rate>
  defaultRate: string | null
  loading: boolean
  error: string | null
}

/**
 * Hook para tasas oficiales activas (todas las disponibles globalmente).
 * Uso tipico: landing, pricing, reportes de pago internos.
 */
export function useOfficialRates(): OfficialState {
  const initial = officialCache?.data ?? []
  const [state, setState] = useState<OfficialState>({
    rates: initial,
    byCode: new Map(initial.map((r) => [r.code, r])),
    loading: !officialCache,
    error: null,
  })

  useEffect(() => {
    if (officialCache && Date.now() - officialCache.at < CACHE_TTL) return
    let cancelled = false
    fetchOfficialRates()
      .then((data) => {
        if (cancelled) return
        officialCache = { at: Date.now(), data }
        setState({
          rates: data,
          byCode: new Map(data.map((r) => [r.code, r])),
          loading: false,
          error: null,
        })
      })
      .catch((err: Error) => {
        if (cancelled) return
        setState((s) => ({ ...s, loading: false, error: err.message }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

/**
 * Hook para tasas visibles por el comprador en un storefront especifico.
 * Filtrado por plan y currencyConfig del store.
 */
export function useStoreRates(slug: string | null | undefined): StoreState {
  const cached = slug ? storeCache.get(slug) : null
  const initialRates = cached?.data.rates ?? []
  const [state, setState] = useState<StoreState>({
    rates: initialRates,
    byCode: new Map(initialRates.map((r) => [r.code, r])),
    defaultRate: cached?.data.defaultRate ?? null,
    loading: !cached && !!slug,
    error: null,
  })

  useEffect(() => {
    if (!slug) return
    const c = storeCache.get(slug)
    if (c && Date.now() - c.at < CACHE_TTL) return
    let cancelled = false
    fetchStoreVisibleRates(slug)
      .then((data) => {
        if (cancelled) return
        storeCache.set(slug, { at: Date.now(), data })
        setState({
          rates: data.rates,
          byCode: new Map(data.rates.map((r) => [r.code, r])),
          defaultRate: data.defaultRate ?? null,
          loading: false,
          error: null,
        })
      })
      .catch((err: Error) => {
        if (cancelled) return
        setState((s) => ({ ...s, loading: false, error: err.message }))
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return state
}
