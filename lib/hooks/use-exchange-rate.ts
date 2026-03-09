import { useState, useEffect } from 'react'

interface ExchangeRate {
  rate: number | null
  loading: boolean
  date: string | null
}

let cachedRate: { rate: number; date: string; fetchedAt: number } | null = null
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export function useExchangeRate(): ExchangeRate {
  const [state, setState] = useState<ExchangeRate>({
    rate: cachedRate?.rate ?? null,
    loading: !cachedRate,
    date: cachedRate?.date ?? null,
  })

  useEffect(() => {
    if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_TTL) {
      setState({ rate: cachedRate.rate, loading: false, date: cachedRate.date })
      return
    }

    let cancelled = false

    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then((res) => {
        if (!res.ok) throw new Error('API error')
        return res.json()
      })
      .then((data: { promedio: number; fechaActualizacion: string }) => {
        if (cancelled) return
        const date = new Date(data.fechaActualizacion).toLocaleDateString('es-VE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        cachedRate = { rate: data.promedio, date, fetchedAt: Date.now() }
        setState({ rate: data.promedio, loading: false, date })
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false }))
      })

    return () => { cancelled = true }
  }, [])

  return state
}

export function formatBs(usd: number, rate: number): string {
  const bs = usd * rate
  return `Bs ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
