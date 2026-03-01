'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { StoreProfile, Product, Category } from './types'
import type { PaymentProvider } from './payment-providers/types'

interface StoreContextValue {
  store: StoreProfile
  products: Product[]
  categories: Category[]
  paymentProvider: PaymentProvider
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({
  store,
  products,
  categories,
  paymentProvider,
  children,
}: StoreContextValue & { children: ReactNode }) {
  return (
    <StoreContext.Provider value={{ store, products, categories, paymentProvider }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
