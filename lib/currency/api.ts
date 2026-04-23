import type { Rate, StoreVisibleRates } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function fetchOfficialRates(): Promise<Rate[]> {
  const res = await fetch(`${API_URL}/public/rates`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch rates: ${res.status}`)
  return res.json()
}

export async function fetchStoreVisibleRates(slug: string): Promise<StoreVisibleRates> {
  const res = await fetch(`${API_URL}/public/${encodeURIComponent(slug)}/rates`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to fetch store rates: ${res.status}`)
  return res.json()
}
